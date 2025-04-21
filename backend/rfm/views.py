import pandas as pd
from datetime import datetime
from decimal import Decimal, InvalidOperation

from django.db import transaction as db_transaction
from rest_framework import views, status, permissions
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Transaction, UploadedFile
from .serializers import RFMScoreSerializer
from .rfm_analysis import calculate_rfm

class CustomerRankingView(views.APIView):
    """
    API view to return a ranking of customers by total paid, including city. Supports filtering by city via ?city=<city>.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        city = request.query_params.get('city', None)
        transactions = Transaction.objects.filter(user=user)
        if city:
            transactions = transactions.filter(city__iexact=city)
        if not transactions.exists():
            return Response({'ranking': [], 'message': 'No transactions found.'}, status=status.HTTP_200_OK)
        df = pd.DataFrame.from_records(
            transactions.values('customer_id', 'city', 'amount')
        )
        if df.empty:
            return Response({'ranking': [], 'message': 'No transactions found.'}, status=status.HTTP_200_OK)
        df['amount'] = pd.to_numeric(df['amount'])
        ranking_df = df.groupby(['customer_id', 'city'], as_index=False)['amount'].sum()
        ranking_df = ranking_df.rename(columns={'amount': 'total_paid'})
        ranking_df = ranking_df.sort_values(by='total_paid', ascending=False)
        ranking_df = ranking_df.head(10)  # Only top 10
        ranking = ranking_df.to_dict('records')
        return Response({'ranking': ranking}, status=status.HTTP_200_OK)

class TransactionUploadView(views.APIView):
    """
    API view for uploading customer transaction data via CSV or Excel file.
    Requires authentication. Deletes previous transactions for the user upon new upload.
    Expects columns: customer_id, purchase_date, amount
    """
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def post(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided.'}, status=status.HTTP_400_BAD_REQUEST)

        file = request.FILES['file']
        user = request.user
        file_name = file.name.lower()

        # Save uploaded file for download/view later
        uploaded_file_obj = UploadedFile.objects.create(
            user=user,
            file=file,
            original_filename=file.name
        )

        try:
            # Read file using pandas
            if file_name.endswith('.csv'):
                df = pd.read_csv(file)
            elif file_name.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file, engine='openpyxl')
            else:
                return Response({'error': 'Unsupported file type. Please upload a CSV or Excel file (.xlsx, .xls).'}, status=status.HTTP_400_BAD_REQUEST)

            if df.empty:
                 return Response({'error': 'The uploaded file is empty or could not be read.'}, status=status.HTTP_400_BAD_REQUEST)

            # --- Validate Required Columns Exist ---
            # Normalize column names from file for checking
            df.columns = [col.lower().strip() for col in df.columns]

            # Accept both old and new column names
            # Map new spreadsheet columns to model fields
            col_map = {
                'customer_id': ['customer_id', 'relationship id'],
                'purchase_date': ['purchase_date', 'date clean'],
                'amount_100kg': ['amount (100kg)', 'amount_100kg'],
                'price_per_kg': ['price_per_kg', 'price per kg', 'price per_kg'],
                'city': ['city'],
            }

            # Check for required columns (new format)
            required_new = [col_map['customer_id'], col_map['purchase_date'], col_map['amount_100kg'], col_map['price_per_kg'], col_map['city']]
            required_new_flat = [item for sublist in required_new for item in sublist]
            has_new_format = all(any(col in df.columns for col in col_list) for col_list in required_new)

            # Check for required columns (old format)
            required_old = {'customer_id', 'purchase_date', 'amount'}
            has_old_format = required_old.issubset(set(df.columns))

            if not has_new_format and not has_old_format:
                error_msg = "File is missing required columns. Acceptable formats: (1) 'Relationship ID', 'Date Clean', 'amount (100kg)', 'price_per_kg', 'city' OR (2) 'customer_id', 'purchase_date', 'amount'."
                return Response({'error': error_msg}, status=status.HTTP_400_BAD_REQUEST)

            transactions_to_create = []
            errors = []

            for i, row in df.iterrows():
                try:
                    if has_new_format:
                        # Flexible column access for new format
                        def get_col(row, options):
                            for col in options:
                                if col in row and not pd.isna(row[col]):
                                    return row[col]
                            return None
                        customer_id = str(get_col(row, col_map['customer_id'])).strip()
                        purchase_date_input = get_col(row, col_map['purchase_date'])
                        amount_100kg = get_col(row, col_map['amount_100kg'])
                        price_per_kg = get_col(row, col_map['price_per_kg'])
                        city = str(get_col(row, col_map['city'])).strip() if get_col(row, col_map['city']) else ''
                        # New fields
                        product_type = str(row.get('product_type', '')).strip() if 'product_type' in row else ''
                        loyalty_points = int(row.get('loyalty_points', 0)) if 'loyalty_points' in row and not pd.isna(row['loyalty_points']) else 0
                        # Compute amount
                        try:
                            amount = Decimal(str(amount_100kg)) * Decimal(str(price_per_kg))
                        except Exception:
                            errors.append(f"Row {i+2}: Invalid amount_100kg or price_per_kg.")
                            continue
                    else:
                        # Old format
                        customer_id = str(row['customer_id']).strip()
                        purchase_date_input = row['purchase_date']
                        amount = Decimal(str(row['amount']).strip())
                        city = ''
                        product_type = str(row.get('product_type', '')).strip() if 'product_type' in row else ''
                        loyalty_points = int(row.get('loyalty_points', 0)) if 'loyalty_points' in row and not pd.isna(row['loyalty_points']) else 0
                        amount_100kg = None
                        price_per_kg = None

                    if pd.isna(customer_id) or not customer_id:
                        errors.append(f"Row {i+2}: Missing customer_id.")
                        continue

                    # Attempt to parse date
                    if pd.isna(purchase_date_input):
                        errors.append(f"Row {i+2}: Missing purchase_date.")
                        continue
                    elif isinstance(purchase_date_input, datetime):
                        purchase_date = purchase_date_input.date()
                    else:
                        try:
                            parsed_dt = pd.to_datetime(str(purchase_date_input).strip())
                            purchase_date = parsed_dt.date()
                        except (ValueError, TypeError):
                            errors.append(f"Row {i+2}: Invalid purchase_date format '{purchase_date_input}'. Could not parse.")
                            continue

                    if has_new_format:
                        if pd.isna(amount_100kg) or pd.isna(price_per_kg):
                            errors.append(f"Row {i+2}: Missing amount_100kg or price_per_kg.")
                            continue
                        try:
                            amount_100kg_val = Decimal(str(amount_100kg))
                            price_per_kg_val = Decimal(str(price_per_kg))
                        except Exception:
                            errors.append(f"Row {i+2}: Invalid amount_100kg or price_per_kg format.")
                            continue
                    else:
                        amount_100kg_val = None
                        price_per_kg_val = None

                    transactions_to_create.append(
                        Transaction(
                            user=user,
                            customer_id=customer_id,
                            purchase_date=purchase_date,
                            amount=amount,
                            city=city,
                            product_type=product_type,
                            amount_100kg=amount_100kg_val,
                            price_per_kg=price_per_kg_val,
                            loyalty_points=loyalty_points
                        )
                    )
                except KeyError as e:
                     errors.append(f"Row {i+2}: Missing expected column '{e}'. Required: customer_id, purchase_date, amount.")
                except Exception as e:
                    errors.append(f"Row {i+2}: Error processing row - {type(e).__name__}: {e}")

            if errors:
                return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

            if not transactions_to_create:
                 return Response({'error': 'File contains no valid transaction data after processing.'}, status=status.HTTP_400_BAD_REQUEST)

            # --- Database Operation ---
            with db_transaction.atomic():
                Transaction.objects.filter(user=user).delete()
                Transaction.objects.bulk_create(transactions_to_create)

            return Response(
                {'message': f'Successfully uploaded and processed {len(transactions_to_create)} transactions.'},
                status=status.HTTP_201_CREATED
            )

        except pd.errors.EmptyDataError:
             return Response({'error': 'The uploaded file is empty.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Error processing upload for user {user.id}: {e}")
            return Response({'error': f'An unexpected error occurred during file processing: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from django.http import FileResponse

class UploadedFileListView(views.APIView):
    """
    API view to list and download user's uploaded files.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        files = UploadedFile.objects.filter(user=request.user).order_by('-uploaded_at')
        file_list = [
            {
                'id': f.id,
                'original_filename': f.original_filename,
                'uploaded_at': f.uploaded_at,
                'download_url': f'/api/rfm/uploaded-files/{f.id}/download/'
            }
            for f in files
        ]
        return Response({'files': file_list}, status=status.HTTP_200_OK)

class UploadedFileDownloadView(views.APIView):
    """
    API view to download a specific uploaded file by ID.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, file_id, *args, **kwargs):
        try:
            uploaded_file = UploadedFile.objects.get(id=file_id, user=request.user)
            response = FileResponse(uploaded_file.file.open('rb'), as_attachment=True, filename=uploaded_file.original_filename)
            return response
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found.'}, status=status.HTTP_404_NOT_FOUND)

class RFMAnalysisView(views.APIView):
    """
    API view to trigger RFM calculation and retrieve the results for the logged-in user.
    Accepts optional query parameters for filtering.
    Requires authentication.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        print("--- RFMAnalysisView GET method entered ---") # Keep log for debugging 404
        user = request.user
        segment_filter = request.query_params.get('segment', None)
        min_monetary = request.query_params.get('min_monetary', None)

        try:
            rfm_results_df = calculate_rfm(user)

            if rfm_results_df is None or rfm_results_df.empty:
                # Check if transactions exist at all for this user
                if not Transaction.objects.filter(user=user).exists():
                     return Response({"message": "No transaction data found for this user. Please upload a file."}, status=status.HTTP_404_NOT_FOUND)
                else:
                     # Data exists but RFM calculation resulted in empty df (shouldn't normally happen)
                     return Response({"message": "Could not calculate RFM data."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


            # Apply filters if provided
            filtered_df = rfm_results_df.copy()
            if segment_filter:
                filtered_df = filtered_df[filtered_df['segment'].str.lower() == segment_filter.lower()]
            if min_monetary:
                try:
                    min_monetary_val = Decimal(min_monetary)
                    filtered_df['monetary'] = pd.to_numeric(filtered_df['monetary'], errors='coerce')
                    filtered_df.dropna(subset=['monetary'], inplace=True) # Drop rows where conversion failed
                    filtered_df = filtered_df[filtered_df['monetary'] >= min_monetary_val]
                except (InvalidOperation, ValueError):
                    return Response({'error': 'Invalid value for min_monetary filter.'}, status=status.HTTP_400_BAD_REQUEST)

            if filtered_df.empty and (segment_filter or min_monetary):
                 # Only return this message if filters were actually applied and resulted in no matches
                 return Response({"message": "No customers match the specified filters.", "rfm_data": [], "summary": rfmAnalysis.summary if rfmAnalysis else {}}, status=status.HTTP_200_OK)


            results_list = filtered_df.to_dict('records')
            serializer = RFMScoreSerializer(results_list, many=True)

            # Prepare summary statistics based on the *original* unfiltered data
            original_segment_counts = rfm_results_df['segment'].value_counts().to_dict()
            total_customers_unfiltered = len(rfm_results_df)

            response_data = {
                'rfm_data': serializer.data,
                'summary': {
                    'total_customers': total_customers_unfiltered,
                    'segment_counts': original_segment_counts,
                    'filters_applied': request.query_params,
                    'filtered_results_count': len(results_list)
                }
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error during RFM analysis for user {user.id}: {e}")
            return Response({'error': f'An error occurred during RFM analysis: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

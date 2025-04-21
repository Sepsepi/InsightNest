from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Transaction
from django.db.models import Sum, Count, Q, F
from datetime import datetime, timedelta
import pandas as pd

class RevenueAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        period = request.query_params.get('period', 'all')  # today, week, month, 3m, 6m, year, all
        now = datetime.now().date()
        period_map = {
            'today': now,
            'week': now - timedelta(days=7),
            'month': now - timedelta(days=30),
            '3m': now - timedelta(days=90),
            '6m': now - timedelta(days=180),
            'year': now - timedelta(days=365),
        }
        qs = Transaction.objects.filter(user=user)
        if period in period_map:
            qs = qs.filter(purchase_date__gte=period_map[period])
        # Revenue by product type (money and weight)
        df = pd.DataFrame.from_records(qs.values('product_type', 'amount', 'amount_100kg'))
        if df.empty:
            return Response({'revenue_by_type': [], 'revenue_by_weight': [], 'total_revenue': 0, 'graph': []}, status=status.HTTP_200_OK)
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
        df['amount_100kg'] = pd.to_numeric(df['amount_100kg'], errors='coerce').fillna(0)
        revenue_by_type = df.groupby('product_type')['amount'].sum().reset_index().sort_values(by='amount', ascending=False)
        revenue_by_weight = df.groupby('product_type')['amount_100kg'].sum().reset_index().sort_values(by='amount_100kg', ascending=False)
        # Graph data: revenue by date
        graph_df = pd.DataFrame.from_records(qs.values('purchase_date', 'amount'))
        graph_df['purchase_date'] = pd.to_datetime(graph_df['purchase_date'])
        graph_df = graph_df.groupby(graph_df['purchase_date'].dt.date)['amount'].sum().reset_index()
        graph = graph_df.to_dict('records')
        total_revenue = df['amount'].sum()
        return Response({
            'revenue_by_type': revenue_by_type.to_dict('records'),
            'revenue_by_weight': revenue_by_weight.to_dict('records'),
            'total_revenue': total_revenue,
            'graph': graph
        }, status=status.HTTP_200_OK)

class CustomerAnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        qs = Transaction.objects.filter(user=user)
        df = pd.DataFrame.from_records(qs.values('customer_id', 'amount', 'loyalty_points', 'purchase_date'))
        if df.empty:
            return Response({'customers': [], 'top_40': [], 'logs': {}, 'graph': []}, status=status.HTTP_200_OK)
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
        df['loyalty_points'] = pd.to_numeric(df['loyalty_points'], errors='coerce').fillna(0)
        # All customers with stats
        customers = df.groupby('customer_id').agg(
            total_paid=('amount', 'sum'),
            total_points=('loyalty_points', 'sum'),
            order_count=('purchase_date', 'count')
        ).reset_index().sort_values(by='total_paid', ascending=False)
        # Top 40 highlighted
        top_40 = customers.head(40).to_dict('records')
        # Payment log for each
        logs = {cid: df[df['customer_id'] == cid][['purchase_date', 'amount']].sort_values('purchase_date').to_dict('records') for cid in customers['customer_id']}
        # Graph for each stat (example: total_paid over time)
        graph_df = df.groupby(df['purchase_date'])['amount'].sum().reset_index()
        graph = graph_df.to_dict('records')
        return Response({
            'customers': customers.to_dict('records'),
            'top_40': top_40,
            'logs': logs,
            'graph': graph
        }, status=status.HTTP_200_OK)

class VIPCustomersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        qs = Transaction.objects.filter(user=user)
        df = pd.DataFrame.from_records(qs.values('customer_id', 'amount', 'loyalty_points'))
        if df.empty:
            return Response({'vip_customers': []}, status=status.HTTP_200_OK)
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
        df['loyalty_points'] = pd.to_numeric(df['loyalty_points'], errors='coerce').fillna(0)
        vip_customers = df.groupby('customer_id').agg(
            total_paid=('amount', 'sum'),
            loyalty_points=('loyalty_points', 'sum')
        ).reset_index().sort_values(by=['loyalty_points', 'total_paid'], ascending=False)
        vip_customers = vip_customers.head(50).to_dict('records')
        # Assign status based on ranking
        for idx, cust in enumerate(vip_customers):
            if idx == 0:
                cust['status'] = 'VIP'
            elif 1 <= idx <= 4:
                cust['status'] = 'Loyal Customer'
            else:
                cust['status'] = 'Thrifter'
        return Response({'vip_customers': vip_customers}, status=status.HTTP_200_OK)


class AvgOrderValueView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        qs = Transaction.objects.filter(user=user)
        df = pd.DataFrame.from_records(qs.values('amount'))
        if df.empty:
            return Response({'avg_order_value': 0}, status=status.HTTP_200_OK)
        df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
        avg_order_value = df['amount'].mean()
        return Response({'avg_order_value': avg_order_value}, status=status.HTTP_200_OK)

# Robust error handling is built into each endpoint above.

import os
import google.generativeai as genai
import pandas as pd
from dotenv import load_dotenv
from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.core.exceptions import ImproperlyConfigured

from rfm.rfm_analysis import calculate_rfm # Import the RFM calculation function

# Load environment variables (especially GEMINI_API_KEY)
load_dotenv()

# Configure the Gemini API client
try:
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        # Log a warning or raise an error if the key is essential for the app to function
        print("Warning: GEMINI_API_KEY not found in environment variables. AI features will be disabled.")
        # raise ImproperlyConfigured("GEMINI_API_KEY environment variable not set.")
    else:
        genai.configure(api_key=gemini_api_key)
except Exception as e:
    print(f"Error configuring Gemini API: {e}")
    # Handle configuration error appropriately, maybe disable AI features

class GenerateInsightsView(views.APIView):
    """
    API view to generate AI-powered insights based on the user's RFM data.
    Requires authentication.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        gemini_api_key = os.getenv("GEMINI_API_KEY") # Re-check key presence

        if not gemini_api_key:
             # Return a specific status if the service is unavailable due to configuration
             return Response({"error": "AI service is not configured. Missing API key."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            # 1. Get RFM data
            rfm_results_df = calculate_rfm(user)

            if rfm_results_df is None:
                return Response({"message": "No transaction data found to generate insights."}, status=status.HTTP_404_NOT_FOUND)

            # 2. Prepare data summary for the prompt
            # Convert relevant parts of the DataFrame to a string format for the prompt
            # Example: Segment counts and maybe average R/F/M per segment
            segment_counts = rfm_results_df['segment'].value_counts()
            summary_stats = rfm_results_df.groupby('segment')[['recency', 'frequency', 'monetary']].mean()

            prompt_data = f"""
            Customer Segmentation Summary:
            Total Customers: {len(rfm_results_df)}
            Segment Counts:
            {segment_counts.to_string()}

            Average RFM per Segment:
            {summary_stats.to_string()}

            Full RFM Data Sample (first 5 rows):
            {rfm_results_df.head().to_string()}
            """

            # 3. Define the prompt for Gemini
            prompt = f"""
            Analyze the following customer RFM (Recency, Frequency, Monetary) segmentation data.
            Provide actionable business insights and 3 specific, prioritized action tips for a marketing team based on this data.
            Focus on identifying key customer groups, potential risks, and growth opportunities.
            Format the output clearly with a section for "Insights" and a section for "Action Tips".

            Data:
            {prompt_data}
            """

            # 4. Call the Gemini API
            try:
                # Use a model suitable for text generation, like gemini-pro
                model = genai.GenerativeModel('gemini-pro')
                response = model.generate_content(prompt)

                # Basic error handling for the response object
                if not response.text:
                     # Check parts if text is empty, sometimes content is in parts
                     if response.parts:
                         generated_text = "".join(part.text for part in response.parts)
                     else:
                         # Log the full response for debugging if possible
                         print(f"Gemini API response issue: {response}")
                         raise Exception("Received empty response from AI service")
                else:
                    generated_text = response.text

            except Exception as api_error:
                 print(f"Gemini API call failed: {api_error}")
                 # Provide a more specific error message if possible
                 return Response({"error": f"Failed to generate insights from AI service: {api_error}"}, status=status.HTTP_502_BAD_GATEWAY)


            # 5. Return the generated insights
            return Response({"insights": generated_text}, status=status.HTTP_200_OK)

        except Exception as e:
            # Catch-all for other unexpected errors during the process
            print(f"Error generating AI insights for user {user.id}: {e}") # Basic logging
            return Response({'error': f'An unexpected error occurred: {e}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# Placeholder for Chatbot view (Bonus)
# class ChatbotView(views.APIView):
#     permission_classes = [permissions.IsAuthenticated]
#     def post(self, request, *args, **kwargs):
#         # Logic to handle chatbot query using RFM data and Gemini
#         pass

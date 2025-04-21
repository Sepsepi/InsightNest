from django.urls import path
from .views import GenerateInsightsView # Import the view

app_name = 'ai_insights'

urlpatterns = [
    path('generate/', GenerateInsightsView.as_view(), name='generate_insights'), # Add endpoint for generating insights
    # Add chatbot endpoint later if implemented
    # path('chat/', ChatbotView.as_view(), name='chatbot'),
]

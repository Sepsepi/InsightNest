from django.urls import path
from .views import UserCreate, CurrentUserDetailView # Import the new view

app_name = 'users'

urlpatterns = [
    path('register/', UserCreate.as_view(), name='register'),
    path('me/', CurrentUserDetailView.as_view(), name='current_user_detail'), # Add URL for current user
    # Add other user-related URLs here (e.g., profile update)
]

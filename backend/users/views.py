from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSerializer
from rest_framework.authtoken.models import Token # Import Token

class UserCreate(generics.CreateAPIView):
    """
    API view for user registration.
    Allows any user (authenticated or not) to create a new user account.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny] # Allow anyone to register

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Generate token for the new user upon successful registration
        token, created = Token.objects.get_or_create(user=user)
        headers = self.get_success_headers(serializer.data)
        # Return user data and token in the response
        return Response(
            {
                'user': serializer.data, # Consider excluding password fields here for security
                'token': token.key
            },
            status=status.HTTP_201_CREATED,
            headers=headers
        )

# You might want a view to get the current user's details later
from rest_framework.views import APIView # Import APIView
from .serializers import UserDetailSerializer # Import the new serializer

# View to get the current authenticated user's details
class CurrentUserDetailView(APIView):
    """
    Returns details for the currently authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated] # Ensure user is logged in

    def get(self, request):
        serializer = UserDetailSerializer(request.user) # Use the detail serializer
        return Response(serializer.data)

"""
URL configuration for backend_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include # Import include
from rest_framework.authtoken.views import obtain_auth_token # Import obtain_auth_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')), # Add users app urls
    path('api/rfm/', include('rfm.urls')),     # Add rfm app urls
    path('api/ai/', include('ai_insights.urls')), # Add ai_insights app urls
    path('api/auth/token/', obtain_auth_token, name='api_token_auth'), # Add DRF token auth endpoint
]

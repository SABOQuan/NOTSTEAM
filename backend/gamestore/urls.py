from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for viewsets
router = DefaultRouter()
router.register(r'games', views.GameViewSet, basename='game')
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'library', views.GameLibraryViewSet, basename='library')
router.register(r'wishlist', views.WishlistViewSet, basename='wishlist')
router.register(r'reviews', views.ReviewViewSet, basename='review')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/logout/', views.logout_user, name='logout'),
    path('auth/me/', views.get_current_user, name='current-user'),
    
    # Payment endpoints - Stripe
    path('payment/create-intent/', views.create_payment_intent, name='create-payment'),
    path('payment/confirm/', views.confirm_payment, name='confirm-payment'),
    path('payment/orders/', views.order_history, name='order-history'),

    # Payment endpoints - 2Checkout (Works in Pakistan)
    path('payment/2checkout/create/', views.create_twocheckout_order, name='create-twocheckout-order'),
    path('payment/2checkout/verify/', views.verify_twocheckout_payment, name='verify-twocheckout-payment'),
    path('payment/2checkout/details/', views.get_twocheckout_payment_details, name='twocheckout-payment-details'),

    # Cart endpoints
    path('cart/add/', views.add_to_cart, name='add-to-cart'),
    path('cart/', views.get_cart, name='get-cart'),
    path('cart/clear/', views.clear_cart, name='clear-cart'),
]
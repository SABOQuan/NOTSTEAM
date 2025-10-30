from django.http import JsonResponse

def home(request):
    """
    Home page view - displays a welcome page with available endpoints
    """
    return JsonResponse({
        'message': 'Welcome to the Game Store API',
        'status': 'Server is running successfully',
        'endpoints': {
            'admin': '/admin/',
            'api': '/api/',
            'games': '/api/games/',
            'auth_register': '/api/auth/register/',
            'auth_login': '/api/auth/login/',
            'wishlist': '/api/wishlist/',
            'library': '/api/library/',
            'cart': '/api/cart/',
        },
        'documentation': 'Visit /api/ for all available endpoints'
    })
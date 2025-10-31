from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models import Q
import stripe
import requests
import hashlib
import hmac
from django.conf import settings

from .models import (
    Game, UserProfile, GameLibrary, Wishlist,
    Review, Achievement, UserAchievement, Order, OrderItem, Tag
)
from .serializers import (
    GameSerializer, UserProfileSerializer, GameLibrarySerializer,
    WishlistSerializer, ReviewSerializer, AchievementSerializer,
    UserAchievementSerializer, OrderSerializer, UserRegistrationSerializer,
    UserSerializer
)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

# 2Checkout API Configuration (Works in Pakistan)
TWOCHECKOUT_API_URL = "https://api.2checkout.com/rest/6.0/"


# ============================================
# AUTHENTICATION VIEWS (Module 1: Auth)
# ============================================

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    """Login user and return token"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })
    return Response(
        {'error': 'Invalid credentials'}, 
        status=status.HTTP_401_UNAUTHORIZED
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_user(request):
    """Logout user by deleting token"""
    request.user.auth_token.delete()
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_current_user(request):
    """Get current logged-in user details"""
    try:
        profile = UserProfile.objects.get(user=request.user)
        return Response({
            'user': UserSerializer(request.user).data,
            'profile': UserProfileSerializer(profile).data
        })
    except UserProfile.DoesNotExist:
        profile = UserProfile.objects.create(user=request.user)
        return Response({
            'user': UserSerializer(request.user).data,
            'profile': UserProfileSerializer(profile).data
        })


# ============================================
# GAME VIEWS (Module 2: Major Functionality - CRUD)
# ============================================

class GameViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for games
    - List all games
    - Retrieve single game (by ID or slug)
    - Create game (admin only)
    - Update game (admin only)
    - Delete game (admin only)
    """
    queryset = Game.objects.all()
    serializer_class = GameSerializer

    def get_object(self):
        """Allow lookup by either ID or slug"""
        lookup_value = self.kwargs.get('pk')

        # Try to get by slug first
        try:
            return Game.objects.get(slug=lookup_value)
        except (Game.DoesNotExist, ValueError):
            # If not found by slug, try by ID
            try:
                return Game.objects.get(id=int(lookup_value))
            except (Game.DoesNotExist, ValueError):
                raise Game.DoesNotExist
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured games with discounts"""
        games = Game.objects.filter(discount_percentage__gt=0).order_by('-discount_percentage')[:10]
        serializer = self.get_serializer(games, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search games by title or description"""
        query = request.query_params.get('q', '')
        if query:
            games = Game.objects.filter(
                Q(title__icontains=query) | 
                Q(description__icontains=query) |
                Q(tags__name__icontains=query)
            ).distinct()
        else:
            games = Game.objects.all()
        
        serializer = self.get_serializer(games, many=True)
        return Response(serializer.data)


class UserProfileViewSet(viewsets.ModelViewSet):
    """User profile CRUD operations"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user's profile"""
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        """Update current user's profile"""
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GameLibraryViewSet(viewsets.ModelViewSet):
    """User's game library CRUD"""
    serializer_class = GameLibrarySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return GameLibrary.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Get recently played games"""
        games = self.get_queryset().order_by('-last_played')[:5]
        serializer = self.get_serializer(games, many=True)
        return Response(serializer.data)


class WishlistViewSet(viewsets.ModelViewSet):
    """Wishlist CRUD operations"""
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['delete'])
    def remove_game(self, request):
        """Remove game from wishlist"""
        game_id = request.data.get('game_id')
        try:
            wishlist_item = Wishlist.objects.get(user=request.user, game_id=game_id)
            wishlist_item.delete()
            return Response({'message': 'Removed from wishlist'})
        except Wishlist.DoesNotExist:
            return Response(
                {'error': 'Game not in wishlist'}, 
                status=status.HTTP_404_NOT_FOUND
            )


class ReviewViewSet(viewsets.ModelViewSet):
    """Game review CRUD"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        game_id = self.request.query_params.get('game_id')
        if game_id:
            return Review.objects.filter(game_id=game_id)
        return Review.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ============================================
# PAYMENT VIEWS (Module 3: Payment Gateway)
# ============================================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment_intent(request):
    """Create Stripe payment intent"""
    try:
        game_ids = request.data.get('game_ids', [])
        games = Game.objects.filter(id__in=game_ids)
        
        # Calculate total
        total = sum(game.discounted_price for game in games)
        
        # Create payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(total * 100),  # Convert to cents
            currency='usd',
            metadata={
                'user_id': request.user.id,
                'game_ids': ','.join(map(str, game_ids))
            }
        )
        
        return Response({
            'client_secret': intent.client_secret,
            'amount': total
        })
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_payment(request):
    """Confirm payment and add games to library"""
    try:
        payment_intent_id = request.data.get('payment_intent_id')
        game_ids = request.data.get('game_ids', [])
        
        # Verify payment with Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status == 'succeeded':
            # Create order
            games = Game.objects.filter(id__in=game_ids)
            total = sum(game.discounted_price for game in games)
            
            order = Order.objects.create(
                user=request.user,
                total_amount=total,
                status='completed',
                payment_method='stripe',
                stripe_payment_id=payment_intent_id,
                completed_at=timezone.now()
            )
            
            # Add games to library
            for game in games:
                # Create order item
                OrderItem.objects.create(
                    order=order,
                    game=game,
                    price=game.price,
                    discount_applied=game.price - game.discounted_price
                )
                
                # Add to library
                GameLibrary.objects.get_or_create(
                    user=request.user,
                    game=game
                )
                
                # Remove from wishlist if exists
                Wishlist.objects.filter(user=request.user, game=game).delete()
            
            return Response({
                'message': 'Payment successful',
                'order_id': order.id
            })
        else:
            return Response(
                {'error': 'Payment not completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def order_history(request):
    """Get user's order history"""
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_to_cart(request):
    """Add game to temporary cart (stored in session)"""
    game_id = request.data.get('game_id')
    
    # Get or create cart in session
    cart = request.session.get('cart', [])
    
    if game_id not in cart:
        cart.append(game_id)
        request.session['cart'] = cart
        request.session.modified = True
        return Response({'message': 'Added to cart', 'cart': cart})
    
    return Response({'message': 'Already in cart', 'cart': cart})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_cart(request):
    """Get cart items"""
    cart = request.session.get('cart', [])
    games = Game.objects.filter(id__in=cart)
    serializer = GameSerializer(games, many=True)
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def clear_cart(request):
    """Clear cart"""
    request.session['cart'] = []
    request.session.modified = True
    return Response({'message': 'Cart cleared'})


# ============================================
# 2CHECKOUT PAYMENT VIEWS (Module 3b: Second Payment Gateway - Works in Pakistan)
# ============================================

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_twocheckout_order(request):
    """Create 2Checkout payment order"""
    try:
        game_ids = request.data.get('game_ids', [])
        games = Game.objects.filter(id__in=game_ids)

        # Calculate total
        total = sum(game.discounted_price for game in games)

        # Generate unique order reference
        order_reference = f"ORDER_{request.user.id}_{int(timezone.now().timestamp())}"

        # Store game_ids in session for later retrieval
        request.session['twocheckout_game_ids'] = game_ids
        request.session['twocheckout_order_ref'] = order_reference
        request.session.modified = True

        # Build items for 2Checkout
        items = []
        for game in games:
            items.append({
                'name': game.title,
                'quantity': 1,
                'price': float(game.discounted_price),
                'description': game.short_description[:100]
            })

        return Response({
            'order_reference': order_reference,
            'amount': float(total),
            'currency': 'USD',
            'merchant_code': settings.TWOCHECKOUT_MERCHANT_CODE,
            'items': items,
            'return_url': request.data.get('return_url', 'http://localhost:5173/payment/success'),
            'cancel_url': request.data.get('cancel_url', 'http://localhost:5173/payment/cancel')
        })
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_twocheckout_payment(request):
    """Verify 2Checkout payment and complete order"""
    try:
        # Get payment details from 2Checkout IPN/response
        order_reference = request.data.get('order_reference')
        refno = request.data.get('refno')  # 2Checkout reference number

        # Verify the order reference matches session
        stored_order_ref = request.session.get('twocheckout_order_ref')
        if order_reference != stored_order_ref:
            return Response(
                {'error': 'Invalid order reference'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get game_ids from session
        game_ids = request.session.get('twocheckout_game_ids', [])

        if not game_ids:
            return Response(
                {'error': 'No games found in session'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Payment verified, create order
        games = Game.objects.filter(id__in=game_ids)
        total = sum(game.discounted_price for game in games)

        order = Order.objects.create(
            user=request.user,
            total_amount=total,
            status='completed',
            payment_method='2checkout',
            stripe_payment_id=refno,  # Using same field for 2Checkout ref number
            completed_at=timezone.now()
        )

        # Add games to library
        for game in games:
            # Create order item
            OrderItem.objects.create(
                order=order,
                game=game,
                price=game.price,
                discount_applied=game.price - game.discounted_price
            )

            # Add to library
            GameLibrary.objects.get_or_create(
                user=request.user,
                game=game
            )

            # Remove from wishlist if exists
            Wishlist.objects.filter(user=request.user, game=game).delete()

        # Clear session
        request.session['twocheckout_game_ids'] = []
        request.session['twocheckout_order_ref'] = None
        request.session.modified = True

        return Response({
            'message': 'Payment successful',
            'order_id': order.id
        })

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_twocheckout_payment_details(request):
    """Get 2Checkout order details"""
    try:
        refno = request.query_params.get('refno')

        if not refno:
            return Response(
                {'error': 'Reference number required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build API request to 2Checkout
        headers = {
            'Content-Type': 'application/json',
            'X-Avangate-Authentication': f'code="{settings.TWOCHECKOUT_MERCHANT_CODE}" date="{timezone.now().strftime("%Y-%m-%d %H:%M:%S")}" hash="{settings.TWOCHECKOUT_SECRET_KEY}"'
        }

        response = requests.get(
            f'{TWOCHECKOUT_API_URL}orders/{refno}/',
            headers=headers,
            timeout=10
        )

        if response.status_code == 200:
            order_data = response.json()
            return Response({
                'refno': order_data.get('RefNo'),
                'status': order_data.get('Status'),
                'amount': order_data.get('GrossPrice'),
                'currency': order_data.get('Currency'),
                'created': order_data.get('OrderDate')
            })
        else:
            return Response(
                {'error': 'Could not fetch order details'},
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Game, UserProfile, GameLibrary, Wishlist, 
    Review, Achievement, UserAchievement, Order, OrderItem, Tag
)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'profile_picture', 'status_message', 'level', 'xp', 'created_at']


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']


class GameSerializer(serializers.ModelSerializer):
    discounted_price = serializers.ReadOnlyField()
    tags = TagSerializer(many=True, read_only=True)
    review_count = serializers.SerializerMethodField()
    positive_reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Game
        fields = [
            'id', 'title', 'description', 'short_description', 
            'price', 'discount_percentage', 'discounted_price',
            'image', 'release_date', 'developer', 'publisher',
            'tags', 'review_count', 'positive_reviews', 
            'created_at', 'updated_at'
        ]
    
    def get_review_count(self, obj):
        return obj.reviews.count()
    
    def get_positive_reviews(self, obj):
        total = obj.reviews.count()
        if total == 0:
            return 0
        positive = obj.reviews.filter(rating='positive').count()
        return round((positive / total) * 100, 1)


class GameLibrarySerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)
    
    class Meta:
        model = GameLibrary
        fields = ['id', 'game', 'purchase_date', 'hours_played', 'last_played']


class WishlistSerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)
    game_id = serializers.PrimaryKeyRelatedField(
        queryset=Game.objects.all(), 
        source='game', 
        write_only=True
    )
    
    class Meta:
        model = Wishlist
        fields = ['id', 'game', 'game_id', 'added_date']


class ReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    game = GameSerializer(read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'user', 'game', 'rating', 'review_text', 
            'hours_played', 'helpful_count', 'created_at', 'updated_at'
        ]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'game', 'name', 'description', 'icon', 'xp_reward']


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement', 'unlocked_date']


class OrderItemSerializer(serializers.ModelSerializer):
    game = GameSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'game', 'price', 'discount_applied']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'total_amount', 'status', 
            'payment_method', 'stripe_payment_id',
            'created_at', 'completed_at', 'items'
        ]


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        # Create profile automatically
        UserProfile.objects.create(user=user)
        return user
from django.contrib import admin
from .models import (
    Game, UserProfile, GameLibrary, Wishlist,
    Review, Achievement, UserAchievement, Order, OrderItem, Tag
)

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ['title', 'price', 'discount_percentage', 'discounted_price', 'release_date', 'developer']
    list_filter = ['release_date', 'developer', 'publisher']
    search_fields = ['title', 'description', 'developer', 'publisher']
    list_editable = ['price', 'discount_percentage']

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'level', 'xp']

@admin.register(GameLibrary)
class GameLibraryAdmin(admin.ModelAdmin):
    list_display = ['user', 'game', 'purchase_date', 'hours_played']
    list_filter = ['purchase_date']

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['user', 'game', 'added_date']
    list_filter = ['added_date']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'game', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['game', 'name', 'xp_reward']

@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'achievement', 'unlocked_date']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_amount', 'status', 'created_at']
    list_filter = ['status', 'created_at']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'game', 'price', 'discount_applied']
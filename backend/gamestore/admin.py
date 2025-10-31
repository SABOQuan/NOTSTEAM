from django.contrib import admin
from django.db.models import Count, Sum, Avg
from django.utils.html import format_html
from .models import (
    Game, Genre, UserProfile, GameLibrary, Wishlist,
    Review, Achievement, UserAchievement, Order, OrderItem, Tag
)

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'game_count']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'description')
        }),
        ('SEO Settings', {
            'fields': ('meta_title', 'meta_description'),
        }),
    )

    def game_count(self, obj):
        return obj.games.count()
    game_count.short_description = 'Number of Games'


@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ['title', 'get_genres', 'price', 'discount_percentage', 'discounted_price',
                    'positive_reviews', 'total_sales', 'revenue', 'release_date', 'developer']
    list_filter = ['release_date', 'developer', 'publisher', 'genres']
    search_fields = ['title', 'slug', 'description', 'developer', 'publisher', 'meta_keywords']
    list_editable = ['price', 'discount_percentage', 'positive_reviews']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['genres']
    readonly_fields = ['total_sales', 'revenue', 'review_stats']
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'genres', 'short_description', 'description')
        }),
        ('Pricing', {
            'fields': ('price', 'discount_percentage')
        }),
        ('Publishing', {
            'fields': ('developer', 'publisher', 'release_date', 'image')
        }),
        ('SEO Settings', {
            'fields': ('meta_title', 'meta_description', 'meta_keywords'),
        }),
        ('Reviews & Analytics', {
            'fields': ('positive_reviews', 'total_sales', 'revenue', 'review_stats')
        }),
    )

    def get_genres(self, obj):
        return ", ".join([genre.name for genre in obj.genres.all()])
    get_genres.short_description = 'Genres'

    def total_sales(self, obj):
        return OrderItem.objects.filter(game=obj, order__status='completed').count()
    total_sales.short_description = 'Total Sales'

    def revenue(self, obj):
        total = OrderItem.objects.filter(
            game=obj,
            order__status='completed'
        ).aggregate(total=Sum('price'))['total'] or 0
        return f'${total:.2f}'
    revenue.short_description = 'Total Revenue'

    def review_stats(self, obj):
        reviews = Review.objects.filter(game=obj)
        total = reviews.count()
        if total == 0:
            return 'No reviews yet'
        positive = reviews.filter(rating='positive').count()
        percentage = (positive / total) * 100
        return format_html(
            '<strong>{}/{}</strong> positive ({}%)',
            positive, total, round(percentage, 1)
        )
    review_stats.short_description = 'Review Stats'


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name', 'game_count']
    search_fields = ['name']

    def game_count(self, obj):
        return obj.games.count()
    game_count.short_description = 'Number of Games'

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'level', 'xp', 'games_owned', 'total_spent']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'games_owned', 'total_spent']

    def games_owned(self, obj):
        return GameLibrary.objects.filter(user=obj.user).count()
    games_owned.short_description = 'Games Owned'

    def total_spent(self, obj):
        total = Order.objects.filter(
            user=obj.user,
            status='completed'
        ).aggregate(total=Sum('total_amount'))['total'] or 0
        return f'${total:.2f}'
    total_spent.short_description = 'Total Spent'

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
    list_display = ['id', 'user', 'total_amount', 'status', 'payment_method', 'created_at', 'completed_at']
    list_filter = ['status', 'payment_method', 'created_at']
    search_fields = ['user__username', 'user__email', 'stripe_payment_id']
    readonly_fields = ['stripe_payment_id', 'created_at', 'completed_at']
    date_hierarchy = 'created_at'

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'game', 'price', 'discount_applied']
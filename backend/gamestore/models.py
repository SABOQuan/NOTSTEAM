from django.db import models
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from PIL import Image
from io import BytesIO
import sys

class Game(models.Model):
    """Main Game model for the store"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    short_description = models.CharField(max_length=500)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_percentage = models.IntegerField(default=0)
    image = models.ImageField(upload_to='games/', blank=True, null=True)
    release_date = models.DateField()
    developer = models.CharField(max_length=200)
    publisher = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        """Override save to compress image before uploading"""
        if self.image:
            # Open the image
            img = Image.open(self.image)

            # Convert to RGB if necessary (for PNG with transparency)
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background

            # Resize if image is too large (max 1920px width)
            max_width = 1920
            if img.width > max_width:
                ratio = max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)

            # Compress image to under 10MB
            output = BytesIO()
            quality = 85
            img.save(output, format='JPEG', quality=quality, optimize=True)

            # If still too large, reduce quality further
            while output.tell() > 9 * 1024 * 1024 and quality > 20:  # 9MB to be safe
                output = BytesIO()
                quality -= 5
                img.save(output, format='JPEG', quality=quality, optimize=True)

            output.seek(0)

            # Replace the image file with compressed version
            self.image.save(
                self.image.name.rsplit('.', 1)[0] + '.jpg',
                ContentFile(output.read()),
                save=False
            )

        super().save(*args, **kwargs)

    @property
    def discounted_price(self):
        """Calculate discounted price"""
        from decimal import Decimal
        if self.discount_percentage > 0:
            discount = self.price * (Decimal(self.discount_percentage) / Decimal(100))
            return self.price - discount
        return self.price


class UserProfile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    status_message = models.CharField(max_length=500, blank=True)
    level = models.IntegerField(default=1)
    xp = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"


class GameLibrary(models.Model):
    """User's game library"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='library')
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)
    hours_played = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_played = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ('user', 'game')
    
    def __str__(self):
        return f"{self.user.username} - {self.game.title}"


class Wishlist(models.Model):
    """User's wishlist"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wishlist')
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    added_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'game')
    
    def __str__(self):
        return f"{self.user.username} - {self.game.title}"


class Review(models.Model):
    """Game reviews"""
    RATING_CHOICES = [
        ('positive', 'Positive'),
        ('negative', 'Negative'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='reviews')
    rating = models.CharField(max_length=10, choices=RATING_CHOICES)
    review_text = models.TextField()
    hours_played = models.DecimalField(max_digits=10, decimal_places=2)
    helpful_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'game')
    
    def __str__(self):
        return f"{self.user.username}'s review of {self.game.title}"


class Achievement(models.Model):
    """Game achievements"""
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='achievements')
    name = models.CharField(max_length=200)
    description = models.TextField()
    icon = models.ImageField(upload_to='achievements/', blank=True, null=True)
    xp_reward = models.IntegerField(default=10)
    
    def __str__(self):
        return f"{self.game.title} - {self.name}"


class UserAchievement(models.Model):
    """User's unlocked achievements"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('user', 'achievement')
    
    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"


class Order(models.Model):
    """Payment orders"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_method = models.CharField(max_length=50)
    stripe_payment_id = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"


class OrderItem(models.Model):
    """Items in an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    discount_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    def __str__(self):
        return f"{self.order.id} - {self.game.title}"


class Tag(models.Model):
    """Game tags/categories"""
    name = models.CharField(max_length=50, unique=True)
    games = models.ManyToManyField(Game, related_name='tags')
    
    def __str__(self):
        return self.name
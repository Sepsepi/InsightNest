from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Transaction(models.Model):
    """
    Represents a single customer transaction uploaded by a user.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    customer_id = models.CharField(max_length=255, db_index=True) # Assuming customer ID can be alphanumeric
    purchase_date = models.DateField(db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    city = models.CharField(max_length=100, db_index=True)
    product_type = models.CharField(max_length=100, db_index=True, blank=True, null=True, help_text="Potato variety/type")
    amount_100kg = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    loyalty_points = models.PositiveIntegerField(default=0, help_text="Loyalty points for this transaction")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-purchase_date'] # Default ordering
        # Ensure a user cannot upload the exact same transaction details multiple times?
        # unique_together = ('user', 'customer_id', 'purchase_date', 'amount') # Optional: depends on requirements

    def __str__(self):
        return f"User {self.user.username} - Customer {self.customer_id} - {self.purchase_date} - ${self.amount} - {self.city}"

class UploadedFile(models.Model):
    """
    Stores uploaded transaction files for each user, allowing download/view later.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_files')
    file = models.FileField(upload_to='uploads/')
    original_filename = models.CharField(max_length=255)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.original_filename} ({self.user.username}) - {self.uploaded_at}"

# We might add an RFMSegment model later if we want to persist calculated segments
# class RFMSegment(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rfm_segments')
#     customer_id = models.CharField(max_length=255, db_index=True)
#     recency_score = models.IntegerField()
#     frequency_score = models.IntegerField()
#     monetary_score = models.IntegerField()
#     segment = models.CharField(max_length=50) # e.g., 'VIP', 'Loyal', 'At Risk'
#     calculated_at = models.DateTimeField(default=timezone.now)
#
#     class Meta:
#         unique_together = ('user', 'customer_id') # Only one segment per customer per user
#         ordering = ['-calculated_at']

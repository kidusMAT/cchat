from django.db import models

class PartnerInquiry(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('reviewed', 'Reviewed'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]
    name = models.CharField(max_length=120)
    brand = models.CharField(max_length=120)
    email = models.EmailField()
    placement_interest = models.CharField(max_length=100)
    idea = models.TextField()
    agreed_terms = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inquiry from {self.name} ({self.brand})"


class SponsorPlacement(models.Model):
    brand_name = models.CharField(max_length=100)
    headline = models.CharField(max_length=200)
    tagline = models.CharField(max_length=300)
    image_url = models.CharField(max_length=500, blank=True, default='')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.brand_name


class SponsorMenuItem(models.Model):
    sponsor = models.ForeignKey(SponsorPlacement, on_delete=models.CASCADE, related_name='menu_items')
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=250)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.name


class SponsorTrack(models.Model):
    sponsor = models.ForeignKey(SponsorPlacement, on_delete=models.CASCADE, related_name='tracks')
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=150)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

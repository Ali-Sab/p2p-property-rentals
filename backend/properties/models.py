from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from users.models import User, BaseReview, Comment
from django.contrib.contenttypes.fields import GenericRelation

class Property(models.Model):
  name = models.CharField(max_length=200, blank=False, null=False)
  guests = models.IntegerField(blank=False, null=False, validators=[
    MinValueValidator(1)
  ])
  beds = models.IntegerField(blank=False, null=False, validators=[
    MinValueValidator(1)
  ])
  bathrooms = models.IntegerField(blank=False, null=False, validators=[
    MinValueValidator(1)
  ])
  rating = models.DecimalField(default=3, decimal_places=2, max_digits=3, validators=[
    MinValueValidator(1),
    MaxValueValidator(5)
  ])
  num_ratings = models.IntegerField(default=0)
  amenities = models.JSONField()
  description = models.TextField(blank=False, null=False)
  owner = models.ForeignKey(User, on_delete=models.CASCADE, null=False)

class PricePeriod(models.Model):
  price = models.DecimalField(blank=False, null=False, decimal_places=2, max_digits=7, validators=[
    MinValueValidator(0)
  ])
  date_start = models.DateField(blank=False, null=False)
  date_end = models.DateField(blank=False, null=False)
  property = models.ForeignKey(Property, on_delete=models.CASCADE, null=False)
  available = models.BooleanField(default=True)

class PropertyReview(BaseReview):
  property = models.ForeignKey(Property, on_delete=models.CASCADE, null=False, related_name='property_reviews')

class Reservation(models.Model):
  state = models.CharField(max_length=20)
  price = models.DecimalField(blank=False, null=False, decimal_places=2, max_digits=7, validators=[
    MinValueValidator(0)
  ])
  date_start = models.DateTimeField(blank=False, null=False)
  date_end = models.DateTimeField(blank=False, null=False)
  date_created = models.DateTimeField(auto_now_add=True)
  property = models.ForeignKey(Property, on_delete=models.SET_NULL, null=True)
  host = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='host_reservation')
  user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='user_reservation')
  reply_by = models.DateTimeField(blank=False, null=False)
  
class ImageModel(models.Model):
  image = models.ImageField(upload_to='properties/')
  property = models.ForeignKey(Property, on_delete=models.CASCADE, null=False, related_name='images')
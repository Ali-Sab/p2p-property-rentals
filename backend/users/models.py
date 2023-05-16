from django.db import models
from django.contrib.auth.models import User as UserBase
from phonenumber_field.modelfields import PhoneNumberField
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation

class User(UserBase):
  phone_number = PhoneNumberField(blank=False, null=False)
  rating = models.DecimalField(default=3, decimal_places=2, max_digits=3, validators=[
    MinValueValidator(1),
    MaxValueValidator(5)
  ])
  num_ratings = models.IntegerField(default=0)
  avatar = models.ImageField(upload_to='avatars/')

class BaseReview(models.Model):
  rating = models.IntegerField(null=False, blank=False, validators=[
    MinValueValidator(1),
    MaxValueValidator(5)
  ])
  review_text = models.TextField(null=False, blank=False)
  review_date = models.DateTimeField(auto_now_add=True)
  reviewer_name = models.CharField(max_length=300, null=False, blank=False)
  reviewer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
  comments = GenericRelation('Comment')

class Comment(models.Model):
  comment_text = models.TextField(null=False, blank=False)
  commenter_name = models.CharField(max_length=300, null=False, blank=False)
  commenter = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
  comment_date = models.DateTimeField(auto_now_add=True)
  content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
  object_id = models.PositiveIntegerField()
  review = GenericForeignKey('content_type', 'object_id')

class UserReview(BaseReview):
  user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
  
class Notification(models.Model):
  notification_msg = models.CharField(max_length=300, null=False, blank=False)
  date_created = models.DateTimeField(auto_now_add=True)
  user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
  content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
  object_id = models.PositiveIntegerField()
  content_object = GenericForeignKey('content_type', 'object_id')
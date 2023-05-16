import datetime

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, password_validation
from django.shortcuts import get_object_or_404
from django.http import HttpResponseForbidden, HttpResponseBadRequest
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import Http404
from phonenumber_field.serializerfields import PhoneNumberField

from .models import User, Property, ImageModel, PricePeriod, PropertyReview, Reservation
from users.models import Comment


class CreatePropertySerializer(serializers.ModelSerializer):
  owner_username = serializers.CharField(required=True)

  class Meta:
    model = Property
    exclude = ['owner', 'rating']

  def validate_owner_username(self, value):
    try:
      owner = User.objects.get(username=value)
    except Exception as e:
      raise ValidationError("Owner not found")
    return owner

  def create(self, validated_data):
    validated_data['owner'] = validated_data['owner_username']
    validated_data['rating'] = 3
    owner_username = validated_data.pop('owner_username')
    super().create(validated_data)
    validated_data['owner_username'] = owner_username
    validated_data.pop('owner')
    validated_data.pop('rating')
    return validated_data
  
class GetPropertySerializer(serializers.ModelSerializer):
  class Meta:
    model = Property
    exclude = []

class EditPropertyDetailsSerializer(serializers.ModelSerializer):
  class Meta:
    model = Property
    fields = ['name', 'guests', 'beds', 'bathrooms']
  
class EditPropertyDescriptionSerializer(serializers.ModelSerializer):
  class Meta:
    model = Property
    fields = ['description', 'amenities']
  
class DeletePropertySerializer(serializers.ModelSerializer):
  class Meta:
    model = Property
    exclude = []

class ImageModelSerializer(serializers.ModelSerializer):
  class Meta:
    model = ImageModel
    exclude = []
  
  def create(self, validated_data):
    image_model = ImageModel.objects.create(
      image=validated_data['image'],
      property=validated_data['property']
    )
    return validated_data
  
class GetImageModelSerializer(serializers.ModelSerializer):
  class Meta:
    model = ImageModel
    fields = ['id', 'image']

class GetPropertiesSerializer(serializers.Serializer):
  id = serializers.IntegerField()
  name = serializers.CharField()
  description = serializers.CharField()
  images = GetImageModelSerializer(many=True)

  #https://blog.devgenius.io/react-tips-back-button-stop-event-bubbling-merging-states-5aca03bf50f9#:~:text=For-,instance%2C%20we,-can%20write%3B

class PricePeriodSerializer(serializers.ModelSerializer):
  class Meta:
    model = PricePeriod
    fields = '__all__'

  def validate(self, attrs):
    if attrs['date_end'] < attrs['date_start']:
      raise ValidationError({'date_end':'End Date should be after Start Date'})
    if attrs['date_start'] < datetime.datetime.now().date():
      raise ValidationError({'date_start':'Start Date should not be prior to today'})
    return super().validate(attrs)
  
  def create(self, validated_data):
    property_id = validated_data['property']
    price_periods = PricePeriod.objects.filter(property_id=validated_data['property']).order_by('date_start').values()

    date_start = validated_data['date_start']
    date_end = validated_data['date_end']
    
    for price_period in price_periods:
      if date_end < price_period['date_start']:
        break
      elif date_start > price_period['date_end']:
        continue

      if date_end < price_period['date_end']:
        PricePeriod.objects.create(
          property=property_id,
          date_start=date_end + datetime.timedelta(days=1),
          date_end=price_period['date_end'],
          price=price_period['price'],
          available=price_period['available']
        )

      if date_start > price_period['date_start']:
        PricePeriod.objects.create(
          property=property_id,
          date_start=price_period['date_start'],
          date_end=date_start - datetime.timedelta(days=1),
          price=price_period['price'],
          available=price_period['available']
        )
      PricePeriod.objects.filter(id=price_period['id']).delete()
    PricePeriod.objects.create(
      property=validated_data['property'],
      date_start=date_start,
      date_end=date_end,
      price=validated_data['price'],
      available=validated_data['available']
    )
    return validated_data
  
class GetPricePeriodSerializer(serializers.ModelSerializer):
  class Meta:
    model = PricePeriod
    fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
  class Meta:
    model = Comment
    fields = ['comment_text', 'commenter_name', 'comment_date', 'commenter']

class GetPropertyReviewsSerializer(serializers.ModelSerializer):
  comments = CommentSerializer(many=True)

  class Meta:
    model = PropertyReview
    exclude = ['property',]
    ordering = ['-id']

  def to_representation(self, instance):
    response = super().to_representation(instance)
    sorted_comments = sorted(response.get('comments'), key=lambda x: x.get('comment_date'), reverse=False)
    response['comments'] = sorted_comments
    return response


class CreatePropertyReviewSerializer(serializers.ModelSerializer):
  reviewer_username = serializers.CharField(required=True)

  class Meta:
    model = PropertyReview
    fields = ['rating', 'review_text',
              'reviewer_username', 'property']

  def validate_reviewer_username(self, value):
    if not User.objects.filter(username=value).exists():
      raise ValidationError("Reviewer does not exist")
    return value

  def create(self, validated_data):
    reviewer = User.objects.get(username=validated_data['reviewer_username'])
    reviewer_name = reviewer.first_name + " " + reviewer.last_name
    property = validated_data['property']
    
    property_review = PropertyReview.objects.create(
        rating=validated_data['rating'],
        review_text=validated_data['review_text'],
        reviewer=reviewer,
        reviewer_name=reviewer_name,
        property=property
    )
    current_rating = property.rating
    current_num_ratings = property.num_ratings
    property.num_ratings = current_num_ratings + 1
    property.rating = ((current_rating * current_num_ratings) +
                       property_review.rating) / property.num_ratings
    property.save()
    return validated_data

class CreatePropertyCommentSerializer(serializers.ModelSerializer):
  commenter_username = serializers.CharField(required=True)

  class Meta:
    model = Comment
    fields = ['comment_text', 'commenter_username', 'object_id']

  def validate_commenter_username(self, value):
    try:
      user = User.objects.get(username=value)
    except Exception as e:
      raise ValidationError("Commenter does not exist")
    return user.first_name + " " + user.last_name

  def validate_object_id(self, value):
    try:
      review = PropertyReview.objects.get(id=value)
    except Exception as e:
      raise ValidationError("Review not found")
    return review

  def create(self, validated_data):
    commenter = User.objects.get(username=self.initial_data['commenter_username'])
    comment = Comment.objects.create(
        commenter_name=validated_data['commenter_username'],
        commenter=commenter,
        comment_text=validated_data['comment_text'],
        review=validated_data['object_id']
    )
    validated_data['object_id'] = comment.object_id
    return validated_data

class SearchPropertySerializer(serializers.Serializer):
  id = serializers.IntegerField()
  name = serializers.CharField()
  guests = serializers.IntegerField()
  beds = serializers.IntegerField()
  bathrooms = serializers.IntegerField()
  rating = serializers.DecimalField(decimal_places=2, max_digits=3)
  num_ratings = serializers.IntegerField()
  amenities = serializers.JSONField()
  description = serializers.CharField()
  owner_id = serializers.IntegerField()
  price = serializers.DecimalField(decimal_places=2, max_digits=7)
  images = GetImageModelSerializer(many=True)

class CreateReservationSerializer(serializers.ModelSerializer):
  user = serializers.CharField(required=True)

  class Meta:
    model = Reservation
    exclude = ['host', 'state', 'price']

  def validate_user(self, value):
    try:
      user = User.objects.get(username=value)
    except Exception as e:
      raise ValidationError("User does not exist")
    return user

  def validate(self, attrs):
    if attrs['date_end'] < attrs['date_start']:
      raise ValidationError({'date_end':'End Date should be after Start Date'})
    if attrs['property'].owner.username == attrs['user'].username:
      raise ValidationError({"property": "A host cannot reserve their own property."})
    
    # Validate that the property is available at this time and compute price
    date_start = attrs['date_start'].date()
    date_end = attrs['date_end'].date()
    price_periods = PricePeriod.objects.filter(available=True, property=attrs['property']).order_by('date_start')
    start_from_date = None
    price = 0
    property_available = False
    for price_period in price_periods:
      if date_start >= price_period.date_start:
        if date_end <= price_period.date_end:
          delta = date_end - date_start + datetime.timedelta(days=1)
          price += delta.days * price_period.price
          attrs['price'] = price
          property_available = True
          break
        elif date_start <= price_period.date_end:
          start_from_date = price_period.date_end + datetime.timedelta(days=1)
          delta = price_period.date_end - date_start + datetime.timedelta(days=1)
          price += delta.days * price_period.price
      elif start_from_date is not None and start_from_date == price_period.date_start:
        if date_end <= price_period.date_end:
          delta = date_end - price_period.date_start + datetime.timedelta(days=1)
          price += delta.days * price_period.price
          attrs['price'] = price
          property_available = True
          break
        else:
          start_from_date = price_period.date_end + datetime.timedelta(days=1)
          delta = price_period.date_end - price_period.date_start + datetime.timedelta(days=1)
          price += delta.days * price_period.price
    
    if not property_available:
      raise ValidationError({"property": "Property is not available on some or all of the specified dates"})
    return super().validate(attrs)

  def create(self, validated_data):
    # Mark time as booked
    date_start = validated_data['date_start'].date()
    date_end = validated_data['date_end'].date()
    price_periods = PricePeriod.objects.filter(property_id=validated_data['property']).order_by('date_start').values()
    for price_period in price_periods:
      if date_end < price_period['date_start']:
        break
      elif date_start > price_period['date_end']:
        continue

      if date_end < price_period['date_end']:
        PricePeriod.objects.create(
          property=validated_data['property'],
          date_start=date_end + datetime.timedelta(days=1),
          date_end=price_period['date_end'],
          price=price_period['price'],
          available=price_period['available']
        )

      if date_start > price_period['date_start']:
        PricePeriod.objects.create(
          property=validated_data['property'],
          date_start=price_period['date_start'],
          date_end=date_start - datetime.timedelta(days=1),
          price=price_period['price'],
          available=price_period['available']
        )
      PricePeriod.objects.filter(id=price_period['id']).delete()
    delta_days = date_end - date_start + datetime.timedelta(days=1)
    avg_price = validated_data['price'] / delta_days.days
    PricePeriod.objects.create(
      property=validated_data['property'],
      date_start=date_start,
      date_end=date_end,
      price=avg_price,
      available=False
    )
    # Now create the reservation
    validated_data['host'] = validated_data['property'].owner
    validated_data['state'] = 'pending'
    super().create(validated_data)
    validated_data.pop('host')
    validated_data.pop('state')
    validated_data.pop('price')
    validated_data['user'] = validated_data['user'].username
    return validated_data

class UpdateReservationSerializer(serializers.ModelSerializer):
  class Meta:
    model = Reservation
    fields = ['state']
  
class ReservationSerializer(serializers.Serializer):
  id = serializers.IntegerField()
  state = serializers.CharField()
  property_name = serializers.CharField()
  property_id = serializers.IntegerField()
  date_start = serializers.DateTimeField()
  date_end = serializers.DateTimeField()
  reply_by = serializers.DateTimeField()
  avg_price = serializers.DecimalField(decimal_places=2, max_digits=7)
  user_name = serializers.CharField()
  user_email = serializers.EmailField()
  user_id = serializers.IntegerField()
  user_phone_number = serializers.IntegerField()
  images = GetImageModelSerializer(many=True)
  can_review = serializers.BooleanField()
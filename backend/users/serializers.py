import datetime as datetime

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, password_validation
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import Http404

from .models import User, UserReview, Comment, Notification


REMEMBER_ME_LIFETIME = datetime.timedelta(days=30)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
  remember_me = serializers.BooleanField(default=False)
  id = serializers.IntegerField()

  def validate(self, attrs):
    initialData = self.get_initial()
    data = super(TokenObtainPairSerializer, self).validate(attrs)
    rememberMe = initialData.get('remember_me')
    refresh = self.get_token(self.user)
    user = User.objects.get(username=self.user)

    if (type(rememberMe) is str and rememberMe.lower() == 'true') or (type(rememberMe) is bool and rememberMe is True):
      refresh.set_exp(lifetime=REMEMBER_ME_LIFETIME)

    data['refresh'] = str(refresh)
    data['access'] = str(refresh.access_token)
    data['id'] = user.id
    return data


class CustomTokenRefreshSerializer(TokenRefreshSerializer):
  def validate(self, attrs):
    refresh_token = RefreshToken(attrs["refresh"])
    lifetime = datetime.timedelta(
        seconds=refresh_token.payload['exp'] - refresh_token.payload['iat'])

    data = super().validate(attrs)

    refresh_token = RefreshToken(data['refresh'])
    refresh_token.set_exp(lifetime=lifetime)
    data['refresh'] = str(refresh_token)
    return data


class RegisterSerializer(serializers.ModelSerializer):
  confirm_password = serializers.CharField(required=True)

  class Meta:
    model = User
    fields = ['email', 'first_name',
              'last_name', 'phone_number', 'avatar', 'password', 'confirm_password']
    extra_kwargs = {
        'email': {'required': True},
        'first_name': {'required': True},
        'last_name': {'required': True},
    }

  def validate_email(self, value):
    if value:
      try:
        validate_email(value)
      except ValidationError as e:
        raise ValidationError("Enter a valid email address")
      if len(value) > 150:
        raise ValidationError("We only accept email addresses with less than 150 characters")
      if User.objects.filter(email=value).exists():
        raise ValidationError("A user with that email already exists")
    else:
      raise ValidationError("Enter a valid email address")
    return value

  def validate_first_name(self, value):
    if not value:
      raise ValidationError("This field may not be blank")
    return value

  def validate_last_name(self, value):
    if not value:
      raise ValidationError("This field may not be blank")
    return value

  def validate_password(self, value):
    if value:
      try:
        password_validation.validate_password(value, self.instance)
      except ValidationError as e:
        raise ValidationError(e)
    return value

  def validate(self, attrs):
    attrs = super().validate(attrs)
    password1 = attrs.get('password')
    password2 = attrs.get('confirm_password')
    if password1 and password2 and password1 != password2:
      raise ValidationError(
          {'confirm_password': "The two password fields didn't match"})
    return attrs

  def create(self, validated_data):
    validated_data['username'] = validated_data['email']
    user = User.objects.create(
        username=validated_data['username'],
        email=validated_data['email'],
        first_name=validated_data['first_name'],
        last_name=validated_data['last_name'],
        phone_number=validated_data['phone_number'],
        avatar=validated_data['avatar'],
    )
    user.set_password(validated_data['password'])
    user.save()
    validated_data['password'] = "hidden"
    validated_data['confirm_password'] = "hidden"
    return validated_data


class GetProfileSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['id', 'email', 'first_name', 'last_name', 'phone_number',
              'rating', 'num_ratings', 'avatar', 'date_joined']


class EditNameProfileSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['first_name', 'last_name',]
    extra_kwargs = {
        'first_name': {'required': True},
        'last_name': {'required': True},
    }

  def validate_first_name(self, value):
    if not value:
      raise ValidationError("This field may not be blank")
    return value

  def validate_last_name(self, value):
    if not value:
      raise ValidationError("This field may not be blank")
    return value


class EditEmailProfileSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['email',]
    extra_kwargs = {
        'email': {'required': True},
    }

  def validate_email(self, value):
    if value:
      try:
        validate_email(value)
      except ValidationError as e:
        print(e)
        raise ValidationError("Enter a valid email address")
      if User.objects.filter(email=value).exists():
        raise ValidationError("A user with that email already exists")
    else:
      raise ValidationError("Enter a valid email address")
    return value

  def update(self, instance, validated_data):
    validated_data['username'] = validated_data['email']
    return super().update(instance, validated_data)


class EditPhoneNumberProfileSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['phone_number',]


class EditAvatarProfileSerializer(serializers.ModelSerializer):
  class Meta:
    model = User
    fields = ['avatar',]


class EditPasswordProfileSerializer(serializers.ModelSerializer):
  confirm_password = serializers.CharField(required=True)

  class Meta:
    model = User
    fields = ['password', 'confirm_password']

  def validate_password(self, value):
    if value:
      try:
        password_validation.validate_password(value, self.instance)
      except ValidationError as e:
        raise ValidationError(e)
    return value

  def validate(self, attrs):
    attrs = super().validate(attrs)
    password1 = attrs.get('password')
    password2 = attrs.get('confirm_password')
    if password1 and password2 and password1 != password2:
      raise ValidationError(
          {'confirm_password': "The two password fields didn't match"})
    return attrs

  def update(self, instance, validated_data):
    instance.set_password(validated_data['password'])
    instance.save()
    validated_data['password'] = 'hidden'
    validated_data['confirm_password'] = 'hidden'
    return validated_data

class GetUserReviewsSerializer(serializers.ModelSerializer):

  class Meta:
    model = UserReview
    exclude = ['user',]


class CreateUserReviewSerializer(serializers.ModelSerializer):
  reviewer_username = serializers.CharField(required=True)
  reviewee_username = serializers.CharField(required=True)

  class Meta:
    model = UserReview
    fields = ['rating', 'review_text',
              'reviewer_username', 'reviewee_username']

  def validate_reviewer_username(self, value):
    if not User.objects.filter(username=value).exists():
      raise ValidationError("Reviewer does not exist")
    return value

  def validate_reviewee_username(self, value):
    if not User.objects.filter(username=value).exists():
      raise ValidationError("Reviewee does not exist")
    return value

  def create(self, validated_data):
    reviewer = User.objects.get(username=validated_data['reviewer_username'])
    reviewer_name = reviewer.first_name + " " + reviewer.last_name
    reviewee = User.objects.get(username=validated_data['reviewee_username'])
    user_review = UserReview.objects.create(
        rating=validated_data['rating'],
        review_text=validated_data['review_text'],
        reviewer=reviewer,
        reviewer_name=reviewer_name,
        user=reviewee
    )
    current_rating = reviewee.rating
    current_num_ratings = reviewee.num_ratings
    reviewee.num_ratings = current_num_ratings + 1
    reviewee.rating = ((current_rating * current_num_ratings) +
                       user_review.rating) / reviewee.num_ratings
    reviewee.save()
    return validated_data


class NotificationSerializer(serializers.ModelSerializer):
  class Meta:
    model = Notification
    fields = ['notification_msg', 'id', 'date_created']

from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.generics import CreateAPIView, RetrieveAPIView, UpdateAPIView, ListAPIView, DestroyAPIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from django.http import HttpResponseForbidden
from .serializers import CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer, RegisterSerializer
from .serializers import GetProfileSerializer, EditNameProfileSerializer, EditEmailProfileSerializer
from .serializers import EditPhoneNumberProfileSerializer, EditAvatarProfileSerializer, EditPasswordProfileSerializer
from .serializers import GetUserReviewsSerializer, CreateUserReviewSerializer
from .serializers import NotificationSerializer
from .models import User, UserReview, Notification
from properties.models import Property


class CustomTokenObtainView(TokenObtainPairView):
  serializer_class = CustomTokenObtainPairSerializer

  def post(self, request):
    request.data['id'] = 0
    response = super().post(request)
    return response


class CustomTokenRefreshView(TokenRefreshView):
  serializer_class = CustomTokenRefreshSerializer

class LogoutView(APIView):
  permission_classes = [AllowAny,]
  authentication_classes = []

  def post(self, request):
    try:
      refresh_token = request.data['refresh']
      token = RefreshToken(refresh_token)
      token.blacklist()
      return Response(status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
      print(e)
      return Response(status=status.HTTP_400_BAD_REQUEST)

class RegisterView(CreateAPIView):
  serializer_class = RegisterSerializer

class GetProfileView(RetrieveAPIView):
  permission_classes = [AllowAny,]
  serializer_class = GetProfileSerializer
  queryset = User.objects.all()

  def get_object(self):
    obj = get_object_or_404(self.get_queryset(), id=self.request.query_params['user'])
    return obj

class GetOwnProfileView(RetrieveAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = GetProfileSerializer
  queryset = User.objects.all()

  def get_object(self):
    obj = get_object_or_404(self.get_queryset(), email=self.request.user)
    return obj

class EditNameProfileView(UpdateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = EditNameProfileSerializer
  queryset = User.objects.all()

  def get_object(self):
    obj = get_object_or_404(self.get_queryset(), email=self.request.user)
    return obj
  
class EditEmailProfileView(UpdateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = EditEmailProfileSerializer
  queryset = User.objects.all()

  def get_object(self):
    obj = get_object_or_404(self.get_queryset(), email=self.request.user)
    return obj
  
class EditPhoneNumberProfileView(UpdateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = EditPhoneNumberProfileSerializer
  queryset = User.objects.all()

  def get_object(self):
    obj = get_object_or_404(self.get_queryset(), email=self.request.user)
    return obj
  
class EditAvatarProfileView(UpdateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = EditAvatarProfileSerializer
  queryset = User.objects.all()

  def get_object(self):
    obj = get_object_or_404(self.get_queryset(), email=self.request.user)
    return obj
  
class EditPasswordProfileView(UpdateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = EditPasswordProfileSerializer
  queryset = User.objects.all()

  def get_object(self):
    obj = get_object_or_404(self.get_queryset(), email=self.request.user)
    return obj

class GetUserReviewsView(ListAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = GetUserReviewsSerializer
  def list(self, request, *args, **kwargs):
    host = get_object_or_404(User, username=request.user)
    if not self.request.query_params['user'].isdigit():
      return Response("User with specified ID does not exist.", status=status.HTTP_404_NOT_FOUND)
    user = get_object_or_404(User, id=self.request.query_params['user'])
    if not user.user_reservation.filter(host=host).exists():
      return Response("You can only view reviews for users that have or had reservations with you.", status=status.HTTP_403_FORBIDDEN)
    self.queryset = UserReview.objects.filter(user=user).order_by('-review_date')
    return super().list(request, *args, **kwargs)
  
class CreateUserReviewView(CreateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = CreateUserReviewSerializer

  def create(self, request, *args, **kwargs):
    if hasattr(request.data, '_mutable') and not request.data._mutable:
      request.data._mutable = True
    request.data.update({'reviewer_username':str(request.user)})

    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    reviewer = get_object_or_404(User, username=request.user)
    reviewee = get_object_or_404(User, username=serializer.validated_data['reviewee_username'])

    # Check that the reviewee has been one of the host's properties in the past and the host has not left a review already
    reservations = reviewer.host_reservation.filter(user=reviewee, state='completed')
    reviews = UserReview.objects.filter(user=reviewee, reviewer=reviewer)
    if len(reservations) <= 0 or len(reviews) >= len(reservations):
      return Response({'error': "Host is not permitted to leave a review for this user"}, status=status.HTTP_400_BAD_REQUEST)
    
    self.perform_create(serializer)
    headers = self.get_success_headers(serializer.data)
    return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
  
class GetNotificationsView(ListAPIView):
  serializer_class = NotificationSerializer
  permission_classes = [IsAuthenticated,]

  def list(self, request, *args, **kwargs):
    self.queryset = Notification.objects.filter(user=self.request.user).order_by('-date_created')
    return super().list(request, *args, **kwargs)
  
class DeleteNotificationView(DestroyAPIView):
  serializer_class = NotificationSerializer
  queryset = Notification.objects.all()
  permission_classes = [IsAuthenticated,]

  def destroy(self, request, *args, **kwargs):
    notification = get_object_or_404(Notification, id=self.kwargs.get('pk'))
    user = get_object_or_404(User, username=request.user)
    if notification.user != user:
      return Response("User cannot delete another user's notification", status=status.HTTP_403_FORBIDDEN)
    return super().destroy(request, *args, **kwargs)
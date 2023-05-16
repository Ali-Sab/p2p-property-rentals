import datetime
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.generics import CreateAPIView, RetrieveAPIView, UpdateAPIView, ListAPIView, DestroyAPIView
from rest_framework.response import Response
from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.request import Request
from rest_framework.pagination import PageNumberPagination
from .serializers import CreatePropertySerializer, GetPropertySerializer, EditPropertyDetailsSerializer, EditPropertyDescriptionSerializer, ImageModelSerializer, GetImageModelSerializer, PricePeriodSerializer, GetPricePeriodSerializer, GetPropertyReviewsSerializer, CreatePropertyReviewSerializer, CreatePropertyCommentSerializer, DeletePropertySerializer, CreateReservationSerializer, UpdateReservationSerializer, ReservationSerializer, SearchPropertySerializer, GetPropertiesSerializer
from .models import Property, ImageModel, PricePeriod, PropertyReview, Reservation
from users.models import Notification, User, UserReview


class CreatePropertyView(CreateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = CreatePropertySerializer

  def create(self, request, *args, **kwargs):
    if hasattr(request.data, '_mutable') and not request.data._mutable:
      request.data._mutable = True
    request.data.update({'owner_username': str(request.user)})
    return super().create(request, *args, **kwargs)


class GetPropertyView(RetrieveAPIView):
  permission_classes = [AllowAny,]
  authentication_classes = []
  serializer_class = GetPropertySerializer
  queryset = Property.objects.all()

class EditPropertyDetailsView(UpdateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = EditPropertyDetailsSerializer
  queryset = Property.objects.all()

  def update(self, request, *args, **kwargs):
    property = get_object_or_404(Property, id=self.kwargs.get('pk'))
    user = get_object_or_404(User, username=request.user)
    if property.owner != user:
      return Response("You do not have permission to modify this property.", status=status.HTTP_403_FORBIDDEN)
    return super().update(request, *args, **kwargs)


class EditPropertyDescriptionView(UpdateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = EditPropertyDescriptionSerializer
  queryset = Property.objects.all()

  def update(self, request, *args, **kwargs):
    property = get_object_or_404(Property, id=self.kwargs.get('pk'))
    user = get_object_or_404(User, username=request.user)
    if property.owner != user:
      return Response("You do not have permission to modify this property.", status=status.HTTP_403_FORBIDDEN)
    return super().update(request, *args, **kwargs)


class RemovePropertyView(DestroyAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = DeletePropertySerializer
  queryset = Property.objects.all()

  def destroy(self, request, *args, **kwargs):
    property = get_object_or_404(Property, id=self.kwargs.get('pk'))
    user = get_object_or_404(User, username=request.user)
    if property.owner != user:
      return Response("You do not have permission to modify this property.", status=status.HTTP_403_FORBIDDEN)
    return super().destroy(request, *args, **kwargs)


class CreateImageModelView(CreateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = ImageModelSerializer

  def create(self, request, *args, **kwargs):
    property = get_object_or_404(Property, id=request.data['property'])
    user = get_object_or_404(User, username=request.user)
    if property.owner != user:
      return Response("You do not have permission to modify this property.", status=status.HTTP_403_FORBIDDEN)
    return super().create(request, *args, **kwargs)


class RemoveImageModelView(DestroyAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = ImageModelSerializer
  queryset = ImageModel.objects.all()

  def destroy(self, request, *args, **kwargs):
    property = get_object_or_404(Property, id=request.data['property'])
    user = get_object_or_404(User, username=request.user)
    if property.owner != user:
      return Response("You do not have permission to modify this property.", status=status.HTTP_403_FORBIDDEN)
    return super().destroy(request, *args, **kwargs)


class ListImageModelView(ListAPIView):
  permission_classes = [AllowAny,]
  authentication_classes = []
  serializer_class = GetImageModelSerializer
  pagination_class = None

  def list(self, request, *args, **kwargs):
    self.queryset = ImageModel.objects.filter(
        property_id=self.kwargs.get('pk'))
    return super().list(request, *args, **kwargs)


class CreatePricePeriodView(CreateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = PricePeriodSerializer

  def create(self, request, *args, **kwargs):
    if hasattr(request.data, '_mutable') and not request.data._mutable:
      request.data._mutable = True
    request.data.update({'property': self.kwargs.get('pk')})
    property = get_object_or_404(Property, id=self.kwargs.get('pk'))
    user = get_object_or_404(User, username=request.user)
    if property.owner != user:
      return Response("You do not have permission to modify this property.", status=status.HTTP_403_FORBIDDEN)
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    reservations = serializer.validated_data['property'].reservation_set.filter(
        state__in=['pending', 'approved', 'completed',]).order_by('date_start')

    # Validate that the property is available at this time and compute price
    date_start = serializer.validated_data['date_start']
    date_end = serializer.validated_data['date_end']
    property_available = True
    for reservation in reservations:
      if date_start >= reservation.date_start.date() and date_start <= reservation.date_end.date():
        property_available = False
        break
      elif date_end >= reservation.date_start.date() and date_end <= reservation.date_end.date():
        property_available = False
        break

    if not property_available:
      return Response("Property has already been reserved on some or all of the specified dates", status=status.HTTP_409_CONFLICT)

    self.perform_create(serializer)
    headers = self.get_success_headers(serializer.data)
    return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ListPricePeriodView(ListAPIView):
  permission_classes = [AllowAny,]
  authentication_classes = []
  serializer_class = GetPricePeriodSerializer

  def list(self, request, *args, **kwargs):
    self.queryset = PricePeriod.objects.filter(
        property_id=self.kwargs.get('pk'))
    price_periods = self.queryset.order_by('date_start')
    today_date = datetime.date.today()
    for price_period in price_periods:
      if price_period.available and price_period.date_start < today_date:
        if price_period.date_end < today_date:
          price_period.available = False
          price_period.save()
        else:
          PricePeriod.objects.create(
            property=price_period.property,
            date_start=price_period.date_start,
            date_end=today_date - datetime.timedelta(days=1).date(),
            price=price_period.price,
            available=False
          )
          price_period.date_start = today_date
          price_period.save()
    return super().list(request, *args, **kwargs)


class GetPropertyReviewsView(ListAPIView):
  permission_classes = [AllowAny,]
  authentication_classes = []
  serializer_class = GetPropertyReviewsSerializer

  def list(self, request, *args, **kwargs):
    self.queryset = PropertyReview.objects.filter(
        property_id=self.kwargs.get('pk')).order_by('-review_date')
    return super().list(request, *args, **kwargs)


class CreatePropertyReviewView(CreateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = CreatePropertyReviewSerializer

  def create(self, request, *args, **kwargs):
    if hasattr(request.data, '_mutable') and not request.data._mutable:
      request.data._mutable = True
    request.data.update({'reviewer_username': str(request.user)})
    request.data.update({'property': self.kwargs.get('pk')})
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    reviewer = get_object_or_404(User, username=request.user)
    property = serializer.validated_data['property']

    # Check that the reviewer has been to this property in the past and has not left a review already
    reservations = reviewer.user_reservation.filter(
        property=property, state='completed')
    reviews = PropertyReview.objects.filter(
        property=property, reviewer=reviewer)
    if len(reservations) <= 0 or len(reviews) >= len(reservations):
      return Response("User is not permitted to leave a review for this property", status=status.HTTP_400_BAD_REQUEST)

    self.perform_create(serializer)
    headers = self.get_success_headers(serializer.data)
    response = Response(
        serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    if response.status_code == 201:
      property = get_object_or_404(
          Property.objects.all(), id=self.kwargs.get('pk'))
      user = get_object_or_404(User.objects.all(), username=self.request.user)
      target = get_object_or_404(User.objects.all(), username=property.owner)
      notification_message = f"{user.first_name} {user.last_name} has left a review!"
      Notification.objects.create(
          notification_msg=notification_message,
          user=target,
          content_object=property
      )
    return response


class CreatePropertyCommentView(CreateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = CreatePropertyCommentSerializer

  def create(self, request, *args, **kwargs):
    if hasattr(request.data, '_mutable') and not request.data._mutable:
      request.data._mutable = True
    request.data.update({'commenter_username': str(request.user)})

    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    commenter = get_object_or_404(User, username=request.user)
    review = serializer.validated_data['object_id']
    comment = review.comments.all().order_by('comment_date').last()

    if review.reviewer != commenter and review.property.owner != commenter:
      return Response({'error':"User is not part of this thread."}, status=status.HTTP_403_FORBIDDEN)
    if comment is None and review.reviewer == commenter:
      return Response({'error':"User must wait for host to respond before leaving another comment."}, status=status.HTTP_400_BAD_REQUEST)
    elif comment is not None and comment.commenter == commenter:
      return Response({'error':"User cannot comment twice consecutively. Must wait for other user to respond."}, status=status.HTTP_400_BAD_REQUEST)

    self.perform_create(serializer)
    headers = self.get_success_headers(serializer.data)

    if review.reviewer != commenter:
      target = review.reviewer
    else:
      target = review.property.owner
    notification_message = f"{commenter.first_name} {commenter.last_name} has left a comment!"
    Notification.objects.create(
        notification_msg=notification_message,
        user=target,
        content_object=review.property
    )

    return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class SearchView(ListAPIView):
  permission_classes = [AllowAny,]
  authentication_classes = []
  serializer_class = SearchPropertySerializer
  pagination_class = PageNumberPagination

  def list(self, request, *args, **kwargs):
    queryset = Property.objects.all()
    for key, value in request.query_params.items():
      if key == 'location' and value != "":
        queryset = queryset.filter(name__icontains=value.strip().lower())
      elif key == 'guests' and value != "":
        queryset = queryset.filter(guests=value)
      elif key == 'amenities' and value != "":
        amenities = value.split(',')
        for amenity in amenities:
          queryset = queryset.filter(
              amenities__icontains=amenity.strip().lower())
    properties = queryset.values()
    date_start = None
    date_end = None
    if 'date_start' in request.query_params and len(request.query_params['date_start'].strip()):
      date_start = datetime.datetime.strptime(
          request.query_params['date_start'], '%Y-%m-%d').date()
    if 'date_end' in request.query_params and len(request.query_params['date_end'].strip()):
      date_end = datetime.datetime.strptime(
          request.query_params['date_end'], '%Y-%m-%d').date()

    if date_start is None and date_end is not None:
      date_start = date_end
    elif date_end is None and date_start is not None:
      date_end = date_start

    today_date = datetime.date.today()
    if date_start is None:
      date_start = today_date
      date_end = date_start

    if date_end < date_start:
      return Response("End Date must be on the same day or after Start Date", status=status.HTTP_400_BAD_REQUEST)

    if date_end < today_date:
      return Response("End Date must be today or after today", status=status.HTTP_400_BAD_REQUEST)

    delta_days = date_end - date_start + datetime.timedelta(days=1)

    response = []
    for property in properties:
      price_periods = PricePeriod.objects.filter(
          available=True, property=property.get('id')).order_by('date_start')
      start_from_date = None
      price = 0
      for price_period in price_periods:
        if date_start >= price_period.date_start:
          if date_end <= price_period.date_end:
            delta = date_end - date_start + datetime.timedelta(days=1)
            price += delta.days * price_period.price
            avg_price = price / delta_days.days
            property.update({'price': avg_price})
            response.append(property)
            break
          elif date_start <= price_period.date_end:
            start_from_date = price_period.date_end + \
                datetime.timedelta(days=1)
            delta = price_period.date_end - \
                date_start + datetime.timedelta(days=1)
            price += delta.days * price_period.price
        elif start_from_date is not None and start_from_date == price_period.date_start:
          if date_end <= price_period.date_end:
            delta = date_end - price_period.date_start + \
                datetime.timedelta(days=1)
            price += delta.days * price_period.price
            avg_price = price / delta_days.days
            property.update({'price': avg_price})
            response.append(property)
            break
          else:
            start_from_date = price_period.date_end + \
                datetime.timedelta(days=1)
            delta = price_period.date_end - \
                price_period.date_start + datetime.timedelta(days=1)
            price += delta.days * price_period.price
    for property in response:
      images = ImageModel.objects.filter(property=property['id'])
      property.update({'images': images})

    if 'sort' in request.query_params and len(request.query_params['sort'].strip()):
      sort = request.query_params['sort']
      if 'order' in request.query_params and len(request.query_params['order'].strip()):
        order = request.query_params['order']
      if sort == "price":
        if order.lower() == 'ascending':
          response.sort(key=lambda x: x.get('price'))
        elif order.lower() == 'descending':
          response.sort(key=lambda x: x.get('price'), reverse=True)
      elif sort == "rating":
        if order.lower() == 'ascending':
          response.sort(key=lambda x: x.get('rating'))
        elif order.lower() == 'descending':
          response.sort(key=lambda x: x.get('rating'), reverse=True)

    page = self.paginate_queryset(response)
    if page is not None:
      serializer = self.get_serializer(page, many=True)
      return self.get_paginated_response(serializer.data)
    serializer = self.get_serializer(data=response, many=True)
    serializer.is_valid()
    return Response(serializer.validated_data)
  
class GetPriceView(APIView):
  permission_classes = [IsAuthenticated,]

  def get(self, request, format=None):
    print(request.query_params['property'].strip())
    property = get_object_or_404(Property, id=int(request.query_params['property'].strip()))
    date_start = None
    date_end = None
    if 'date_start' in request.query_params and len(request.query_params['date_start'].strip()):
      date_start = datetime.datetime.strptime(
          request.query_params['date_start'], '%Y-%m-%d').date()
    if 'date_end' in request.query_params and len(request.query_params['date_end'].strip()):
      date_end = datetime.datetime.strptime(
          request.query_params['date_end'], '%Y-%m-%d').date()

    if date_start is None or date_end is None:
      return Response("Must specify both Start Date and End Date", status=status.HTTP_400_BAD_REQUEST)

    if date_end < date_start:
      return Response("End Date must be on the same day or after Start Date", status=status.HTTP_400_BAD_REQUEST)
    
    today_date = datetime.date.today()
    if date_end < today_date:
      return Response("End Date must be today or after today", status=status.HTTP_400_BAD_REQUEST)

    delta_days = date_end - date_start + datetime.timedelta(days=1)

    price_periods = PricePeriod.objects.filter(available=True, property=property.id).order_by('date_start')
    start_from_date = None
    price = 0

    found = False
    for price_period in price_periods:
      if date_start >= price_period.date_start:
        if date_end <= price_period.date_end:
          delta = date_end - date_start + datetime.timedelta(days=1)
          price += delta.days * price_period.price
          found = True
          break
        elif date_start <= price_period.date_end:
          start_from_date = price_period.date_end + datetime.timedelta(days=1)
          delta = price_period.date_end - date_start + datetime.timedelta(days=1)
          price += delta.days * price_period.price
      elif start_from_date is not None and start_from_date == price_period.date_start:
        if date_end <= price_period.date_end:
          delta = date_end - price_period.date_start + datetime.timedelta(days=1)
          price += delta.days * price_period.price
          found = True
          break
        else:
          start_from_date = price_period.date_end + datetime.timedelta(days=1)
          delta = price_period.date_end - price_period.date_start + datetime.timedelta(days=1)
          price += delta.days * price_period.price
    if not found: 
      return Response("Property is not available on some or all of the specified dates", status=status.HTTP_400_BAD_REQUEST)
    response = {
      'avg_price': round((price/delta_days.days), 2),
      'total_price': round(price, 2)
    }
    return Response(response, status=status.HTTP_200_OK)

class GetPropertiesView(ListAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = GetPropertiesSerializer
  pagination_class = PageNumberPagination

  def list(self, request, *args, **kwargs):
    user = get_object_or_404(User, username=request.user)
    properties = user.property_set.all()
    data = []
    for property in properties:
      property_data = {
        'id': property.id,
        'name': property.name,
        'description': property.description,
        'images': property.images
      }
      data.append(property_data)
    page = self.paginate_queryset(data)
    if page is not None:
      serializer = self.get_serializer(page, many=True)
      return self.get_paginated_response(serializer.data)
    serializer = self.get_serializer(data=data, many=True)
    serializer.is_valid()
    return Response(serializer.validated_data)

class CreateReservationView(CreateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = CreateReservationSerializer

  def create(self, request, *args, **kwargs):
    if hasattr(request.data, '_mutable') and not request.data._mutable:
      request.data._mutable = True
    request.data.update({'user': str(request.user)})
    request.data.update({'property': self.kwargs.get('pk')})

    price_periods = PricePeriod.objects.filter(property=self.kwargs.get('pk')).order_by('date_start')
    today_date = datetime.date.today()
    for price_period in price_periods:
      if price_period.available and price_period.date_start < today_date:
        if price_period.date_end < today_date:
          price_period.available = False
          price_period.save()
        else:
          PricePeriod.objects.create(
            property=price_period.property,
            date_start=price_period.date_start,
            date_end=today_date - datetime.timedelta(days=1),
            price=price_period.price,
            available=False
          )
          price_period.date_start = today_date
          price_period.save()
    
    response = super().create(request, *args, **kwargs)
    if response.status_code == 201:
      property = get_object_or_404(
          Property.objects.all(), id=self.kwargs.get('pk'))
      user = get_object_or_404(User.objects.all(), username=request.user)
      target = get_object_or_404(User.objects.all(), username=property.owner)
      notification_message = f"{user.first_name} {user.last_name} has made a reservation on {property.name}!"
      Notification.objects.create(
          notification_msg=notification_message,
          user=target,
          content_object=property
      )
    return response


class UpdateReservationView(UpdateAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = UpdateReservationSerializer
  queryset = Reservation.objects.all()

  def update(self, request, *args, **kwargs):
    reservation = self.get_queryset().get(id=self.kwargs.get('pk'))
    requester = get_object_or_404(User, username=request.user)

    partial = kwargs.pop('partial', False)
    instance = self.get_object()
    serializer = self.get_serializer(
        instance, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)

    state = serializer.validated_data['state']
    if state == 'denied':
      if reservation.state != 'pending':
        return Response("Only a reservation in state: 'pending' can be declined", status=status.HTTP_400_BAD_REQUEST)
      if requester != reservation.host:
        return Response("Only the host can decline this reservation", status=status.HTTP_403_FORBIDDEN)
    elif state == 'approved':
      if reservation.state != 'pending' and reservation.state != 'cancellation_request':
        return Response("Only a reservation in state: 'pending' or 'cancellation_request' can be approved", status=status.HTTP_400_BAD_REQUEST)
      if requester != reservation.host:
        return Response("Only the host can approve this reservation or cancellation request", status=status.HTTP_403_FORBIDDEN)
      if reservation.state == 'cancellation_request':
        target = get_object_or_404(
            User.objects.all(), username=reservation.user)
        notification_message = f"{requester.first_name} {requester.last_name} has declined your cancellation request for {reservation.property.name}!"
        Notification.objects.create(
            notification_msg=notification_message,
            user=target,
            content_object=reservation.property
        )
      else:
        target = get_object_or_404(
            User.objects.all(), username=reservation.user)
        notification_message = f"{requester.first_name} {requester.last_name} has approved your reservation for {reservation.property.name}!"
        Notification.objects.create(
            notification_msg=notification_message,
            user=target,
            content_object=reservation.property
        )
    elif state == 'cancellation_request':
      if reservation.state != 'pending' and reservation.state != 'approved':
        return Response("Only a reservation in state: 'pending' or 'approved' can have a cancellation request", status=status.HTTP_400_BAD_REQUEST)
      if requester != reservation.user:
        return Response("Only the user can request cancellation for a reservation", status=status.HTTP_403_FORBIDDEN)
      if reservation.state == 'pending':
        serializer.validated_data['state'] = 'canceled'
        host = get_object_or_404(User.objects.all(), username=reservation.host)
        notification_message = f"{requester.first_name} {requester.last_name} has canceled their reservation at {reservation.property.name}!"
        Notification.objects.create(
            notification_msg=notification_message,
            user=host,
            content_object=reservation.property
        )
      else:
        host = get_object_or_404(User.objects.all(), username=reservation.host)
        notification_message = f"{requester.first_name} {requester.last_name} has requested cancellation for their reservation at {reservation.property.name}!"
        Notification.objects.create(
            notification_msg=notification_message,
            user=host,
            content_object=reservation.property
        )
    elif state == 'canceled':
      if reservation.state != 'cancellation_request':
        return Response("Only a reservation in state: 'cancellation_request' can be cancelled", status=status.HTTP_400_BAD_REQUEST)
      if requester != reservation.host:
        return Response("Only the host can approve this cancellation request", status=status.HTTP_403_FORBIDDEN)
      target = get_object_or_404(User.objects.all(), username=reservation.user)
      notification_message = f"{requester.first_name} {requester.last_name} has approved your cancellation request for {reservation.property.name}!"
      Notification.objects.create(
          notification_msg=notification_message,
          user=target,
          content_object=reservation.property
      )
    elif state == 'terminated':
      if reservation.state != 'approved':
        return Response("Only a reservation in state: 'approved' can be terminated", status=status.HTTP_400_BAD_REQUEST)
      if requester != reservation.host:
        return Response("Only the host can terminate this reservation", status=status.HTTP_403_FORBIDDEN)
      target = get_object_or_404(User.objects.all(), username=reservation.user)
      notification_message = f"{requester.first_name} {requester.last_name} has terminated your reservation at {reservation.property.name}!"
      Notification.objects.create(
          notification_msg=notification_message,
          user=target,
          content_object=reservation.property
      )
    else:
      return Response("State is not allowed", status=status.HTTP_400_BAD_REQUEST)

    self.perform_update(serializer)
    if getattr(instance, '_prefetched_objects_cache', None):
      instance._prefetched_objects_cache = {}
    return Response(serializer.data)


class ListUserReservationView(ListAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = ReservationSerializer
  pagination_class = PageNumberPagination

  def list(self, request, *args, **kwargs):
    user = get_object_or_404(User, username=request.user)
    reservations = user.user_reservation.all().order_by('-date_start', '-date_created')
    data = []
    for reservation in reservations:
      host_name = reservation.host.first_name + " " + reservation.host.last_name
      if reservation.state == 'pending':
        date_today = datetime.datetime.now().date()
        reply_by = reservation.reply_by.date()
        if date_today > reply_by:
          reservation.state = 'expired'
          reservation.save()
      if reservation.state == 'approved':
        date_today = datetime.datetime.now().date()
        date_end = reservation.date_end.date()
        if date_today > date_end:
          reservation.state = 'completed'
          reservation.save()
      reservationCheck = user.user_reservation.filter(property=reservation.property, state='completed')
      reviews = PropertyReview.objects.filter(property=reservation.property, reviewer=user)
      if len(reservationCheck) <= 0 or len(reviews) >= len(reservationCheck):
        can_review = False
      else:
        can_review = True

      reservation_data = {
          'id': reservation.id,
          'state': reservation.state,
          'property_name': reservation.property.name,
          'property_id': reservation.property.id,
          'date_start': reservation.date_start,
          'date_end': reservation.date_end,
          'reply_by': reservation.reply_by,
          'avg_price': reservation.price,
          'user_name': host_name,
          'user_email': reservation.host.email,
          'user_id': reservation.host.id,
          'user_phone_number': str(reservation.host.phone_number),
          'images': reservation.property.images,
          'can_review': can_review
      }
      data.append(reservation_data)

    page = self.paginate_queryset(data)
    if page is not None:
      serializer = self.get_serializer(page, many=True)
      return self.get_paginated_response(serializer.data)
    serializer = self.get_serializer(data=data, many=True)
    serializer.is_valid()
    return Response(serializer.validated_data)


class ListHostReservationView(ListAPIView):
  permission_classes = [IsAuthenticated,]
  serializer_class = ReservationSerializer
  pagination_class = PageNumberPagination

  def list(self, request, *args, **kwargs):
    user = get_object_or_404(User, username=request.user)
    reservations = user.host_reservation.all().order_by('-date_start', '-date_created')
    data = []
    for reservation in reservations:
      user_name = reservation.user.first_name + " " + reservation.user.last_name
      if reservation.state == 'pending':
        date_today = datetime.datetime.now().date()
        reply_by = reservation.reply_by.date()
        if date_today > reply_by:
          reservation.state = 'expired'
          reservation.save()
      if reservation.state == 'approved':
        date_today = datetime.datetime.now().date()
        date_end = reservation.date_end.date()
        if date_today > date_end:
          reservation.state = 'completed'
          reservation.save()

      reservationCheck = user.host_reservation.filter(user=reservation.user, state='completed')
      reviews = UserReview.objects.filter(user=reservation.user, reviewer=user)
      if len(reservationCheck) <= 0 or len(reviews) >= len(reservationCheck):
        can_review = False
      else:
        can_review = True

      reservation_data = {
          'id': reservation.id,
          'state': reservation.state,
          'property_name': reservation.property.name,
          'property_id': reservation.property.id,
          'date_start': reservation.date_start,
          'date_end': reservation.date_end,
          'reply_by': reservation.reply_by,
          'avg_price': reservation.price,
          'user_name': user_name,
          'user_email': reservation.user.email,
          'user_id': reservation.user.id,
          'user_phone_number': str(reservation.user.phone_number),
          'images': reservation.property.images,
          'can_review': can_review
      }
      data.append(reservation_data)

    page = self.paginate_queryset(data)
    if page is not None:
      serializer = self.get_serializer(page, many=True)
      return self.get_paginated_response(serializer.data)
    serializer = self.get_serializer(data=data, many=True)
    serializer.is_valid()
    return Response(serializer.validated_data)

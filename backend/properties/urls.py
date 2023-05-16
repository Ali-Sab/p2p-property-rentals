from django.urls import path
from .views import CreatePropertyView, GetPropertyView, EditPropertyDetailsView, EditPropertyDescriptionView, CreateImageModelView, RemoveImageModelView, ListImageModelView, CreatePricePeriodView, ListPricePeriodView, GetPropertyReviewsView, CreatePropertyReviewView, CreatePropertyCommentView, SearchView, RemovePropertyView, GetPropertiesView, CreateReservationView, UpdateReservationView, ListUserReservationView, ListHostReservationView, GetPriceView

app_name = 'properties'
urlpatterns = [
  path('create/', CreatePropertyView.as_view(), name='create_property'),
  path('<int:pk>/view/', GetPropertyView.as_view(), name='view_property'),
  path('<int:pk>/update/details/', EditPropertyDetailsView.as_view(), name='edit_property_details'),
  path('<int:pk>/update/description/', EditPropertyDescriptionView.as_view(), name='edit_property_description'),
  path('<int:pk>/update/price/', CreatePricePeriodView.as_view(), name='edit_price'),
  path('<int:pk>/list/price/', ListPricePeriodView.as_view(), name="list_prices"),
  path('<int:pk>/delete/', RemovePropertyView.as_view(), name="delete_property"),
  path('add/images/', CreateImageModelView.as_view(), name='add_images'),
  path('<int:pk>/list/images/', ListImageModelView.as_view(), name='list_images'),
  path('remove/images/<int:pk>/', RemoveImageModelView.as_view(), name='remove_images'),
  path('<int:pk>/reviews/', GetPropertyReviewsView.as_view(), name='get_reviews'),
  path('<int:pk>/reviews/add/', CreatePropertyReviewView.as_view(), name='add_review'),
  path('reviews/comment/', CreatePropertyCommentView.as_view(), name='add_comment'),
  path('search/', SearchView.as_view(), name='search'),
  path('list/', GetPropertiesView.as_view(), name='see_owner_properties'),
  path('<int:pk>/reservation/create/', CreateReservationView.as_view(), name="create_reservation"),
  path('reservation/<int:pk>/update/', UpdateReservationView.as_view(), name="update_reservation"),
  path('reservations/user/', ListUserReservationView.as_view(), name="see_user_reservations"),
  path('reservations/host/', ListHostReservationView.as_view(), name="see_host_reservations"),
  path('reservation/check/', GetPriceView.as_view(), name="check_dates"),
  # path('reservations/host/', ListReservationView.as_view(), name="see_host_reservations"),
  # make a reservation
  # edit reservation (use for update, cancel, etc.) NOTE: to cancel, you must edit the reservation state
]

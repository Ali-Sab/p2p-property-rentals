from .views import CustomTokenObtainView, CustomTokenRefreshView, LogoutView, RegisterView, GetProfileView, GetOwnProfileView, EditNameProfileView, EditPasswordProfileView, EditEmailProfileView, EditAvatarProfileView, EditPhoneNumberProfileView, GetUserReviewsView, CreateUserReviewView, GetNotificationsView, DeleteNotificationView
from django.urls import path

app_name='users'
urlpatterns = [
    path('token/', CustomTokenObtainView.as_view(), name='token'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/logout/', LogoutView.as_view(), name='logout'),
    path('register/', RegisterView.as_view(), name='register'),
    path('view/', GetProfileView.as_view(), name='view'),
    path('view/self/', GetOwnProfileView.as_view(), name='view_self'),
    path('edit-name/', EditNameProfileView.as_view(), name='edit_name'),
    path('edit-email/', EditEmailProfileView.as_view(), name='edit_email'),
    path('edit-phone-number/', EditPhoneNumberProfileView.as_view(), name='edit_phone_number'),
    path('edit-avatar/', EditAvatarProfileView.as_view(), name='edit_avatar'),
    path('edit-password/', EditPasswordProfileView.as_view(), name='edit_password'),
    path('reviews/', GetUserReviewsView.as_view(), name='user_reviews'),
    path('review/create/', CreateUserReviewView.as_view(), name='create_user_review'),
    path('notifications/', GetNotificationsView.as_view(), name="get_notifications"),
    path('notifications/<int:pk>/delete/', DeleteNotificationView.as_view(), name="delete_notification")
    #path('token/blacklist/')
]
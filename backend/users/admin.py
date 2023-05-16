from django.contrib import admin
from .models import User, UserReview, Comment, Notification

# Register your models here.
admin.site.register(User)
admin.site.register(UserReview)
admin.site.register(Comment)
admin.site.register(Notification)
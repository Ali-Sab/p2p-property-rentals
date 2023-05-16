from django.contrib import admin
from .models import Property, PropertyReview, PricePeriod, Reservation

admin.site.register(Property)
admin.site.register(PropertyReview)
admin.site.register(PricePeriod)
admin.site.register(Reservation)
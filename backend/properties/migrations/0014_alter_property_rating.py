# Generated by Django 4.1.7 on 2023-03-17 06:31

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0013_alter_propertyreview_property'),
    ]

    operations = [
        migrations.AlterField(
            model_name='property',
            name='rating',
            field=models.DecimalField(decimal_places=2, default=3, max_digits=3, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(5)]),
        ),
    ]
# Generated by Django 4.1.7 on 2023-03-14 05:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0003_alter_property_amenities'),
    ]

    operations = [
        migrations.AddField(
            model_name='priceperiod',
            name='available',
            field=models.BooleanField(default=True),
        ),
    ]
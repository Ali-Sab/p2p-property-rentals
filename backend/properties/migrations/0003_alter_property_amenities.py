# Generated by Django 4.1.7 on 2023-03-13 18:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0002_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='property',
            name='amenities',
            field=models.JSONField(),
        ),
    ]
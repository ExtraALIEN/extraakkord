# Generated by Django 3.0.8 on 2020-07-27 20:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('akkordbase', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='artist',
            name='slug',
            field=models.SlugField(default='', unique=True),
        ),
    ]

from django.contrib import admin
from .models import Artist, Song, Pick, Comment

admin.site.register(Artist)
admin.site.register(Song)
admin.site.register(Pick)
admin.site.register(Comment)

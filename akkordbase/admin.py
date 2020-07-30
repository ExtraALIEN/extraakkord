from django.contrib import admin
from .models import Artist, Song, Pick, Comment


class ArtistInline(admin.TabularInline):
    model = Song
    extra = 0
    show_change_link = True

class ArtistAdmin(admin.ModelAdmin):
    # fieldsets = [
    #     (None,               {'fields': ['question_text']}),
    #     ('Date information', {'fields': ['pub_date'], 'classes': ['collapse']}),
    # ]
    inlines = [ArtistInline]
    list_select_related = True


class SongInline(admin.TabularInline):
    model = Pick
    extra = 0
    show_change_link = True

class SongAdmin(admin.ModelAdmin):
    # fieldsets = [
    #     (None,               {'fields': ['question_text']}),
    #     ('Date information', {'fields': ['pub_date'], 'classes': ['collapse']}),
    # ]
    list_filter = ('artist__full_name',)
    inlines = [SongInline]

admin.site.register(Artist, ArtistAdmin)
admin.site.register(Song, SongAdmin)
admin.site.register(Pick)
admin.site.register(Comment)

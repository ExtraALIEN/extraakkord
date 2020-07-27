from django.db import models
from .converters import FullNameToSlugConverter as slugmaker
# class CustomUser
    # tracklist
    # bio


class Artist(models.Model):
    full_name = models.CharField(max_length=40)
    slug = models.SlugField(max_length=50, unique=True, blank=True, null=True)

    def __str__(self):
        return self.full_name

    def _get_unique_slug(self):
        slug = slugmaker().to_python(self.full_name)
        unique_slug = slug
        num = 1
        while Artist.objects.filter(slug=unique_slug).exists():
            unique_slug = f'{slug}-{num}'
            num += 1
        return unique_slug

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._get_unique_slug()
        super().save(*args, **kwargs)


    def get_url(self):
        return f'/akkords/{self.slug}/'

class Song(models.Model):
    full_name = models.CharField(max_length=40)
    artist = models.ForeignKey('Artist', on_delete=models.CASCADE)
    # slug
    def __str__(self):
        return self.full_name

class Pick(models.Model):
    date_added = models.DateField(auto_now_add=True)
    views = models.PositiveIntegerField(default=0)
    votes_sum = models.PositiveIntegerField(default=0)
    # voted_users
    bpm = models.PositiveSmallIntegerField(default=110)
    music_data = models.TextField()
    song = models.ForeignKey('Song', on_delete=models.CASCADE)

    # tone = Models.CharField
    # chordss (search)
    # boi (search)
    # author = Models.ForeignKey('customuser', on_delete=models.DO_NOTHING)

    def __str__(self):
        return f'{self.song.full_name} - {self.date_added}'


class Comment(models.Model):
    # author = Models.ForeignKey('customuser', on_delete=models.DO_NOTHING)
    pick = models.ForeignKey('Pick', on_delete=models.CASCADE)
    pick_mark = models.PositiveSmallIntegerField(blank=True, null=True)
    pick_vote = models.BooleanField()
    date_added = models.DateTimeField(auto_now_add=True)
    votes_up = models.PositiveIntegerField(default=0)
    votes_down = models.PositiveIntegerField(default=0)
    # voted_users =models.Manytomany
    text = models.TextField()

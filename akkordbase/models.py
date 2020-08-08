from django.db import models
from django.contrib.auth.models import User
from .converters import FullNameToSlugConverter as slugmaker


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(max_length=400, blank=True)
    location = models.CharField(max_length=20, blank=True)
    tracklist = models.ManyToManyField('Song', related_name='performers')

    def __str__(self):
        return self.user.username

    def get_url(self):
        return f'/profile/{self.user.username}/'


class CustomQuerySet(models.QuerySet):
    def alphabet_list(self):
        return self.order_by('full_name')

    def startswith(self, letter):
        return self.filter(full_name__istartswith=letter)


class Artist(models.Model):
    full_name = models.CharField(max_length=40)
    slug = models.SlugField(max_length=50, unique=True, blank=True, null=True)
    qs = CustomQuerySet.as_manager()
    added_by = models.ForeignKey('Profile', on_delete=models.DO_NOTHING, related_name='added_artists')
    objects = models.Manager()


    def __str__(self):
        return self.full_name

    def _get_unique_slug(self):
        slug = slugmaker().to_python(self.full_name).replace(' ', '-')
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
    artist = models.ForeignKey('Artist',
                               on_delete=models.CASCADE,
                               related_name='songs')
    slug = models.SlugField(max_length=50, blank=True, null=True)
    qs = CustomQuerySet.as_manager()
    added_by = models.ForeignKey('Profile', on_delete=models.DO_NOTHING, related_name='added_songs')
    objects = models.Manager()


    def __str__(self):
        return self.full_name

    def _make_slug_for_new(self):
        slug = slugmaker().to_python(self.full_name).replace(' ', '-')
        if self.artist.songs.filter(slug=slug).exists():
            return None
        return slug

    def save(self, *args, **kwargs):
        slug = self._make_slug_for_new()
        if slug:
            self.slug = slug
            super().save(*args, **kwargs)
        else:
            print('exists')
            # raise error


class PickManager(models.Manager):
    def get_latest(self):
        return self.order_by('-pk')[:25]

    def get_popular(self):
        return self.order_by('-views')[:25]


class Pick(models.Model):
    pick_id = models.PositiveIntegerField(blank=True, null=True)
    date_added = models.DateField(auto_now_add=True)
    views = models.PositiveIntegerField(default=0)
    votes_sum = models.PositiveIntegerField(default=0)
    # voted_users
    bpm = models.PositiveSmallIntegerField(default=110)
    music_data = models.TextField()
    song = models.ForeignKey('Song', on_delete=models.CASCADE, related_name='picks')
    objects = PickManager()
    # tone = Models.CharField
    # chordss (search)
    # boi (search)
    added_by = models.ForeignKey('Profile', on_delete=models.DO_NOTHING)

    def __str__(self):
        return f'{self.song.full_name} - {self.date_added}'


    def increment_views(self):
        self.views = self.views + 1
        self.save()


    def save(self, *args, **kwargs):
        if not self.pick_id:
            id = 1
            exist_picks = self.song.picks.count()
            if exist_picks:
                id = self.song.picks.last().pick_id + 1
            self.pick_id = id
        super().save(*args, **kwargs)


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


class Boi(models.Model):
    name = models.CharField(max_length=40)
    code = models.TextField()
    cycle_length = models.PositiveSmallIntegerField(default=4)

    def __str__(self):
        return self.name

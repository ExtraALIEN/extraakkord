from django.apps import AppConfig


class AkkordbaseConfig(AppConfig):
    name = 'akkordbase'

    def ready(self):
        import akkordbase.signals

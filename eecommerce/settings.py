from django.conf import settings as dj_settings

EE_COMMERCE_MODELS = getattr(dj_settings, 'EE_COMMERCE_MODELS', [])

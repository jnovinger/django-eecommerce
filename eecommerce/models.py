from decimal import Decimal
from json import dumps, JSONEncoder

from django.db.models.signals import post_init
from django.utils.functional import cached_property

from . import settings as ee_settings
from .compat import import_by_path


class config(object):
    def __init__(self, **kwargs):
        self.__dict__.update(kwargs)


class ExtendedJSONEncoder(JSONEncoder):
    def default(self, obj):
        if hasattr(obj, 'isoformat'):
            return obj.isoformat()
        elif isinstance(obj, Decimal):
            return float(obj)
        elif isinstance(obj, long):
            return int(obj)
        return super(ExtendedJSONEncoder, self).default(obj)


class EnhancedEcommerceTracker(object):
    """Handles collecting/tracking/collating GA Enhanced Ecommerce data."""

    actions = {
        'impressions': ['list', 'brand', 'category', 'variant',
                        'position', 'price'],
        'click': ['price', 'brand', 'category', 'variant'],
        'detail': ['price', 'brand', 'category', 'variant', 'list'],
        'add': ['price', 'brand', 'category', 'variant', 'quantity'],
        'remove': [],
        'promo_view': [],
        'promo_click': [],
    }

    def __init__(self, request, currency='USD', brand='Moniker'):
        self.config = config(request=request, currency=currency, brand=brand)
        self.items = set()
        self.impressions = []
        self.click = {}
        self.detail = {}
        self.add = []
        self.remove = []
        self.promo_view = []
        self.promo_click = []

    def track(self, item):
        self.items.add(item)


    def get_data(self, as_json=True):
        data = []
        brand = self.config.brand

        for item in self.items:
            if not hasattr(item, 'ee_data'):
                continue

            item_data = item.ee_data()

            # default brand
            if 'brand' not in item_data:
                item_data['brand'] = brand

            data.append(item_data)

        if not as_json:
            return data

        return dumps(data, cls=ExtendedJSONEncoder)

    @cached_property
    def data(self):
        return self.get_data()


class EETrackerRegistry(object):
    """Acts as a proxy for `request` associated tracker instances"""

    def __init__(self):
        # holds tracker objects, keyed by request
        self._registry = {}
        self.setup_handlers()

    def get_models(self):
        return (import_by_path(path) for path
                in ee_settings.EE_COMMERCE_MODELS)

    def setup_handlers(self):
        for model in self.get_models():
            post_init.connect(self.handle_instance_inited,
                              sender=model, weak=False)

    def teardown_handlers(self):
        for model in self.get_models():
            post_init.disconnect(self.handle_instance_inited, sender=model)

    def handle_instance_inited(self, sender, instance, **kwargs):
        for tracker in self._registry.itervalues():
            tracker.track(instance)

    def get_tracker(self, request):
        registry = self._registry
        tracker = registry.get(request, None)

        if tracker is None:
            tracker = EnhancedEcommerceTracker(request)
            registry[request] = tracker
        return tracker

    def finish_tracker(self, request):
        registry = self._registry
        if request in registry:
            del(self._registry[request])

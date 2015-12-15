from decimal import Decimal
from json import dumps, JSONEncoder

from django.conf import settings
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
    PAGE_TYPES = (
        'detail', 'checkout', 'list',
    )

    def __init__(self, request, currency='USD', brand='Moniker'):
        self.config = config(request=request, currency=currency, brand=brand)
        self.items = {}
        self.details = []
        self.impressions = []
        self.checkout = {}
        self.transactions = []
        self.page_type = None

    def add_item(self, item):
        hash_ = item.unique_hash
        self.items[hash_] = item
        return hash_

    def track_detail(self, item):
        hash_ = self.add_item(item)

        if hash_ not in self.details:
            self.details.append(hash_)

        # don't record impressions for details items
        impressions = self.impressions
        while hash_ in impressions:
            impressions.remove(hash_)
        self.impressions = impressions

    def track_impression(self, item):
        hash_ = self.add_item(item)
        if hash_ not in self.impressions:
            self.impressions.append(hash_)

    def track_checkout(self, step, **kwargs):
        checkout = {
            'step': step,
        }
        checkout.update(kwargs)

        self.checkout = checkout

    def track_transaction(self, transaction):
        self.transactions.append(transaction)

    def set_page_type(self, type_):
        assert type_ in self.PAGE_TYPES
        self.page_type = type_

    def get_data(self, as_json=True):
        data = {}
        items_ = {}
        brand = self.config.brand

        for hash_, item in self.items.iteritems():
            if not hasattr(item, 'ee_data'):
                continue

            item_data = item.ee_data()

            # default brand
            if 'brand' not in item_data:
                item_data['brand'] = brand

            items_[hash_] = item_data

        data['items'] = items_
        data['details'] = self.details
        data['impressions'] = self.impressions
        data['checkout'] = self.checkout
        data['type'] = self.page_type
        data['debug'] = settings.DEBUG

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
            # default action is impression
            tracker.track_impression(instance)

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


registry = EETrackerRegistry()

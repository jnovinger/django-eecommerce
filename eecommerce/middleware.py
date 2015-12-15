from .models import registry


class EnhancedEcommerceTrackerMiddleware(object):

    def __init__(self, *args, **kwargs):
        super(EnhancedEcommerceTrackerMiddleware, self).__init__(*args,
                                                                 **kwargs)

    def _get_tracker(self, request):
        tracker = getattr(request, 'ee_tracker', None)
        if tracker is None:
            assert hasattr(request, 'session'), 'Session framework is required'
            tracker = registry.get_tracker(request)
            request.ee_tracker = tracker
        return tracker

    def _finish_tracker(self, request):
        registry.finish_tracker(request)

    def process_request(self, request):
        self._get_tracker(request)

    def process_template_response(self, request, response):
        if hasattr(response, 'context_data'):
            response.context_data['ee_tracker'] = request.ee_tracker
        return response

    def process_response(self, request, response):
        self._finish_tracker(request)
        return response

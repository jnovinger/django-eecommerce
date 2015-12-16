.. :changelog:

History
-------

0.0.3 (2015-12-16)
++++++++++++++++++

* Fix possible "dictionary changed size during iteration" error
* Refactored `EnhanceEcommerceTracker.get_data()` method
* Fix two small bugs with `EnhanceEcommerceTracker.sendProductDetail()`

0.0.2 (2015-12-15)
++++++++++++++++++

* Remove hard coded Google Analytics id.

0.0.1 (2015-12-14)
++++++++++++++++++

* First release on PyPI.
* Provide automatic tracking of registered ecommerce objects on the server.
* Provide a client side tracker that receives serialized data from the backend, reacts to on page interactions via a unified click handler, and sends properly formatted ecommerce data to Google Analytics.

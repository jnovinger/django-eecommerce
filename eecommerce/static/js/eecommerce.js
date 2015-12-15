var EETracker = (function(){

  /**
   * EETracker takes a chunk of JSON from the backend
   * @constructor
   * @param {array<object>} data
   */
  var EETracker = function(data) {
    this.init = this.init.bind(this);
    this.initGA = this.initGA.bind(this);
    this.ga = this.ga.bind(this);
    this.setData = this.setData.bind(this);
    this.sendImpressions = this.sendImpressions.bind(this);
    this.getImpressions = this.getImpressions.bind(this);
    this.getImpression = this.getImpression.bind(this);
    this.sendProductDetail = this.sendProductDetail.bind(this);
    this.getProduct = this.getProduct.bind(this);

    this.checkout = this.checkout.bind(this);
    this.getCheckoutData = this.getCheckoutData.bind(this);

    this.init(data);
  };

  var noop = function() {};

  /**
   * The data provided to the constructor for this page
   * @type {array}
   * @private
   */
  EETracker.prototype.data = null;

  /**
   * Parse and set the JSON blob set in the page.
   * @param {object} data
   * @returns {object} data Guaranteed to be an object-literal
   */
  EETracker.prototype.setData = function(data) {
    if (typeof(data) == 'string') {
      data = JSON.parse(data);
    }

    data.items = data.items || {};
    data.details = data.details || [];
    data.impressions = data.impressions || [];
    data.checkout = data.checkout || {};
    data.page_type = data.page_type || 'list';

    this.data = data;
    return data;
  };

  /**
   * The GA Enhanced Ecommerce data queue
   * @type {array}
   */
  EETracker.prototype.dataLayer = null;
  EETracker.prototype.ga = null;
  EETracker.prototype.debug = function() {
    console.log(arguments);
  };

  /**
   *
   */
  EETracker.prototype.currencyCode = 'USD';

  /**
   * Handle any setup
   * @param {object} data
   */
  EETracker.prototype.init = function(data) {
    data = this.setData(data);
    this.type = data.type;
    if (!data.debug) {
      this.debug = noop;
    }
    this.currencyCode = data.currency || this.currencyCode;
    this.initGA();
    this.handleInitialActions();
  };

  EETracker.prototype.initGA = function() {
    this.ga('create', this.data.gaID, 'none', 'ee');
    this.ga('ee.require', 'ec');
  };

  EETracker.prototype.ga = function() {
    this.debug.apply(this, arguments);
    window.ga.apply(window.ga, arguments);
  };

  /**
   *
   */
  EETracker.prototype.handleInitialActions = function() {
    this.debug('start handleInitialActions');

    // always send impressions immediately
    this.sendImpressions();
    switch (this.type) {
      case 'detail':
        this.sendProductDetail();
        break;
      case 'checkout':
        this.sendImmediateCheckout();
        break;
      case 'success':
        this.sendImmediateCheckout();
        this.sendTransaction();
        break;
      default:
        break;
    };
    this.ga('ee.send', 'pageview');
    this.debug('end handleInitialActions');
  };

  /**
   * Return an array of properly formatted `impression` objects
   * @returns {array}
   */
  EETracker.prototype.getImpressions = function() {
    var data = this.data
    var impressionHashes = data.impressions;

    impressionHashes = impressionHashes.filter(function(item) {
      return !this.data.details.includes(item);
    }, this);

    return impressionHashes.map(function(hash) {
      return this.getImpression(this.data.items[hash]);
    }, this);
  };

  /**
   * Returns properly formatted `impression` objects consumable by GA
   * @param {object} item
   * @returns {object}
   */
  EETracker.prototype.getImpression = function(itemData) {
    return new impressionObject(itemData);
  };

  /**
   * Send impression data to GA
   */
  EETracker.prototype.sendImpressions = function() {
    var impressions = this.getImpressions();
    impressions.forEach(function(impression) {
      this.ga('ee.ec:addImpression', impression);
    }, this);
  };

  /**
   * Returns properly formatted `product` objects consumable by GA
   * @param {object} item
   * @returns {object}
   */
  EETracker.prototype.getProduct = function(productData) {
    return new productObject(productData);
  };

  /**
   *
   */
  EETracker.prototype.getProducts = function() {
    return this.data.details.map(function(product) {
      return this.getProduct(this.data.items[product]);
    }, this);
  }

  /**
   *
   */
  EETracker.prototype.getProductByHash = function(hash) {
    var product = this.data.items[hash];
    if (product) {
      return this.getProducts(product);
    }

    return;
  };

  /**
   * Send product data to GA
   */
  EETracker.prototype.sendProductDetail = function() {
    var products = this.getProducts();
    products.forEach(function(product) {
      this.ga('ee.ec:addProduct', product);
    }, this);
  };

  /**
   *
   */
  EETracker.prototype.addToCart = function(hash, callback) {
    var product = this.getProductByHash(hash);
    if (!product) {
      return;
    }

    this.ga('ee.ec:addProduct', product);
    this.ga('ee.ec:setAction', 'add');
    this.ga('ee.send', 'event', 'UX', 'click', 'add to cart', {
      hitCallback: callback
    });
  }

  /**
   *
   */
  EETracker.prototype.removeFromCart = function(hash, callback) {
    var product = this.getProductByHash(hash);
    if (!product) {
      return;
    }

    this.ga('ee.ec:addProduct', product);
    this.ga('ee.ec:setAction', 'remove');
    this.ga('ee.send', 'event', 'UX', 'click', 'remove from cart', {
      hitCallback: callback
    });
  }

  /**
   *
   */
  EETracker.prototype.checkout = function(option) {
    this.sendProductDetail();
    this.ga('ee.ec:setAction', 'checkout', this.getCheckoutData(option));
    this.ga('ee.send', 'pageview');
  };

  /**
   *
   */
  EETracker.prototype.sendImmediateCheckout = function() {
    if (this.data.checkout.immediate) {
      this.checkout();
    }
  }

  /**
   *
   */
  EETracker.prototype.getCheckoutData = function(option) {
    var data = this.data.checkout;
    // do some other data handling?
    if(typeof(option) !== "undefined") {
      data.option = option;
    }
    return data;
  }

  /**
   *
   */
  EETracker.prototype.sendTransaction = function() {
    this.sendProductDetail();
    this.ga('ee.ec:setAction', 'purchase', this.data.transaction);
    this.ga('ee.send', 'pageview');
  };

  /**
   *
   */
  EETracker.prototype.attachListener = function(selector, action) {
    var els = document.querySelectorAll(selector);
    Array.from(els).forEach(function(el) {
      el.addEventListener('click', this.onClick.bind(this, action));
    }, this);
  };

  /**
   *
   */
  EETracker.prototype.onClick = function(action, event) {
    var href = event.target.href || null;
    var hash = event.target.dataset.hash || null;
    var option = event.target.dataset.option || null;

    var callback = noop;
    if (href) {
      callback = function() {
        document.location = href;
      };
    }

    switch(action) {
      case 'addToCart':
        this.addToCart(hash, callback);
        break;
      case 'removeFromCart':
        this.removeFromCart(hash, callback);
        break;
      case 'checkout':
        this.checkout(option, callback);
      default:
        break;
    }
  };

  return EETracker;
})();

/**
 * Private function to load GA if not present
 */
var loadGA = function() {
  (function(i,s,o,g,r,a,m){
    i['GoogleAnalyticsObject']=r;
    i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)
    }
    i[r].l=1*new Date();
    a=s.createElement(o);
    m=s.getElementsByTagName(o)[0];
    // a.async=1;
    a.src=g;
    m.parentNode.insertBefore(a,m)
  })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');
}

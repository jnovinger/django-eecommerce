var EETracker = (function(){

  /**
   * EETracker takes a chunk of JSON from the backend
   * @constructor
   * @param {array<object>} data
   */
  var EETracker = function(data) {
    this.setData = this.setData.bind(this);
    this.pushData = this.pushData.bind(this);
    this.getImpressions = this.getImpressions.bind(this);
    this.getImpression = this.getImpression.bind(this);

    this.init(data);
  };

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
    data.objects = data.objects || [];
    this.data = data;
    return data;
  };

  /**
   * The GA Enhanced Ecommerce data queue
   * @type {array}
   */
  EETracker.prototype.dataLayer = null;

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
    this.currencyCode = data.currency || this.currencyCode;
    this.dataLayer = window[data.dataLayer] || window.dataLayer;
    this.handleInitialActions();
  };

  /**
   * Actions that should be pushed to GA immediately
   */
  var initialActions = [
    'getImpressions'
  ];

  /**
   *
   */
  EETracker.prototype.handleInitialActions = function() {
    initialActions.forEach(function(element, index, array) {
      this.pushData(this[element]());
    }, this);
  };

  /**
   * Return an array of properly formatted `impression` objects
   * @returns {array}
   */
  EETracker.prototype.getImpressions = function() {
    return new impressionFieldObject(this.data.objects, this.currencyCode);
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
   * Push data to the GA Enhanced Analytics queue
   * @param {object} data
   */
  EETracker.prototype.pushData = function(data) {
    console.log("Logging: ");
    console.log(data);
    this.dataLayer.push(data);
  };

  return EETracker;
})();

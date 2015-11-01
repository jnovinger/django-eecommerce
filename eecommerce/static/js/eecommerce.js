var EETracker = (function(){

  /**
   * EETracker takes a chunk of JSON from the backend
   * @constructor
   * @param {array<object>} data
   */
  var EETracker = function(data) {
    this.setData = this.setData.bind(this);
    this.getFields = this.getFields.bind(this);
    this.getImpressions = this.getImpressions.bind(this);
    this.getImpression = this.getImpression.bind(this);
    this.getFieldedObject = this.getFieldedObject.bind(this);

    this.setData(data);
  }

  /**
   * The data provided to the constructor for this page
   * @type {array}
   * @private
   */
  EETracker.prototype.data = [];

  /**
   * Parse and set the JSON blob set in the page.
   * @param {array<object>} data
   */
  EETracker.prototype.setData = function(data) {
    if (typeof(data) == 'string') {
      data = JSON.parse(data);
    }
    this.data = data;
  }

  /**
   * Fields common many actions
   * @type {array}
   */
  EETracker.baseFields = ['id', 'name', 'brand']

  /**
   * Fields for 'impression' actions
   * @type {array}
   */
  EETracker.impressionFields = EETracker.baseFields.concat([
    'list', 'category', 'variant', 'position', 'price'
  ]);

  /**
   * Fields for 'click' actions
   * @type {array}
   */
  EETracker.clickFields = EETracker.baseFields.concat([
    'price', 'category', 'variant'
  ]);

  /**
   * Return the correct field name for a particular action
   * @param {string} action
   * @returns {array}
   */
  EETracker.prototype.getFields = function(action) {
    return EETracker[action + 'Fields'];
  }

  /**
   * Return an array of properly formatted `impression` objects
   * @returns {array}
   */
  EETracker.prototype.getImpressions = function() {
    return this.data.map(this.getImpression, this);
  }

  /**
   * Returns properly formatted `impression` objects consumable by GA
   * @param {object} item
   * @returns {object}
   */
  EETracker.prototype.getImpression = function(item) {
    return this.getFieldedObject('impression', item);
  }

  /**
   * Return an array of properly formatted `click` objects
   * @returns {array}
   */
  EETracker.prototype.getClicks = function() {
    return this.data.map(this.getClick, this);
  }

  /**
   * Returns properly formatted `click` objects consumable by GA
   * @param {object} item
   * @returns {object}
   */
  EETracker.prototype.getClick = function(item) {
    return this.getFieldedObject('click', item);
  }

  /**
   *
   */
  // EETracker.prototype.getClickedItem = function(?) {
  //   var
  // }

  /**
   * Generic function that builds a new object, that has the correct fields,
   * from base item data.
   * @param {string} type
   * @param {object} item
   * @returns {object}
   */
  EETracker.prototype.getFieldedObject = function(action, item) {
    var newItem = {};
    var fieldNames = this.getFields(action);

    fieldNames.forEach(function(fieldName) {
      if (item.hasOwnProperty(fieldName)) {
        newItem[fieldName] = item[fieldName];
      }
    });

    return newItem;
  }

  return EETracker;
})();

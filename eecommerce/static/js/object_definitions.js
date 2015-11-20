/**
 * Impression Data
 *
 * Represents information about a product that has been viewed. It is referred
 * to as an impressionFieldObject and contains the following values:
 *
 * Value    Type      Req   Description
 * id       String    Yes*  The product ID or SKU (e.g. P67890). *Either this
 *                          field or name must be set.
 * name     String    Yes*  The name of the product (e.g. Android T-Shirt).
 *                          *Either this field or id must be set.
 * list     String    No    The list or collection to which the product
 *                          belongs (e.g. Search Results).
 * brand    String    No    The brand associated with the product
 *                          (e.g. Google).
 * category String    No    The category to which the product belongs (e.g.
 *                          Apparel). Use / as a delimiter to specify up to
 *                          5-levels of hierarchy (e.g. Apparel/Men/T-Shirts).
 * variant  String    No    The variant of the product (e.g. Black).
 * position Number    No    The product's position in a list/collection (e.g. 2).
 * price    Currency  No    The price of a product (e.g. 29.20).
 *
 * Example:
 *  {
 *    'name': 'Triblend Android T-Shirt',       // Name or ID is required.
 *    'id': '12345',
 *    'price': '15.25',
 *    'brand': 'Google',
 *    'category': 'Apparel',
 *    'variant': 'Gray',
 *    'list': 'Search Results',
 *    'position': 1
 *  }
 */

var impressionObject = (function() {
  /**
   * Optional fields for the object
   */
  var optionalFields = [
    'list', 'brand', 'category', 'variant', 'position', 'price'
  ];

  /**
   * a single impressionObject as defined by GA Enhanced Ecommerce docs
   * @constructor
   * @param {object} data
   */
  var impressionObject = function(data) {
    this.id = data.id,
    this.name = data.name,

    optionalFields.forEach(function(field) {
      if (data.hasOwnProperty(field)) {
        this[field] = data[field];
      }
    }, this);
  };

  return impressionObject;
})();

var impressionFieldObject = (function() {
  /**
   * a `impressionFieldObject` as defined by GA Enhanced Ecommerce docs
   * @constructor
   * @param {array<object>} objects
   * @param {string|undefined} currency
   */
  var impressionFieldObject = function(objects, currency) {
    this.impressions = objects.map(function(objectData) {
      return new impressionObject(objectData);
    });

    if (currency) {
      this.currency = currency;
    }
  }

  return impressionFieldObject;
})();

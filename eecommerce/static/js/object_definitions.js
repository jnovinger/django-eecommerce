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
    this.id = data.id;
    this.name = data.name;

    optionalFields.forEach(function(field) {
      if (data.hasOwnProperty(field)) {
        this[field] = data[field];
      }
    }, this);
  };

  return impressionObject;
})();

/**
 * Product data
 *
 * Value    Type      Req   Description
 * id       String    Yes*  The product ID or SKU (e.g. P67890).
 *                          *Either this field or name must be set.
 * name     String    Yes*  The name of the product (e.g. Android T-Shirt).
 *                          *Either this field or id must be set.
 * brand    String    No    The brand associated with the product (e.g. Google).
 * category String    No    The category to which the product belongs (e.g.
 *                          Apparel). Use / as a delimiter to specify up to
 *                          5-levels of hierarchy (e.g. Apparel/Men/T-Shirts).
 * variant  String    No    The variant of the product (e.g. Black).
 * price    Currency  No    The price of a product (e.g. 29.20).
 * quantity Number    No    The quantity of a product (e.g. 2).
 * coupon   String    No    The coupon code associated with a product (e.g. SUMMER_SALE13).
 * position Number    No    The product's position in a list or collection (e.g. 2).
 *
 * Example:
 *  {               // Provide product details in a productFieldObject.
 *    'id': 'P12345',                   // Product ID (string).
 *    'name': 'Android Warhol T-Shirt', // Product name (string).
 *    'category': 'Apparel',            // Product category (string).
 *    'brand': 'Google',                // Product brand (string).
 *    'variant': 'Black',               // Product variant (string).
 *    'position': 1,                    // Product position (number).
 *    'dimension1': 'Member'            // Custom dimension (string).
 *  });
 */

var productObject = (function() {
  var optionalFields = [
    'brand', 'category', 'variant', 'price', 'quantity', 'coupon', 'position'
  ];

  /**
   * a single productObject as defined by GA Enhanced Ecommerce docs
   * @constructor
   * @param {object} data
   */
  var productObject = function(data) {
    this.id = data.id;
    this.name = data.name;

    optionalFields.forEach(function(field) {
      if (data.hasOwnProperty(field)) {
        this[field] = data[field];
      }
    }, this);
  };

  return productObject;
})();

/**
 * Promotion Data
 *
 * Value    Type      Req   Description
 * id       String    Yes*  The promotion ID (e.g. PROMO_1234).
 *                          *Either this field or name must be set.
 * name     String    Yes*  The name of the promotion (e.g. Summer Sale).
 *                          *Either this field or id must be set.
 * creative String    No    The creative associated with the promotion
 *                          (e.g. summer_banner2).
 * position String    No    The position of the creative (e.g. banner_slot_1).
 *
 * Example:
 *
 *   {
 *
 *   }
 */
var promoObject = (function() {
  var optionalFields = ['creative', 'position'];

  /**
   * a single promoObject as defined by GA Enhanced Ecommerce docs
   * @constructor
   * @param {object} data
   */
  var promoObject = function(data) {
    this.id = data.id;
    this.name = data.name;

    optionalFields.forEach(function(field) {
      if (data.hasOwnProperty(field)) {
        this[field] = data[field];
      }
    }, this);
  };

  return promoObject;
})();

/**
 * Action Data
 *
 * Value        Type      Req   Description
 * id           String    Yes*  The transaction ID (e.g. T1234).
 *                              *Required if the action type is purchase/refund.
 * affiliation  String    No    The store or affiliation from which this
 *                              transaction occurred (e.g. Google Store).
 * revenue      Currency  No    Specifies the total revenue or grand total
 *                              associated with the transaction (e.g. 11.99).
 *                              This value may include shipping, tax costs, or
 *                              other adjustments to total revenue that you want
 *                              to include as part of your revenue calculations.
 *                              Note: if revenue is not set, its value will be
 *                              automatically calculated using the product
 *                              quantity and price fields of all products in the
 *                              same hit.
 * tax          Currency  No    The total tax associated with the transaction.
 * shipping     Currency  No    The shipping cost associated with the
 *                              transaction.
 * coupon       String    No    The transaction coupon redeemed with the
 *                              transaction.
 * list         String    No    The list that the associated products belong
 *                              to. Optional.
 * step         Number    No    A number representing a step in the checkout
 *                              process. Optional on checkout actions.
 * option       String    No    Additional field for checkout and
 *                              checkout_option actions that can describe option
 *                              information on the checkout page, like selected
 *                              payment method.
 *
 * Example:
 *   {
 *
 *   }
 */
var actionObject = (function() {
  var optionalFields = [
    'affiliation', 'revenue', 'tax', 'shipping', 'coupon', 'list', 'step', 'option'
  ];

  /**
   * a single actionObject as defined by GA Enhanced Ecommerce docs
   * @constructor
   * @param {object} data
   */
  var actionObject = function(data) {
    this.id = data.id;

    optionalFields.forEach(function(field) {
      if (data.hasOwnProperty(field)) {
        this[field] = data[field];
      }
    }, this);
  };

  return actionObject;
})();

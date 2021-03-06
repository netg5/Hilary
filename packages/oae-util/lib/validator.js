/*!
 * Copyright 2014 Apereo Foundation (AF) Licensed under the
 * Educational Community License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may
 * obtain a copy of the License at
 *
 *     http://opensource.org/licenses/ECL-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS"
 * BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

const _ = require('underscore');
const tz = require('oae-util/lib/tz');

const { Validator } = require('validator');
module.exports.Validator = Validator;

const HOST_REGEX = /^(?=.{1,255}$)[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?(?:\.[0-9A-Za-z](?:(?:[0-9A-Za-z]|-){0,61}[0-9A-Za-z])?)*\.?(:\d+)?$/i;

let countriesByCode = null;

/*!
 * Wrapper function around node-validator that makes sure that a validation
 * Failure doesn't throw an error and just collects all of the errors
 *
 * @param  {Object}  msg     Error that should be recorded if the validation fails
 */
Validator.prototype.error = function(msg) {
  this._errors.push(msg);
};

/**
 * Wrapper function around node-validator that retrieves all of the validation
 * errors that have been encountered for a given Validator instance
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * ...
 * var errors = validator.getErrors();
 * ```
 *
 * @return {Object[]}     Array containing all of the validation errors
 */
Validator.prototype.getErrors = function() {
  if (this._errors && this._errors.length > 0) {
    return this._errors;
  }
  return null;
};

/**
 * Wrapper function around node-validator that determines how many errors have been collected.
 * @return {Number}     The number of errors that have been collected by this validator
 */
Validator.prototype.getErrorCount = function() {
  if (this._errors) {
    return this._errors.length;
  }
  return 0;
};

/**
 * Get the first error in a validator, in case an validation error has happened
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * ...
 * var firstErorr = validator.getFirstError();
 * ```
 *
 * @return {Object} The first error object in this validator or null if no errors were found.
 */
Validator.prototype.getFirstError = function() {
  if (this._errors && this._errors.length > 0) {
    return this._errors[0];
  }
  return null;
};

/**
 * Check whether or not a given Validator instance has seen any validation errors
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * ...
 * var hasError = validator.hasErrors();
 * ```
 *
 * @return {Boolean}     Returns true when validation errors have occured and false otherwise
 */
Validator.prototype.hasErrors = function() {
  return Boolean(this._errors && this._errors.length);
};

/// ////////////////////
// Custom validators //
/// ////////////////////

/**
 * Check whether or not a context represents a logged in user
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(null, error).isLoggedInUser(ctx);
 * ```
 *
 * @param  {Context}    ctx             Standard context object containing the current user and the current tenant
 * @param  {String}     [tenantAlias]   The alias of the tenant to verify the context is authenticated to. If unspecified, the check will validate that the context is simply authenticated anywhere
 */
Validator.prototype.isLoggedInUser = function(ctx, tenantAlias) {
  if (!_.isObject(ctx)) {
    this.error(this.msg || 'An empty context has been passed in');
  } else if (!_.isObject(ctx.tenant()) || !ctx.tenant().alias) {
    this.error(this.msg || 'The context is not associated to a tenant');
  } else if (!_.isObject(ctx.user()) || !ctx.user().id) {
    this.error(this.msg || 'The user is not logged in');
  } else if (tenantAlias && ctx.tenant().alias !== tenantAlias) {
    this.error(this.msg || 'The context is associated to an invalid tenant');
  }
  return this;
};

/**
 * Check whether or not a context represents a global administrator
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(null, error).isGlobalAdministratorUser(ctx);
 * ```
 *
 * @param  {Context}    ctx     Standard context object containing the current user and the current tenant
 */
Validator.prototype.isGlobalAdministratorUser = function(ctx) {
  if (!_.isObject(ctx)) {
    this.error(this.msg || 'An empty context has been passed in');
  } else if (!_.isFunction(ctx.tenant) || !_.isObject(ctx.tenant()) || !ctx.tenant().alias) {
    this.error(this.msg || 'The context is not associated to a tenant');
  } else if (!_.isFunction(ctx.user) || !_.isObject(ctx.user()) || !ctx.user().id) {
    this.error(this.msg || 'The user is not logged in');
  } else if (!_.isFunction(ctx.user().isGlobalAdmin)) {
    this.error(this.msg || 'The user object is invalid');
  } else if (ctx.user().isGlobalAdmin() !== true) {
    this.error(this.msg || 'The user is not a global administrator');
  }

  return this;
};

/**
 * Check whether or not the passed in object is an actual JSON object
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(null, error).isObject(obj);
 * ```
 *
 * @param  {Object}     obj   Object that needs to be checked for validity
 */
Validator.prototype.isObject = function(obj) {
  if (!_.isObject(obj)) {
    this.error(this.msg || 'A non-object has been passed in');
  }
  return this;
};

/**
 * Check whether or not the passed in object is an actual array
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(null, error).isArray(arr);
 * ```
 *
 * @param  {Object[]}     arr   Object that needs to be checked for validity
 */
Validator.prototype.isArray = function(arr) {
  if (!_.isArray(arr)) {
    this.error(this.msg || 'A non-array has been passed in');
  }
  return this;
};

/**
 * Check whether or not the passed in object is an actual boolean
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(null, error).isBoolean(val);
 * ```
 *
 * @param  {Boolean}     val   Value that needs to be checked for validity
 */
Validator.prototype.isBoolean = function(val) {
  const isBoolean = val === true || val === false;
  if (!isBoolean) {
    this.error(this.msg || 'A non-boolean has been passed in');
  }
  return this;
};

/**
 * Check whether or not the passed in value is defined. Will result in
 * an error if the value is `null` or `undefined`. However other falsey
 * values like `false` and `''` will not trigger a validation error.
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(null, error).isDefined(val);
 * ```
 *
 * @param  {Object}     val     Value that needs to be checked if it is defined (i.e., not `null` or `undefined`)
 */
Validator.prototype.isDefined = function(val) {
  const isDefined = !_.isNull(val) && !_.isUndefined(val);
  if (!isDefined) {
    this.error(this.msg || 'An undefined value has been passed in');
  }
  return this;
};

/**
 * Check whether or not the passed in valid is a string
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(null, error).isString(val);
 * ```
 */
Validator.prototype.isString = function(val) {
  if (!_.isString(val)) {
    this.error(this.msg || 'A non-string has been passed in');
  }
  return this;
};

/**
 * Checks whether or not the provided string is a valid time zone.
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(timezone, error).isValidTimeZone();
 * ```
 */
Validator.prototype.isValidTimeZone = function() {
  // Only timezones of the following format are supported: `foo/bar[/optional]`
  if (!tz.timezone.timezone.zones[this.str] || this.str.indexOf('/') === -1) {
    this.error(this.msg || 'Invalid timezone');
  }
  return this;
};

/**
 * Checks whether the string that was passed in the `check` method is a short string.
 *
 * A short string should be:
 *     * At least 1 character long
 *     * At most 1000 characters long
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(aString, error).isShortString();
 * ```
 */
Validator.prototype.isShortString = function() {
  this.len(1, 1000);
};

/**
 * Checks whether the string that was passed in the `check` method is a medium string.
 *
 * A medium string should be:
 *     * At least 1 character long
 *     * At most 10000 characters long
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(aString, error).isMediumString();
 * ```
 */
Validator.prototype.isMediumString = function() {
  this.len(1, 10000);
};

/**
 * Checks whether the string that was passed in the `check` method is a long string.
 *
 * A long string should be:
 *     * At least 1 character long
 *     * At most 100000 characters long
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(aString, error).isLongString();
 * ```
 */
Validator.prototype.isLongString = function() {
  this.len(1, 100000);
};

/**
 * Checks whether the string is a valid host
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(aString, error).istHost();
 * ```
 */
Validator.prototype.isHost = function() {
  this.isShortString();
  this.regex(HOST_REGEX);
};

/**
 * Checks whether the string is a valid iso-3166 country code
 *
 * Usage:
 * ```
 * var validator = new Validator();
 * validator.check(aString, error).isIso3166Country();
 * ```
 */
Validator.prototype.isIso3166Country = function() {
  if (!_.isString(this.str)) {
    this.error(this.msg || 'Provided country code was not a string');
  } else if (!_hasCountryCode(this.str.toUpperCase())) {
    this.error(this.msg || 'Provided country code is not associated to any known country');
  }
};

/**
 * Determine if the given country code is known
 *
 * @param  {String}     code    The ISO-3166-1 country code to check
 * @return {Boolean}            Whether or not the code is a known ISO-3166-1 country code
 * @api private
 */
const _hasCountryCode = function(code) {
  if (!countriesByCode) {
    // Lazy initialize the country code array so as to not form an cross-
    // dependency on `oae-ui`
    countriesByCode = _.chain(require('oae-ui').getIso3166CountryInfo().countries)
      .indexBy('code')
      .mapObject(() => {
        return true;
      })
      .value();
  }

  return countriesByCode[code];
};

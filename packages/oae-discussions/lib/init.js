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

/* eslint-disable no-unused-vars */
const DiscussionsSearch = require('./search');

module.exports = function(config, callback) {
  // Register the library functionality
  const library = require('./library');

  // Register the activity functionality

  const activity = require('./activity');

  // Register the invitations functionality
  const invitations = require('./invitations');

  return DiscussionsSearch.init(callback);
};

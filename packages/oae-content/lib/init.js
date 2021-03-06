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

const mkdirp = require('mkdirp');

const Cleaner = require('oae-util/lib/cleaner');
const log = require('oae-logger').logger('oae-content');
const TaskQueue = require('oae-util/lib/taskqueue');

const ContentAPI = require('./api');
const { ContentConstants } = require('./constants');
const ContentSearch = require('./search');
const Etherpad = require('./internal/etherpad');
const LocalStorage = require('./backends/local');

module.exports = function(config, callback) {
  // Initialize the content library capabilities
  // eslint-disable-next-line import/no-unassigned-import
  require('./library');

  // Initialize activity capabilities
  // eslint-disable-next-line import/no-unassigned-import
  require('./activity');

  // Ensure that the preview listeners get registered
  // eslint-disable-next-line import/no-unassigned-import
  require('./previews');

  // Initialize invitations listeners
  // eslint-disable-next-line import/no-unassigned-import
  require('./invitations');

  // Initialize the etherpad client.
  Etherpad.refreshConfiguration(config.etherpad);

  ContentSearch.init(err => {
    if (err) {
      return callback(err);
    }

    // Create the directory where files will be stored.
    mkdirp(config.files.uploadDir, err => {
      if (err && err.code !== 'EEXIST') {
        log().error({ err }, 'Could not create the directory where uploaded files can be stored.');
        return callback(err);
      }

      if (config.files.cleaner.enabled) {
        // Start a timed process that checks the uploaded dir and remove files
        // which should not be there.
        Cleaner.start(config.files.uploadDir, config.files.cleaner.interval);
      }

      LocalStorage.init(config.files.localStorageDirectory, err => {
        if (err) {
          return callback(err);
        }

        // Handle "publish" messages that are sent from Etherpad via RabbitMQ. These messages
        // indicate that a user made edits and has closed the document
        TaskQueue.bind(ContentConstants.queue.ETHERPAD_PUBLISH, ContentAPI.handlePublish, null, err => {
          if (err) {
            return callback(err);
          }

          return callback();
        });
      });
    });
  });
};

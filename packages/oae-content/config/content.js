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

const Fields = require('oae-config/lib/fields');

module.exports = {
  title: 'OAE Content Module',
  visibility: {
    name: 'Default Visibility Values',
    description: 'Default visibility settings for new content',
    elements: {
      files: new Fields.List('Files Visibility', 'Default visibility for new files', 'public', [
        {
          name: 'Public',
          value: 'public'
        },
        {
          name: 'Logged in users',
          value: 'loggedin'
        },
        {
          name: 'Private',
          value: 'private'
        }
      ]),
      collabdocs: new Fields.List(
        'Collaborative Document Visibility',
        'Default visibility for new Collaborative Documents',
        'private',
        [
          {
            name: 'Public',
            value: 'public'
          },
          {
            name: 'Logged in users',
            value: 'loggedin'
          },
          {
            name: 'Private',
            value: 'private'
          }
        ]
      ),
      links: new Fields.List('Links Visibility', 'Default visibility for new links', 'public', [
        {
          name: 'Public',
          value: 'public'
        },
        {
          name: 'Logged in users',
          value: 'loggedin'
        },
        {
          name: 'Private',
          value: 'private'
        }
      ])
    }
  }
};

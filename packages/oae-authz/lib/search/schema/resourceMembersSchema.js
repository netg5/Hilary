/* eslint unicorn/filename-case: 0 */

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

/**
 * Create the schema for a document that indexes resource members information. This document is intended to be a child document,
 * whose parent is the central resource document. This relationship allows for a resource's members to be updated without having
 * to re-index the memberships (if any) as well as the central resource document.
 *
 * @return {Object}     schema                  The resource members schema object
 *         {String[]}   schema.direct_members   A multi-value field that holds the direct member ids of the parent resource
 */
module.exports = {
  // eslint-disable-next-line camelcase
  direct_members: {
    type: 'string',
    store: 'no',
    index: 'not_analyzed'
  }
};

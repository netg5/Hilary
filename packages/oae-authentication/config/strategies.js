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
  title: 'OAE Authentication Module',
  local: {
    name: 'Local Authentication',
    description: 'Allow local authentication for tenant',
    elements: {
      allowAccountCreation: new Fields.Bool(
        'Local Account Creation',
        'Allow users to create their own account',
        true
      ),
      enabled: new Fields.Bool(
        'Local Authentication Enabled',
        'Allow local authentication for tenant',
        true
      )
    }
  },
  google: {
    name: 'Google Authentication',
    description: 'Allow Google authentication for tenant',
    elements: {
      enabled: new Fields.Bool(
        'Google Authentication Enabled',
        'Allow Google authentication for tenant',
        false
      ),
      key: new Fields.Text('Google client ID', 'Google client ID', process.env.GOOGLE_CLIENT_ID, {
        suppress: true
      }),
      secret: new Fields.Text(
        'Google client secret',
        'Google client secret',
        process.env.GOOGLE_CLIENT_SECRET,
        {
          suppress: true
        }
      ),
      domains: new Fields.Text(
        'Google domain(s)',
        'A comma-separated list of allowed email domains (optional)',
        ''
      )
    }
  },
  twitter: {
    name: 'Twitter Authentication',
    description: 'Allow Twitter authentication for tenant',
    elements: {
      enabled: new Fields.Bool(
        'Twitter Authentication Enabled',
        'Allow Twitter authentication for tenant',
        true
      ),
      key: new Fields.Text(
        'Twitter consumer key',
        'Twitter consumer key',
        process.env.TWITTER_KEY,
        {
          suppress: true
        }
      ),
      secret: new Fields.Text(
        'Twitter consumer secret',
        'Twitter consumer secret',
        process.env.TWITTER_SECRET,
        {
          suppress: true
        }
      )
    }
  },
  facebook: {
    name: 'Facebook Authentication',
    description: 'Allow Facebook authentication for tenant',
    elements: {
      enabled: new Fields.Bool(
        'Facebook Authentication Enabled',
        'Allow Facebook authentication for tenant',
        false
      ),
      appid: new Fields.Text('Facebook App ID', 'Facebook App ID', process.env.FACEBOOK_APP_ID, {
        suppress: true
      }),
      secret: new Fields.Text('Secret', 'Secret', process.env.FACEBOOK_APP_SECRET, {
        suppress: true
      })
    }
  },
  shibboleth: {
    name: 'Shibboleth Authentication',
    description: 'Allow Shibboleth authentication for tenant',
    elements: {
      enabled: new Fields.Bool(
        'Shibboleth Authentication Enabled',
        'Allow Shibboleth authentication for tenant',
        false
      ),
      name: new Fields.Text(
        'Name',
        'A name that users will recognize as their identity provider',
        ''
      ),
      idpEntityID: new Fields.Text('Identity Provider entity ID', 'The entity ID of the IdP', '', {
        suppress: true
      }),
      externalIdAttributes: new Fields.Text(
        'External ID Attribute',
        'The attribute that uniquely identifies the user. This should be a prioritised space seperated list',
        'persistent-id targeted-id eppn',
        { suppress: true }
      ),
      mapDisplayName: new Fields.Text(
        'Display name',
        'The attibute(s) that should be used to construct the displayname. This should be a prioritised space seperated list. e.g., `displayname cn`',
        'displayname cn',
        { suppress: true }
      ),
      mapEmail: new Fields.Text(
        'Email',
        'The attibute(s) that should be used to construct the email. This should be a prioritised space seperated list. e.g., `mail email eppn`',
        'mail email eppn',
        { suppress: true }
      ),
      mapLocale: new Fields.Text(
        'Locale',
        'The attibute(s) that should be used to construct the locale. This should be a prioritised space seperated list. e.g., `locality locale`',
        'locality locale',
        { suppress: true }
      )
    }
  },
  cas: {
    name: 'CAS Authentication',
    description: 'Allow CAS authentication for tenant',
    elements: {
      enabled: new Fields.Bool(
        'CAS Authentication Enabled',
        'Allow CAS authentication for tenant',
        false
      ),
      name: new Fields.Text(
        'Name',
        'A name that users will recognize as their identity provider',
        ''
      ),
      url: new Fields.Text(
        'Host',
        'The URL at which the CAS server can be reached. This should include http(s)://, any non-standard port and any base path with no trailing slash',
        '',
        { suppress: true }
      ),
      loginPath: new Fields.Text(
        'Login Path',
        'The path to which the user should be redirected to start the authentication flow',
        '/login',
        { suppress: true }
      ),
      useSaml: new Fields.Bool(
        'Use SAML',
        'Use SAML to get CAS attributes. When using this, you probably need to set the Validate Path to "/samlValidate"',
        false,
        { suppress: true }
      ),
      validatePath: new Fields.Text(
        'CAS Validate Path',
        'The CAS validation path such as /serviceValdiate',
        '/serviceValidate',
        { suppress: true }
      ),
      logoutUrl: new Fields.Text(
        'Logout URL',
        'The URL to which the user should be redirected when logging out of OAE. This should be a full url including a valid protocol (e.g., https://my.cas.server/cas/logout)',
        '',
        { suppress: true }
      ),
      mapDisplayName: new Fields.Text(
        'Display name',
        'The attibute(s) that should be used to construct the displayname. e.g., {first_name} {last_name}',
        '',
        { suppress: true }
      ),
      mapEmail: new Fields.Text(
        'Email',
        'The attibute(s) that should be used to construct the email. e.g., {mail}',
        '',
        { suppress: true }
      ),
      mapLocale: new Fields.Text(
        'Locale',
        'The attibute(s) that should be used to construct the locale. e.g., {locale}',
        '',
        { suppress: true }
      )
    }
  },
  ldap: {
    name: 'LDAP Authentication',
    description: 'Allow LDAP authentication for tenant',
    elements: {
      enabled: new Fields.Bool(
        'LDAP Authentication Enabled',
        'Allow LDAP authentication for tenant',
        false
      ),
      url: new Fields.Text(
        'Host',
        'The URL at which the LDAP server can be reached. This should include both the protocol and the port. E.g. `ldaps://lookup.example.com:636` (required)',
        '',
        { suppress: true }
      ),
      adminDn: new Fields.Text(
        'Admin Distinguished Name',
        'The DN that identifies an admin user that can search for user information. E.g. uid=admin,ou=users,dc=example,dc=com (required)',
        '',
        { suppress: true }
      ),
      adminPassword: new Fields.Text(
        'Admin password',
        'The password for the admin DN that can be used to bind to LDAP. (required)',
        '',
        { suppress: true }
      ),
      searchBase: new Fields.Text(
        'Base',
        'The base DN under which to search for users. E.g. ou=users,dc=example,dc=com (required)',
        '',
        { suppress: true }
      ),
      searchFilter: new Fields.Text(
        'Filter',
        'The LDAP search filter with which to find a user by username, e.g. (uid={{username}}). Use the literal `{{username}}` to have the given username be interpolated in for the LDAP search. (required)',
        '',
        { suppress: true }
      ),
      mapExternalId: new Fields.Text(
        'LDAP External ID field',
        'The name of the LDAP field that contains an identifier that uniquely identifies the user in LDAP (required)',
        'uid',
        { suppress: true }
      ),
      mapDisplayName: new Fields.Text(
        'LDAP DisplayName field',
        "The name of the LDAP field that contains the user's displayName (required)",
        'cn',
        { suppress: true }
      ),
      mapEmail: new Fields.Text(
        'LDAP Email field',
        "The name of the LDAP field that contains the user's email address (optional)",
        '',
        { suppress: true }
      ),
      mapLocale: new Fields.Text(
        'LDAP Locale field',
        "The name of the LDAP field that contains the user's locale (optional)",
        '',
        { suppress: true }
      )
    }
  }
};

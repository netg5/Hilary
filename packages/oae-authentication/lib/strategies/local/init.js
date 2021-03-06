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

const LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');

const ConfigAPI = require('oae-config');
const { Context } = require('oae-context');
const PrincipalsAPI = require('oae-principals');
const { User } = require('oae-principals/lib/model');

const AuthenticationAPI = require('oae-authentication');

const AuthenticationConfig = ConfigAPI.config('oae-authentication');
const { AuthenticationConstants } = require('oae-authentication/lib/constants');
const AuthenticationUtil = require('oae-authentication/lib/util');

let globalTenantAlias = null;

module.exports = function(config) {
  globalTenantAlias = config.servers.globalAdminAlias;

  // Build up the OAE strategy.
  const strategy = {};

  /**
   * @see oae-authentication/lib/strategy#shouldBeEnabled
   */
  strategy.shouldBeEnabled = function(tenantAlias) {
    // The global tenant should always have local login enabled.
    if (tenantAlias === globalTenantAlias) {
      return true;

      // Otherwise we need to check the configuration.
    }
    return AuthenticationConfig.getValue(
      tenantAlias,
      AuthenticationConstants.providers.LOCAL,
      'enabled'
    );
  };

  /**
   * @see oae-authentication/lib/strategy#getPassportStrategy
   */
  strategy.getPassportStrategy = function() {
    const passportStrategy = new LocalStrategy(
      { passReqToCallback: true },
      (req, username, password, done) => {
        const { tenant } = req;

        AuthenticationAPI.checkPassword(tenant.alias, username, password, (err, userId) => {
          if (err && err.code === 401) {
            // The provided password was incorrect
            return done(null, false);
          }
          if (err) {
            // Some internal error occurred
            return done(err);
          }

          // By this point we know that we were succesfully logged in. Retrieve
          // the user account and stick it in the context.
          const ctx = new Context(tenant, new User(tenant.alias, userId));
          PrincipalsAPI.getUser(ctx, userId, (err, user) => {
            if (err) {
              return done(err);
            }
            if (user.deleted) {
              return done(null, false);
            }

            const strategyId = AuthenticationUtil.getStrategyId(
              tenant,
              AuthenticationConstants.providers.LOCAL
            );
            const authObj = { user, strategyId };
            AuthenticationUtil.logAuthenticationSuccess(
              req,
              authObj,
              AuthenticationConstants.providers.LOCAL
            );
            return done(null, authObj);
          });
        });
      }
    );

    return passportStrategy;
  };

  // Register our strategy.
  AuthenticationAPI.registerStrategy(AuthenticationConstants.providers.LOCAL, strategy);

  // The local strategy is the only strategy that we register on the global admin server. As
  // this is a special case, it's OK to hardcode it.
  const globalTenant = { alias: globalTenantAlias };
  const adminLocalPassportStrategyName = AuthenticationUtil.getStrategyId(
    globalTenant,
    AuthenticationConstants.providers.LOCAL
  );
  passport.use(adminLocalPassportStrategyName, strategy.getPassportStrategy(globalTenant));
};

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

const AuthzUtil = require('oae-authz/lib/util');
const EmitterAPI = require('oae-emitter');
const OaeUtil = require('oae-util/lib/util');
const PrincipalsDAO = require('oae-principals/lib/internal/dao');
const PrincipalsUtil = require('oae-principals/lib/util');
const { Validator } = require('oae-authz/lib/validator');

const FollowingAuthz = require('oae-following/lib/authz');
const { FollowingConstants } = require('oae-following/lib/constants');
const FollowingDAO = require('./internal/dao');

/**
 * ### Events
 *
 * The `FollowingAPI`, as enumerated in `FollowingConstants.events`, emits the following events:
 *
 *  * `follow(ctx, followerUser, followedUser)`: One user followed another user. The `ctx` of the current request, the `followerUser` (the user who became a follower) and the `followedUser` (the user who was followed) are all provided
 *  * `unfollow(ctx, followerUser, unfollowedUserId)`: One user unfollowed another user. The `ctx` of the current request, the `followerUser` (the user who unfollowed another user) and the `followedUserId` (the id of the user who is unfollowed) are all provided
 */
const FollowingAPI = new EmitterAPI.EventEmitter();

/**
 * Get the users who are following a user
 *
 * @param  {Context}    ctx                 Standard context object containing the current user and the current tenant
 * @param  {String}     userId              The id of the user whose followers to get
 * @param  {String}     [start]             From where to start fetching the page of followers, as specified by the `nextToken` return param
 * @param  {Number}     [limit]             The maximum number of followers to retrieve
 * @param  {Function}   callback            Standard callback function
 * @param  {Object}     callback.err        An error that occurred, if any
 * @param  {User[]}     callback.followers  The followers of the specified user
 * @param  {String}     callback.nextToken  The token to use as the `start` parameter when fetching the next page of followers
 */
const getFollowers = function(ctx, userId, start, limit, callback) {
  limit = OaeUtil.getNumberParam(limit, 10, 1);

  const validator = new Validator();
  validator.check(userId, { code: 400, msg: 'You must specify a valid user id' }).isUserId();
  if (validator.hasErrors()) {
    return callback(validator.getFirstError());
  }

  // Get the user so we can determine their visibility and permissions
  PrincipalsDAO.getPrincipal(userId, (err, user) => {
    if (err) {
      return callback(err);
    }

    // Determine if the current user has access to view the followers
    FollowingAuthz.canViewFollowers(ctx, user, err => {
      if (err) {
        return callback(err);
      }

      // Get the list of followers
      FollowingDAO.getFollowers(userId, start, limit, (err, followerUserIds, nextToken) => {
        if (err) {
          return callback(err);
        }

        AuthzUtil.filterDeletedIds(followerUserIds, (err, followerUserIds) => {
          if (err) {
            return callback(err);
          }

          // Expand the list of followers into their basic profiles
          _expandUserIds(ctx, followerUserIds, (err, users) => {
            if (err) {
              return callback(err);
            }

            // Emit an event indicating that the followers for a user have been retrieved
            FollowingAPI.emit(
              FollowingConstants.events.GET_FOLLOWERS,
              ctx,
              userId,
              start,
              limit,
              users,
              err => {
                if (err) {
                  return callback(err);
                }

                return callback(null, users, nextToken);
              }
            );
          });
        });
      });
    });
  });
};

/**
 * Get the users who are followed by a specific user
 *
 * @param  {Context}    ctx                 Standard context object containing the current user and the current tenant
 * @param  {String}     userId              The id of the user whose list of followed users to get
 * @param  {String}     [start]             From where to start fetching the page of followed users, as specified by the `nextToken` return param
 * @param  {Number}     [limit]             The maximum number of followed users to retrieve
 * @param  {Function}   callback            Standard callback function
 * @param  {Object}     callback.err        An error that occurred, if any
 * @param  {User[]}     callback.followed   The list of users who are being followed by the specified user
 * @param  {String}     callback.nextToken  The token to use as the `start` parameter when fetching the next page of followed users
 */
const getFollowing = function(ctx, userId, start, limit, callback) {
  limit = OaeUtil.getNumberParam(limit, 10, 1);

  const validator = new Validator();
  validator.check(userId, { code: 400, msg: 'You must specify a valid user id' }).isUserId();
  if (validator.hasErrors()) {
    return callback(validator.getFirstError());
  }

  // Get the user so we can determine their visibility and permissions
  PrincipalsDAO.getPrincipal(userId, (err, user) => {
    if (err) {
      return callback(err);
    }

    // Determine if the current user has access to view the list of followed users
    FollowingAuthz.canViewFollowing(ctx, user, err => {
      if (err) {
        return callback(err);
      }

      // Get the list of followed user ids
      FollowingDAO.getFollowing(userId, start, limit, (err, followingUserIds, nextToken) => {
        if (err) {
          return callback(err);
        }

        // Remove those that have been deleted
        AuthzUtil.filterDeletedIds(followingUserIds, (err, followingUserIds) => {
          if (err) {
            return callback(err);
          }

          // Expand the user ids into the list of basic user profiles
          _expandUserIds(ctx, followingUserIds, (err, users) => {
            if (err) {
              return callback(err);
            }

            // Emit an event indicating that the followed users for a user have been retrieved
            FollowingAPI.emit(
              FollowingConstants.events.GET_FOLLOWING,
              ctx,
              userId,
              start,
              limit,
              users,
              err => {
                if (err) {
                  return callback(err);
                }

                return callback(null, users, nextToken);
              }
            );
          });
        });
      });
    });
  });
};

/**
 * Follow a user
 *
 * @param  {Context}    ctx             Standard context object containing the current user and the current tenant
 * @param  {String}     followedUserId  The id of the user to follow
 * @param  {Function}   callback        Standard callback function
 * @param  {Object}     callback.err    An error that occurred, if any
 */
const follow = function(ctx, followedUserId, callback) {
  const validator = new Validator();
  validator
    .check(null, { code: 401, msg: 'You must be authenticated to follow a user' })
    .isLoggedInUser(ctx);
  validator
    .check(followedUserId, {
      code: 400,
      msg: 'You must specify a valid user id of a user to follow'
    })
    .isUserId();
  if (validator.hasErrors()) {
    return callback(validator.getFirstError());
  }

  // Get the user to follow to perform permission checks
  PrincipalsDAO.getPrincipal(followedUserId, (err, followedUser) => {
    if (err) {
      return callback(err);
    }

    // Determine if the current user is allowed to follow this user
    FollowingAuthz.canFollow(ctx, followedUser, err => {
      if (err) {
        return callback(err);
      }

      FollowingDAO.isFollowing(ctx.user().id, [followedUserId], (err, following) => {
        if (err) {
          return callback(err);
        }
        if (following[followedUserId]) {
          // The user is already following the target user, so we don't
          // have to do anything
          return callback();
        }

        // Save the new list of followed users for the current user
        FollowingDAO.saveFollows(ctx.user().id, [followedUserId], err => {
          if (err) {
            return callback(err);
          }

          return FollowingAPI.emit(
            FollowingConstants.events.FOLLOW,
            ctx,
            ctx.user(),
            followedUser,
            callback
          );
        });
      });
    });
  });
};

/**
 * Unfollow a user
 *
 * @param  {Context}    ctx                 Standard context object containing the current user and the current tenant
 * @param  {String}     unfollowedUserId    The id of the user to unfollow
 * @param  {Function}   callback            Standard callback function
 * @param  {Object}     callback.err        An error that occurred, if any
 */
const unfollow = function(ctx, unfollowedUserId, callback) {
  const validator = new Validator();
  validator
    .check(null, { code: 401, msg: 'You must be authenticated to unfollow a user' })
    .isLoggedInUser(ctx);
  validator
    .check(unfollowedUserId, {
      code: 400,
      msg: 'You must specify a valid user id of a user to unfollow'
    })
    .isUserId();
  if (validator.hasErrors()) {
    return callback(validator.getFirstError());
  }

  // A user can always try and delete followers from their list of followers
  FollowingDAO.deleteFollows(ctx.user().id, [unfollowedUserId], err => {
    if (err) {
      return callback(err);
    }

    return FollowingAPI.emit(
      FollowingConstants.events.UNFOLLOW,
      ctx,
      ctx.user(),
      unfollowedUserId,
      callback
    );
  });
};

/**
 * Expand the array of user ids into the associated (scrubbed if necessary) basic user profiles array in the same order
 *
 * @param  {Context}    ctx             Standard context object containing the current user and the current tenant
 * @param  {String[]}   userIds         The user ids to expand into basic profiles
 * @param  {Function}   callback        Standard callback function
 * @param  {Object}     callback.err    An error that occurred, if any
 * @param  {User[]}     callback.users  The basic user profiles of the users in the userIds array in the same order as the ids provided
 * @api private
 */
const _expandUserIds = function(ctx, userIds, callback) {
  if (_.isEmpty(userIds)) {
    return callback(null, []);
  }

  // Fetch and scrub the basic user profiles
  PrincipalsUtil.getPrincipals(ctx, userIds, (err, userProfiles) => {
    if (err) {
      return callback(err);
    }

    const userList = [];
    _.each(userIds, userId => {
      userList.push(userProfiles[userId]);
    });

    return callback(null, userList);
  });
};

module.exports = {
  emitter: FollowingAPI,
  getFollowers,
  getFollowing,
  follow,
  unfollow
};

const Cassandra = require('oae-util/lib/cassandra');

/**
 * Create the following database schema
 *
 * @param  {Function}   callback        Standard callback function
 * @param  {Object}     callback.err    An error that occurred, if any
 * @api private
 */
const ensureSchema = function(callback) {
  Cassandra.createColumnFamilies(
    {
      FollowingUsersFollowers:
        'CREATE TABLE "FollowingUsersFollowers" ("userId" text, "followerId" text, "value" text, PRIMARY KEY ("userId", "followerId")) WITH COMPACT STORAGE',
      FollowingUsersFollowing:
        'CREATE TABLE "FollowingUsersFollowing" ("userId" text, "followingId" text, "value" text, PRIMARY KEY ("userId", "followingId")) WITH COMPACT STORAGE'
    },
    callback
  );
};

module.exports = { ensureSchema };

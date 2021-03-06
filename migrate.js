#!/usr/bin/env node
/**
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

const path = require('path');
const optimist = require('optimist');

const log = require('oae-logger').logger();

const config = require(path.join(__dirname, 'config.js'));
const dbConfig = config.config.cassandra;
const migrationRunner = require(path.join(__dirname, 'etc/migration/migration_runner.js'));

const { argv } = optimist
  .usage('$0 [--keyspace <keyspace>]')
  .alias('k', 'keyspace')
  .describe('k', 'Specify the keyspace for running the migrations')
  .default('k', dbConfig.keyspace);

if (argv.help) {
  optimist.showHelp();
  process.exit(0);
}

dbConfig.keyspace = argv.keyspace === true ? dbConfig.keyspace : argv.keyspace;

const execute = function() {
  log().info('Running migrations for keyspace ' + dbConfig.keyspace + '...');
  migrationRunner.runMigrations(dbConfig, () => {
    log().info('All done.');
    process.exit(0);
  });
};

execute();

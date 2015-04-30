/*!
 * Copyright 2015 Digital Services, University of Cambridge Licensed
 * under the Educational Community License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
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
 * Initialises the grasshopper APIs
 */
define(['gh.utils', 'gh.api.admin', 'gh.api.app', 'gh.api.authentication', 'gh.api.config', 'gh.api.event', 'gh.api.groups',
        'gh.api.orgunit', 'gh.api.series', 'gh.api.tenant', 'gh.api.user'],
    function(utils, adminAPI, appAPI, authenticationAPI, configAPI, eventAPI, groupsAPI, orgunitAPI, seriesAPI, tenantAPI, userAPI) {

        var gh = {
            'api': {
                'adminAPI': adminAPI,
                'appAPI': appAPI,
                'authenticationAPI': authenticationAPI,
                'configAPI': configAPI,
                'eventAPI': eventAPI,
                'groupsAPI': groupsAPI,
                'orgunitAPI': orgunitAPI,
                'seriesAPI': seriesAPI,
                'tenantAPI': tenantAPI,
                'userAPI': userAPI
            },
            'config': {},
            'utils': utils,
            'data': {
                'me': null
            }
        };

        /**
         * Initialise the various APIs and data needed to make the app function
         *
         * @param  {Function}    callback       Standard callback function
         * @param  {Function}    callback.gh    Global data object containing information on the user, the app configuration and the APIs
         * @private
         */
        var initGH = function(callback) {
            // Load the me feed
            userAPI.getMe(function(err, me) {
                /* istanbul ignore else */
                if (!err) {
                    gh.data.me = me;
                } else {
                    // Intercept 503 status indicating that the server is down
                    if (err.code === 503) {
                        gh.utils.redirect().unavailable();
                    }
                }

                // Get the app configuration
                getConfig(function() {
                    /* istanbul ignore if */
                    if (gh.config.enableAnalytics) {
                        utils.setUpInstrumentation(gh.data.me, gh.config.analyticsTrackingId, gh.config.enableAnalytics, function() {
                            // The APIs have now fully initialised. All javascript that
                            // depends on the initialised core APIs can now execute
                            return callback(gh);
                        });
                    } else {
                        return callback(gh);
                    }
                });
            });
        };

        /**
         * Get the app configuration, except if the global admin page is loaded up
         *
         * @param  {Function}    callback    Standard callback function
         * @private
         */
        var getConfig = function(callback) {
            // Don't attempt to fetch any configuration when the global admin UI or QUnit
            // is loaded up as it has its own way of dealing with configuration
            /* istanbul ignore else */
            if ($('body').hasClass('gh-global-admin') || $('body').data('isqunit')) {
                callback();
            // Fetch the configuration and cache it on the global gh object when we're loading
            // up the student UI or student admin UI
            } else {
                configAPI.getConfig(null, function(err, config) {
                    if (err) {
                        throw new Error('The configuration for the app could not be retrieved');
                    }

                    // Show a message to the user informing them that the app hasn't been properly configured
                    // if the academicYear hasn't been set
                    if (!config.terms[config.academicYear]) {
                        gh.utils.notification('App is not configured', 'The application has not yet been properly configured for an academic year', 'error', null, true);
                    }

                    // Cache the config on the global gh.data object
                    gh.config = config;

                    // Continue the startup procedure
                    callback();
                });
            }
        };

        return {
            'pluginBuilder': 'pluginBuilder',
            /*!
             * Invoked when the module has been loaded, which can trigger initialization in a chained manner.
             */
            'load': function(name, parentRequire, load, config) {
                initGH(load);
            }
        };
    }
);

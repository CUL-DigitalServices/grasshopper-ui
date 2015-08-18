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

define(['gh.core', 'gh.constants', 'chosen', 'validator', 'gh.global-admin.configuration', 'gh.global-admin.tenants', 'gh.global-admin.users', 'gh.header', 'gh.footer'], function(gh, constants) {

    // Get the current page, strip out slashes etc
    var currentPage = window.location.pathname.split('/')[1];

    // Cached app objects for easy manipulation
    var cachedApps = null;


    ///////////////
    // RENDERING //
    ///////////////

    /**
     * Render the admin navigation
     *
     * @private
     */
    var renderNavigation = function() {
        // Render the navigation template
        gh.utils.renderTemplate('global-admin-navigation', {
            'gh': gh,
            'currentPage': currentPage
        }, $('#gh-navigation-container'));
    };


    ///////////////
    // UTILITIES //
    ///////////////

    /**
     * Update the value attribute of a checkbox
     *
     * @private
     */
    var updateCheckboxValue = function() {
        $(this).val($(this).is(':checked'));
    };


    //////////////////////
    // TENANTS AND APPS //
    //////////////////////

    /**
     * Set up the tenants page
     *
     * @private
     */
    var setUpTenants = function() {
        // Get the tenant data
        getTenantData(function(tenants) {
            $(document).trigger('gh.global-admin.renderTenants', {'tenants': tenants});
        });
    };

    /**
     * Get tenant data and app data for those tenants and render them
     *
     * @private
     */
    var getTenantData = function(callback) {
        gh.api.tenantAPI.getTenants(function(err, tenants) {
            if (err) {
                return gh.utils.notification('Could not fetch system tenants', constants.messaging.default.error, 'error');
            }

            var todo = tenants.length;
            var done = 0;

            var getApps = function(tenantId, _callback) {
                gh.api.appAPI.getApps(tenantId, function(err, apps) {
                    if (err) {
                        return gh.utils.notification('Could not fetch system apps', constants.messaging.default.error, 'error');
                    }

                    // Sort the apps by host
                    apps.sort(gh.utils.sortByHost);
                    // Cache the apps on the tenants object for easy access in the templates
                    tenants[done].apps = apps;
                    // Cache the apps on a separate object for easy access
                    cachedApps = _.union(cachedApps, apps);

                    done++;
                    if (done === todo) {
                        _callback(tenants);
                    } else {
                        getApps(tenants[done].id, _callback);
                    }
                });
            };

            // If there are no tenants yet we can start rendering
            if (todo === 0) {
                callback([]);
            // Otherwise we get the apps for each tenant
            } else {
                getApps(tenants[done].id, function(tenants) {
                    tenants.sort(gh.utils.sortByDisplayName);
                    callback(tenants);
                });
            }
        });
    };


    ///////////
    // USERS //
    ///////////

    /**
     * Set up the users page
     *
     * @private
     */
    var setUpUsers = function() {
        // Set up the global administrators
        getAdminUserData(function(administrators) {
            // Get the tenant data
            getTenantData(function(tenants) {
                // Set up the app users
                getConfigData(tenants, function(config) {
                    $(document).trigger('gh.global-admin.renderUsers', {
                        'administrators': administrators,
                        'tenants': tenants
                    });
                });
            });
        });
    };

    /**
     * Get administrator users and render them
     *
     * @private
     */
    var getAdminUserData = function(callback) {
        gh.api.adminAPI.getAdmins(null, null, function(err, administrators) {
            if (err) {
                return gh.utils.notification('Could not fetch admins', constants.messaging.default.error, 'error');
            }

            callback(administrators.rows);
        });
    };


    ///////////////////
    // CONFIGURATION //
    ///////////////////

    /**
     * Set up the configuration page
     *
     * @private
     */
    var setUpConfig = function() {
        getTenantData(function(tenants) {
            getConfigData(tenants, function(tenants) {
                $(document).trigger('gh.global-admin.renderConfig', {'tenants': tenants});
            });
        });
    };

    /**
     * Get the configuration data for all apps in all tenants
     *
     * @param  {Object[]}    tenants    The tenants and apps to fetch configuration for
     * @private
     */
    var getConfigData = function(tenants, callback) {
        var tenantsDone = 0;

        var appsToDo = 0;
        var appsDone = 0;

        /**
         * Recursive function that retrieves configuration for the provided apps and caches it
         * on the app object
         *
         * @param  {Object[]}    apps         Array op applications to retrieve the configuration for
         * @param  {Function}    _callback    Standard callback function
         * @private
         */
        var getConfigForApps = function(apps, _callback) {
            gh.api.configAPI.getConfig(apps[appsDone].id, function(err, config) {
                if (err) {
                    return gh.utils.notification('Could not fetch system configuration', constants.messaging.default.error, 'error');
                }

                // Remove unwanted properties from the configuration object
                delete config.createdAt;
                delete config.updatedAt;

                // Cache the configuration on the app object
                apps[appsDone].config = config;

                // If there are other apps in the tenant, fetch the next one's config
                appsDone++;
                if (appsDone !== appsToDo) {
                    return getConfigForApps(apps, _callback);
                }

                // There are no other apps. If there are no other tenants call back
                tenantsDone++;
                if (tenantsDone === tenants.length) {
                    return _callback();
                }

                // There are no other apps. There are other tenants so go and get the app configs for those
                getAppsInTenant(tenants[tenantsDone], _callback);
            });
        };

        /**
         * Recursive function that goes through a tenant's apps and retrieves the config for them
         *
         * @param  {Object}      tenant       The tenant to iterate over its apps
         * @param  {Function}    _callback    Standard callback function
         * @private
         */
        var getAppsInTenant = function(tenant, _callback) {
            // If there are no apps we can skip this tenant
            if (tenant.apps.length === 0) {
                // If no other tenants are left, execute the callback
                tenantsDone++;
                if (tenantsDone === tenants.length) {
                    return _callback();
                }

                // There are other tenants, iterate over the next one's apps
                return getAppsInTenant(tenants[tenantsDone], _callback);
            }

            // There are apps, got retrieve their configuration
            appsToDo = tenant.apps.length;
            appsDone = 0;
            getConfigForApps(tenant.apps, _callback);
        };

        // If there are no tenants yet we can start rendering
        if (tenants.length === 0) {
            return callback([]);
        }

        // There are tenants. Go retrieve their apps
        getAppsInTenant(tenants[tenantsDone], function() {
            callback(tenants);
        });
    };


    ///////////////
    // APP USERS //
    ///////////////

    /**
     * Retrieve the users that belong to an app taking the search query into account
     *
     * @private
     */
    var getUsers = function() {
        // Get the ID of the app to search for users in
        var appId = parseInt($(this).closest('.panel-group').data('appid'), 10);
        // Get the search query
        var query = $($(this).closest('.panel-group').find('.gh-striped-container-search input')).val();

        gh.api.userAPI.getUsers(appId, null, null, query, function(err, data) {
            if (err) {
                return gh.utils.notification('Could not retrieve the users for this app', constants.messaging.default.error, 'error');
            }

            // Render the users in the app container
            $(document).trigger('gh.global-admin.renderAppUsersResults', {'appId': appId, 'users': data});
        });
    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    /**
     * Add event handlers to various elements on the page
     *
     * @private
     */
    var addBinding = function() {

        // Update the value attribute of a checkbox when it changes
        $('body').on('change', 'input[type="checkbox"]', updateCheckboxValue);

        // Search users
        $('body').on('submit', '.gh-striped-container-search', function() {
            // Open the panel and let its event handle the search
            $(this).closest('.panel-group').find('.collapse').collapse('show').trigger('show.bs.collapse');
            // Avoid default form submit behaviour
            return false;
        });

        // Retrieve the users belonging to the app that was opened
        $('body').on('show.bs.collapse', '#gh-administrators-container .collapse', getUsers);

        $(document).on('gh.global-admin.getCachedApps', function(evt, callback) {
            callback(cachedApps);
        });

        // Set up tenants
        $(document).on('gh.global-admin.setUpTenants', setUpTenants);
        // Set up users
        $(document).on('gh.global-admin.setUpUsers', setUpUsers);
    };

    /**
     * Initialise the page
     *
     * @private
     */
    var initialise = function() {

        // Add event listeners to various components on the page
        addBinding();

        // Set up the page header
        $(document).trigger('gh.header.init', {
            'includeLoginForm': true,
            'isGlobalAdminUI': true
        });

        // Set up the page footer
        $(document).trigger('gh.footer.init');

        // Determine which page to load based on the login state and
        // page the user's on
        if (gh.data && !gh.data.me.anon) {
            // Show the right content, depending on the page the user's on
            if (currentPage === 'configuration') {
                setUpConfig();
            } else if (currentPage === 'users') {
                setUpUsers();
            } else {
                currentPage = 'tenants';
                setUpTenants();
            }
            renderNavigation();
        }
    };

    initialise();
});

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

define(['gh.core', 'gh.constants', 'chosen', 'validator'], function(gh, constants) {

    // Get the current page, strip out slashes etc
    var currentPage = window.location.pathname.split('/')[1];


    ///////////////
    // RENDERING //
    ///////////////

    /**
     * Render admin user functionality and show the container
     *
     * @param  {Object[]}    administrators    The administrator users to render
     * @private
     */
    var renderAdmins = function(administrators) {
        gh.utils.renderTemplate($('#gh-administrators-template'), {
            'gh': gh,
            'administrators': administrators
        }, $('#gh-administrators-container'));
        $('#gh-administrators-container').show();
    };

    /**
     * Render configuration functionality and show the container
     *
     * @private
     */
    var renderConfig = function(tenants) {
        gh.utils.renderTemplate($('#gh-configuration-template'), {
            'gh': gh,
            'tenants': tenants
        }, $('#gh-configuration-container'));
        $('#gh-configuration-container').show();
    };

    /**
     * Render the header
     *
     * @private
     */
    var renderHeader = function() {
        gh.utils.renderTemplate($('#gh-header-template'), {
            'data': {
                'gh': gh,
                'isGlobalAdminUI': true
            }
        }, $('#gh-header'));

        // Bind the validator to the login form
        $('.gh-signin-form').validator({
            'disable': false
        }).on('submit', doLogin);
    };

    /**
     * Render the admin navigation
     *
     * @private
     */
    var renderNavigation = function() {
        gh.utils.renderTemplate($('#gh-navigation-template'), {
            'gh': gh,
            'currentPage': currentPage
        }, $('#gh-navigation-container'));
    };

    /**
     * Render tenant admin functionality and show the container
     *
     * @param  {Object[]}    tenants    The tenants and apps to render
     * @private
     */
    var renderTenants = function(tenants) {
        gh.utils.renderTemplate($('#gh-tenants-template'), {
            'gh': gh,
            'tenants': tenants
        }, $('#gh-tenants-container'));
        $('#gh-tenants-container').show();
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

    /**
     * Log in using the local authentication strategy
     *
     * @param  {Event}    ev    The jQuery event
     * @private
     */
    var doLogin = function(ev) {
        // Log in to the system if the form is valid
        if (!ev.isDefaultPrevented()) {
            // Collect and submit the form data
            var formValues = _.object(_.map($(this).serializeArray(), _.values));
            gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
                if (err) {
                    return gh.utils.notification('Could not sign you in', 'Please check that you are entering a correct username & password', 'error');
                }
                window.location.reload();
            });
        }

        // Avoid default form submit behaviour
        return false;
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
        getTenantData(function(tenants) {
            renderTenants(tenants);
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
                gh.utils.notification('Could not fetch system tenants', constants.messaging.default.error, 'error');
            }

            var todo = tenants.length;
            var done = 0;

            var getApps = function(tenantId, _callback) {
                gh.api.appAPI.getApps(tenantId, function(err, apps) {
                    if (err) {
                        gh.utils.notification('Could not fetch system apps', constants.messaging.default.error, 'error');
                    }

                    // Sort the apps by host
                    apps.sort(gh.utils.sortByHost);
                    // Cache the apps on the tenants object
                    tenants[done].apps = apps;

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

    /**
     * Create a new app within a tenant
     *
     * @return {Boolean}    Return false to avoid default form submit behaviour
     * @private
     */
    var createApp = function() {
        // Get the ID of the tenant to create the app in
        var tenantId = parseInt($(this).data('tenantid'), 10);

        // Get the apps name and host
        var displayName = $('.gh-app-displayname', $(this)).val();
        var host = $('.gh-app-host', $(this)).val();

        // Create a new app
        gh.api.appAPI.createApp(displayName, host, tenantId, 'timetable', function(err, data) {
            if (err) {
                return gh.utils.notification('Could not create system app', constants.messaging.default.error, 'error');
            }
            setUpTenants();
            gh.utils.notification('System app ' + displayName + ' successfully created', null, 'success');
        });

        // Avoid default form submit behaviour
        return false;
    };

    /**
     * Create a new tenant with the provided display name
     *
     * @return {Boolean}    Return false to avoid default form submit behaviour
     * @private
     */
    var createTenant = function() {
        // Get the new tenant's name
        var displayName = $('#gh-tenant-name').val();

        // Create the tenant
        gh.api.tenantAPI.createTenant(displayName, function(err, data) {
            if (err) {
                return gh.utils.notification('Could not create system tenant', constants.messaging.default.error, 'error');
            }
            setUpTenants();
            gh.utils.notification('System tenant ' + displayName + ' successfully created', null, 'success');
        });

        // Avoid default form submit behaviour
        return false;
    };

    /**
     * Update an existing application
     *
     * @return {Boolean}    Return false to avoid default form submit behaviour
     * @private
     */
    var updateApp = function() {
        // Get the ID of the app that's being updated
        var appId = parseInt($(this).data('appid'), 10);

        // Get the updated values
        var displayName = $('.gh-app-displayname', $(this)).val();
        var enabled = $('.gh-app-enabled', $(this)).is(':checked');
        var host = $('.gh-app-host', $(this)).val();

        // Update the app
        gh.api.appAPI.updateApp(appId, displayName, enabled, host, function(err, data) {
            if (err) {
                return gh.utils.notification('Could not update the system app', constants.messaging.default.error, 'error');
            }
            setUpTenants();
            gh.utils.notification('System app ' + displayName + ' successfully updated', null, 'success');
        });

        // Avoid default form submit behaviour
        return false;
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
        getAdminUserData(function(administrators) {
            renderAdmins(administrators);
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
                gh.utils.notification('Could not fetch admins', constants.messaging.default.error, 'error');
            }

            callback(administrators.rows);
        });
    };

    /**
     * Create a new global administrator
     *
     * @return {Boolean}    Return false to avoid default form submit behaviour
     * @private
     */
    var createAdmin = function() {
        // Get the administrator name, username and password
        var displayName = $('#gh-admin-displayname', $(this)).val();
        var username = $('#gh-admin-username', $(this)).val();
        var password = $('#gh-admin-password', $(this)).val();

        // Create the administrator
        gh.api.adminAPI.createAdmin(username, displayName, password, function(err) {
            if (err) {
                return gh.utils.notification('Could not create administrator: ' + displayName, constants.messaging.default.error, 'error');
            }
            setUpUsers();
            gh.utils.notification('Administrator ' + displayName + ' successfully created', null, 'success');
        });

        // Avoid default form submit behaviour
        return false;
    };

    /**
     * Update a global administrator
     *
     * @return {Boolean}    Return false to avoid default form submit behaviour
     * @private
     */
    var updateAdmin = function() {
        // Get the administrator's userId and display name
        var userId = parseInt($(this).data('userid'), 10);
        var displayName = $('#gh-admin-displayname', $(this)).val();

        // Update the administrator
        gh.api.adminAPI.updateAdmin(userId, displayName, function(err) {
            if (err) {
                return gh.utils.notification('Administrator ' + displayName + ' could not be updated', constants.messaging.default.error, 'error');
            }
            setUpUsers();
            gh.utils.notification('Administrator ' + displayName + ' successfully updated', null, 'success');
        });

        // Avoid default form submit behaviour
        return false;
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
                renderConfig(tenants);
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

    /**
     * Submit the configuration form and save the values
     *
     * @return {Boolean}    Avoid default form submit behaviour
     * @private
     */
    var submitConfigurationForm = function() {
        var $form = $(this);

        // Serialise the form values into an object that can be sent to the server
        var configValues = _.object(_.map($form.serializeArray(), _.values));

        // Standards say that unchecked checkboxes shouldn't be sent over to the server. Too bad, we need to add them
        // in explicitely as config values might have changed.
        _.each($('[type="checkbox"]:not(:checked)', $form), function(chk) {
            configValues[$(chk).attr('name')] = $(chk).is(':checked');
        });

        // Update the configuration
        gh.api.configAPI.updateConfig($form.data('appid'), configValues, function(err) {
            if (err) {
                return gh.utils.notification('System configuration not updated', constants.messaging.default.error, 'error');
            }
            return gh.utils.notification('System configuration updated', null, 'success');
        });

        // Avoid default form submit behaviour
        return false;
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
        // Submit configuration values
        $('body').on('submit', '.gh-configuration-form', submitConfigurationForm);

        // Create global administrator
        $('body').on('submit', '#gh-administrators-create-form', createAdmin);
        // Update global administrator
        $('body').on('submit', '.gh-administrators-update-form', updateAdmin);

        // Tenant creation
        $('body').on('submit', '#gh-tenants-create-tenant-form', createTenant);
        // Tenant updates
        $('body').on('submit', '.gh-tenants-app-update-form', updateApp);
        // App creation
        $('body').on('submit', '.gh-tenants-app-create-form', createApp);

        // Update the value attribute of a checkbox when it changes
        $('body').on('change', 'input[type="checkbox"]', updateCheckboxValue);
    };

    /**
     * Initialise the page
     *
     * @private
     */
    var initIndex = function() {
        addBinding();
        renderHeader();
        // Determine which page to load based on the login state and
        // page the user's on
        if (gh.data && !gh.data.me.anon) {
            // Show the right content, depending on the page the user's on
            if (currentPage === 'configuration') {
                setUpConfig();
            } else if (currentPage === 'tenants') {
                setUpTenants();
            } else if (currentPage === 'users') {
                setUpUsers();
            } else {
                currentPage = 'tenants';
                setUpTenants();
            }
            renderNavigation();
        }
    };

    initIndex();
});

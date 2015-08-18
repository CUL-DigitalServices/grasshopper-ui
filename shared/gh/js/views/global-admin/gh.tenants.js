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

define(['gh.core', 'gh.constants'], function(gh, constants) {


    ///////////////
    // RENDERING //
    ///////////////

    /**
     * Render tenant admin functionality and show the container
     *
     * @param  {Object[]}    tenants    The tenants and apps to render
     * @private
     */
    var renderTenants = function(tenants) {
        // Render the tenants template
        gh.utils.renderTemplate('global-admin-tenants', {
            'gh': gh,
            'tenants': tenants
        }, $('#gh-main'));
    };


    ///////////////
    // UTILITIES //
    ///////////////

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

            $(document).trigger('gh.global-admin.setUpTenants');

            gh.utils.notification('System tenant ' + displayName + ' successfully created', null, 'success');
        });

        // Avoid default form submit behaviour
        return false;
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

            $(document).trigger('gh.global-admin.setUpTenants');

            gh.utils.notification('System app ' + displayName + ' successfully created', null, 'success');
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

            $(document).trigger('gh.global-admin.setUpTenants');

            gh.utils.notification('System app ' + displayName + ' successfully updated', null, 'success');
        });

        // Avoid default form submit behaviour
        return false;
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various components
     *
     * @private
     */
    var addBinding = function() {

        // Tenant creation
        $('body').on('submit', '#gh-tenants-create-tenant-form', createTenant);
        // Tenant updates
        $('body').on('submit', '.gh-tenants-app-update-form', updateApp);
        // App creation
        $('body').on('submit', '.gh-tenants-app-create-form', createApp);

        // Rendering
        $(document).on('gh.global-admin.renderTenants', function(evt, msg) {
            renderTenants(msg.tenants);
        });
    };

    addBinding();
});

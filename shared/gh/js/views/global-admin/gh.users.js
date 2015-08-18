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
     * Render admin user functionality and show the container
     *
     * @param  {Object[]}    administrators    The administrator users to render
     * @private
     */
    var renderAdmins = function(administrators) {
        // Render the administrators template
        gh.utils.renderTemplate('global-admin-administrators', {
            'gh': gh,
            'administrators': administrators
        }, $('#gh-global-users-container'));
        // Show the administrators container
        $('#gh-administrators-container').show();
    };

    /**
     * Render app user functionality and show the container
     *
     * @param  {Object[]}    tenants    The app tenants to render
     * @private
     */
    var renderUserApps = function(tenants) {
        // Render the app users template
        gh.utils.renderTemplate('global-admin-users', {
            'gh': gh,
            'tenants': tenants
        }, $('#gh-app-users-container'));
        // Show the administrators container
        $('#gh-administrators-container').show();
    };

    /**
     * Render users for an app inside of the app container
     *
     * @param  {Number}    appId    The ID of the app to render users for
     * @param  {User[]}    users    The users for the app to render
     * @private
     */
    var renderAppUsersResults = function(appId, users) {
        // Retrieve the cached apps
        $(document).trigger('gh.global-admin.getCachedApps', function(cachedApps) {
            // Render the app users template
            gh.utils.renderTemplate('global-admin-app-user', {
                'app': _.find(cachedApps, function(app) {return app.id === appId;}),
                'gh': gh,
                'users': users.results
            }, $('#gh-app-users-container [data-appid="' + appId + '"] .gh-users-container'));
        });
    };


    ///////////////
    // UTILITIES //
    ///////////////

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

            $(document).trigger('gh.global-admin.setUpUsers');

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

            $(document).trigger('gh.global-admin.setUpUsers');

            gh.utils.notification('Administrator ' + displayName + ' successfully updated', null, 'success');
        });

        // Avoid default form submit behaviour
        return false;
    };

    /**
     * Delete a global administrator
     *
     * @return {Boolean}    Return false to avoid default form submit behaviour
     * @private
     */
    var deleteAdmin = function() {
        // Get the administrator's userId
        var userId = parseInt($(this).data('userid'), 10);

        // Delete the administrator
        gh.api.adminAPI.deleteAdmin(userId, function(err) {
            if (err) {
                return gh.utils.notification('Administrator could not be deleted', constants.messaging.default.error, 'error');
            }

            $(document).trigger('gh.global-admin.setUpUsers');

            gh.utils.notification('Administrator successfully deleted', null, 'success');
        });

        // Avoid default form submit behaviour
        return false;
    };

    /**
     * Create an application user
     *
     * @return {Boolean}    Return false to avoid default form submit behaviour
     * @private
     */
    var createUser = function() {
        // Cache the form object
        var $form = $(this);
        // Get the ID of the app to create the user in
        var appId = parseInt($form.data('appid'), 10);
        // Get the user details
        var displayName = $('.gh-new-user-displayname', $form).val();
        var email = $('.gh-new-user-email', $form).val();
        var password = $('.gh-new-user-password', $form).val();
        var emailPreference = 'no';
        var isAdmin = $('.gh-new-user-isadmin', $form).is(':checked');

        // Create the administrator
        gh.api.userAPI.createUser(appId, displayName, email, password, emailPreference, isAdmin, null, null, function(err) {
            if (err) {
                return gh.utils.notification('Could not create user: ' + displayName, constants.messaging.default.error, 'error');
            }
            // Update the user list
            $('#gh-administrators-container .collapse').trigger('show.bs.collapse');
            // Reset the form
            $form[0].reset();
            // Show a success message
            gh.utils.notification('User ' + displayName + ' successfully created', null, 'success');
        });

        // Avoid default form submit behaviour
        return false;
    };

    /**
     * Update an application user
     *
     * @return {Boolean}    Return false to avoid default form submit behaviour
     * @private
     */
    var updateUser = function() {
        // Cache the form object
        var $form = $(this);
        // Get the administrator's userId and display name
        var userId = parseInt($form.data('userid'), 10);
        var displayName = $('.gh-user-displayname', $form).val();
        var email = $('.gh-user-email', $form).val();
        var emailPreference = 'no';
        var password = $('.gh-user-password', $form).val();
        var isAdmin = $('.gh-user-isadmin', $form).is(':checked');

        // Update the user
        gh.api.userAPI.updateUser(userId, displayName, email, emailPreference, function(updateErr) {
            if (updateErr) {
                return gh.utils.notification('Administrator ' + displayName + ' could not be updated', constants.messaging.default.error, 'error');
            }

            // Promote/demote the user
            gh.api.userAPI.updateAdminStatus(userId, isAdmin, function(adminStatusErr) {
                if (adminStatusErr) {
                    return gh.utils.notification('Administrator ' + displayName + ' could not be updated', constants.messaging.default.error, 'error');
                }
                // Update the user list
                $('#gh-administrators-container .collapse').trigger('show.bs.collapse');
                // Show a success message
                gh.utils.notification('Administrator ' + displayName + ' successfully updated', null, 'success');
            });
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

        // Create global administrator
        $('body').on('submit', '#gh-administrators-create-form', createAdmin);
        // Update global administrator
        $('body').on('submit', '.gh-administrators-update-form', updateAdmin);
        // Delete global administrator
        $('body').on('click', '.gh-administrators-delete', deleteAdmin);

        // Update user
        $('body').on('submit', '.gh-app-user-update-form', updateUser);
        // Create user
        $('body').on('submit', '.gh-app-user-create-form', createUser);

        // Rendering
        $(document).on('gh.global-admin.renderUsers', function(evt, msg) {
            gh.utils.renderTemplate('global-admin-users', {
                'data': {
                    'administrators': msg.administrators,
                    'tenants': msg.tenants
                },
                'gh': gh
            }, $('#gh-main'));
        });
        $(document).on('gh.global-admin.renderAppUsersResults', function(evt, msg) {
            renderAppUsersResults(msg.appId, msg.users);
        });
    };

    addBinding();
});

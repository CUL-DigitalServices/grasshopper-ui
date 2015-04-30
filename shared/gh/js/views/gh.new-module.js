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

define(['gh.core', 'gh.constants', 'gh.api.orgunit'], function(gh, constants, orgUnitAPI) {

    // Keep track of when the user started
    var timeFromStart = null;

    /**
     * Create the module using the provided title
     *
     * @private
     */
    var createModule = function() {
        // Calculate how long it takes the user to create the module
        timeFromStart = (new Date() - timeFromStart) / 1000;
        // Get the AppId
        var appId = require('gh.core').data.me.AppId;
        // Get the display name of the new module
        var displayName = $(this).find('#gh-module-title').val();
        // Get the ID of the part that this new module belongs to
        var partId = $(this).find('button[type="submit"]').data('partid');
        // Get the ID of the group that this new module belongs to
        var groupId = $(this).find('button[type="submit"]').data('groupid');

        orgUnitAPI.createOrgUnit(appId, displayName, 'module', partId, groupId, null, null, null,function(err, module) {
            // Show a success or failure notification
            if (err) {
                return gh.utils.notification('Could not create ' + displayName, constants.messaging.default.error, 'error');
            }
            gh.utils.notification(displayName + ' created successfully', null, 'success');

            // Track the user creating the module
            gh.utils.trackEvent(['Manage', 'Add module', 'Completed'], {
                'time_from_start': timeFromStart
            });

            // Hide the module modal
            $('#gh-new-module-modal').modal('hide');

            // Retrieve the organisational unit information for the modules
            orgUnitAPI.getOrgUnits(appId, true, null, partId, ['module'], function(err, modules) {
                if (err) {
                    gh.utils.notification('Could not fetch modules', constants.messaging.default.error, 'error');
                }

                // Refresh the modules list
                $(document).trigger('gh.listview.refresh', {
                    'partId': partId,
                    'modules': modules
                });
            });
        });

        return false;
    };

    /**
     * Render and show the 'new module' modal dialog
     *
     * @private
     */
    var showNewModuleModal = function() {
        // Render the modal
        gh.utils.renderTemplate('new-module-modal', {
            'data': {
                'partId': $(this).data('partid'),
                'groupId': $(this).data('groupid')
            }
        }, $('#gh-new-module-modal-container'), function() {

            // Show the modal
            $('#gh-new-module-modal').modal();
        });
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the new module modal
     *
     * @private
     */
    var addBinding = function() {
        $('body').on('click', '.gh-new-module', showNewModuleModal);
        $('body').on('submit', '#gh-new-module-form', createModule);
        $('body').on('shown.bs.modal', '#gh-new-module-modal', function() {
            // Track the user starting creation of a module
            gh.utils.trackEvent(['Manage', 'Add module', 'Started']);
            // Track how long the user takes to create the module
            timeFromStart = new Date();
            // Focus the input field after the modal is shown
            $('#gh-module-title').focus();
        });
        $('body').on('click', '#gh-new-module-modal [data-dismiss="modal"]', function() {
            // Track the user cancelling creation of a module
            gh.utils.trackEvent(['Manage', 'Add module', 'Cancelled']);
        });
    };

    addBinding();
});

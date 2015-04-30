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

    // Cache the ID of the module that's being renamed
    var moduleId = null;
    // Cache the old display name of the module that's being renamed
    var oldDisplayName = null;

    /**
     * Rename the module using the provided title
     *
     * @private
     */
    var renameModule = function() {
        // Calculate how long it takes the user to rename the module
        timeFromStart = (new Date() - timeFromStart) / 1000;
        // Get the display name of the renamed module
        var displayName = $(this).find('#gh-module-title').val();

        orgUnitAPI.updateOrgUnit(moduleId, null, displayName, null, null, null, null, null,function(err, module) {
            // Show a success or failure notification
            if (err) {
                return gh.utils.notification('Could not rename ' + oldDisplayName, constants.messaging.default.error, 'error');
            }
            gh.utils.notification(oldDisplayName + ' renamed successfully to ' + displayName, null, 'success');

            // Track the user renaming the module
            gh.utils.trackEvent(['Manage', 'Rename module', 'Completed'], {
                'time_from_start': timeFromStart
            });

            // Hide the module modal
            $('#gh-rename-module-modal').modal('hide');

            // Update the modules list display name
            $('.list-group-item[data-id="' + moduleId + '"] .gh-toggle-list .gh-list-description-text').text(displayName);
            $('.list-group-item[data-id="' + moduleId + '"] .gh-toggle-list + ul .gh-rename-module').data('displayname', displayName);
        });

        return false;
    };

    /**
     * Render and show the 'rename module' modal dialog
     *
     * @private
     */
    var showRenameModuleModal = function() {
        // Cache the display name and module ID
        oldDisplayName = $(this).data('displayname');
        moduleId = parseInt($(this).attr('data-id'), 10);

        // Render the modal
        gh.utils.renderTemplate('rename-module-modal', {
            'data': {
                'displayName': oldDisplayName,
                'moduleId': moduleId
            }
        }, $('#gh-rename-module-modal-container'), function() {

            // Show the modal
            $('#gh-rename-module-modal').modal();
        });
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the rename module modal
     *
     * @private
     */
    var addBinding = function() {
        $('body').on('click', '.gh-rename-module', showRenameModuleModal);
        $('body').on('submit', '#gh-rename-module-form', renameModule);
        $('body').on('shown.bs.modal', '#gh-rename-module-modal', function() {
            // Track the user starting renaming of a module
            gh.utils.trackEvent(['Manage', 'Rename module', 'Started']);
            // Track how long the user takes to rename the module
            timeFromStart = new Date();
        });
        $('body').on('click', '#gh-rename-module-modal [data-dismiss="modal"]', function() {
            // Track the user cancelling renaming of a module
            gh.utils.trackEvent(['Manage', 'Rename module', 'Cancelled']);
        });
    };

    addBinding();
});

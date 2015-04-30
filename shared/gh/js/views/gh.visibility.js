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

    // Keep track of when the user started
    var timeFromStart = null;


    /////////////
    //  MODAL  //
    /////////////

    /**
     * Highlight the selected visibility types and toggle the warning message and submit button
     *
     * @private
     */
    var selectVisibilityType = function() {
        $('.gh-visibility-label').removeClass('checked');
        $(this).parents('label').addClass('checked');
        // Toggle the warning message
        $('#gh-visibility-publish-warning').toggleClass('open');
        // Toggle the submit button
        $('#gh-visibility-save').attr('disabled', !$('#gh-visibility-published').is(':checked'));
    };

    /**
     * Dismiss the 'visibility' modal dialog
     *
     * @private
     */
    var dismissVisibilityModal = function() {
        $('#gh-visibility-modal').modal('hide');
    };

    /**
     * Render and show the 'visibility' modal dialog
     *
     * @private
     */
    var showVisibilityModal = function() {
        // Track how long the user takes to publish the part
        timeFromStart = new Date();
        // Cache the trigger
        var $trigger = $(this);
        // Retrieve the organisational unit ID
        var orgUnitId = parseInt(History.getState().data.part, 10);

        // Retrieve the published status
        gh.api.orgunitAPI.getOrgUnit(orgUnitId, false, function(err, data) {
            if (err) {
                return gh.utils.notification('Request error.', constants.messaging.default.error, 'error');
            }

            // Render the modal
            gh.utils.renderTemplate('visibility-modal', {'data': {
                'published': data.published
            }}, $('#gh-visibility-modal-container'), function() {

                // Track the user starting to publish
                gh.utils.trackEvent(['Manage', 'Publishing', 'Started']);

                // Show the modal
                $('#gh-visibility-modal').modal();
            });
        });
    };

    /**
     * Update the visibility status
     *
     * @private
     */
    var updateVisibilityStatus = function() {
        // Calculate how long it takes the user to create the series
        timeFromStart = (new Date() - timeFromStart) / 1000;
        // Retrieve the organisational unit ID
        var orgUnitId = parseInt(History.getState().data.part, 10);
        // Retrieve the published status
        var published = $('#gh-visibility-modal').find('.gh-visibility-label.checked').data('published');

        // Update the published status for the organisational unit
        gh.api.orgunitAPI.updateOrgUnit(orgUnitId, null, null, null, null, null, null, published, function(err, orgUnit) {
            if (err) {
                return gh.utils.notification('Could not publish the ' + orgUnit.displayName + ' timetable', constants.messaging.default.error, 'error');
            }

            // Only show a notification when the draft has been published
            if (published) {
                gh.utils.notification('The ' + orgUnit.displayName + ' timetable has been successfully published.', 'All events are now available in the student interface. All event data can still be edited, but be mindful not to delete items which might be in students\' personal calendars');

                // Track the user publishing a part
                gh.utils.trackEvent(['Manage', 'Publishing', 'Completed'], {
                    'time_from_start': timeFromStart,
                    'date_stamp': (new Date()).getTime()
                });
            }

            // Render the visibility button
            renderVisibilityButton(orgUnit.id, orgUnit.published);

            // Trigger a refresh
            $(document).trigger('gh.triposdata.refresh');

            // Hide the modal
            return dismissVisibilityModal();
        });
    };


    //////////////
    //  BUTTON  //
    //////////////

    /**
     * Initialise the visibility button
     *
     * @param  {Event}     ev           Standard jQuery event
     * @param  {Object}    data         Data object containing the organisational unit
     * @param  {Number}    data.part    The ID of the organisational unit
     * @private
     */
    var setUpVisibilityButton = function(ev, data) {
        if (data && data.part) {

            // Retrieve the published status
            gh.api.orgunitAPI.getOrgUnit(data.part, false, function(err, orgUnit) {
                if (err) {
                    return gh.utils.notification('Request error.', constants.messaging.default.error, 'error');
                }

                // Render the visibility button
                renderVisibilityButton(orgUnit.id, orgUnit.published);
            });
        } else {
            $('#gh-subheader-visibility').empty();
        }
    };

    /**
     * Render the visibility button
     *
     * @param  {Number}     id           The id of the organisational unit
     * @param  {Boolean}    published    Whether or not the unit has been published
     * @private
     */
    var renderVisibilityButton = function(id, published) {

        // Render the visibility button
        gh.utils.renderTemplate('visibility-button', {'data': {
            'id': id,
            'published': published
        }}, $('#gh-subheader-visibility'));
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add bindings to various elements in the visibility component
     *
     * @private
     */
    var addBinding = function() {
        // Initialise the visibility button
        $(document).on('gh.part.changed', setUpVisibilityButton);
        // Change the visibility mode
        $('body').on('change', '#gh-visibility-form input[type="radio"]', selectVisibilityType);
        // Change the visibility selection to published
        $('body').on('click', '#gh-visibility-form #gh-visibility-divider', function() {
            $('#gh-visibility-published').click();
        });
        // Update the visibility status
        $('body').on('click', '#gh-visibility-save', updateVisibilityStatus);
        // Toggle the modal
        $('body').on('click', '.gh-visibility', showVisibilityModal);
        $('body').on('click', '#gh-visibility-modal [data-dismiss="modal"]', function() {
            // Track the user cancelling publishing a part
            gh.utils.trackEvent(['Manage', 'Publishing', 'Cancelled']);
        });
    };

    addBinding();
});

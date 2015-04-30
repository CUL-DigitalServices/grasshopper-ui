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

    // Cache the tripos data
    var triposData = null;
    // Keep track of when the user started
    var timeFromStart = null;

    /**
     * Set up the modules of events in the list.
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected part to fetch modules for
     * @private
     */
    var setUpModules = function(ev, data) {
        var partId = parseInt(data.selected, 10);

        // Track the user choosing a part
        gh.utils.trackEvent(['Manage', 'Borrow series', 'Chosen part']);

        // Retrieve the organisational unit information for the modules
        orgUnitAPI.getOrgUnits(gh.data.me.appId, true, null, partId, ['module'], function(err, modules) {
            if (err) {
                gh.utils.notification('Could not fetch modules', constants.messaging.default.error, 'error');
            }

            $(document).trigger('gh.part.selected', {
                'partId': partId,
                'modules': modules,
                'container': $('#gh-borrow-series-modal'),
                'template': $('#gh-borrow-series-modules-template')
            });
        });
    };

    /**
     * Set up the part picker in the modal
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected tripos to fetch parts for
     * @private
     */
    var setUpPartPicker = function(ev, data) {
        var triposId = parseInt(data.selected, 10);

        // Track the user choosing a tripos
        gh.utils.trackEvent(['Manage', 'Borrow series', 'Chosen tripos']);

        // Get the parts associated to the selected tripos
        var parts = _.filter(triposData.parts, function(part) {
            return parseInt(data.selected, 10) === part.ParentId;
        });

        // Render the results in the part picker
        gh.utils.renderTemplate($('#gh-borrow-series-part-template'), {
            'data': {
                'parts': parts,
                'excludePart': History.getState().data.part
            }
        }, $('#gh-borrow-series-part'));

        // Show the subheader part picker
        $('#gh-borrow-series-part').show();

        // Destroy the field if it's been initialised previously
        $('#gh-borrow-series-part').chosen('destroy').off('change', setUpModules);

        // Initialise the Chosen plugin on the part picker
        $('#gh-borrow-series-part').chosen({
            'no_results_text': 'No matches for',
            'disable_search_threshold': 10
        }).on('change', setUpModules);

        // Chosen has a bug where search sometimes isn't disabled properly
        $('#gh_borrow_series_part_chosen .chosen-search').hide();
    };

    /**
     * Render and show the 'borrow series' modal dialog
     *
     * @private
     */
    var showBorrowSeriesModal = function() {
        // Get the ID of the module to borrow series to
        var moduleId = $(this).closest('.list-group-item').data('id');
        // Get the part ID of the module
        var partId = $(this).closest('#gh-modules-list-container').data('partid');

        // Fetch the triposes
        gh.utils.getTriposStructure(null, function(err, _triposData) {
            // Cache the triposdata for use in the other picker
            triposData = _triposData;

            // Slim down the dataset before passing it into the template
            var triposPickerData = {
                'courses': triposData.courses
            };

            // Add the optional subject to the course
            _.each(triposPickerData.courses, function(course) {
                course.subjects = _.filter(triposData.subjects, function(subject) {
                    return course.id === subject.ParentId;
                });
            });

            // Render the modal and pickers
            gh.utils.renderTemplate('borrow-series-modal', {
                'data': {
                    'triposPickerData': triposPickerData,
                    'moduleId': moduleId,
                    'partId': partId
                }
            }, $('#gh-modal'), function() {

                // Show the modal
                $('#gh-borrow-series-modal').modal();
            });
        });
    };

    /**
     * Add a series to the list of series that will be borrowed by applying the `gh-borrow-series-borrowed`
     * class to its container
     *
     * @private
     */
    var addSeriesToBorrow = function() {
        $(this).closest('.list-group-item ').addClass('gh-borrow-series-borrowed');
        // Track the user adding a series to borrow
        gh.utils.trackEvent(['Manage', 'Borrow series', 'Series added']);
    };

    /**
     * Remove a series from the list of series that will be borrowed by removing the
     * `gh-borrow-series-borrowed` class from its container
     *
     * @private
     */
    var removeSeriesToBorrow = function() {
        $(this).closest('.list-group-item ').removeClass('gh-borrow-series-borrowed');
        // Track the user removing a series to borrow
        gh.utils.trackEvent(['Manage', 'Borrow series', 'Series removed']);
    };

    /**
     * Collect all series marked as 'to borrow' and borrow them into a module
     *
     * @private
     */
    var borrowSeries = function()  {
        // Calculate how long it takes the user to borrow the series
        timeFromStart = (new Date() - timeFromStart) / 1000;

        // Get the ID of the module to borrow series to
        var moduleId = $(this).data('moduleid');

        // Get the parent ID of the module
        var partId = $(this).data('partid');

        // Get all series marked as 'to borrow'
        var seriesToBorrow = $('.gh-borrow-series-borrowed', $('#gh-borrow-series-modal'));

        // Get all series' IDs
        var seriesIDs = _.map(seriesToBorrow, function(series) { return $(series).data('id'); });

        // Borrow the event series in the module
        orgUnitAPI.addOrgUnitSeries(moduleId, seriesIDs, function(err, data) {
            // Show a success or failure notification
            if (err) {
                return gh.utils.notification('Could not borrow series', constants.messaging.default.error, 'error');
            }
            gh.utils.notification('Successfully borrowed series', null, 'success');

            // Track the user completing borrowing of a series
            gh.utils.trackEvent(['Manage', 'Borrow series', 'Completed'], {
                'time_from_start': timeFromStart,
                'number_of_borrowed_series': seriesIDs.length
            });

            // Hide the module modal
            $('#gh-borrow-series-modal').modal('hide');

            // Retrieve the organisational unit information for the modules
            orgUnitAPI.getOrgUnits(gh.data.me.AppId, true, null, partId, ['module'], function(err, modules) {
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
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the borrow series modal
     *
     * @private
     */
    var addBinding = function() {
        $('body').on('click', '.gh-borrow-series', showBorrowSeriesModal);
        $('body').on('shown.bs.modal', '#gh-borrow-series-modal', function () {
            // Show the subheader tripos picker
            $('#gh-borrow-series-tripos').show();

            // Destroy the field if it's been initialised previously
            $('#gh-borrow-series-tripos').chosen('destroy').off('change', setUpModules);

            // Initialise the Chosen plugin on the tripos picker
            $('#gh-borrow-series-tripos').chosen({
                'no_results_text': 'No matches for'
            }).change(setUpPartPicker);

            // Track the user starting borrowing of a series
            gh.utils.trackEvent(['Manage', 'Borrow series', 'Started']);
            // Track how long the user takes to borrow the series
            timeFromStart = new Date();
        });
        $('body').on('click', '#gh-borrow-series-modal [data-dismiss="modal"]', function() {
            // Track the user cancelling borrowing of a module
            gh.utils.trackEvent(['Manage', 'Borrow series', 'Cancelled']);
        });
        // Mark a series as 'to borrow'
        $('body').on('click', '.gh-borrow-series-select', addSeriesToBorrow);
        // Unmark a series as 'to borrow'
        $('body').on('click', '.gh-borrow-series-deselect', removeSeriesToBorrow);
        // Mark or unmark a series as 'to borrow' depending on the status
        $('body').on('click', '.gh-list-description', function() {
            $(this).next().find('button:visible').click();
        });
        // Borrow all series marked as 'to borrow' into a module
        $('body').on('click', '#gh-borrow-series-submit', borrowSeries);
    };

    addBinding();
});

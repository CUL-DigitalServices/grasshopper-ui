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

define(['gh.core', 'gh.constants', 'gh.api.orgunit', 'gh.visibility', 'chosen'], function(gh, constants, orgunitAPI) {

    var triposData = null;

    // Keep track of the previously selected part
    var prevPartId = null;
    // Keep track of the modules to avoid having to fetch them over and over again
    var cachedModules = null;
    // Keep track of when the user started
    var timeFromStart = null;

    /**
     * Return to the home page
     *
     * @private
     */
    var goHome = function() {
        gh.utils.removeFromState(['tripos', 'part', 'module', 'series']);
        // Send a tracking event when the user clicks the home button
        gh.utils.trackEvent(['Navigation', 'Home', 'Shortcut clicked']);
    };

    /**
     * Set up the modules of events in the sidebar
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected part to fetch modules for
     * @private
     */
    var setUpModules = function(ev, data) {
        var partId = parseInt(data.selected, 10);

        // Push the selected part in the URL
        gh.utils.addToState({'part': partId});

        if (timeFromStart) {
            // Calculate how long it takes the user to make a part selection
            timeFromStart = (new Date() - timeFromStart) / 1000;

            // Track that the user selected a part
            gh.utils.trackEvent(['Navigation', 'Part selector', 'Selected'], {
                'part': parseInt(data.selected, 10),
                'tripos': History.getState().data.tripos,
                'time_from_start': timeFromStart
            });

            timeFromStart = null;
        }

        // Retrieve the organisational unit information for the modules, only if the previous part is not the same as
        // the current one OR if the modules list hasn't been rendered
        if ((prevPartId !== partId) || !$('#gh-modules-container #gh-modules-list-container ul').length) {
            orgunitAPI.getOrgUnits(gh.data.me.AppId, true, null, partId, ['module'], function(err, modules) {
                if (err) {
                    gh.utils.notification('Could not fetch modules', constants.messaging.default.error, 'error');
                }

                // Cache the modules for later use
                cachedModules = modules;

                // Trigger an event when a part has been selected, persisting the part ID and the modules
                $(document).trigger('gh.part.selected', {
                    'partId': partId,
                    'modules': cachedModules,
                    'container': $('#gh-left-container'),
                    'template': 'admin-modules'
                });
            });
        } else {
            // Let the admin modules list know that the list was updated
            $(document).trigger('gh.part.selected.admin');
        }

        // Update the previously used partId for next time
        prevPartId = partId;
    };

    /**
     * Set up the part picker in the subheader
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected tripos to fetch parts for
     * @private
     */
    var setUpPartPicker = function(ev, data) {
        var triposId = parseInt(data.selected, 10);

        // Push the selected tripos in the URL
        gh.utils.addToState({'tripos': triposId});

        // Track that the user selected a tripos
        gh.utils.trackEvent(['Navigation', 'Tripos selector', 'Selected'], {
            'tripos': triposId
        });

        // Get the parts associated to the selected tripos
        var parts = _.filter(triposData.parts, function(part) {
            // Only add the parts that are published for the normal users
            if (part.published || (!part.published && gh.data.me && gh.data.me.isAdmin)) {
                return parseInt(data.selected, 10) === part.ParentId;
            }
        });

        // Render the results in the part picker
        gh.utils.renderTemplate('subheader-part', {
            'data': {
                'gh': gh,
                'parts': parts
            }
        }, $('#gh-subheader-part'), function() {
            // Show the subheader part picker
            $('#gh-subheader-part').show();

            // Destroy the field if it's been initialised previously
            $('#gh-subheader-part').chosen('destroy').off('change', setUpModules);

            // Initialise the Chosen plugin on the part picker
            $('#gh-subheader-part').chosen({
                'disable_search': true
            }).on('change', setUpModules);

            // Chosen has a bug where search sometimes isn't disabled properly
            $('#gh_subheader_part_chosen .chosen-search').hide();
        });
    };

    /**
     * Set up the Tripos picker in the subheader
     *
     * @private
     */
    var setUpTriposPicker = function() {
        var triposPickerData = {
            'courses': triposData.courses
        };

        _.each(triposPickerData.courses, function(course) {
            course.subjects = _.filter(triposData.subjects, function(subject) {
                return course.id === subject.ParentId;
            });
        });

        // Massage the data so that courses are linked to their child subjects
        // Render the results in the tripos picker
        gh.utils.renderTemplate('subheader-picker', {
            'data': {
                'triposPickerData': triposPickerData
            }
        }, $('#gh-subheader-tripos'), function() {

            // Show the subheader tripos picker
            $('#gh-subheader-tripos').show();

            // Destroy the field if it's been initialised previously
            $('#gh-subheader-tripos').chosen('destroy').off('change', setUpPartPicker);

            // Initialise the Chosen plugin on the tripos picker
            $('#gh-subheader-tripos').chosen({
                'no_results_text': 'No matches for'
            }).change(setUpPartPicker);

            // Set the default placeholder text
            $('#gh_subheader_tripos_chosen .chosen-search input').attr('placeholder', 'Search triposes');
        });
    };

    /**
     * Handle the statechange event by applying state values to the pickers. Can also be
     * used separate from the statechange event to apply state values to the pickers
     *
     * @private
     */
    var handleStateChange = function() {

        // Close all modal dialogs
        $('.modal').modal('hide');

        // Make sure that all state data is set before handling the statechange event
        gh.utils.setStateData();

        // Get the current history state
        var state = History.getState().data;

        // If the URL shows a preselected tripos, select that tripos automatically
        if (state.tripos) {
            $('#gh-subheader-tripos').val(state.tripos);
            $('#gh-subheader-tripos').trigger('change', {'selected': state.tripos});
            $('#gh-subheader-tripos').trigger('chosen:updated');
        } else {
            // If there is no selected tripos, the tripos, part, module and series should be removed from the hash
            gh.utils.removeFromState(['part', 'module', 'series']);
            // There is no state for the tripos, make sure it's reset
            setUpTriposPicker();
            // Show the contextual help
            if (!$('body').hasClass('gh-admin')) {
                $('#gh-content-description p').show();
            }
            // Resetting the tripos means destroying the part picker and hiding it
            if ($('#gh_subheader_part_chosen').length) {
                // Destroy the field if it's been initialised previously
                $('#gh-subheader-part').chosen('destroy').off('change', setUpModules);
                // Show the subheader part picker
                $('#gh-subheader-part').hide();
            }
        }

        // If the URL shows a preselected part, select that part automatically
        if (state.part && $('#gh-subheader-part [value="' + state.part + '"]').length) {
            $('#gh-subheader-part').val(state.part);
            $('#gh-subheader-part').trigger('change', {'selected': state.part});
            $('#gh-subheader-part').trigger('chosen:updated');
            // Hide the contextual help
            if (!$('body').hasClass('gh-admin')) {
                $('#gh-content-description p').hide();
            }

            // Only select the part if it is available in the part picker, if it's not
            // it indicates that either the tripos has changed since the last iteration
            // or the part is no longer available. Either way, the part, module and series
            // should be removed from the url in that case
            if (!$('#gh-subheader-part option[value="' + state.part + '"]').length) {
                // If there is no part to select, part, module and series should be removed from the hash
                gh.utils.removeFromState(['part', 'module', 'series']);
            }

            // Dispatch an event to update the visibility button
            $(document).trigger('gh.part.changed', {'part': state.part});
        } else {
            // If there is no preselected part, the part, module and series should be removed from the hash
            gh.utils.removeFromState(['part', 'module', 'series']);
            $('#gh-result-summary').remove();
            // Show the informational message to the user, if there is one
            gh.utils.renderTemplate('admin-tripos-help', null, $('#gh-modules-list-container'), function() {
                // Show the contextual help
                if (!$('body').hasClass('gh-admin')) {
                    $('#gh-content-description p').show();
                }

                // Dispatch an event to update the visibility button
                $(document).trigger('gh.part.changed');
            });
        }

        // ADMIN ONLY LOGIC
        if ($('body').hasClass('gh-admin')) {
            // If the URL shows a module and series, go into batch edit mode
            if (state.module && state.series) {
                // Set up batch edit, this will redirect the user to the correct batch edit view as well
                $(document).trigger('gh.batchedit.setup');
            // If the URL shows a tripos and a part, but no module and series, we select the first module and series in the list
            } else if (state.tripos && state.part) {
                $(document).trigger('gh.listview.preselect');
            // If there is no preselected series, the module and series should be removed from the hash
            } else {
                gh.utils.removeFromState(['module', 'series']);
                // Show the editable parts in the UI
                $(document).trigger('gh.admin.changeView', {'name': constants.views.EDITABLE_PARTS});
            }
        }
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add bindings to various elements in the subheader component
     *
     * @private
     */
    var addBinding = function() {

        // Handle hash changes
        $(window).on('statechange', handleStateChange);
        // Initialise the subheader component
        $(document).on('gh.subheader.init', function(ev, data) {
            triposData = data.triposData;
            // Set up the tripos picker
            setUpTriposPicker();
            // Run the statechange logic to put the right selections in place
            handleStateChange();
        });

        // Tripos tracking events
        $('body').on('chosen:showing_dropdown', '#gh-subheader-tripos', function() {
            gh.utils.trackEvent(['Navigation', 'Tripos selector', 'Opened']);
        });
        $('body').on('chosen:hiding_dropdown', '#gh-subheader-tripos', function() {
            gh.utils.trackEvent(['Navigation', 'Tripos selector', 'Closed']);
        });
        $('body').on('change', '#gh_subheader_tripos_chosen .chosen-search input', function() {
            gh.utils.trackEvent(['Navigation', 'Tripos selector', 'Search'], {
                'query': $(this).val()
            });
        });
        // Part tracking events
        $('body').on('chosen:showing_dropdown', '#gh-subheader-part', function() {
            gh.utils.trackEvent(['Navigation', 'Part selector', 'Opened']);
            timeFromStart = new Date();
        });
        $('body').on('chosen:hiding_dropdown', '#gh-subheader-part', function() {
            gh.utils.trackEvent(['Navigation', 'Part selector', 'Closed']);
        });

        $('body').on('click', '.gh-home', goHome);
    };

    addBinding();
});

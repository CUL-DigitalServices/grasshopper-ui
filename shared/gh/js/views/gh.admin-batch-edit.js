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

define(['gh.core', 'gh.constants', 'moment', 'gh.calendar', 'gh.admin-event-type-select', 'gh.admin-series-title', 'gh.datepicker', 'gh.admin-batch-edit-date', 'gh.admin-batch-edit-organiser', 'gh.admin-edit-organiser', 'gh.delete-series'], function(gh, constants, moment) {

    // Object used to cache the triposData
    var triposData = null;

    // Keep track of when the user started
    var timeFromStart = null;


    ///////////////
    // UTILITIES //
    ///////////////

    /**
     * Sort given objects based on the data-start attribute.
     * The list will be ordered from A to Z.
     *
     * @see Array#sort
     * @private
     */
    var sortByDate = function(a, b) {
        if (new Date($(a).find('.gh-event-date').attr('data-start')) < new Date($(b).find('.gh-event-date').attr('data-start'))) {
            return -1;
        } else if (new Date($(a).find('.gh-event-date').attr('data-start')) > new Date($(b).find('.gh-event-date').attr('data-start'))) {
            return 1;
        }
        return 0;
    };

    /**
     * Sort table rows from A to Z based on the start date of the event
     *
     * @param  {Object}    $tableBody    jQuery selector containing the table's tbody element
     * @private
     */
    var sortEventTable = function($tableBody) {
        // Make sure the table is in an initialised jQuery object
        $tableBody = $($tableBody);
        // Array used to cache the table rows before sorting
        var sortedTable = [];
        // Sort the table
        sortedTable = $tableBody.find('tr:not(.gh-batch-edit-events-container-empty)').sort(sortByDate);
        // Remove all data from the unsorted table in the DOM
        $tableBody.find('tr:not(.gh-batch-edit-events-container-empty)').remove();
        // Repopulate the table with the sorted data in the DOM
        $tableBody.append(sortedTable);
        // Reinitialise jEditable fields
        setUpJEditable();
    };

    /**
     * Hide the empty term description container. The container will only be hidden if there are events left in the term
     *
     * @param {String}    term    The term for which to hide the empty term description container
     * @private
     */
    var hideEmptyTermDescription = function(term) {
        // If events are found in the term, hide the empty description container
        if ($('.gh-batch-edit-events-container[data-term="' + term + '"] tbody tr:visible').length) {
            $('.gh-batch-edit-events-container[data-term="' + term + '"] .gh-batch-edit-events-container-empty').hide();
        }
    };

    /**
     * Show the empty term description container. The container will only be shown if no events are left in the term
     *
     * @param {String}    term    The term for which to show the empty term description container
     * @private
     */
    var showEmptyTermDescription = function(term) {
        // If no events are found in the term, show the empty term description container
        if (!$('.gh-batch-edit-events-container[data-term="' + term + '"] tbody tr:visible').length) {
            $('.gh-batch-edit-events-container[data-term="' + term + '"] .gh-batch-edit-events-container-empty').show();
        }
    };

    /**
     * Fade the colourisation of a row over 2 seconds and remove the `gh-fade` class
     * after the animation completes
     *
     * @param  {Object|String}    $row    jQuery object or selector of the row to fade
     * @private
     */
    var fadeRowColour = function($row) {
        // Make sure we're dealing with a jQuery object
        $row = $($row);
        // Set a timeout of 2 seconds before fading out the row colour
        setTimeout(function() {
            $row.addClass('gh-fade');
            // Set a timeout of 2 seconds before removing the `gh-fade` animation class
            setTimeout(function() {
                $row.removeClass('danger active success gh-fade');
            }, 2000);
        }, 2000);
    };

    /**
     * Enable editing of the series title
     *
     * @private
     */
    var renameSeries = function() {
        $('.gh-jeditable-series-title').click();
        // Track the user renaming the series via the menu
        gh.utils.trackEvent(['Manage', 'Rename series via menu']);
    };

    /**
     * Add a new event row to the table and initialise the editable fields in it
     *
     * @param {Event}     ev      Standard jQuery event
     * @param {Object}    data    Data object containing the event object to create and its container
     * @private
     */
    var addNewEventRow = function(ev, data) {
        var $eventContainer = data && data.eventContainer ? $(data.eventContainer) : $(this).closest('thead').next('tbody');
        var termName = $eventContainer.closest('.gh-batch-edit-events-container').data('term');
        var termStart = gh.utils.getFirstDayOfTerm(termName);
        var eventObj = {
            'data': {
                'ev': null
            }
        };

        // Hide the empty term description
        hideEmptyTermDescription(termName);

        // If an event was already added to the term, clone that event to the new event
        var $lastEventInTerm = $('tr:visible:last-child', $eventContainer);
        // Generate default values based on what was previously added
        var defaultLocation = $($('.gh-event-location:not(:empty)')[0]).text();
        var $hiddenOrganiserFields = $($('.gh-event-organisers:not(:empty)')[0]).prev();
        var defaultOrganisers = gh.utils.getOrganiserObjects($hiddenOrganiserFields);
        if ($lastEventInTerm.length) {
            eventObj.data.ev = data && data.eventObj ? data.eventObj : {
                'displayName': $('.gh-jeditable-series-title').text(),
                'end': moment($($lastEventInTerm.find('.gh-event-date')).attr('data-end')).add(7, 'days').toISOString(),
                'location': defaultLocation,
                'organisers': defaultOrganisers,
                'start': moment($($lastEventInTerm.find('.gh-event-date')).attr('data-start')).add(7, 'days').toISOString(),
                'type': gh.config.events.default
            };
        // If no events were previously added to the term, create a default event object
        } else {
            eventObj.data.ev = data && data.eventObj ? data.eventObj : {
                'displayName': $('.gh-jeditable-series-title').text(),
                'end': moment(moment([termStart.getFullYear(), termStart.getMonth(), termStart.getDate(), 14, 0, 0, 0])).toISOString(),
                'location': defaultLocation,
                'organisers': defaultOrganisers,
                'start': moment(moment([termStart.getFullYear(), termStart.getMonth(), termStart.getDate(), 13, 0, 0, 0])).toISOString(),
                'type': gh.config.events.default
            };
        }

        // Add common properties to the event object
        eventObj.data.ev['isNew'] = true; // Used in the template to know this one needs special handling
        eventObj.data.ev['selected'] = true; // Select and highlight added events straight away
        eventObj.data.ev['tempId'] = gh.utils.generateRandomString(); // The actual ID hasn't been generated yet
        eventObj.data['utils'] = gh.utils;

        // Create a new row
        gh.utils.renderTemplate('admin-batch-edit-event-row', eventObj, null, function($row) {
            // Append a new event row
            $eventContainer.append();
            // Enable JEditable on the row
            setUpJEditable();
            // Show the save button
            toggleSubmit();
            // Enable batch editing of dates
            toggleBatchEditEnabled();
            // Trigger a change event on the newly added row to update the batch edit
            $eventContainer.find('.gh-select-single').trigger('change');
            // Sort the table
            sortEventTable($eventContainer);
        });
    };

    /**
     * Add as many new rows as it takes to fill up a term
     *
     * @param {Event}    ev    Standard jQuery event
     * @private
     */
    var addNewEventRows = function(ev) {
        var termLabel = $(this).closest('.gh-batch-edit-events-container').attr('data-term');
        // Get the term from the configuration
        var term = _.find(gh.config.terms[gh.config.academicYear], function(term) {
            return term.label.toLowerCase() === termLabel.toLowerCase();
        });
        // Get the number of weeks in the term
        var weeksInTerm = gh.utils.getWeeksInTerm(term);
        // Add a new event row for every week in the term
        for (weeksInTerm; weeksInTerm !== 0; weeksInTerm--) {
            // Add new event rows
            addNewEventRow(ev, {
                'eventContainer': $(this).closest('.gh-batch-edit-events-container').find('tbody'),
            });
        }
        // Track the user adding events for an empty term
        gh.utils.trackEvent(['Data', 'Added events for empty term']);
    };

    /**
     * Delete an event from the series
     *
     * @private
     */
    var deleteEvent = function() {
        // Only soft delete the event when it hasn't been created in the first place. If the
        // row has no 'eventid' data attribute it shouldn't be deleted from the db
        var $row = $(this).closest('tr');
        var $otEventContainer = $($(this).closest('.gh-batch-edit-events-container.gh-ot'));
        var termLabel = $row.closest('.gh-batch-edit-events-container').attr('data-term');
        if ($row.data('eventid')) {
            $row.addClass('gh-event-deleted').fadeOut(200, function() {
                // If the event was the last OT event, hide its container
                if ($otEventContainer.length && !$otEventContainer.find('tbody tr:visible').length) {
                    $otEventContainer.hide();
                }
                // Show the empty term description
                showEmptyTermDescription(termLabel);
                // Update the footer
                toggleSubmit();
            });
        } else {
            $row.addClass('gh-event-deleted').fadeOut(200, function() {
                $row.remove();
                // If the event was the last OT event, remove its container
                if ($otEventContainer.length && !$otEventContainer.find('tbody tr:visible').length) {
                    $otEventContainer.remove();
                }
                // Show the empty term description
                showEmptyTermDescription(termLabel);
                // Update the footer
                toggleSubmit();
            });
        }
        // Track the user deleting an event
        gh.utils.trackEvent(['Data', 'Event deleted']);
        // Let other components know that an event was deleted
        $(document).trigger('gh.event.deleted');
    };

    /**
     * Check all events in all terms
     *
     * @private
     */
    var checkAllEvents = function() {
        // Tick all boxes
        $('.gh-select-all').prop('checked', 'checked');
        // Fire the change event to let the handlers do their magic
        $('.gh-select-all').change();
        // Track the user selecting an event term
        gh.utils.trackEvent(['Data', 'All events selected from menu']);
    };

    /**
     * Check/uncheck all events in a term
     *
     * @private
     */
    var toggleAllEventsInTerm = function() {
        // Determine if the boxes should all be checked
        var checkAll = $(this).is(':checked');
        // Get the boxes to check
        var $checkboxes = $($(this).closest('thead').next('tbody').find('input[type="checkbox"]'));
        // (un)check the boxes
        if (checkAll) {
            $checkboxes.prop('checked', 'checked');
        } else {
            $checkboxes.removeAttr('checked');
        }
        // Trigger the change event on all checkboxes
        $checkboxes.change();
        // Enable batch editing of dates
        toggleBatchEditEnabled();
    };

    /**
     * Checks/unchecks a single event
     *
     * @private
     */
    var toggleEvent = function() {
        if ($(this).is(':checked')) {
            $(this).closest('tr').addClass('info');
        } else {
            $(this).closest('tr').removeClass('info');
        }
        toggleBatchEditEnabled();
    };

    /**
     * Shows/hides the batch edit footer based on whether or not updates happened
     *
     * @private
     */
    var toggleSubmit = function() {
        // Get the number of events that were updated
        var eventsUpdated = $('.gh-batch-edit-events-container tbody tr.active:not(.gh-event-deleted):not(.gh-new-event-row)').length;
        // Get the number of events that were created
        var eventsCreated = $('.gh-batch-edit-events-container tbody tr.gh-new-event-row:not(.gh-event-deleted)').length;
        // Get the number of events that were deleted
        var eventsDeleted = $('.gh-batch-edit-events-container tbody tr.gh-event-deleted').length;

        // Only toggle and update the footer if events where updated, created or deleted
        if (eventsUpdated || eventsCreated || eventsDeleted) {
            // Update the count
            gh.utils.renderTemplate($('#gh-batch-edit-actions-template'), {
                'data': {
                    'updated': eventsUpdated,
                    'created': eventsCreated,
                    'deleted': eventsDeleted
                }
            }, $('.gh-batch-edit-actions-container'));
            // Show the save button if events have changed but not submitted
            $('.gh-batch-edit-actions-container').fadeIn(200);
        } else {
            // Hide the save button if all events have been submitted
            $('.gh-batch-edit-actions-container').fadeOut(200);
        }
    };

    /**
     * Enable or disable batch editing of dates depending on whether or not there are
     * event rows that have been selected
     *
     * @private
     */
    var toggleBatchEditEnabled = function() {
        if ($('.gh-batch-edit-events-container:not(.gh-ot) tbody .gh-select-single:checked').length ||
            $('.gh-batch-edit-events-container:not(.gh-ot) thead .gh-select-all:checked').length) {
            $('input, button, select', $('#gh-batch-edit-header')).removeAttr('disabled');
            $('.as-selections', $('#gh-batch-edit-header')).removeClass('gh-disabled');
            $('#gh-batch-edit-header').removeClass('gh-disabled');
        } else {
            if ($('#gh-batch-edit-header').hasClass('gh-batch-edit-time-open')) {
                gh.utils.trackEvent(['Data', 'Batch edit', 'TimeDate', 'Closed']);
            }
            $('#gh-batch-edit-header').removeClass('gh-batch-edit-time-open');
            $('input, button, select', $('#gh-batch-edit-header')).attr('disabled', 'disabled');
            $('.as-selections', $('#gh-batch-edit-header')).addClass('gh-disabled');
            $('#gh-batch-edit-header').addClass('gh-disabled');
        }
    };

    /**
     * Reset all batch header fields
     *
     * @private
     */
    var resetBatchHeader = function() {
        // Reset the title
        $('#gh-batch-edit-title').val('');
        // Reset the location
        $('#gh-batch-edit-location').val('');
        // Reset the type
        $('#gh-batch-edit-type').val(gh.config.events.default);
        // Reset the organisers
        $(document).trigger('gh.batchorganiser.reset');
    };

    /**
     * Toggles each and every action in the UI to be disabled or enabled based on
     * the parameter passed in to the function
     *
     * @param  {Boolean}    [disable]    Whether or not to disable all elements. Defaults to `false`
     * @private
     */
    var disableEnableAll = function(disable) {
        disable = disable || false;

        // Disable input elements and fire off an event for Chosen to be able to adjust itself
        $('button, input, select, textarea').attr('disabled', disable).trigger('chosen:updated.chosen');

        if (disable) {
            // Disable jEditable fields
            $('.gh-jeditable-series-title, .gh-jeditable-events, .gh-edit-event-organisers, .gh-event-type').editable('disable');

            // Disable the date picker. This one is not a jEditable field so needs special handling
            $('.gh-event-date').addClass('gh-disabled');
        } else {
            // Enable jEditable fields
            $('.gh-jeditable-series-title, .gh-jeditable-events, .gh-edit-event-organisers, .gh-event-type').editable('enable');

            // Enable the date picker. This one is not a jEditable field so needs special handling
            $('.gh-event-date').removeClass('gh-disabled');
        }
    };

    /**
     * Hide the batch date editing functionality when the escape key has been pressed
     *
     * @param  {Event}    ev    Standard jQuery event
     * @private
     */
    var hideBatchEditDateOnEscape = function(ev) {
        if (parseInt(ev.keyCode, 10) === 27) {
            toggleBatchEditDate();
        }
    };

    /**
     * Show/hide the date batch editing functionality
     *
     * @private
     */
    var toggleBatchEditDate = function() {
        $('#gh-batch-edit-header').toggleClass('gh-batch-edit-time-open');
        if ($('#gh-batch-edit-header').hasClass('gh-batch-edit-time-open')) {
            $(document).on('keyup', hideBatchEditDateOnEscape);
            gh.utils.trackEvent(['Data', 'Batch edit', 'TimeDate', 'Started']);
        } else {
            $(document).off('keyup', hideBatchEditDateOnEscape);
            gh.utils.trackEvent(['Data', 'Batch edit', 'TimeDate', 'Closed']);
        }
    };

    /**
     * Handles keypress events when focus is set to individual edit fields
     *     - Initialises jEditable field when hitting space or enter
     *
     * @param  {Event}    ev    Standard jQuery keypress event
     * @private
     */
    var handleEditableKeyPress = function(ev) {
        var key = parseInt(ev.which, 10);
        if (key === 32 || key === 13) {
            $(this).click();
        }
    };

    /**
     * Calculate the width of the batch edit header header and return the result in pixels
     *
     * @return {String}    Return the width of the batch edit header, in pixels
     * @private
     */
    var calculateBatchHeaderWidth = function() {
        var headerWidth = $('#gh-batch-edit-container').width() + 60;
        var contentWidth = $('#gh-batch-edit-term-container').width() + 60;

        // If the content is wider than the batch edit header, assign its width
        // to the batch edit header
        headerWidth = contentWidth;

        return headerWidth + 'px';
    };

    /**
     * Make the header stick to the top of the page, depending on how far
     * down the page is scrolled
     *
     * @private
     */
    var handleStickyHeader = function() {
        // Set the offset of the header. When the modules navigation is collapsed, the header is fixed to the top
        // and shouldn't be taken into account when calculating when to make the header sticky
        var headerOffset = 0;
        if ($('html').hasClass('gh-collapsed')) {
            headerOffset = $('#gh-header-container').outerHeight();
        }

        // Only attempt to handle scrolling when the batch edit is being used
        if ($('#gh-batch-edit-view').is(':visible')) {
            // Get the top of the window and the top of the header's position
            var windowTop = $(window).scrollTop();
            var headerTop = $('#gh-sticky-header-anchor').offset().top - headerOffset;
            // If the window is scrolled further down than the header was originally
            // positioned, make the header sticky
            if (windowTop >= headerTop) {
                // Set the margin of the batch edit container to the height of the sticky header + original margin-top of the event container
                $('#gh-batch-edit-term-container').css('margin-top', $('#gh-batch-edit-container').outerHeight() + 'px');
                // Set the width of the container
                $('#gh-batch-edit-container').css('width', calculateBatchHeaderWidth());
                // Add the sticky class to the header
                $('#gh-batch-edit-container').addClass('gh-sticky-header');
            } else {
                // Reset the margin of the batch edit container
                $('#gh-batch-edit-term-container').css('margin-top', 0);
                // Reset the width of the container
                $('#gh-batch-edit-container').css('width', 'auto');
                // Remove the sticky class from the header
                $('#gh-batch-edit-container').removeClass('gh-sticky-header');
            }
        }
    };


    //////////////
    // CALENDAR //
    //////////////

    /**
     * Fetch the tripos data that the calendar needs
     *
     * @param  {Function}    callback    Standard callback function
     * @private
     */
    var setUpPreviewCalendar = function(callback) {
        // Fetch the triposes
        if (!triposData) {
            gh.utils.getTriposStructure(null, function(err, data) {
                if (err) {
                    return gh.utils.notification('Could not fetch triposes', constants.messaging.default.error, 'error');
                }

                // Cache the triposData for future use
                triposData = data;

                // Render the calendar
                renderPreviewCalendar();
            });
        } else {
            // Render the calendar
            renderPreviewCalendar();
        }
    };

    /**
     * Render and initialise the calendar
     *
     * @private
     */
    var renderPreviewCalendar = function() {
        // Render the calendar template
        gh.utils.renderTemplate('calendar', {
            'data': {
                'gh': gh,
                'view': 'admin'
            }
        }, $('#gh-calendar-view-container'), function() {

            // Initialise the calendar
            $(document).trigger('gh.calendar.init', {
                'triposData': triposData,
                'orgUnitId': History.getState().data.module
            });

            // Put the calendar on today's view
            $(document).trigger('gh.calendar.navigateToToday');
        });
    };


    /////////////
    // LOCKING //
    /////////////

    // The interval at which to lock the group
    var lockInterval = null;
    // The ID of the group that's currently being locked
    var lockedGroupId = null;

    /**
     * Lock the group
     *
     * @private
     */
    var lockGroup = function() {
        // Get the GroupId
        lockedGroupId = $('#gh-modules-container button[data-groupid]').data('groupid');
        // Only lock the group if the ID is defined
        if (lockedGroupId) {
            // Lock the group
            gh.api.groupsAPI.lock(lockedGroupId);
            // Lock the currently edited group every 60 seconds
            lockInterval = setInterval(function() {
                // Only attempt to lock when the batch edit mode is active
                if ($('#gh-batch-edit-view').is(':visible')) {
                    gh.api.groupsAPI.lock(lockedGroupId);
                // If batch edit is not active we can unlock the group
                } else {
                    unlockGroup();
                }
            }, 60000);
        }
    };

    /**
     * Unlock the group
     *
     * @private
     */
    var unlockGroup = function() {
        // Only unlock the group if it was previously locked
        if (lockedGroupId) {
            // Unlock the group
            gh.api.groupsAPI.unlock(lockedGroupId);
            // Clear the interval
            clearInterval(lockInterval);
        }
    };


    ////////////////
    // BATCH EDIT //
    ////////////////

    /**
     * Verify that a valid series title was entered and saves the value
     *
     * @param  {String}   value     The new value for the item
     * @return {String}             The value to show in the editable field after editing completed
     * @private
     */
    var editableSeriesTitleSubmitted = function(value, editableField) {

        // Remove the editing class from the jeditable input field
        $('.gh-jeditable-series-title.editing').removeClass('editing');

        // Get the value
        value = $.trim(value);
        // If no value has been entered, we fall back to the previous value
        if (!value) {
            return this.revert;
        } else if (this.revert !== value) {
            var seriesId = parseInt(History.getState().data['series'], 10);
            gh.api.seriesAPI.updateSeries(seriesId, value, null, null, function(err, data) {
                if (err) {
                    // Show a failure notification
                    return gh.utils.notification('Could not update the title for this series', constants.messaging.default.error, 'error');
                }

                // Track the user renaming the series inline
                gh.utils.trackEvent(['Manage', 'Rename series inline']);

                // Update the series in the sidebar
                $('#gh-modules-list .list-group-item[data-id="' + seriesId + '"] .gh-list-description p').text(value);

                // Show a success notification
                return gh.utils.notification('Series title successfully updated', null, 'success');
            });
        }
        return value;
    };

    /**
     * Verify that a valid value was entered and persist the value in the field
     *
     * @param  {String}   value     The new value for the item
     * @return {String}             The value to show in the editable field after editing completed
     * @private
     */
    var editableEventSubmitted = function(value, editableField) {
        // Get the value
        value = $.trim(value);
        // Get the event ID. If no eventId is found on the tr that means we're dealing with a newly added event
        var eventId = $(this).closest('tr').data('eventid');
        // If no value has been entered, we fall back to the previous value
        if (!value) {
            return this.revert;
        // A value has been entered and the event already existed
        } else if (this.revert !== value && eventId) {
            $('.gh-batch-edit-events-container tbody tr[data-eventid="' + eventId + '"]').removeClass('danger active success').addClass('active');
            // Show the save button
            toggleSubmit();
        // A value has been entered and this is a newly added event
        } else if (this.revert !== value && !eventId) {
            $(this).closest('tr').removeClass('danger active success').addClass('active gh-new-event-row');
            // Show the save button
            toggleSubmit();
        }

        // Track the user updating the event location or title
        if ($(this).hasClass('gh-event-location')) {
            gh.utils.trackEvent(['Data', 'Location edit', 'Completed']);
        } else if ($(this).hasClass('gh-event-description')) {
            gh.utils.trackEvent(['Data', 'Title edited', 'Completed']);
        }

        // Return the selected value
        return value;
    };

    /**
     * Verify that a valid value for event type was entered and persist the value in the field
     *
     * @param  {String}   value     The new value for the item
     * @return {String}             The value to show in the editable field after editing completed
     * @private
     */
    var editableEventTypeSubmitted = function(value, editableField) {
        // Get the value
        value = $.trim(value);
        // Get the event ID. If no eventId is found on the tr that means we're dealing with a newly added event
        var eventId = $(this).closest('tr').data('eventid');
        // If no value has been entered, we fall back to the previous value
        if (!value) {
            return this.revert;
        // A value has been entered and the event already existed
        } else if (this.revert !== value && eventId) {
            $('.gh-batch-edit-events-container tbody tr[data-eventid="' + eventId + '"]').removeClass('danger active success').addClass('active');
            // Show the save button
            toggleSubmit();
        // A value has been entered and this is a newly added event
        } else if (this.revert !== value && !eventId) {
            $(this).closest('tr').removeClass('danger active success').addClass('active gh-new-event-row');
            // Show the save button
            toggleSubmit();
        }
        // Remove the editing class from the table cell
        $(this).removeClass('gh-editing');

        // Track the user updating the event type
        gh.utils.trackEvent(['Data', 'Type changed'], {
            'type': value
        });

        // Return the selected value
        return value;
    };

    /**
     * Parse the AutoSuggest input and display a list of organisers
     *
     * @private
     */
    var editableOrganiserSubmitted = function() {
        // Retrieve the values from the AutoSuggest field and create a String to show
        var $hiddenFields = $(this).closest('.gh-edit-event-organisers').prev('.gh-event-organisers-fields').find('input[data-add="true"]');
        var organisers = [];

        // Create the stringified organiser Array
        _.each($hiddenFields, function(hiddenField) {
            organisers.push(hiddenField.value);
        });

        // Mark the row as edited
        $(this).closest('tr').addClass('active');

        // Toggle the submit button
        toggleSubmit();

        // Return the stringified organisers
        return organisers.join(', ');
    };

    /**
     * Set up editable fields in the batch edit tables
     *
     * @private
     */
    var setUpJEditable = function() {

        // Apply jEditable to the series title. (custom plugin)
        $('.gh-jeditable-series-title').editable(editableSeriesTitleSubmitted, {
            'cssclass': 'gh-jeditable-form gh-jeditable-form-with-submit',
            'disable': false,
            'height': '38px',
            'maxlength': 255,
            'onblur': 'submit',
            'placeholder': 'Click to add a title for this series',
            'select': true,
            'type': 'series-title',
            'submit': '<button type="submit" class="btn btn-default">Save</button>',
            'callback': function(value, settings) {
                // Remove the `editing` class when the input field loses its focus
                $('.gh-jeditable-series-title.editing').removeClass('editing');
            }
        });

        // Apply jEditable for inline editing of event rows
        $('.gh-jeditable-events').editable(editableEventSubmitted, {
            'cssclass': 'gh-jeditable-form',
            'height': '38px',
            'onblur': 'submit',
            'placeholder': '',
            'select' : true,
            'callback': function(value, settings) {
                // Focus the edited field td element after submitting the value
                // for improved keyboard accessibility
                if (!$(':focus', $('.gh-batch-edit-events-container')).length) {
                    $(this).focus();
                }
            }
        });

        // Apply jEditable to the event type. (custom plugin)
        $('.gh-jeditable-events-select').editable(editableEventTypeSubmitted, {
            'cssclass': 'gh-jeditable-form',
            'disable': false,
            'placeholder': '',
            'select': true,
            'tooltip': 'Click to edit the event type',
            'type': 'event-type-select',
            'callback': function(value, settings) {
                // Focus the edited field td element after submitting the value
                // for improved keyboard accessibility
                if (!$(':focus', $('.gh-batch-edit-events-container')).length) {
                    $(this).focus();
                }
            }
        });

        // Apply jEditable to the organisers
        $('.gh-edit-event-organisers').editable(editableOrganiserSubmitted, {
            'cssclass': 'gh-jeditable-form',
            'placeholder': '',
            'select': true,
            'tooltip': 'Click to add a lecturer for this event',
            'type': 'organiser-autosuggest',
            'callback': function(value, settings) {
                // Focus the edited field td element after submitting the value
                // for improved keyboard accessibility
                if (!$(':focus', $('.gh-batch-edit-events-container')).length) {
                    $(this).focus();
                }
            }
        });
    };

    /**
     * Update all events that were edited or created
     *
     * @param  {Event[]}     updatedEventObjs    Array of event objects to submit updates for
     * @param  {Function}    callback            Standard callback function
     * @param  {Error}       callback.err        Error object containing the error code and error message
     * @private
     */
    var submitEventUpdates = function(updatedEventObjs, callback) {
        if (!updatedEventObjs.length) {
            return callback(null);
        }

        var done = 0;
        var todo = updatedEventObjs.length;
        var hasError = false;

        /**
         * Update a single event. Calls itself when more events need updating and executes
         * a callback function when everything has been persisted
         *
         * @param  {Object}      updatedEvent    The event that needs to be updated
         * @param  {Function}    callback        Standard callback function
         * @private
         */
        var submitEventUpdate = function(updatedEvent, _callback) {
            gh.api.eventAPI.updateEvent(updatedEvent.id, updatedEvent.displayName, null, null, updatedEvent.start, updatedEvent.end, updatedEvent.location, updatedEvent.notes, updatedEvent.type, function(evErr, data) {
                if (evErr) {
                    hasError = true;
                }

                var $row = $('.gh-batch-edit-events-container tbody tr[data-eventid="' + updatedEvent.id + '"]');

                if (updatedEvent.organisers) {
                    // Update the event organisers
                    gh.api.eventAPI.updateEventOrganisers(updatedEvent.id, updatedEvent.organisers, function(orgErr, data) {
                        if (orgErr) {
                            hasError = true;
                            // Mark the row so it's visually obvious that the update failed
                            $row.addClass('danger');
                        } else {
                            // Mark the row so it's visually obvious that the update was successful
                            $row.removeClass('danger active').addClass('success');
                        }

                        // If we're done, execute the callback, otherwise call the function again with
                        // the next event to update
                        done++;
                        if (done === todo) {
                            _callback();
                        } else {
                            submitEventUpdate(updatedEventObjs[done], _callback);
                        }
                    });
                } else {
                        if (evErr) {
                            hasError = true;
                            // Mark the row so it's visually obvious that the update failed
                            $row.addClass('danger');
                        } else {
                            // Mark the row so it's visually obvious that the update was successful
                            $row.removeClass('danger active').addClass('success');
                        }

                        // If we're done, execute the callback, otherwise call the function again with
                        // the next event to update
                        done++;
                        if (done === todo) {
                            _callback();
                        } else {
                            submitEventUpdate(updatedEventObjs[done], _callback);
                        }
                }

                // Fade the row colours if there were no errors
                if (!hasError) {
                    fadeRowColour($row);
                }
            });
        };

        // Start by submitting the first update
        submitEventUpdate(updatedEventObjs[done], function() {
            callback(hasError);
        });
    };

    /**
     * Create all new events that were added
     *
     * @param  {Event[]}     newEventObjs    Array of new events to create in the series
     * @param  {Function}    callback        Standard callback function
     * @param  {Error}       callback.err    Error object containing the error code and error message
     * @private
     */
    var createNewEvents = function(newEventObjs, callback) {
        if (!newEventObjs.length) {
            return callback(null);
        }

        var done = 0;
        var todo = newEventObjs.length;
        var hasError = false;

        /**
         * Create a single event. Calls itself when more events need to be created and executes
         * a callback function when everything has been persisted
         *
         * @param  {Object}      newEvent    The bew event that needs to be created
         * @param  {Function}    callback    Standard callback function
         * @private
         */
        var createNewEvent = function(newEvent, _callback) {
            // Get the ID of the series this event is added to
            var seriesId = parseInt(History.getState().data['series'], 10);
            gh.api.eventAPI.createEvent(newEvent.displayName, newEvent.start, newEvent.end, null, null, newEvent.location, newEvent.notes, newEvent.organiserOther, newEvent.organiserUsers, seriesId, newEvent.type, function(evErr, data) {
                var $row = $('.gh-batch-edit-events-container tbody tr[data-tempid="' + newEvent.tempId + '"]');
                if (evErr) {
                    hasError = true;
                    // Mark the row so it's visually obvious that the creation failed
                    $row.addClass('danger');
                } else {
                    // Mark the row so it's visually obvious that the creation was successful
                    $row.removeClass('danger active').addClass('success');
                    // Replace the temporary ID with the real one
                    $row.data('tempid', null).removeAttr('data-tempid');
                    $row.data('eventid', data.id).attr('data-eventid', data.id).removeClass('gh-new-event-row');
                }

                // Fade the row colours if there were no errors
                if (!hasError) {
                    fadeRowColour($row);
                }

                // If we're done, execute the callback, otherwise call the function again with
                // the next event to create
                done++;
                if (done === todo) {
                    _callback();
                } else {
                    createNewEvent(newEventObjs[done], _callback);
                }
            });
        };

        // Start by submitting the first new event
        createNewEvent(newEventObjs[done], function() {
            callback(hasError);
        });
    };

    /**
     * Delete events
     *
     * @param  {Event[]}     eventsToDelete    Array of events to delete
     * @param  {Function}    callback          Standard callback function
     * @param  {Error}       callback.err      Error object containing the error code and error message
     * @private
     */
    var deleteEvents = function(eventsToDelete, callback) {
        if (!eventsToDelete.length) {
            return callback(null);
        }

        var done = 0;
        var todo = eventsToDelete.length;
        var hasError = false;

        /**
         * Delete an event
         *
         * @param  {String}      eventID   The ID of the event to delete
         * @param  {Function}    _callback Standard callback function
         * @private
         */
        var deleteEvent = function(eventID, _callback) {
            gh.api.eventAPI.deleteEvent(eventID, function(err) {
                // Remove the row from the DOM
                $('.gh-batch-edit-events-container tbody tr[data-eventid="' + eventID + '"]').remove();

                // If we're done, execute the callback, otherwise call the function again with
                // the next event to delete
                done++;
                if (done === todo) {
                    _callback();
                } else {
                    deleteEvent(eventsToDelete[done], _callback);
                }
            });
        };

        // Start by deleting the first event
        deleteEvent(eventsToDelete[done], function() {
            callback(hasError);
        });
    };

    /**
     * Get the organisers and their status for an event row (added or removed from the event). Returns null
     * when no organisers where found in the container
     *
     * @param  {jQuery}    $container    jQuery selector of the event row to get organisers for
     * @return {Object}                  Object containing all organisers to add or remove from the event. e.g., {'21': true, 'john doe': false} or `null` when no organisers where found in the container
     * @private
     */
    var getOrganiserState = function($container) {
        var organiserFields = $('.gh-event-organisers-fields input', $container);
        var organisers = {};

        _.each(organiserFields, function($organiserField) {
            $organiserField = $($organiserField);
            var userId = $organiserField.attr('data-id');
            var displayName = $organiserField.val();
            var toAdd = $organiserField.attr('data-add') === "true";

            // If the ID is defined, use that as the key. Otherwise,
            // use the display name as the key
            if (userId) {
                organisers[userId] = toAdd;
            } else {
                organisers[displayName] = toAdd;
            }
        });

        return _.isEmpty(organisers) ? null : organisers;
    };

    /**
     * Get the Array of organiser user IDs (or strings if no existing user was selected) selected
     * in the AutoSuggest field
     *
     * @param  {jQuery}               $container     The container to look for the AutoSuggest field in
     * @return {Number[]|String[]}                   The Array of organiser IDs
     * @private
     */
    var getOrganiserList = function($container) {
        var organiserFields = $('.gh-event-organisers-fields input', $container);
        var organisers = {
            organiserOthers: [],
            organiserUsers: []
        };

        _.each(organiserFields, function($organiserField) {
            $organiserField = $($organiserField);
            var userId = $organiserField.attr('data-id');
            var displayName = $organiserField.val();

            // If the userID is present, push it into the user Array. If no ID
            // is available for the user this user does not have an account and we
            // push the displayName in the others Array
            if (userId) {
                organisers.organiserUsers.push(userId);
            } else {
                organisers.organiserOthers.push(displayName);
            }
        });

        return organisers;
    };

    /**
     * Submit all changes made in batch edit mode
     *
     * @private
     */
    var submitBatchEdit = function() {
        // Calculate how long it takes the user to batch edit
        timeFromStart = (new Date() - timeFromStart) / 1000;

        // Remove the `gh-not-eligible` class
        $('.gh-not-eligible').removeClass('gh-not-eligible');

        // Disable all elements in the UI to avoid data changing halfway through the update
        disableEnableAll(true);

        var updatedEventObjs = [];
        var newEventObjs = [];
        var eventsToDelete = [];

        // For each term, go over each event and create an event object to persist
        _.each($('.gh-batch-edit-events-container'), function($termContainer) {
            // Loop over each (non-new) event in the term and create the event object
            _.each($('tbody tr.active:not(.gh-new-event-row)', $termContainer), function($eventContainer) {
                $eventContainer = $($eventContainer);

                // Gather the organisers for the field
                var organisers = getOrganiserState($eventContainer);

                // Create the updated event object
                var updatedEventObj = {
                    'id': $eventContainer.data('eventid'),
                    'displayName': $('.gh-event-description', $eventContainer).text(),
                    'end': $('.gh-event-date', $eventContainer).attr('data-end'),
                    'location': $('.gh-event-location', $eventContainer).text(),
                    'organisers': organisers || null,
                    'start': $('.gh-event-date', $eventContainer).attr('data-start'),
                    'type': $('.gh-event-type', $eventContainer).attr('data-type')
                };
                updatedEventObjs.push(updatedEventObj);
            });

            // Loop over each new event in the term and create the event object
            _.each($('tbody tr.active.gh-new-event-row', $termContainer), function($eventContainer) {
                $eventContainer = $($eventContainer);

                // Gather the organisers for the field
                var organisers = getOrganiserList($eventContainer);

                // Create the new event object
                var newEventObj = {
                    'tempId': $eventContainer.data('tempid'),
                    'displayName': $('.gh-event-description', $eventContainer).text(),
                    'end': $('.gh-event-date', $eventContainer).attr('data-end'),
                    'location': $('.gh-event-location', $eventContainer).text(),
                    'organiserOther': organisers.organiserOthers || null,
                    'organiserUsers': organisers.organiserUsers || null,
                    'start': $('.gh-event-date', $eventContainer).attr('data-start'),
                    'type': $('.gh-event-type', $eventContainer).attr('data-type')
                };
                newEventObjs.push(newEventObj);
            });

            // Loop over each deleted event in the term and create the event object
            _.each($('tbody tr.gh-event-deleted', $termContainer), function($eventContainer) {
                $eventContainer = $($eventContainer);
                // Only push it in the array if it has an event ID
                var eventID = $eventContainer.data('eventid');
                if (eventID) {
                    eventsToDelete.push(eventID);
                }
            });
        });

        // Track how long the user spent in batch edit
        gh.utils.trackEvent(['Data', 'Batch edit', 'Completed'], {
            'number_of_changes': (updatedEventObjs.length + newEventObjs.length + eventsToDelete.length),
            'number_of_selected_events': $('.gh-select-single:checked').length,
            'number_of_selected_terms': $('.gh-select-all:checked').length,
            'time_from_start': timeFromStart,
            'tripos': History.getState().data.tripos
        });
        // Reset the timer to track how long a user batch edits
        timeFromStart = new Date();

        // Deselect the 'check all' checkbox to see progress update
        $('.gh-select-all').prop('checked', false);
        $('.gh-select-all').change();
        // Submit the event updates
        submitEventUpdates(updatedEventObjs, function(updateErr) {
            // Create the new events
            createNewEvents(newEventObjs, function(newErr) {
                // Delete events
                deleteEvents(eventsToDelete, function(deleteErr) {
                    // Re-enable all elements in the UI
                    disableEnableAll(false);
                    // Keep the batch edit header disabled as there is no selection after saving
                    toggleBatchEditEnabled();
                    // Reset the batch edit header
                    resetBatchHeader();

                    if (updateErr || newErr || deleteErr) {
                        // Show an error notification
                        return gh.utils.notification('Could not update all events for ' + $('.gh-jeditable-series-title').text(), constants.messaging.default.error, 'error');
                    }
                    // Hide the save button
                    toggleSubmit();
                    // Show a success notification to the user
                    return gh.utils.notification('All events in ' + $('.gh-jeditable-series-title').text() + ' successfully updated', 'Students will see the updated information in about 8 hours');
                });
            });
        });
    };

    /**
     * Batch edit the event type
     *
     * @private
     */
    var batchEditType = function() {
        // Get the title
        var title = $(this).val();
        // Update all rows that are checked
        $('.gh-batch-edit-events-container tbody tr.info .gh-event-type').text(title).attr('data-type', title).attr('data-first', title.substr(0,1));
        // Add an `active` class to all updated rows to indicate that changes where made
        $('.gh-batch-edit-events-container tbody tr.info').addClass('active');
        // Show the save button
        toggleSubmit();
        // Track the user batch editing the type
        gh.utils.trackEvent(['Data', 'Batch edit', 'Type changed']);
    };

    /**
     * Batch edit the event location
     *
     * @private
     */
    var batchEditLocation = function() {
        // Get the title
        var title = $(this).val();
        // Update all rows that are checked
        $('.gh-batch-edit-events-container tbody tr.info .gh-event-location').text(title);
        // Add an `active` class to all updated rows to indicate that changes where made
        $('.gh-batch-edit-events-container tbody tr.info').addClass('active');
        // Show the save button
        toggleSubmit();
        // Track the user batch editing the location
        gh.utils.trackEvent(['Data', 'Batch edit', 'Location edited']);
    };

    /**
     * Batch edit the event title
     *
     * @private
     */
    var batchEditTitle = function() {
        // Get the title
        var title = $(this).val();
        // Update all rows that are checked
        $('.gh-batch-edit-events-container tbody tr.info .gh-event-description').text(title);
        // Add an `active` class to all updated rows to indicate that changes where made
        $('.gh-batch-edit-events-container tbody tr.info').addClass('active');
        // Show the save button
        toggleSubmit();
        // Track the user batch editing the title
        gh.utils.trackEvent(['Data', 'Batch edit', 'Title edited']);
    };

    /**
     * Batch edit the event date
     *
     * @param  {Event}     ev         Standard jQuery event
     * @param  {Object}    trigger    jQuery object representing the trigger
     * @private
     */
    var batchEditDate = function(ev, trigger) {
        var eventId = $(trigger).closest('tr').data('eventid');
        if (!eventId) {
            // Add an `active` class to the updated row to indicate that changes where made and
            // add a 'gh-new-event-row' class to it to indicate it's a new event
            $(trigger).parent().addClass('active gh-new-event-row');
        } else {
            // Add an `active` class to the updated row to indicate that changes where made
            $(trigger).parent().addClass('active');
        }
        // Sort the table
        sortEventTable($(trigger).closest('tbody'));
        // Show the save button
        toggleSubmit();
    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    /**
     * Load the information on the series and events in the series before initialising
     * the batch edit page
     *
     * @private
     */
    var loadSeriesEvents = function() {
        // Track how long the user takes to batch edit
        timeFromStart = new Date();

        // Track the user starting batch edit
        gh.utils.trackEvent(['Data', 'Batch edit', 'Started']);

        var seriesId = parseInt(History.getState().data['series'], 10);
        var moduleId = parseInt(History.getState().data['module'], 10);

        // Get the information about the series
        if (seriesId) {
            gh.api.seriesAPI.getSeries(seriesId, true, function(err, series) {
                if (err) {
                    return gh.utils.notification('Could not fetch the series data', constants.messaging.default.error, 'error');
                }

                // Object used to aggregate the events between pages
                var events = {
                    'results': []
                };

                /**
                 * Get the events in a series per page of 25. Calls itself when it feels like there might be more
                 *
                 * @param  {Number}      offset      The paging number of the results to retrieve
                 * @param  {Function}    callback    Standard callback function
                 * @param  {Object}      opts        Object containing additional borrowing data
                 * @private
                 */
                var getSeriesEvents = function(offset, callback, opts) {
                    // Get the information about the events in the series
                    gh.api.seriesAPI.getSeriesEvents(seriesId, 25, offset, false, function(err, _events) {
                        if (err) {
                            return gh.utils.notification('Could not fetch the event data', constants.messaging.default.error, 'error');
                        }

                        // Aggregate the results
                        events.results = _.union(events.results, _events.results);

                        // If the length of the Array of _events is 25 there might be other results so
                        // we increase the offset and fetch again
                        if (_events.results.length === 25) {
                            offset = offset + 25;
                            getSeriesEvents(offset, callback, opts);
                        } else {
                            callback(opts);
                        }
                    });
                };

                /**
                 * Invoke a view change when the data retrieval has been completed
                 *
                 * @param  {Object}    opts    Object containing additional borrowing data
                 * @private
                 */
                var onGetSeriesEventsComplete = function(opts) {

                    // Unlock the currently locked group
                    unlockGroup();

                    // Template data object
                    var data = _.extend({
                        'events': events,
                        'series': series
                    }, opts);

                    // Check whether the series is borrowed from another module
                    if (series.borrowedFrom && moduleId !== series.borrowedFrom.id) {
                        data.borrowedFrom = series.borrowedFrom;
                    }

                    // Load up the batch edit page and provide the events and series data
                    $(document).trigger('gh.admin.changeView', {
                        'name': constants.views.BATCH_EDIT,
                        'data': data
                    });

                    // Lock the currently edited group every 60 seconds
                    lockGroup();

                    // Track the user opening a series
                    gh.utils.trackEvent(['Navigation', 'Series opened'], {
                        'seriesID': seriesId,
                        'is_borrowed': 'TBD',
                        'can_be_edited': 'TBD'
                    });

                    // TODO: Remove this and only trigger when button is clicked/expanded
                    $(document).trigger('gh.batchdate.setup');
                    $(document).trigger('gh.batchorganiser.setup');
                };

                // Fetch the part the borrowed series belongs to
                if (series.borrowedFrom) {
                    gh.api.orgunitAPI.getOrgUnit(series.borrowedFrom.ParentId, false, function(err, part) {
                        if (err) {
                            return gh.utils.notification('Part data not retrieved.', 'The part data could not be successfully retrieved.', 'error');
                        }

                        // Fetch the tripos the borrowed series belogs to
                        if (part.ParentId) {
                            gh.api.orgunitAPI.getOrgUnit(part.ParentId, false, function(err, tripos) {
                                if (err) {
                                    return gh.utils.notification('Tripos data not retrieved.', 'The tripos data could not be successfully retrieved.', 'error');
                                }

                                // Get the first page of events
                                getSeriesEvents(0, onGetSeriesEventsComplete, {
                                    'part': part,
                                    'tripos': tripos
                                });
                            });
                        }
                    });

                // Immediately get the first page of events when the series is not borrowed
                } else {
                    getSeriesEvents(0, onGetSeriesEventsComplete);
                }
            });
        }
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the listview
     *
     * @private
     */
    var addBinding = function() {
        // Setup
        $(document).on('gh.batchedit.setup', loadSeriesEvents);
        $(document).on('gh.batchedit.rendered', setUpJEditable);
        $(window).scroll(handleStickyHeader);
        $(window).resize(handleStickyHeader);

        // External edit
        $(document).on('gh.datepicker.change', batchEditDate);
        $('body').on('click', '.gh-event-date:not(.gh-disabled)', function(ev) {
            // @see gh.datepicker.js for parameter instructions
            $(document).trigger('gh.datepicker.show', {
                'ev': ev,
                'trigger': this
            });
        });

        // Settings
        $('body').on('click', '.gh-select-all-terms', checkAllEvents);
        $('body').on('click', '.gh-rename-series', renameSeries);

        // List utilities
        $('body').on('change', '.gh-select-all', function() {
            toggleAllEventsInTerm.apply(this);
            // Track the user selecting an event term
            gh.utils.trackEvent(['Data', 'Term selected'], {
                'is_empty': !$($(this).closest('thead').next('tbody').find('input[type="checkbox"]')).length
            });
        });
        $('body').on('change', '.gh-select-single', toggleEvent);
        // Send an event when the user manually selects a checkbox
        $('body').on('click', '.gh-select-single', function() {
            if ($(this).is(':checked')) {
                // Track the user selecting an individual event
                gh.utils.trackEvent(['Data', 'Event selected']);
            }
        });
        $('body').on('click', '.gh-new-event', function(ev, data) {
            addNewEventRow.apply(this, [ev, data]);
            gh.utils.trackEvent(['Data', 'Added event']);
        });
        $(document).on('gh.batchedit.addevent', function(ev, data) {
            addNewEventRow.apply(this, [ev, data]);
            gh.utils.trackEvent(['Data', 'Added event']);
        });
        $('body').on('click', '.gh-new-events', addNewEventRows);
        $('body').on('click', '.gh-event-delete > button', deleteEvent);

        // Batch edit form submission and cancel
        $('body').on('click', '#gh-batch-edit-submit', submitBatchEdit);
        $('body').on('click', '#gh-batch-edit-cancel', function() {
            // Calculate how long it takes the user to batch edit
            timeFromStart = (new Date() - timeFromStart) / 1000;
            // Track how long the user spent in batch edit
            var updatedEventObjs = $('tbody tr.active:not(.gh-new-event-row)');
            var newEventObjs = $('tbody tr.active.gh-new-event-row');
            var eventsToDelete = $('tbody tr.gh-event-deleted');
            gh.utils.trackEvent(['Data', 'Batch edit', 'Cancelled'], {
                'number_of_changes': (updatedEventObjs.length + newEventObjs.length + eventsToDelete.length),
                'number_of_selected_events': $('.gh-select-single:checked').length,
                'number_of_selected_terms': $('.gh-select-all:checked').length,
                'time_from_start': timeFromStart,
                'tripos': History.getState().data.tripos
            });
            // Reload the event series
            loadSeriesEvents();
        });
        $(document).on('gh.batchedit.togglesubmit', toggleSubmit);

        // Batch edit header functionality
        $('body').on('keyup', '#gh-batch-edit-title', batchEditTitle);
        $('body').on('keyup', '#gh-batch-edit-location', batchEditLocation);
        $('body').on('change', '#gh-batch-edit-type', batchEditType);
        $('body').on('click', '#gh-batch-edit-time', toggleBatchEditDate);
        $('body').on('click', '#gh-batch-edit-header th', function() {
            if ($(this).find('[disabled]').length) {
                gh.utils.trackEvent(['Data', 'Batch edit', 'Clicked on disabled batch edit component']);
            }
        });

        // Keyboard accessibility
        $('body').on('keypress', 'td.gh-jeditable-events', handleEditableKeyPress);
        $('body').on('keypress', 'td.gh-jeditable-events-select', handleEditableKeyPress);
        $('body').on('keypress', 'td.gh-edit-event-organisers', handleEditableKeyPress);

        // Tabs
        $(document).on('shown.bs.tab', '#gh-batch-edit-view .gh-toolbar-primary a[data-toggle="tab"]', function(ev) {
            // Only set up the calendar if that tab is active
            if ($(ev.target).attr('aria-controls') === 'gh-batch-calendar-view') {
                setUpPreviewCalendar();
                // Track the user opening the calendar view
                gh.utils.trackEvent(['Navigation', 'Calendar view selected'], {
                    'partId': History.getState().data.part
                });
            } else {
                // Track the user opening the list view
                gh.utils.trackEvent(['Navigation', 'List view selected'], {
                    'partId': History.getState().data.part
                });
            }
        });
    };

    addBinding();
});

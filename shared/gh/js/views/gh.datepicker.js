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

define(['gh.core', 'moment', 'clickover', 'jquery-datepicker'], function(gh, moment) {

    var $trigger = null;
    var components = null;
    var hasChanges = false;

    var _term = null;

    // Keep track of when the user started
    var timeFromStart = null;


    /////////////////
    //  UTILITIES  //
    /////////////////

    /**
     * Apply the date change
     *
     * @private
     */
    var applyDateChange = function() {

        // Retrieve the entered dates
        var dates = getFullDates();

        // Render the content
        var content = gh.utils.renderTemplate('admin-edit-date-field', {
            'data': {
                'start': dates.start,
                'end': dates.end
            },
            'utils': gh.utils
        }, function() {

            // Update the trigger
            $trigger.attr('data-start', dates.start).attr('data-end', dates.end).html(content);

            // Close the popover window
            dismissPopover();

            // Calculate how long it takes the user to change the date
            timeFromStart = (new Date() - timeFromStart) / 1000;
            // Track the user editing the date
            gh.utils.trackEvent(['Data', 'DateTime edit', 'Completed'], {
                'time_from_start': timeFromStart
            });
        });
    };

    /**
     * Return the entered dates
     *
     * @return {Object}    Object containing the entered dates
     * @private
     */
    var getFormValues = function() {

        // Retrieve the selected date from the calendar
        var date = $('.popover #gh-datepicker').datepicker('getDate');

        // Retrieve the form values
        var week = parseInt($('#gh-edit-dates-form #gh-module-week').val(), 10);
        var day = parseInt($('#gh-edit-dates-form #gh-module-day').val(), 10);
        var startHour = parseInt($('#gh-edit-dates-form #gh-module-from-hour').val(), 10);
        var startMinutes = parseInt($('#gh-edit-dates-form #gh-module-from-minutes').val(), 10);
        var endHour = parseInt($('#gh-edit-dates-form #gh-module-to-hour').val(), 10);
        var endMinutes = parseInt($('#gh-edit-dates-form #gh-module-to-minutes').val(), 10);

        return {
            'date': date,
            'week': week,
            'day': day,
            'startHour': startHour,
            'startMinutes': startMinutes,
            'endHour': endHour,
            'endMinutes': endMinutes
        };
    };

    /**
     * Return the fully constructed date based on the entries
     *
     * @return  {Object}    Object containing the full start- and end dates
     * @private
     */
    var getFullDates = function() {
        // Retrieve the entered values
        var entries = getFormValues();

        // Generate the start and end dates
        var startDate = moment(entries.date).add({'h': entries.startHour, 'm': entries.startMinutes}).toISOString();
        var endDate = moment(entries.date).add({'h': entries.endHour, 'm': entries.endMinutes}).toISOString();

        // Return the full dates
        return {
            'start': startDate,
            'end': endDate
        };
    };

    /**
     * Validate the entered dates
     *
     * @return {Boolean}    Whether the entered time span is valid or not
     * @private
     */
    var isValidRange = function() {
        // Get the form values
        var entries = getFormValues();
        // Compare and return the difference
        return ((entries.startHour + (entries.startMinutes * 0.01)) < (entries.endHour + (entries.endMinutes * 0.01)));
    };

    /**
     * Validate the entered dates
     *
     * @private
     */
    var validateEntry = function() {
        // Check whether the entered ranges are valid
        if (!isValidRange()) {
            hasChanges = false;
            return $('#gh-edit-dates-apply').attr('disabled','disabled');
        }

        // Enable the submit button if the entries are valid
        if ($('#gh-edit-dates-apply').attr('disabled')) {
            hasChanges = true;
            $('#gh-edit-dates-apply').removeAttr('disabled');
        }
    };


    /////////////////
    //  CLICKOVER  //
    /////////////////

    /**
     * Calculate the position of the popover window
     *
     * @param  {Object}    $trigger    A jQuery object representing the trigger
     * @private
     */
    var calculatePopoverPosition = function(ev) {
        var placement = 'bottom';
        if ((ev.view.innerHeight - ev.clientY) < 320) {
            placement = 'top';
        }
        return placement;
    };

    /**
     * Dismiss the popover window
     *
     * @param {Event}    [ev]    Standard jQuery object
     * @private
     */
    var dismissPopover = function(ev) {
        if($trigger && $trigger.attr('aria-describedby')) {
            // If the function was called by an event, check if the target was inside or outside
            // the popover. If inside, the popover cannot be closed unless cancel was clicked
            if (ev) {
                var clickedTrigger = !!$(ev.target).closest('.gh-event-date').length || $(ev.target).hasClass('gh-event-date');
                var clickedPopover = !!$(ev.target).closest('.popover').length || $(ev.target).hasClass('.popover') || !!$(ev.target).closest('.ui-datepicker-header').length;
                var clickedCancel = !!$(ev.target).attr('data-dismiss');

                if ((clickedPopover || clickedTrigger) && !clickedCancel) {
                    return;
                }
            }

            $trigger.trigger('click');
            $trigger.focus();

            // Toggle the submit button in the batch edit
            if (hasChanges) {
                $(document).trigger('gh.datepicker.change', $trigger);
            }
        }
    };

    /**
     * Show the popover window
     *
     * @param  {Event}     ev             The dispatched jQuery event
     * @param  {Object}    msg            The custom message that was sent with the event
     * @param  {Object}    msg.ev         The original invoked jQuery event
     * @param  {Object}    msg.trigger    The trigger that invoked the jQuery event
     * @private
     */
    var showPopover = function(ev, msg) {
        if (!msg) {
            throw new Error('A custom message object should be provided');
        } else if (!msg.ev) {
            throw new Error('The original jQuery event should be provided in the custom message');
        } else if (!msg.trigger) {
            throw new Error('The trigger should be provided in the custom message');
        }

        // Calculate the number of weeks in a term based on the date
        var numWeeks = 0;
        var _term = gh.utils.getTerm(gh.utils.convertISODatetoUnixDate(moment($(msg.trigger).attr('data-start')).utc().format('YYYY-MM-DD')), true);
        if (_term) {
            numWeeks = gh.utils.getWeeksInTerm(_term);
        }

        // Render the popover template
        var content = gh.utils.renderTemplate('admin-edit-dates', {
            'data': {
                'gh': gh,
                'numWeeks': numWeeks,
                'interval': {
                    'hours': 1,
                    'minutes': 15
                }
            }
        }, function() {

        // Cache the trigger
        $trigger = $(msg.trigger);

            // Show the popover window
            _.defer(function() {
                $trigger.clickover({
                    'class_name': 'gh-datepicker-popover',
                    'container': 'body',
                    'content': content,
                    'global_close': false,
                    'html': true,
                    'placement': calculatePopoverPosition(msg.ev),
                    'onShown': function() {
                        // Track how long the user takes to adjust the date
                        timeFromStart = new Date();

                        // Track the user starting to edit dates
                        gh.utils.trackEvent(['Data', 'DateTime edit', 'Started']);

                        // Cache the trigger
                        $trigger = $(msg.trigger).closest('tr .gh-event-date');

                        // Cache the delegating components
                        components = [
                            $('#gh-datepicker'),
                            $('#gh-module-week'),
                            $('#gh-module-day')
                        ];

                        initialiseDatePicker();
                        setComponents();

                        // Set the focus on current day of the calendar
                        $('.popover .ui-state-active').focus();
                    }
                });
                $trigger.trigger('click');
            });
        });
    };


    ///////////////////
    //  DATE PICKER  //
    ///////////////////

    /**
     * Initialise the date picker
     *
     * @private
     */
    var initialiseDatePicker = function() {
        $('.popover #gh-datepicker').datepicker({
            'dateFormat': "yy-mm-dd",
            'dayNamesMin': ['S','M','T','W','T','F','S'],
            'firstDay': 4,
            'nextText': '<i class="fa fa-chevron-right"></i>',
            'prevText': '<i class="fa fa-chevron-left"></i>',
            'showOtherMonths': true,
            'selectOtherMonths': true,
            'onSelect': onDatepickerChange
        });
    };

    /**
     * Navigate to a specific date in the calendar
     *
     * @param  {String}    date    The date that needs to be displayed in the calendar
     * @private
     */
    var setDatePicker = function(date) {
        $('.popover #gh-datepicker').datepicker('setDate', date);
    };

    /**
     * Set the original date and time values for the components
     *
     * @private
     */
    var setComponents = function() {
        // Retrieve the origan start and end date for the event
        var startDate = gh.utils.convertUnixDatetoISODate($trigger.attr('data-start'));
        var endDate = gh.utils.convertUnixDatetoISODate($trigger.attr('data-end'));

        // Set the datepicker value
        var calendarDate = moment(startDate).utc().format('YYYY-MM-DD');
        setDatePicker(calendarDate);

        // Set the week value
        var week = gh.utils.getAcademicWeekNumber(gh.utils.convertISODatetoUnixDate(startDate), true);
        $('.popover #gh-module-week').val(week);

        // Set the day value
        var day = moment(startDate).day();
        $('.popover #gh-module-day').val(day);

        // Set the start time values
        startDate = gh.utils.convertUnixDatetoISODate(gh.utils.fixDateToGMT(startDate));
        $('.popover #gh-module-from-hour').val(moment(startDate).utc().format('HH'));
        $('.popover #gh-module-from-minutes').val(moment(startDate).utc().format('mm'));

        // Set the end time values
        endDate = gh.utils.convertUnixDatetoISODate(gh.utils.fixDateToGMT(endDate));
        $('.popover #gh-module-to-hour').val(moment(endDate).utc().format('HH'));
        $('.popover #gh-module-to-minutes').val(moment(endDate).utc().format('mm'));
    };

    /**
     * Function that is executed when the datepicker value was changed
     *
     * @private
     */
    var onDatepickerChange = function() {
        updateComponents('#gh-datepicker');
        validateEntry();
        // Track the user changing the calendar
        gh.utils.trackEvent(['Data', 'DateTime edit', 'Calendar item selected']);
    };


    ////////////////////
    //  FORM CHANGES  //
    ////////////////////

    /**
     * Function that is executed when the week has been changed
     *
     * @private
     */
    var onWeekChange = function() {
        // Track the user editing the week
        gh.utils.trackEvent(['Data', 'DateTime edit', 'Week changed']);
        updateComponents('#gh-module-week');
        validateEntry();
    };

    /**
     * Function that is exectued when the day has been changed
     *
     * @private
     */
    var onDayChange = function() {
        // Track the user editing the day
        gh.utils.trackEvent(['Data', 'DateTime edit', 'Day changed']);
        updateComponents('#gh-module-day');
        validateEntry();
    };

    /**
     * Update the date components
     *
     * @param  {String}    trigger    The ID of the component that invoked the change
     * @private
     */
    var updateComponents = function(trigger) {

        // Collect the component dates
        var dates = getFullDates();

        // Re calculate the date based on the selected week
        if (trigger === '#gh-module-week') {

            // Retrieve the chosen week
            var weekVal = parseInt($('#gh-module-week').val(), 10);
            if (weekVal) {

                // Retrieve the term
                var term = gh.utils.getTerm(gh.utils.convertISODatetoUnixDate(moment(dates.start).utc().format('YYYY-MM-DD')), true);
                if (term) {
                    _term = term;

                    // Jump to the start of the term if the first week was chosen
                    if (weekVal === 1) {
                        setDatePicker(moment(_term.start).utc().format('YYYY-MM-DD'));
                    } else {

                        // Calculate the offset
                        var offset = moment(_term.start).day();

                        // Calculate the start date of the first full week
                        var startDate = moment(_term.start).add({'days': offset});

                        // Change the date picker
                        setDatePicker(moment(startDate).add({'weeks': (weekVal - 2)}).utc().format('YYYY-MM-DD'));
                    }
                } else {
                    var dayNumber = 2;
                    if (weekVal !== 1) {
                        dayNumber = 4;
                        weekVal -= 1;
                    }
                    setDatePicker(moment(gh.utils.getDateByWeekAndDay(_term.name, weekVal, dayNumber)).utc().format('YYYY-MM-DD'));
                }
            }

        // Recalculate the date based on the selected day
        } else if (trigger === '#gh-module-day') {

            // Retrieve the current day
            var currentDay = moment(dates.start).format('E');

            // Calculate the start of the week
            var dayOffset = -3;
            if (currentDay > 3) {
                dayOffset = 4;
            }
            dayOffset = currentDay - dayOffset;

            var weekStart = moment(dates.start).add({'hours': 1}).subtract({'days': dayOffset}).utc().format('YYYY-MM-DD');

            // Retrieve the selected day value
            var dayVal = parseInt($('#gh-module-day option:selected').attr('data-day'), 10);

            // Calculate the new date
            setDatePicker(moment(weekStart).add({'days': dayVal, 'hours': 1}).utc().format('YYYY-MM-DD'));
        }

        // Refetch the dates
        dates = getFullDates();

        // Update all the components except the trigger
        _.each(components, function(component) {
            if ($(component).selector !== trigger) {

                // Update the week
                if ($(component).selector === '#gh-module-week') {
                    var week = gh.utils.getAcademicWeekNumber(gh.utils.convertISODatetoUnixDate(moment(dates.start).utc().format('YYYY-MM-DD')), true);
                    $(component).val(week);

                // Update the day
                } else if ($(component).selector === '#gh-module-day') {
                    var day = moment(dates.start).day();
                    $(component).val(day);
                }
            }
        });
    };


    ///////////////
    //  BINDING  //
    ///////////////

    /**
     * Handles keypress events when focus is set to the editable event date field
     *
     * @param  {Event}    ev    Standard jQuery keypress event
     * @private
     */
    var handleKeyPress = function(ev) {
        var key = parseInt(ev.which, 10);
        if (key === 32 || key === 13) {
            $(this).click();
        }
    };

    /**
     * Add handlers to various elements in the date picker popover
     *
     * @private
     */
    var addBinding = function() {
        // Form submission
        $('body').on('click', '#gh-edit-dates-apply', applyDateChange);

        // Keyboard accessibility
        $('body').on('keypress', '.gh-event-date', handleKeyPress);

        // Utilities
        $('body').on('change', '#gh-edit-dates-form select', validateEntry);
        $('body').click(dismissPopover);

        // Week change
        $('body').on('change', '#gh-module-week', onWeekChange);
        $('body').on('change', '#gh-module-day', onDayChange);

        // Time related changes
        $('body').on('change', '#gh-module-from-hour', function() {
            // Track the user changing the start hour
            gh.utils.trackEvent(['Data', 'DateTime edit', 'Start hour changed']);
        });
        $('body').on('change', '#gh-module-from-minutes', function() {
            // Track the user changing the start minute
            gh.utils.trackEvent(['Data', 'DateTime edit', 'Start minute changed']);
        });
        $('body').on('change', '#gh-module-to-hour', function() {
            // Track the user changing the end hour
            gh.utils.trackEvent(['Data', 'DateTime edit', 'End hour changed']);
        });
        $('body').on('change', '#gh-module-to-minutes', function() {
            // Track the user changing the end minute
            gh.utils.trackEvent(['Data', 'DateTime edit', 'End minute changed']);
        });

        // Setup and show the datapicker popover
        $(document).on('gh.datepicker.show', showPopover);
    };

    addBinding();
});

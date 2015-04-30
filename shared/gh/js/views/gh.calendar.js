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

define(['gh.core', 'gh.constants', 'moment', 'clickover', 'gh.agenda-view'], function(gh, constants, moment) {


    /////////////////////
    // INSTRUMENTATION //
    /////////////////////

    /**
     * Create a human readable string from the selected view and return it
     *
     * @return {String}    Human readable string of the selected view. One of `Month`, `Week` or `Day`
     * @private
     */
    var getReadableView = function() {
        if (currentView === 'month') {
            return 'Month';
        } else if (currentView === 'agendaDay') {
            return 'Day';
        }

        return 'Week';
    };

    /**
     * Send a tracking event when the user navigates the terms
     *
     * @param  {Function}    termName    The name of the term that was navigated to
     * @private
     */
    var sendTermNavigationEvent = function(termName) {
        // Create a human readable string from the selected view
        var viewMode = getReadableView();

        // Send a tracking event when the user navigates the terms
        gh.utils.trackEvent(['Calendar', 'View', viewMode, 'Term ' + termName]);
    };

    /**
     * Send a tracking event when the user navigates to today
     *
     * @private
     */
    var sendTodayNavigationEvent = function() {
        // Create a human readable string from the selected view
        var viewMode = getReadableView();

        // Send a tracking event when the user navigates the terms
        gh.utils.trackEvent(['Calendar', 'View', viewMode, 'Today']);
    };

    /**
     * Send a tracking event when the user navigates the view within the current view (month/week/day)
     *
     * @param  {Function}    next    Whether or not the next month/week/day button was clicked
     * @private
     */
    var sendNavigationEvent = function(next) {
        // Append an icon at the end of the tracking event, depending on whether the
        // next or previous button was clicked
        var navIcon = next ? '>' : '<';

        // Create a human readable string from the selected view
        var viewMode = getReadableView();

        // Send a tracking event when the user navigates the terms
        gh.utils.trackEvent(['Calendar', 'View', viewMode,  viewMode + ' ' + navIcon]);
    };

    /**
     * Send a tracking event when the user navigates the current view (month/week/day)
     *
     * @private
     */
    var sendViewNavigationEvent = function() {
        // Create a human readable string from the selected view
        var viewMode = getReadableView();

        // Send a tracking event when the user navigates the terms
        gh.utils.trackEvent(['Calendar', 'View', viewMode + ' view selected']);
    };


    ////////////////
    //  CALENDAR  //
    ////////////////

    // Cache the calendar object
    var calendar = null;

    // Set the default view
    var currentView = 'agendaWeek';

    // Object used to cache the triposData received on initialisation
    var triposData = null;

    // Used to cache the optional orgUnitId, passed in when initialising the calendar. If
    // no orgUnitID is specified the user's personal calendar will be loaded instead.
    var orgUnitID = null;

    // Get the start and end dates for the terms
    var terms = gh.api.configAPI.getAppTerm();

    /**
     * Change the calendar's current period
     *
     * @private
     */
    var changePeriod = function() {
        // Retrieve the button's action
        var action = $(this).attr('data-action');
        // Update the calendar
        calendar.fullCalendar(action);
        // Set the current day
        setCurrentDay();
        // Set the period label
        setPeriodLabel();
        // Set the term label
        setTermLabel();
        // Set the document title
        setDocumentTitle();

        // Fetch the user's events
        getUserEvents();

        // Track the user navigating periods
        sendNavigationEvent(action === 'next');
    };

    /**
     * Change the calendar's current term
     *
     * @private
     */
    var changeTerm = function() {
        var termName = $(this).attr('data-term');
        // Retrieve the first day of term based on the name
        var term = gh.utils.getFirstDayOfTerm(termName);
        // Navigate to a specific date in the calendar
        calendar.fullCalendar('gotoDate', term);
         // Set the current day
        setCurrentDay();
        // Set the week label
        setPeriodLabel();
        // Set the term label
        setTermLabel();
        // Set the document title
        setDocumentTitle();

        // Fetch the user's events
        getUserEvents();

        // Send an event when the user changes the term
        sendTermNavigationEvent(termName);
    };

    /**
     * Change the calendar's current view
     *
     * @private
     */
    var changeView = function() {
        // Retrieve the view
        currentView = $(this).attr('data-view');
        // Change the view
        calendar.fullCalendar('changeView', currentView);
        // Set the view mode label
        $('#gh-switch-view-label').html(getReadableView() + ' view');
        // Set the current day
        setCurrentDay();
        // Set the period label
        setPeriodLabel();
        // Set the term label
        setTermLabel();
        // Set the document title
        setDocumentTitle();

        // Fetch the user's events
        getUserEvents();

        // Send a tracking event when the user changes the current view
        sendViewNavigationEvent();
    };

    /**
     * Change the current view to today's view
     *
     * @private
     */
    var navigateToToday = function() {
        // Navigate to today
        calendar.fullCalendar('today');
        // Set the current day
        setCurrentDay();
        // Set the week label
        setPeriodLabel();
        // Set the term label
        setTermLabel();
        // Set the document title
        setDocumentTitle();

        // Fetch the user's events
        getUserEvents();

        // Track the user clicking the today button
        sendTodayNavigationEvent();
    };

    /**
     * Get the user's events for the current view's time span
     *
     * @private
     */
    var getUserEvents = function() {
        // Only attempt to get the user's calendar when not anonymous
        if (!gh.data.me.anon) {

            // Determine the date range for which to get the user's events
            gh.utils.getCalendarDateRange(function(range) {
                if (orgUnitID) {
                    gh.api.orgunitAPI.getOrgUnitCalendar(parseInt(orgUnitID, 10), range.start, range.end, function(err, data) {
                        if (err) {
                            return gh.utils.notification('Could not fetch the calendar', constants.messaging.default.error, 'error');
                        }

                        // Update the calendar
                        updateCalendar(data.results);
                    });
                } else {
                    gh.api.userAPI.getUserCalendar(gh.data.me.id, range.start, range.end, function(err, data) {
                        if (err) {
                            return gh.utils.notification('Could not fetch the calendar for ' + gh.data.me.displayName, constants.messaging.default.error, 'error');
                        }

                        // Update the calendar
                        updateCalendar(data.results);
                    });
                }
            });
        }
    };

    /**
     * Refresh the calendar
     *
     * @param  {Object}      data             The dispatched event
     * @param  {Event[]}     data.events      The user's subscribed events
     * @param  {Function}    data.callback    Standard callback function
     * @private
     */
    var refreshCalendar = function(ev, data) {
        if (data.callback && !_.isFunction(data.callback)) {
            throw new Error('A valid callback function should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        data.callback = data.callback || function() {};

        // Replace the calendar's events
        updateCalendar(data.events);
        // Invoke the callback function
        data.callback();
    };

    /**
     * Update the calendar event object
     *
     * @param  {Event[]}    events    Array containing the user's events
     * @private
     */
    var updateCalendar = function(events) {
        // Remove the existing events
        calendar.fullCalendar('removeEvents');
        // Manipulate the dates so they always display in GMT+0
        gh.utils.fixDatesToGMT(events);
        // Get the event context
        getEventContext(events);
        // Replace the calendar's events
        calendar.fullCalendar('addEventSource', events);
    };

    /**
     * Highlight the header of the current day by adding a class
     *
     * @private
     */
    var setCurrentDay = function() {
        var selectedDay = $('.fc-today').index();
        $('.fc-widget-header table th:nth-child(' + (selectedDay + 1) + ')').addClass('fc-today');
    };

    /**
     * Set the period label
     *
     * @private
     */
    var setPeriodLabel = function() {
        var label = calendar.fullCalendar('getView').title;
        if (currentView === 'agendaWeek') {

            // Get the current academic week number
            var weekNumber = gh.utils.getAcademicWeekNumber(getCurrentViewDate(), false);

            // Set the label
            label = 'Outside term week';
            if (weekNumber) {
                label = 'Week ' + weekNumber;
            }
        }
        $('#gh-toolbar-label-period').html(label);
    };

    /**
     * Set the term label
     *
     * @private
     */
    var setTermLabel = function() {
        // Get the current term
        var term = gh.utils.getTerm(getCurrentViewDate());

        // Set the label
        var label = 'Outside term';
        if (term) {
            label = term.label;
        }

        $('#gh-switch-term-label').html(label);
    };

    /**
     * Set the document title to the currently selected date range
     *
     * @private
     */
    var setDocumentTitle = function() {
        if (!$('body').hasClass('gh-admin')) {
            var title = calendar.fullCalendar('getView').title;

            // Set the document title
            gh.utils.setDocumentTitle(title);
        }
    };


    //////////////
    //  EVENTS  //
    //////////////

    /**
     * Export the calendar
     *
     * @private
     */
    var exportCalendar = function() {
        // Toggle the `export-enabled` class on the calendar view to move the components aside
        $('#gh-calendar-view').toggleClass('gh-export-enabled');
        // Set the width of the button to avoid smaller size when toggling the label
        $('#gh-btn-calendar-export').width($('#gh-btn-calendar-export > div').width());
        // Toggle the label in the export button
        $('#gh-btn-calendar-export > div').toggle();
        // Set focus to the Subscribe button
        $('#gh-export-subscribe').focus();
        // If the export panel is opened, disable all actions on the page
        if ($('#gh-calendar-view').hasClass('gh-export-enabled')) {
            disableEnableAll(true);
            // Send a tracking event when the user opens the export panel
            gh.utils.trackEvent(['Calendar', 'Export', 'Opened']);
        // If the export panel is closed, enable all actions on the page
        } else {
            disableEnableAll();
            // Send a tracking event when the user closes the export panel
            gh.utils.trackEvent(['Calendar', 'Export', 'Closed']);
        }
    };

    /**
     * Toggle the `other options` button icon when clicked
     *
     * @private
     */
    var toggleExportOptions = function() {
        // Toggle the icon's class
        $(this).find('i').toggleClass('fa-caret-right fa-caret-down');

        // Pre-select the ical URL in the textarea after the call stack clears
        _.defer(function() {
            $('#gh-export-subscribe-copy').select();
        });

        // Send a tracking event when the user toggles the other subscribe options
        if ($(this).find('i').hasClass('fa-caret-right')) {
            gh.utils.trackEvent(['Calendar', 'Export', 'Other ways', 'Closed']);
        } else {
            gh.utils.trackEvent(['Calendar', 'Export', 'Other ways', 'Opened']);
        }
    };

    /**
     * Print the calendar
     *
     * @private
     */
    var printCalendar = function() {
        // Send a tracking event when a user prints the calendar
        gh.utils.trackEvent(['Calendar', 'Print clicked']);
        return window.print();
    };


    ////////////
    //  UTIL  //
    ////////////

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
        $('button, input, select, textarea, .fc-event').attr('disabled', disable).trigger('chosen:updated.chosen');

        if (disable) {
            // Disable opening of popovers
            $('#gh-calendar-container').off('click', '.fc-event', setUpEventPopover);
        } else {
            // Enable opening of popovers
            $('#gh-calendar-container').on('click', '.fc-event', setUpEventPopover);
        }

        // Never disable the export buttons
        $('#gh-btn-calendar-export').attr('disabled', false);
        $('button, textarea', $('#gh-export-container')).attr('disabled', false);
        // Never disable log out
        $('button', $('#gh-signout-form')).attr('disabled', false);
    };

    /**
     * Return the current view
     *
     * @return {String}    The calendar's current view (e.g. 'month', 'week', 'day'...)
     * @private
     */
    var getCurrentView = function() {
        return calendar.fullCalendar('getView')['intervalUnit'];
    };

    /**
     * Return the start date of the current view in UNIX format
     *
     * @return {Number}    The start date of the current view in a UNIX time format
     * @private
     */
    var getCurrentViewDate = function() {
        // Get the start date from the current calendar view
        var viewStartDate = calendar.fullCalendar('getDate');
        // Convert the Moment object to a UTC date
        return gh.utils.convertISODatetoUnixDate(moment(viewStartDate).utc().format('YYYY-MM-DD'));
    };

    /**
     * Get the context (course - subject / part) that goes with each event to be
     * rendered on the calendar and put it on the event object
     *
     * @param  {Object[]}    events    An Array of events to grab the context for
     * @private
     */
    var getEventContext = function(events) {
        // Loop over all events
        _.each(events, function(ev) {
            // Only grab extra context if the necessary data is available on the event
            if (ev.context) {
                // Grab the part associated to the event
                var partParent = _.find(triposData.parts, function(part) {
                    return ev.context.ParentId === part.id;
                });
                // Grab the subject associated to the event. Note that this might
                // not always be present
                var subjectParent = _.find(triposData.subjects, function(subject) {
                    return partParent.ParentId === subject.id;
                });
                // Grab the course associated to the event
                var courseParent = _.find(triposData.courses, function(course) {
                    if (subjectParent) {
                        return subjectParent.ParentId === course.id;
                    }
                    return partParent.ParentId === course.id;
                });
                // Put the course, subject and part on the event object
                ev.context.part = partParent;
                ev.context.subject = subjectParent;
                ev.context.course = courseParent;
            }
        });
    };

    /**
     * Return a term by its name
     *
     * @param  {String}    name    The name of the term
     * @return {Object}            Object containing term data
     * @private
     */
    var getTermByName = function(name) {
        return _.find(terms, {'name': name});
    };

    /**
     * Return the nearest term
     *
     * @param  {String}    term        Object containing the current term data
     * @param  {String}    property    The term property that is used to calculate the difference
     * @return {Object}                Object containing the next term data
     * @private
     */
    var getNearestTerm = function(term, property) {

        // Get the term start dates and covert them to a UNIX format
        var termDates = _.map(terms, function(term) {
            return {
                'name': term.name,
                'date': gh.utils.convertISODatetoUnixDate(moment(term[property]).utc().format('YYYY-MM-DD'))
            };
        });

        // Pick the nearest start date
        var nearest = _.first(termDates);
        _.each(termDates, function(term) {
            if ((Math.abs(term.date - getCurrentViewDate())) < (Math.abs(nearest.date - getCurrentViewDate()))) {
                nearest = term;
            }
        });

        // Return the term
        return getTermByName(nearest.name);
    };

    /**
     * Return a following term
     *
     * @param  {String}    term    Object containing the current term data
     * @return {Object}            Object containing the next term data
     * @private
     */
    var getNextTerm = function(term) {
        var currentTermIndex = terms.indexOf(term);
        var nextIndex = currentTermIndex + 1;
        if (!terms[nextIndex]) {
            return terms[0];
        }
        return terms[nextIndex];
    };

    /**
     * Return a preceeding term
     *
     * @param  {String}    term    Object containing the current term data
     * @return {Object}            Object containing the previous term data
     * @private
     */
    var getPreviousTerm = function(term) {
        var currentTermIndex = terms.indexOf(term);
        var nextIndex = currentTermIndex - 1;
        if (!terms[nextIndex]) {
            return terms[terms.length - 1];
        }
        return terms[nextIndex];
    };


    ///////////////
    //  POPOVER  //
    ///////////////

    /**
     * Calculate the position of the popover window
     *
     * @param  {Object}    $trigger    A jQuery object representing the trigger
     * @return {String}                The popover's position
     * @private
     */
    var calculatePopoverPosition = function($trigger) {
        // Get the calendar's width
        var calendarWidth = $trigger.closest('table').width();
        // Get the event's offset
        var eventOffset = $trigger.offset().left - 360;
        // Get the event's width
        var eventWidth = $trigger.closest('.fc-event-container').width();
        // Get the popover's width
        var popoverWidth = $('.popover').width();

        // Set the position to left if there is not enough space to show the popover
        var position = 'right';
        if (calendarWidth - (eventOffset + eventWidth) < popoverWidth) {
            position = 'left';
        }

        return position;
    };

    /**
     * Hide the popovers on resize
     *
     * @param  {Object}    $trigger    A jQuery object representing the trigger
     * @private
     */
    var hidePopoverOnResize = function($trigger) {
        $(window).one('resize', function() {
            $trigger.trigger('click');
        });
    };

    /**
     * Set up and show the event popover
     *
     * @private
     */
    var setUpEventPopover = function() {
        var eventId = $(this).data('id');
        var $trigger = $(this);
        var $content = $('.popover[data-id="' + eventId + '"]');

        // Wait until the current call stack cleared so we're sure
        // all popovers are hidden before adding a new one
        _.defer(function() {
            var options = {
                'class_name': 'gh-event-popover',
                'container': 'body',
                'content': $content.html(),
                'global_close': true,
                'html': true,
                'placement': calculatePopoverPosition($trigger),
                'title': '',
                'onHidden': function() {
                    $trigger.removeClass('highlighted');
                },
                'onShown': function() {
                    $trigger.addClass('highlighted');

                    // Hide the popover on resize
                    hidePopoverOnResize($trigger);

                    // Send a tracking event when a user opens the popover
                    gh.utils.trackEvent(['Calendar', 'View', 'Tooltip displayed']);
                }
            };

            $trigger.clickover(options);
            $trigger.trigger('click');
        });
    };


    ///////////////
    //  BINDING  //
    ///////////////

    /**
     * Set the height of the calendar view
     *
     * @private
     */
    var setCalendarHeight = function() {
        // Calculate the new height
        var height = window.innerHeight - 380;
        // Apply the new height on the calendar
        calendar.fullCalendar('option', 'height', height);
    };

    /**
     * Add event listeners to UI-components
     *
     * @private
     */
    var addBinding = function() {
        // Export the calendar
        $('#gh-btn-calendar-export').off('click', exportCalendar).on('click', exportCalendar);
        $('#gh-export-subscribe').off('click').on('click', function() {
            // Send a tracking event when the user clicks the subscribe button
            gh.utils.trackEvent(['Calendar', 'Export', 'Subscribed to calendar feed'], {
                'ics_feed_hash': gh.data.me.calendarToken
            });
        });
        // Toggle the other options for export
        $('#gh-export-collapsed-other-toggle').off('click', toggleExportOptions).on('click', toggleExportOptions);
        // Send an event when the feed URL is copied
        $('#gh-export-subscribe-copy').off('copy').on('copy', function() {
            gh.utils.trackEvent(['Calendar', 'Export', 'Other ways', 'Copied feed URL']);
        });
        // Send tracking events when the help links are clicked
        $('#gh-export-other-google').off('click').on('click', function() {
            gh.utils.trackEvent(['Calendar', 'Export', 'Other ways', 'Google Calendar help clicked']);
        });
        $('#gh-export-other-microsoft').off('click').on('click', function() {
            gh.utils.trackEvent(['Calendar', 'Export', 'Other ways', 'MS Outlook help clicked']);
        });
        $('#gh-export-other-apple').off('click').on('click', function() {
            gh.utils.trackEvent(['Calendar', 'Export', 'Other ways', 'Apple Calendar help clicked']);
        });
        // Print the calendar
        $('#gh-btn-calendar-print').off('click', printCalendar).on('click', printCalendar);
        // Navigate to the current day
        $('#gh-btn-calendar-today').off('click', navigateToToday).on('click', navigateToToday);
        // Change the calendar's period
        $('#gh-calendar-toolbar-period button').off('click', changePeriod).on('click', changePeriod);
        // Change the calendar's term
        $('.gh-switch-term').off('click', changeTerm).on('click', changeTerm);
        // Change the calendar's view
        $('.gh-switch-view').off('click', changeView).on('click', changeView);

        // Return the calendar's current view
        $(document).off('gh.calendar.getCurrentView').on('gh.calendar.getCurrentView', function(ev, callback) {
            return callback(getCurrentView());
        });

        // Return the calendar's current view date
        $(document).off('gh.calendar.getCurrentViewDate').on('gh.calendar.getCurrentViewDate', function(ev, callback) {
            return callback(getCurrentViewDate());
        });

        // Navigate to today
        $(document).off('gh.calendar.navigateToToday', navigateToToday).on('gh.calendar.navigateToToday', navigateToToday);

        // Refresh the calendar
        $(document).off('gh.calendar.refresh', refreshCalendar).on('gh.calendar.refresh', refreshCalendar);

        // Resize the calendar
        $(window).off('resize', setCalendarHeight).on('resize', setCalendarHeight);
    };

    /**
     * Initialise FullCalendar on the page and bind event handlers for navigating it
     *
     * @param  {Event}       ev                         Standard event object
     * @param  {Object}      calendarData               The data associated to the calendar to render
     * @param  {Object[]}    calendarData.triposData    An Array of tripos data
     * @param  {Object[]}    calendarData.events        An Array of events to add to the calendar on initialisation
     * @private
     */
    var setUpCalendar = function(ev, calendarData) {
        // Create an empty array if there are no events yet
        var events = calendarData && calendarData.events && calendarData.events.results ? calendarData.events.results : [];

        orgUnitID = calendarData.orgUnitId || null;

        // Manipulate the dates so they always display in GMT+0
        gh.utils.fixDatesToGMT(events);

        if (calendarData && calendarData.triposData) {
            // Cache the triposData for later use
            triposData = calendarData.triposData;
            // Get the event context
            getEventContext(events);
        }

        // If the calendar instance is initialised while another is on the page,
        // tear it down first
        if (calendar) {
            calendar.fullCalendar('destroy');
        }

        // Initialize the calendar object
        calendar = $('#gh-calendar-container').fullCalendar({
            'header': false,
            'columnFormat': {
                'month': 'ddd',
                'week': 'ddd D/M',
                'day': 'dddd'
            },
            'allDaySlot': false,
            'defaultDate': Date.now(),
            'defaultView': currentView,
            'editable': false,
            'eventLimit': true,
            'firstDay': 4,
            'handleWindowResize': false,
            'maxTime': '20:00:00',
            'minTime': '07:00:00',
            'slotDuration': '00:30:00',
            'events': events,
            'eventRender': function(data) {
                console.log('eventRender');
                console.log(data);

                return gh.utils.renderTemplate('event', {
                    'data': data
                }, function(compiled) {
                    console.log('compiled');
                    return compiled;
                });
            }
        });

        // Show extra information for the event in a popover when it's clicked
        $('#gh-calendar-container').on('click', '.fc-event', setUpEventPopover);

        // Add binding to various elements
        addBinding();
        // Set the current day
        setCurrentDay();
        // Set the calendar height
        setCalendarHeight();
        // Set the period label
        setPeriodLabel();
        // Set the term label
        setTermLabel();
    };

    // Initialise the calendar
    $(document).on('gh.calendar.init', setUpCalendar);

    // Inform the page that the calendar is ready to go so that
    // it can initialise the calendar when it's ready for it
    $(document).trigger('gh.calendar.ready');
});

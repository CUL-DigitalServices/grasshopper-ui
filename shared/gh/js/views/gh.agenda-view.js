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

define(['gh.core'], function(gh) {

    // Get the configuration
    var config = require('gh.core').config;
    // Get the correct terms associated to the current application
    var terms = config.terms[config.academicYear];


    ///////////////
    // RENDERING //
    ///////////////

    /**
     * Render the agenda view
     *
     * @param {Object}    terms    The terms containing the events per week
     * @private
     */
    var renderAgendaView = function(terms) {
        // Add parent info to all events that have context
        addParentInfo();

        // Render the agenda view
        gh.utils.renderTemplate('agenda-view', {
            'data': {
                'openedTerms': require('gh.core').utils.localDataStorage().get('myagenda'),
                'terms': terms,
                'utils': gh.utils
            }
        }, $('#gh-my-agenda-view-container'));
    };


    ///////////////
    // UTILITIES //
    ///////////////

    /**
     * Add the parent info to all events in the terms
     *
     * @private
     */
    var addParentInfo = function() {
        // Loop over all terms
        _.each(terms, function(term) {
            // For each week in the term that was previously fetched, loop over the events
            _.each(term.events, function(week) {
                // Loop over all events in the week and add the parent's information to it
                _.each(week, function(event) {
                    // Add the parent's contextual information to the event if the initial
                    // event context is available
                    if (event.context) {
                        gh.utils.addParentInfoToOrgUnit(event.context);
                    }
                });
            });
        });
    };

    /**
     * Get all events for the specified week and term in the user's calendar
     *
     * @param {Object}    term    The term to get the events for
     * @param {Number}    week    The week of the term to get evens for
     * @private
     */
    var getAgendaViewData = function(term, week) {
        var startOffsetDays = week * 7;
        var endOffsetDays = startOffsetDays + 7;

        var startDate = gh.utils.convertUnixDatetoISODate(moment(term.start).add({'days': startOffsetDays}).toISOString());
        var endDate = gh.utils.convertUnixDatetoISODate(moment(term.start).add({'days': endOffsetDays}).toISOString());

        // Get the user's events for each term in the year
        gh.api.userAPI.getUserCalendar(gh.data.me.id, startDate, endDate, function(err, data) {
            // Assign the term's events to the correct week in the cached object
            term.events = term.events || {};
            term.events[week] = data.results;
            // Update the agenda
            renderAgendaView(terms);
        });
    };

    /**
     * Load the next week in a term
     *
     * @private
     */
    var loadNextWeek = function() {
        // Show the loading indicator
        $(this).find('i').show();
        // Get the next week to load
        var nextWeek = parseInt($(this).attr('data-week'), 10) + 1;
        // Get the term to load the next week for
        var termName = $(this).attr('data-term');
        var term = _.find(terms, function(term) {
            return term.name === termName;
        });
        // Load and render the next week
        getAgendaViewData(term, nextWeek);
    };

    /**
     * Refresh the agenda view by refetching the weeks that were previously loaded
     *
     * @private
     */
    var refreshAgendaView = function() {
        // Loop over all terms
        _.each(terms, function(term) {
            // For each week in the term that was previously fetched, get the
            // updated set of events
            _.each(term.events, function(week, weekIndex) {
                // Get the events
                getAgendaViewData(term, weekIndex);
            });
        });
    };

    /**
     * Show/hide the term when the header is clicked
     *
     * @private
     */
    var toggleTerm = function() {
        // Toggle the caret icon
        $(this).find('i').toggleClass('fa-caret-right fa-caret-down');
        // Toggle the event container
        $(this).parent().next().toggle();
        // Get the expanded terms to store in the local storage
        var expandedTerms = $('.agenda-view-term-header .fa-caret-down').map(function(index, value) {
            return $(value).attr('data-term');
        });
        expandedTerms = _.map(expandedTerms, function(id) { return id; });
        // Store the toggled terms in the local storage
        gh.utils.localDataStorage().store('myagenda', expandedTerms);
    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    /**
     * Add handlers to various elements in the agenda view
     *
     * @private
     */
    var addBinding = function() {
        // Load up the first week of each term when the 'my agenda' tab is shown
        $(document).on('shown.bs.tab', '#gh-calendar-view .gh-toolbar-primary a[data-toggle="tab"]', function(ev) {
            if ($(ev.target).attr('aria-controls') === 'gh-my-agenda-view') {
                // Load the first week of each term by default
                _.each(terms, function(term) {
                    getAgendaViewData(term, 0);
                });
            }
        });

        // Toggle the visiblity of a term when the header is clicked
        $(document).on('click', '.agenda-view-term-header > button', toggleTerm);

        // Load next week in term
        $(document).on('click', '.gh-btn-load-next-week', loadNextWeek);

        // Refresh the calendar
        $(document).on('gh.agendaview.refresh', refreshAgendaView);
    };

    addBinding();
});

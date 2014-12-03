/*!
 * Copyright 2014 Digital Services, University of Cambridge Licensed
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

define(['gh.core', 'bootstrap.calendar', 'bootstrap.listview', 'chosen'], function(gh) {

    var triposData = {
        'courses': [],
        'subjects': [],
        'parts': [],
        'modules': []
    };

    // Dummy module JSON data to render the partial with
    var dummyModules = [
        {
            "description": "S1: Advanced Social Anthropology I: Thought, Belief and Ethics",
            "displayName": "S1: Advanced Social Anthropology I: Thought, Belief and Ethics",
            "eventSummary": "S1: Advanced Social Anthropology I: Thought, Belief and Ethics",
            "id": 0,
            "subscribed": false,
            'events': [
                {
                    "id": 1,
                    "description": "Citizenship",
                    "displayName": "Citizenship",
                    "location": "Seminar Room, Social Anthropology",
                    "notes": "Mi1-4 W 10",
                    "start": '2014-11-27T12:30:00',
                    "end": '2014-11-27T15:45:00',
                    "subscribed": false,
                    "organisers": [
                        {
                            "organiser": {
                                "user": {
                                    "displayName": "Dr S Lazar",
                                    "isAdmin": false
                                }
                            }
                        }
                    ]
                },
                {
                    "id": 2,
                    "description": "Citizenship",
                    "displayName": "Citizenship",
                    "location": "Seminar Room, Social Anthropology",
                    "notes": "Mi1-4 W 10",
                    "start": '2014-11-27T09:30:00',
                    "end": '2014-11-27T12:00:00',
                    "subscribed": false,
                    "organisers": [
                        {
                            "organiser": {
                                "user": {
                                    "displayName": "Dr S Lazar",
                                    "isAdmin": false
                                }
                            }
                        }
                    ]
                },
                {
                    "id": 3,
                    "description": "Citizenship",
                    "displayName": "Citizenship",
                    "location": "Seminar Room, Social Anthropology",
                    "notes": "Mi1-4 W 10",
                    "start": '2014-11-27T08:30:00',
                    "end": '2014-11-27T10:45:00',
                    "subscribed": false,
                    "organisers": [
                        {
                            "organiser": {
                                "user": {
                                    "displayName": "Dr S Lazar",
                                    "isAdmin": false
                                }
                            }
                        }
                    ]
                }
            ]
        },
        {
            "description": "S2: Advanced Social Anthropology I: Thought, Belief and Ethics",
            "displayName": "S2: Advanced Social Anthropology I: Thought, Belief and Ethics",
            "eventSummary": "S2: Advanced Social Anthropology I: Thought, Belief and Ethics",
            "id": 4,
            "subscribed": false,
            'events': [
                {
                    "id": 5,
                    "description": "Citizenship 2",
                    "displayName": "Citizenship 2",
                    "location": "Seminar Room, Social Anthropology",
                    "notes": "Mi1-4 W 10",
                    "start": '2014-11-23T11:30:00',
                    "end": '2014-11-23T12:45:00',
                    "subscribed": false,
                    "organisers": [
                        {
                            "organiser": {
                                "user": {
                                    "displayName": "Dr S Lazar",
                                    "isAdmin": false
                                }
                            }
                        }
                    ]
                }
            ]
        }
    ];

    /**
     * Render the header
     */
    var renderHeader = function() {
        gh.api.utilAPI.renderTemplate($('#gh-header-template'), {
            'gh': gh
        }, $('#gh-header'));
    };

    /**
     * Set up the series of events in the sidebar
     *
     * @param {jQuery}    ev      Standard jQuery event
     * @param {Object}    data    Data object describing the selected part to fetch series for
     */
    var setUpSeries = function(ev, data) {
        gh.api.utilAPI.renderTemplate($('#gh-modules-template'), {
            'data': dummyModules
        }, $('#gh-modules-container'));

        $(document).trigger('gh.listview.init', {
            'modules': dummyModules
        });
    };

    /**
     * Set up the Part picker in the subheader
     *
     * @param {jQuery}    ev      Standard jQuery event
     * @param {Object}    data    Data object describing the selected tripos to fetch parts for
     */
    var setUpPartPicker = function(ev, data) {
        // Get the parts associated to the selected tripos
        var parts = _.filter(triposData.parts, function(part) {
                        return parseInt(data.selected, 10) === part.parentId;
                    });
        // Render the results in the part picker
        gh.api.utilAPI.renderTemplate($('#gh-subheader-part-template'), {
            'data': parts
        }, $('#gh-subheader-part'));

        // Show the subheader part picker
        $('#gh-subheader-part').show();

        // Destroy the field if it's been initialised previously
        $('#gh-subheader-part').chosen('destroy');
        // Initialise the Chosen plugin on the part picker
        $('#gh-subheader-part').chosen({
            'no_results_text': 'No matches for',
            'disable_search_threshold': 10
        }).change(setUpSeries);
    };

    /**
     * Set up the Trips picker in the subheader
     */
    var setUpTriposPicker = function() {
        var triposPickerData = {
            'courses': triposData.courses
        };

        _.each(triposPickerData.courses, function(course) {
            course.subjects = _.filter(triposData.subjects, function(subject) {
                                    return course.id === subject.parentId;
                                });
        });

        // Massage the data so that courses are linked to their child subjects
        // Render the results in the tripos picker
        gh.api.utilAPI.renderTemplate($('#gh-subheader-picker-template'), {
            'data': triposPickerData
        }, $('#gh-subheader-tripos'));

        // Show the subheader tripos picker
        $('#gh-subheader-tripos').show();

        // Initialise the Chosen plugin on the tripos picker
        $('#gh-subheader-tripos').chosen({
            'no_results_text': 'No matches for'
        }).change(setUpPartPicker);

        // Show the descriptive text on the left hand side
        $('#gh-content-description p').show();
    };

    /**
     * Get the tripos structure from the REST API and filter it down for easy
     * access in the templates
     */
    var getTripos = function() {
        gh.api.orgunitAPI.getOrgUnits(gh.data.me.AppId, false, null, null, function(err, data) {
            triposData.courses = _.filter(data.results, function(course) {
                                    return course.type === 'course';
                                });

            triposData.subjects = _.filter(data.results, function(subject) {
                                    return subject.type === 'subject';
                                });

            triposData.parts = _.filter(data.results, function(part) {
                                    return part.type === 'part';
                                });

            triposData.modules = _.filter(data.results, function(module) {
                                    return module.type === 'module';
                                });

            triposData.series = _.filter(data.results, function(serie) {
                                    return serie.type === 'serie';
                                });

            // Set up the tripos picker after all data has been retrieved
            setUpTriposPicker();
        });
    };

    /**
     * Render the calendar view
     */
    var renderCalendarView = function() {
        gh.api.utilAPI.renderTemplate($('#gh-calendar-template'), {
            'data': dummyModules
        }, $('#gh-main'));

        $(document).trigger('gh.calendar.init');
    };

    /**
     * Log in using the local authentication strategy
     *
     * @return {Boolean}     Return false to avoid default form behaviour
     */
    var doLogin = function() {
        var formValues = _.object(_.map($(this).serializeArray(), _.values));
        gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
            if (!err) {
                window.location = '/';
            } else {
                // Show an error to the user
            }
        });

        return false;
    };

    /**
     * Add bindings to various elements on the page
     */
    var addBinding = function() {
        $('body').on('submit', '#gh-signin-form', doLogin);

        $(document).on('gh.calendar.ready', function() {
            renderCalendarView();
        });
    };

    /**
     * Initialise the page
     */
    var initIndex = function() {
        addBinding();
        renderHeader();
        renderCalendarView();

        // If the user isn't logged in the page shouldn't be fully initialised
        if (gh.data.me) {
            getTripos();
        }
        
    };

    initIndex();
});

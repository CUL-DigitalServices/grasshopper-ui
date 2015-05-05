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

define(['gh.core', 'gh.constants', 'gh.subheader', 'gh.calendar', 'gh.student-listview', 'validator'], function(gh, constants) {

    // Cache the tripos data
    var triposData = {};


    /////////////////
    //  RENDERING  //
    /////////////////

    /**
     * Set up the header component by rendering the header and login templates, fetching the tripos
     * structure and initialising the subheader component
     *
     * @private
     */
    var setUpHeader = function() {
        // Render the header template
        gh.utils.renderTemplate($('#gh-header-template'), {
            'data': {
                'gh': gh
            }
        }, $('#gh-header'));

        // Bind the validator to the login form
        $('.gh-signin-form').validator({
            'disable': false
        }).on('submit', doLogin);

        // Render the tripos pickers
        gh.utils.renderTemplate($('#gh-subheader-pickers-template'), {
            'gh': gh
        }, $('#gh-subheader'));

        // Set up the tripos picker after all data has been retrieved
        // Initialise the subheader component after all data has been retrieved
        $(document).trigger('gh.subheader.init', {
            'triposData': triposData
        });
    };

    /**
     * Render the calendar view
     *
     * @private
     */
    var setUpCalendar = function() {
        // Render the calendar template
        gh.utils.renderTemplate($('#gh-calendar-template'), {
            'data': {
                'gh': gh
            }
        }, $('#gh-main'));

        // Initialise the calendar
        $(document).trigger('gh.calendar.init', {'triposData': triposData});

        // Fetch the user's events
        if (!gh.data.me.anon) {

            // Put the calendar on today's view
            $(document).trigger('gh.calendar.navigateToToday');
        }
    };

    /**
     * Display the appropriate view depending on the state of the selected part
     *
     * @param  {Object}    ev      Standard jQuery event
     * @param  {Object}    data
     * @private
     */
    var onPartSelected = function(evt, data) {
        if (!data.modules.results.length) {
            gh.api.orgunitAPI.getOrgUnit(data.partId, true, function(err, data) {
                // Render the 'empty-timetable' template
                gh.utils.renderTemplate($('#gh-empty-template'), {
                    'data': {
                        'gh': gh,
                        'record': data
                    }
                }, $('#gh-empty'));
                $('#gh-left-container').addClass('gh-minimised');
                $('#gh-main').hide();
                $('#gh-empty').show();
                // Track the user selecting an empty part
                gh.utils.trackEvent(['Navigation', 'Draft timetable page shown']);
            });
        } else {
            $('#gh-left-container').removeClass('gh-minimised');
            $('#gh-empty').hide();
            $('#gh-main').show();
        }
    };

    /**
     * Render the login modal dialog used to prompt anonymous users to sign in
     *
     * @private
     */
    var renderLoginModal = function() {
        gh.utils.renderTemplate($('#gh-modal-template'), {
            'data': {
                'gh': gh,
                'isGlobalAdminUI': false
            }
        }, $('#gh-modal'));

        // Bind the validator to the login form
        $('.gh-signin-form').validator({
            'disable': false
        }).on('submit', doLogin);

        // Track an event when the login modal is shown
        $('#gh-modal-login').on('shown.bs.modal', function () {
            gh.utils.trackEvent(['Navigation', 'Authentication modal triggered']);
        });
    };


    /////////////////
    //  UTILITIES  //
    /////////////////

    /**
     * Log in using the local authentication strategy
     *
     * @param  {Event}    ev    The jQuery event
     * @private
     */
    var doLogin = function(ev) {
        // Log in to the system if the form is valid and local authentication is enabled.
        // If Shibboleth is required the native form behaviour will be used and no extra
        // handling is required
        if (!ev.isDefaultPrevented() && gh.config.enableLocalAuth && !gh.config.enableShibbolethAuth) {
            // Collect and submit the form data
            var formValues = _.object(_.map($(this).serializeArray(), _.values));
            gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
                if (err) {
                    return gh.utils.notification('Could not sign you in', 'Please check that you are entering a correct username & password', 'error');
                }
                window.location.reload();
            });

            // Avoid default form submit behaviour
            return false;
        }
    };

    /**
     * Log the current user out
     *
     * @param  {Event}    ev    The jQuery event
     * @private
     */
    var doLogout = function(ev) {
        // Prevent the form from being submitted
        ev.preventDefault();

        gh.api.authenticationAPI.logout(function(err) {
            if (err) {
                return gh.utils.notification('Logout failed', 'Logging out of the application failed', 'error');
            }
            window.location = '/';
        });
    };

    /**
     * Fetch the tripos data
     *
     * @param  {Function}    callback    Standard callback function
     * @private
     */
    var fetchTriposData = function(callback) {
        // Fetch the triposes
        gh.utils.getTriposStructure(null, false, function(err, data) {
            if (err) {
                return gh.utils.notification('Could not fetch triposes', constants.messaging.default.error, 'error');
            }

            // Cache the tripos data
            triposData = data;

            return callback();
        });
    };


    //////////////////////
    //  INITIALISATION  //
    //////////////////////

    /**
     * Add bindings to various elements on the page
     *
     * @private
     */
    var addBinding = function() {
        // Sign out the user when the form is submitted
        $('body').on('submit', '#gh-signout-form', doLogout);
        // Track an event when the user clicks the Cambridge logo
        $('body').on('click', '#gh-header-logo', function() {
            gh.utils.trackEvent(['Navigation', 'Cambridge Logo clicked'], null, null, function() {
                window.location = '/';
            });
        });

        $(document).on('gh.calendar.ready', setUpCalendar);
        $(document).on('gh.part.selected', onPartSelected);
    };

    /**
     * Initialise the page
     *
     * @private
     */
    var setUpIndex = function() {
        addBinding();

        // Fetch the tripos data before initialising the header and the calendar
        fetchTriposData(function() {
            setUpHeader();
            setUpCalendar();
            renderLoginModal();
        });
    };

    setUpIndex();
});

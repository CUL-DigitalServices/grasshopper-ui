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

define(['gh.core', 'gh.constants', 'gh.listview', 'gh.admin-listview', 'gh.admin-batch-edit', 'gh.calendar', 'gh.subheader', 'gh.video', 'clickover', 'jquery.jeditable', 'validator'], function(gh, constants) {

    // Cache the tripos data
    var triposData = {};


    /////////////////
    //  RENDERING  //
    /////////////////

    /**
     * Get the tripos structure from the REST API and filter it down for easy access in the templates
     *
     * @private
     */
    var getTriposData = function() {

        // Fetch the triposes
        gh.utils.getTriposStructure(null, function(err, data) {
            if (err) {
                return gh.utils.notification('Could not fetch triposes', constants.messaging.default.error, 'error');
            }

            // Cache the tripos data
            triposData = data;

            // Set up the tripos picker after all data has been retrieved
            // Initialise the subheader component after all data has been retrieved
            $(document).trigger('gh.subheader.init', {
                'triposData': triposData
            });
        });
    };

    /**
     * Render the header
     *
     * @param  {Function}    callback    Standard callback function
     * @private
     */
    var renderHeader = function(callback) {
        gh.utils.renderTemplate('admin-header-template', {
            'data': {
                'gh': gh,
                'isGlobalAdminUI': false
            }
        }, $('#gh-header'), callback);
    };

    /**
     * Render the help section
     *
     * @param  {Function}    callback    Standard callback function
     * @private
     */
    var renderHelp = function(callback) {
        gh.utils.renderTemplate('admin-help', null, $('#gh-main'), callback);
    };

    /**
     * Render the login form
     *
     * @param  {Function}    callback    Standard callback function
     * @private
     */
    var renderLoginForm = function() {
        $('#gh-subheader, #gh-content-description').height(350);

        // Render the login template
        gh.utils.renderTemplate('admin-login-template', {
            'gh': gh
        }, $('#gh-subheader'), function() {

            // Bind the validator to the login form
            $('body').on('submit', '.gh-signin-form', doLogin).validator({'disable': false});
        });
    };

    /**
     * Render the tripos pickers
     *
     * @param  {Function}    callback    Standard callback function
     * @private
     */
    var renderPickers = function(callback) {
        gh.utils.renderTemplate('admin-subheader-pickers', {
            'gh': gh
        }, $('#gh-subheader'), callback);
    };

    /**
     * Render the editable parts for the user
     *
     * @private
     */
    var renderEditableParts = function() {
        var editableParts = [];
        // Create an entry for each course. If the course has a subject, include the subject
        _.each(triposData.courses, function(course) {
            // Get the subjects that are children of the course
            var subjects = _.filter(triposData.subjects, function(subject) {
                return course.id === subject.ParentId;
            });

            // If there subjects for the course the data object needs to be slightly different
            if (subjects.length) {
                // Loop over all subjects
                _.each(subjects, function(subject) {
                    // Get the parts that are children of the subject
                    var parts = _.filter(triposData.parts, function(part) {
                        return subject.id === part.ParentId;
                    });

                    // For all parts that are children of the subject, create an object and push
                    // it into the Array
                    _.each(parts, function(part) {
                        editableParts.push({
                            'displayName': course.displayName + ' - ' + subject.displayName,
                            'hash': '?tripos=' + subject.id + '&part=' + part.id,
                            'canManage': course.canManage,
                            'part': part,
                            'isEditing': part.Group.LockedBy || false,
                            'isDraft': part.published
                        });
                    });
                });
            } else {
                // There are no subjects and children parts are attached to the course parent
                // Get all the parts that are children of the course
                var parts = _.filter(triposData.parts, function(part) {
                    return course.id === part.ParentId;
                });

                // For all parts that are children of the course, create an object and push
                // it into the Array
                _.each(parts, function(part) {
                    editableParts.push({
                        'displayName': course.displayName,
                        'hash': '?tripos=' + course.id + '&part=' + part.id,
                        'canManage': course.canManage,
                        'part': part,
                        'isEditing': part.Group.LockedBy || false,
                        'isDraft': part.published
                    });
                });
            }
        });

        // Render the editable parts template
        gh.utils.renderTemplate('editable-parts', {
            'data': {
                'editableParts': editableParts,
                'gh': gh,
                'hideVideo': gh.utils.localDataStorage().get('hideVideo')
            }
        }, $('#gh-main'));
    };

    /**
     * Show the new series form
     *
     * @param  {Object}    data    Object containing template data
     * @private
     */
    var renderNewSeriesForm = function(data) {
        gh.utils.renderTemplate('new-series', {
            'gh': gh,
            'data': data
        }, $('#gh-main'));
        // Focus the input field
        $('#gh-series-name').focus();
    };

    /**
     * Show the batch edit form
     *
     * @param  {Object}    data    Object containing template data
     * @private
     */
    var renderBatchEdit = function(data) {
        // Split the events by term
        data.eventsByTerm = gh.utils.splitEventsByTerm(data.events);
        // Delete the events object as it's been parsed into a different object
        delete data.events;
        // Order the events and split up the out of term events
        data.eventsByTerm = gh.utils.orderEventsByTerm(data.eventsByTerm);
        // Render the batch edit template
        gh.utils.renderTemplate('admin-batch-edit', {
            'data': {
                'gh': gh,
                'records': data
            }
        }, $('#gh-main'), function() {

            // Let the batch-edit plugin know that the HTML has been rendered
            $(document).trigger('gh.batchedit.rendered');
        });
    };

    /**
     * Show the tripos help info
     *
     * @private
     */
    var showTriposHelp = function() {
        gh.utils.renderTemplate('admin-tripos-help', null, $('#gh-modules-container'), function() {
            $('.gh-tripos-help').show();
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
            window.location = '/admin';
        });
    };


    /////////////
    //  VIDEO  //
    /////////////

    /**
     * Hide the help video
     *
     * @private
     */
    var hideVideo = function() {
        // Show the video in the list
        $('#gh-main-tripos .gh-video').show();
        // Hide the video on the top
        $('#gh-main-tripos .gh-video:first-child').hide();
        // Do not show the video next time
        gh.utils.localDataStorage().store('hideVideo', true);
        // Track the user hiding the video
        gh.utils.trackEvent(['Navigation', 'Home', 'Intro video collapsed']);
        // Stop the video
        $(document).trigger('gh.video.stop');
    };

    /**
     * Show the help video
     *
     * @private
     */
    var showVideo = function() {
        // Hide the video in the list
        $('#gh-main-tripos .gh-video').hide();
        // Show the video on the top
        $('#gh-main-tripos > .gh-video').show();
        // Scroll to the top to see the video
        $('body').animate({scrollTop: 0}, 200);
        // Start the video
        $(document).trigger('gh.video.play');
    };

    /**
     * Play the help video
     *
     * @private
     */
    var playVideo = function() {
        // Track the user playing the video
        gh.utils.trackEvent(['Navigation', 'Home', 'Intro video played']);
        showVideo();
        return false;
    };


    /////////////
    //  VIEWS  //
    /////////////

    /**
     * Handle the view changed event
     *
     * @param  {Event}     ev           The dispatched jQuery event
     * @param  {Object}    data         The event message object
     * @param  {String}    data.name    The name of the view
     * @param  {Object}    data.data    Object containing template data
     * @private
     */
    var onViewChange = function(ev, data) {
        setView(data.name, data.data);
    };

    /**
     * Change the current view
     *
     * @param  {String}    view    The name of the view that needs to be displayed
     * @param  {Object}    data    Object containing template data
     * @private
     */
    var setView = function(view, data) {
        switch(view) {
            case constants.views.NEW_SERIES:
                // Show the home button
                $('.gh-home').show();
                // Render the new series form
                renderNewSeriesForm(data);
                break;
            case constants.views.BATCH_EDIT:
                // Show the home button
                $('.gh-home').show();
                // Render the batch edit
                renderBatchEdit(data);
                break;
            // Show the editable parts for the admin by default
            default:
                // Hide the home button
                $('.gh-home').hide();
                // Render the editable parts
                renderEditableParts();
                break;
        }
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

        // Video events
        $('body').on('click', '.gh-hide-video', hideVideo);
        $('body').on('click', '.gh-play-video', playVideo);

        // logout
        $('body').on('submit', '#gh-signout-form', doLogout);

        // Track an event when the user clicks the Cambridge logo
        $('body').on('click', '#gh-header-logo', function() {
            gh.utils.trackEvent(['Navigation', 'Cambridge Logo clicked'], null, null, function() {
                window.location = '/admin/';
            });
        });

        // Change the view
        $(document).on('gh.admin.changeView', onViewChange);

        // Refresh the tripos data
        $(document).on('gh.triposdata.refresh', getTriposData);
    };

    /**
     * Initialise the page
     *
     * @private
     */
    var initIndex = function() {

        // Display the login form if the user is not authenticated
        if (gh.data.me && gh.data.me.anon) {
            // Add event handlers
            addBinding();

            // Render the header
            renderHeader(function() {

                // Only show the login form is local authentication is enabled and shibboleth is disabled
                if (gh.config.enableLocalAuth && !gh.config.enableShibbolethAuth) {

                    // Display the help link
                    renderHelp(function() {

                        // Render the login form
                        renderLoginForm();
                    });
                }
            });

        // Redirect the user if he's not authorised
        } else if (gh.data.me && !gh.data.me.isAdmin) {
            gh.utils.redirect().accessdenied();

        // Build up the admin layout
        } else {
            // Add event handlers
            addBinding();

            // Render the header
            renderHeader(function() {

                // Render the picker container
                renderPickers(function() {

                    // Fetch all the triposes
                    getTriposData();

                    // Show the tripos help info
                    showTriposHelp();
                });
            });
        }
    };

    initIndex();
});

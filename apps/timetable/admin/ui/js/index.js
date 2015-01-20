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

define(['gh.core', 'bootstrap.calendar', 'bootstrap.admin-listview', 'chosen', 'clickover', 'jquery-bbq'], function(gh) {

    // Cache the tripos data
    var triposData = {};


    ///////////////
    //  MODULES  //
    ///////////////

    var addNewModule = function() {
        $('#gh-modal-add-module').modal();
    };


    /////////////////
    //  RENDERING  //
    /////////////////

    /**
     * Get the tripos structure from the REST API and filter it down for easy access in the templates
     *
     * @private
     */
    var getTripos = function() {

        // Fetch the triposes
        gh.api.utilAPI.getTriposStructure(function(err, data) {
            if (err) {
                return gh.api.utilAPI.notification('Fetching triposes failed.', 'An error occurred while fetching the triposes.', 'error');
            }

            // Cache the tripos data
            triposData = data;

            // Set up the tripos picker after all data has been retrieved
            setUpTriposPicker();
        });
    };

    /**
     * Get the user's triposes
     *
     * @private
     */
    var getUserTripos = function() {
        /* TODO: replace this by available parts for the admin */
        gh.api.utilAPI.renderTemplate($('#gh-main-tripos-template'), {
            'data': null
        }, $('#gh-main'));
    };

    /**
     * Render the add module modal
     *
     * @private
     */
    var renderAddModuleModal = function() {
         gh.api.utilAPI.renderTemplate($('#gh-add-module-modal-template'), {
            'gh': gh
        }, $('#gh-add-module-modal'));
    };

    /**
     * Render the header
     *
     * @private
     */
    var renderHeader = function() {
        gh.api.utilAPI.renderTemplate($('#gh-header-template'), {
            'gh': gh
        }, $('#gh-header'));
    };

    /**
     * Render the help section
     *
     * @private
     */
    var renderHelp = function() {
        gh.api.utilAPI.renderTemplate($('#gh-help-template'), {
            'gh': gh
        }, $('#gh-main'));
    };

    /**
     * Render the login form
     *
     * @private
     */
    var renderLoginForm = function() {
        $('#gh-subheader, #gh-content-description').height(350);
        gh.api.utilAPI.renderTemplate($('#gh-login-template'), {
            'gh': gh
        }, $('#gh-subheader'));
    };

    /**
     * Render the tripos pickers
     *
     * @private
     */
    var renderPickers = function() {
        gh.api.utilAPI.renderTemplate($('#gh-subheader-pickers-template'), {
            'gh': gh
        }, $('#gh-subheader'));
    };

    /**
     * Set up the modules of events in the sidebar
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected part to fetch modules for
     * @private
     */
    var setUpModules = function(ev, data) {

        // Hide the tripos help text
        $('.gh-tripos-help').hide();
        var partId = parseInt(data.selected, 10);

        gh.api.orgunitAPI.getOrgUnits(gh.data.me.AppId, true, partId, ['module'], function(err, modules) {
            if (err) {
                gh.api.utilAPI.notification('Fetching modules failed.', 'An error occurred while fetching the modules.', 'error');
            }

            // Sort the data before displaying it
            modules.results.sort(gh.api.utilAPI.sortByDisplayName);
            $.each(modules.results, function(i, module) {
                module.Series.sort(gh.api.utilAPI.sortByDisplayName);
            });

            // Decorate the modules with their collapsed status if LocalStorage is supported
            var collapsedIds = [];
            if (Storage) {
                collapsedIds = _.compact(gh.api.utilAPI.localDataStorage().get('admin.collapsed'));
                _.each(modules.results, function(module) {
                    module.collapsed = (_.indexOf(collapsedIds, String(module.id)) > -1);
                });
            }

            // Render the series in the sidebar
            gh.api.utilAPI.renderTemplate($('#gh-modules-template'), {
                'data': modules.results
            }, $('#gh-modules-container'));

            // Clear local storage
            gh.api.utilAPI.localDataStorage().remove('admin.collapsed');

            // Add the current collapsed module(s) back to the local storage
            collapsedIds = _.compact([$('.gh-list-group-item-open').attr('data-id')]);
            gh.api.utilAPI.localDataStorage().store('admin.collapsed', collapsedIds);
        });
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

        // Get the parts associated to the selected tripos
        var parts = _.filter(triposData.parts, function(part) {
            return parseInt(data.selected, 10) === part.ParentId;
        });

        // Render the results in the part picker
        gh.api.utilAPI.renderTemplate($('#gh-subheader-part-template'), {
            'data': parts
        }, $('#gh-subheader-part'));

        // Show the subheader part picker
        $('#gh-subheader-part').show();

        // Destroy the field if it's been initialised previously
        $('#gh-subheader-part').chosen('destroy').off('change', setUpModules);

        // Initialise the Chosen plugin on the part picker
        $('#gh-subheader-part').chosen({
            'no_results_text': 'No matches for',
            'disable_search_threshold': 10
        }).on('change', setUpModules);
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
        gh.api.utilAPI.renderTemplate($('#gh-subheader-picker-template'), {
            'data': triposPickerData
        }, $('#gh-subheader-tripos'));

        // Show the subheader tripos picker
        $('#gh-subheader-tripos').show();

        // Destroy the field if it's been initialised previously
        $('#gh-subheader-tripos').chosen('destroy').off('change', setUpModules);

        // Initialise the Chosen plugin on the tripos picker
        $('#gh-subheader-tripos').chosen({
            'no_results_text': 'No matches for'
        }).change(setUpPartPicker);
    };

    /**
     * Show the tripos help info
     *
     * @private
     */
    var showTriposHelp = function() {
        gh.api.utilAPI.renderTemplate($('#gh-tripos-help-template'), {
            'data': null
        }, $('#gh-modules-container'));
        $('.gh-tripos-help').show();
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

        // Prevent the form from being submitted
        ev.preventDefault();

        // Collect and submit the form data
        var formValues = _.object(_.map($(this).serializeArray(), _.values));
        gh.api.authenticationAPI.login(formValues.username, formValues.password, function(err) {
            if (!err) {
                window.location = '/admin';
            } else {
                gh.api.utilAPI.notification('Login failed', 'Logging in to the application failed', 'error');
            }
        });
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
            if (!err) {
                window.location = '/admin';
            } else {
                gh.api.utilAPI.notification('Logout failed', 'Logging out of the application failed', 'error');
            }
        });
    };


    /////////////
    //  VIDEO  //
    /////////////

    /**
     * Initialise the video
     *
     * @private
     */
    var initVideo = function() {
        if (gh.api.utilAPI.localDataStorage().get('hideVideo')) {
            return hideVideo();
        }
        showVideo();

        // Do not show the video the next time
        gh.api.utilAPI.localDataStorage().store('hideVideo', true);
    };

    /**
     * Hide the help video
     *
     * @private
     */
    var hideVideo = function() {
        $('.gh-video').hide();
        $('.gh-show-video').show();
        return false;
    };

    /**
     * Show the help video
     *
     * @private
     */
    var showVideo = function() {
        $('.gh-video').show();
        $('.gh-show-video').hide();
        return false;
    };

    /**
     * Play the help video
     *
     * @private
     */
    var playVideo = function() {
        return false;
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
        $('body').on('click', '.gh-show-video', showVideo);
        $('body').on('click', '.gh-hide-video', hideVideo);
        $('body').on('click', '.gh-play-video', playVideo);

        // Modules
        $('body').on('click', '.gh-new-module', addNewModule);

        // Login and logout
        $('body').on('submit', '#gh-signin-form', doLogin);
        $('body').on('submit', '#gh-signout-form', doLogout);
    };

    /**
     * Initialise the page
     *
     * @private
     */
    var initIndex = function() {
        addBinding();
        renderHeader();
        renderAddModuleModal();

        // Display the login form if the user is not authenticated
        if (gh.data.me && gh.data.me.anon) {

            // Display the help link
            renderHelp();

            // Render the login form
            renderLoginForm();

            // Hide the current academic year on the left hand side
            $('#gh-content-description p').hide();

        } else {

            // Render the picker container
            renderPickers();

            // Fetch all the triposes
            getTripos();

            // Fetch the user's triposes
            getUserTripos();

            // Show the tripos help info
            showTriposHelp();

            // Initialise the video
            initVideo();

            // Show the current academic year on the left hand side
            $('#gh-content-description p').show();
        }
    };

    initIndex();
});

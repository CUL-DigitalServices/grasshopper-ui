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

define(['gh.core', 'jquery.jeditable'], function(gh) {

    // Keep track of when the user started
    var timeFromStart = null;

    /**
     * Get all organisers that were previously added to the AutoSuggest field
     *
     * @param  {String}    original    The containing HTML element
     * @return {User[]}                Array of User objects of all organisers previously added to the AutoSuggest field
     * @private
     */
    var getDefaultAutoSuggestUsers = function(original) {
        var defaultOrganiserFields = $(original).prev('.gh-event-organisers-fields').find('input');
        var defaultOrganisers = [];

        _.each(defaultOrganiserFields, function($organiser) {
            $organiser = $($organiser);

            if ($organiser.attr('data-add') === 'true') {
                defaultOrganisers.push({
                    'id': $organiser.attr('data-id') ? $organiser.attr('data-id') : $organiser.val(),
                    'displayName': $organiser.val()
                });
            }
        });

        return defaultOrganisers;
    };

    // Create a custom jEditable autosuggest element
    $.editable.addInputType('organiser-autosuggest', {

        /**
         * Create an AutoSuggest component and attach it to the generated form.
         * The form is available inside the function as variable this.
         *
         * @param  {Object}    settings    The jEditable field settings
         * @param  {String}    original    The containing HTML element
         * @private
         */
        'element' : function(settings, original) {
            var that = $(this);

            // Render the organiser template
            gh.utils.renderTemplate('admin-batch-edit-organiser', {
                'data': {
                    'id': 'gh-event-select-' + String(Math.ceil(Math.random() * 10000))
                }
            }, null, function(content) {
                $(that).append(content);
                return that;
            });
        },

        /**
         * Set the default jEditable field content
         *
         * @private
         */
        'content': function() {
            return '';
        },

        /**
         * Extend the jEditable behaviour with custom logic
         *
         * @param  {Object}    settings    The jEditable field settings
         * @param  {String}    original    The containing HTML element
         * @private
         */
        'plugin': function(settings, original) {
            var defaultOrganisers = getDefaultAutoSuggestUsers(original);

            // Track how long the user takes to adjust the organisers
            timeFromStart = new Date();

            // Track the user editing the organisers
            gh.utils.trackEvent(['Data', 'Lecturer edit', 'Started']);

            // Initialise the autosuggest plugin on the editable field
            $('.gh-organiser-autosuggest', this).autoSuggest('/api/users', {
                'asHtmlID': gh.utils.generateRandomString(),
                'minChars': 2,
                'neverSubmit': true,
                'onblur': 'submit',
                'preFill': defaultOrganisers,
                'retrieveLimit': 10,
                'url': '/api/users',
                'searchObjProps': 'id, displayName',
                'selectedItemProp': 'displayName',
                'selectedValuesProp': 'id',
                'startText': 'Lecturers',
                'usePlaceholder': true,
                'resultsComplete': function() {
                    // Track the user if no results come up
                    if (!$(original).find('.as-results li.as-result-item').length) {
                        gh.utils.trackEvent(['Data', 'Lecturer edit', 'Autocomplete no results shown']);
                    }
                },
                'retrieveComplete': function(data) {
                    // Append the shibbolethId to the displayName to make it easier to distinguish between users
                    _.each(data.results, function(user) {
                        var suffix = user.shibbolethId ? ' (' + user.shibbolethId + ')' : '';
                        user.displayName = user.displayName + suffix;
                    });
                    return data.results;
                },
                'selectionAdded': function(elem, id) {
                    // Construct the user object that was added
                    var user = {
                        'id': id.toString(),
                        'displayName': elem.text().slice(1)
                    };

                    // Update the hidden fields
                    var $hiddenFields = $(elem).closest('.gh-event-organisers').prev('.gh-event-organisers-fields');
                    // The new field to create, if required
                    var $field = null;
                    // Update the hidden field if it exists already
                    if ($hiddenFields.find('input[value="' + user.displayName + '"]').length) {
                        // The hidden field exists already, make sure it's marked as 'to add'
                        $hiddenFields.find('input[value="' + user.displayName + '"]').attr('data-add', true);
                        // If the hidden field has a data-id, it's an existing user in the database
                        if ($hiddenFields.find('input[value="' + user.displayName + '"]').attr('data-id')) {
                            // Track the user editing the organisers
                            gh.utils.trackEvent(['Data', 'Lecturer edit', 'Autocomplete userID selected']);
                        } else {
                            // Track the user editing the organisers
                            gh.utils.trackEvent(['Data', 'Lecturer edit', 'Freetext entered']);
                        }
                    // Create the hidden field if it doesn't exist yet
                    } else {
                        // Create the hidden field element
                        $field = $('<input type="hidden" name="gh-event-organiser" value="' + user.displayName + '" data-add="true">');

                        // Try to parse the ID, if it fails that means we have a new user, not in the system
                        var hasId = false;
                        try {
                            hasId = parseInt(user.id, 10);
                        } catch (err) {
                            hasId = false;
                        }

                        // If the user exists in the system, add the ID to the hidden field
                        if (hasId) {
                            $field.attr('data-id', user.id);
                            // Track the user editing the organisers
                            gh.utils.trackEvent(['Data', 'Lecturer edit', 'Autocomplete userID selected']);
                        } else {
                            // Track the user editing the organisers
                            gh.utils.trackEvent(['Data', 'Lecturer edit', 'Freetext entered']);
                        }

                        // Add the hidden field
                        $(elem).closest('.gh-event-organisers').prev('.gh-event-organisers-fields').append($field);
                    }
                },
                'selectionRemoved': function(elem) {
                    // Construct the user object that was removed
                    var user = {
                        'id': $(elem).data('value').toString(),
                        'displayName': elem.text().slice(1)
                    };

                    // Update the hidden fields
                    var $hiddenFields = $(elem).closest('.gh-event-organisers').prev('.gh-event-organisers-fields');

                    // Update the hidden field if it exists already
                    if ($hiddenFields.find('input[value="' + user.displayName + '"]').length) {
                        // The hidden field exists already, make sure it's NOT marked as 'to add'
                        $hiddenFields.find('input[value="' + user.displayName + '"]').attr('data-add', false);
                    }

                    // Remove the element from the AutoSuggest field
                    elem.remove();

                    // Track the user removing an AutoSuggest field
                    gh.utils.trackEvent(['Data', 'Lecturer edit', 'Item removed']);
                }
            });

            /**
             * Submit the AutoSuggest field and detach all event handlers from it
             *
             * @param  {[type]}    _this       The AutoSuggest container object
             * @param  {String}    original    The containing HTML element
             * @private
             */
            var submitAutoSuggest = function(_this, original) {
                // Remove event handlers from the AutoSuggest field
                $(document).off('click', 'body', closeAutoSuggest);
                $('input', _this).off('focusout', closeAutoSuggest);
                // Submit the form
                $(original).find('form').submit();
            };

            /**
             * Close the autosuggest
             *
             * @param  {Event}    ev    Standard jQuery event
             * @private
             */
            var closeAutoSuggest = function(ev) {
                // Only close the input if the focus was lost on an element outside of the organiser container
                if (!$(ev.target).closest('.gh-event-organisers').length || !$(ev.relatedTarget).closest('.gh-event-organisers').length) {
                    // The form shouldn't be submitted when a click was triggered by pressing the space
                    if (ev.type !== 'click') {
                        // Submit the AutoSuggest field
                        submitAutoSuggest(this, original);

                        // Calculate how long it takes the user to change the date
                        timeFromStart = (new Date() - timeFromStart) / 1000;
                        // Track the user editing organisers
                        gh.utils.trackEvent(['Data', 'Lecturer edit', 'Completed'], {
                            'time_from_start': timeFromStart
                        });

                        // If there is a relatedTarget set on the event that triggered the function, focus on it
                        if ($(ev.relatedTarget).length) {
                            $(ev.relatedTarget).focus();
                        }
                    }
                }
            };

            // Close the autosuggest when the body is clicked
            $(document).on('click', 'body', closeAutoSuggest);
            // Close the autosuggest when focus is lost
            $('input', this).on('focusout', closeAutoSuggest);
        }
    });
});

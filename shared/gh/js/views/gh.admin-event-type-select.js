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

define(['gh.core', 'jquery.jeditable'], function(gh) {

    // Create a custom jEditable select box
    $.editable.addInputType('event-type-select', {

        /**
         * Create a form element and attach it to the generated form.
         * The form is available inside the function as variable this.
         *
         * @param  {Object}    settings    the jEditable field settings
         * @param  {String}    original    the containing HTML element
         * @private
         */
        'element' : function(settings, original) {
            var that = $(this);

            // Add a class to the table cell
            $(original).addClass('gh-editing');
            // Render the event type select box template
            gh.utils.renderTemplate('admin-batch-edit-event-type', {
                'data': {
                    'id': 'gh-event-select-' + String(Math.ceil(Math.random() * 10000)),
                    'types': gh.config.events.types,
                    'disable': settings.disable
                }
            }, function(content) {
                ($that).append(content);
                // Add a hidden input field that stores the selected value
                var hidden = $('<input type="hidden">');
                $(that).append(hidden);
                return(hidden);
            });
        },

        /**
         * Set the default value
         *
         * @param  {String}    data        object containing the element data
         * @param  {Object}    settings    the jEditable field settings
         * @param  {String}    original    the containing HTML element
         * @private
         */
        'content': function(value, settings, original) {
            var eventType = $(original).attr('data-type');
            if (eventType) {
                $(this).find('select option[value="' + eventType + '"]').attr('selected', 'selected');
            }
        },

        /**
         * Extend the jEditable behaviour with custom logic
         *
         * @param  {Object}    settings    the jEditable field settings
         * @param  {String}    original    the containing HTML element
         * @private
         */
        'plugin': function(settings, original) {
            $('select', this).on('change', function() {
                // Store the selected value in the hidden input field
                $(this).parent().find('input[type="hidden"]').val($(this).val());
                // Store the selected value in the `data-type` attribute
                $(this).closest('td').attr('data-type', $(this).val());
                // Store the first letter of the selected value in the `data-first` attribute
                $(this).closest('td').attr('data-first', $(this).val().substr(0,1));
                // Submit the form
                $(this).closest('form').trigger('submit');
            });
            $('select', this).on('focusout', function() {
                // Show the event type icon
                $(original).removeClass('gh-editing');
                // Reset the form
                original.reset(this);
            });
        }
    });
});

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

define(['gh.core', 'gh.constants'], function(gh, constants) {


    ///////////////
    // RENDERING //
    ///////////////

    /**
     * Render configuration functionality and show the container
     *
     * @private
     */
    var renderConfig = function(tenants) {
        // Render the configuration template
        gh.utils.renderTemplate('global-admin-configuration', {
            'gh': gh,
            'tenants': tenants
        }, $('#gh-main'));
    };


    ///////////////
    // UTILITIES //
    ///////////////

    /**
     * Submit the configuration form and save the values
     *
     * @return {Boolean}    Avoid default form submit behaviour
     * @private
     */
    var updateConfiguration = function() {
        var $form = $(this);

        // Serialise the form values into an object that can be sent to the server
        var configValues = _.object(_.map($form.serializeArray(), _.values));

        // Standards say that unchecked checkboxes shouldn't be sent over to the server. Too bad, we need to add them
        // in explicitely as config values might have changed.
        _.each($('[type="checkbox"]:not(:checked)', $form), function(chk) {
            configValues[$(chk).attr('name')] = $(chk).is(':checked');
        });

        // Update the configuration
        gh.api.configAPI.updateConfig($form.data('appid'), configValues, function(err) {
            if (err) {
                return gh.utils.notification('System configuration not updated', constants.messaging.default.error, 'error');
            }
            return gh.utils.notification('System configuration updated', null, 'success');
        });

        // Avoid default form submit behaviour
        return false;
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various components
     *
     * @private
     */
    var addBinding = function() {

        // Submit configuration values
        $('body').on('submit', '.gh-configuration-form', updateConfiguration);

        // Rendering
        $(document).on('gh.global-admin.renderConfig', function(evt, msg) {
            renderConfig(msg.tenants);
        });
    };

    addBinding();
});

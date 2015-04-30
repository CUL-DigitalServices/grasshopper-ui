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

define(['exports', 'gh.constants'], function(exports, constants) {

    // The cached partials;
    var partials = {};

    /**
     * Cache a partial
     *
     * @param  {String}      partial     The name of the partial that needs to be cached
     * @param  {Function}    callback    Standard callback function
     * @throws {Error}                   Default error
     */
    var _cachePartial = function(partial, callback) {

        // Construct the path to the partial
        var path = 'text!/shared/gh/partials/' + partial + '.html';

        // Request the partial file
        try {
            require([path], function(template) {

                // Cache the partial
                partials[partial] = template;

                // Return the partial file
                return callback(template);
            });

        // Throw an error if an error occurred
        } catch (err) {
            throw new Error('An error occurred while caching the partial');
        }
    };

    /**
     * Render a partial
     *
     * @param  {String}            template     The template that needs to be rendered
     * @param  {Object}            data         The template data
     * @param  {Element|String}    [$target]    jQuery element representing the HTML element in which the template output should be put, or jQuery selector for the output container
     * @return {Object}                         The compiled template
     * @throws {Error}                          Default error
     */
    var _renderTemplate = function(template, data, $target) {

        // Make sure we're dealing with jQuery objects
        $template = $(template);
        $target = $($target);

        // Ensure we don't have an empty data object
        data = data || {};

        // Compile the template
        var compiled = _.template(template);
        compiled = compiled(data);

        // Render the partial in the target, if provided
        if ($target) {
            $target.html(compiled);
        }

        // Return the compiled template
        return compiled;
    };

    /**
     * Render a template and cache it
     *
     * @param  {String}            partial       The name of the partial that needs to be rendered
     * @param  {Object}            data          The template data
     * @param  {Element|String}    [$target]     jQuery element representing the HTML element in which the template output should be put, or jQuery selector for the output container
     * @param  {Function}          [callback]    Standard callback function
     * @throws {Error}                           Default error
     */
    var renderTemplate = exports.renderTemplate = function(partial, data, $target, callback) {
        if (!_.isString(partial)) {
            throw new Error('An invalid value for partial was provided');
        } else if (data && !_.isObject(data)) {
            throw new Error('An invalid value for data was provided');
        } else if ($target && (!_.isString($target) && !_.isObject($target))) {
            throw new Error('An invalid value for $target was provided');
        } else if (callback && !_.isFunction(callback)) {
            throw new Error('An invalid value for callback was provided');
        }

        // Ensure we always have a callback function
        callback = callback || function() {};

        // Render the partial straight away if it already has been cached
        if (!partials[partial]) {

            // Cache the partial
            return _cachePartial(partial, function(template) {

                // Render and return the partial
                callback(_renderTemplate(template, data, $target));
            });
        }

        // Render and return the partial
        callback(_renderTemplate(partials[partial], data, $target));
    };

    /**
     * Render and return the hierarchy string
     *
     * @param  {Object}    orgUnit      The organisational unit to start building the hierarchy structure with
     * @param  {String}    separator    The string used to split the organisational units
     * @return {String}                 The generated hierarchy string
     * @throws {Error}                           Default error
     */
    var renderHierarchyString = exports.renderHierarchyString = function(orgUnit, separator) {
        if (!_.isObject(orgUnit)) {
            throw new Error('An invalid value for orgUnit has been provided');
        } else if (!_.isString(separator)) {
            throw new Error('An invalid value for separator has been provided');
        }

        // Store the organisational units' display names
        var hierarchy = [];

        /**
         * Retrieve the display name for each parent object in the tree structure and return
         * the hierarchy string when no more parents are available
         *
         * @param  {Object}             The organisational unit to return the display name from
         * @return {Function|String}    The recursive function or the generated hierarchy string
         * @private
         */
        var _renderHierarchyString = function(orgUnit) {
            hierarchy.push('<span>' + orgUnit.displayName + '</span>');
            if (orgUnit.Parent) {
                return _renderHierarchyString(orgUnit.Parent);
            } else {
                return hierarchy.reverse().join(separator);
            }
        };

        // Start rendering the hierarchy string
        return _renderHierarchyString(orgUnit);
     };

    /**
     * Initialise the partials
     *
     * @private
     */
    var init = function() {

        // Add our own functions to lodash to declare and access partials
        _.mixin({
            'renderPartial': function(name, data, target) {
                if (!name) {
                    throw new Error('An invalid value for name was provided');
                } else if (data && !_.isObject(data)) {
                    throw new Error('An invalid value for data was provided');
                } else if (!target) {
                    throw new Error('An invalid value for target was provided');
                }

                renderTemplate(name, data, null, function(compiled) {
                    $(target).html(compiled);
                });
            }
        });
    };

    init();
});

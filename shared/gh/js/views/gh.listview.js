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

define(['gh.utils', 'gh.api.orgunit', 'gh.constants'], function(utils, orgunitAPI, constants) {

    // Whether to preselect the first module and series or not
    var preselect = false;

    /**
     * Set up the modules of events in the sidebar. Note that context-specific handling should be done
     * in the appropriate components
     *
     * @param  {Event}     ev      Standard jQuery event
     * @param  {Object}    data    Data object describing the selected part to fetch modules for
     * @private
     */
    var setUpModules = function(ev, data) {

        // Assign a default container if it's not defined in the data
        data.container = data.container || $('body');
        // Assign a default template if it's not defined in the data
        // data.template = data.template || 'student-modules';
        data.template = 'student-modules';
        // Cache the modules
        var modules = data.modules;

        // Sort the data before displaying it
        modules.results.sort(utils.sortByDisplayName);
        $.each(modules.results, function(i, module) {

            // Decorate the series with their parent info
            utils.decorateBorrowedSeriesWithParentInfo(module.Series);

            // Sort the series by their display name
            module.Series.sort(utils.sortByDisplayName);
        });

        // Decorate the modules with their expanded status if LocalStorage is supported
        var expandedIds = [];
        if (Storage) {
            expandedIds = _.compact(utils.localDataStorage().get('expanded'));
            _.each(modules.results, function(module) {
                module.expanded = (_.indexOf(expandedIds, String(module.id)) > -1);
            });
        }

        // Render the series in the sidebar
        utils.renderTemplate(data.template, {
            'data': {
                'modules': modules.results,
                'state': History.getState().data,
                'preselect': preselect
            }
        }, $('#gh-modules-container', $(data.container)), function() {

            // Reset the preselect value for next iteration
            if (preselect) {
                preselectSeries();
            }

            // Put focus on the selected series
            $('.gh-series-active').focus();

            // Clear local storage
            utils.localDataStorage().remove('expanded');

            // Add the current expanded module(s) back to the local storage
            expandedIds = $('.gh-list-group-item-open', $(data.container)).map(function(index, value) {
                return $(value).attr('data-id');
            });

            expandedIds = _.map(expandedIds, function(id) { return id; });
            utils.localDataStorage().store('expanded', expandedIds);
        });
    };

    /**
     * Preselect the first module and first series inside of that module when the modules list has
     * been rendered in the UI. In case it's not been rendered yet, a flag is set which will make
     * sure the function is executed again after the list has been rendered.
     *
     * @private
     */
    var preselectSeries = function() {
        // Preselect the series if the modules list has been loaded already. If it still
        // needs to be rendered, set a variable indicating that preselection needs to happen
        // Get the first available series
        var $firstSeries = $($('#gh-modules-list li.list-group-item > ul > li:first-child')[0]);
        // Get the first series' parent module
        var $firstModule = $($firstSeries.parents('li.list-group-item'));

        // If both module and series are defined, open them up
        if ($firstModule.length && $firstSeries.length) {
            utils.addToState({
                'module': $firstModule.attr('data-id'),
                'series': $firstSeries.attr('data-id')
            }, true);
            // Reset the preselect value for the next iteration
            preselect = false;
        } else {
            $(document).trigger('gh.admin.changeView', {'name': constants.views.EDITABLE_PARTS});
            preselect = true;
        }
    };


    /////////////
    // UTILITY //
    /////////////

    /**
     * Update the list's expanded status in the local storage
     *
     * @param  {Object[]}    items    Collection of list items
     * @private
     */
    var updateListExpandedStatus = function(items) {
        // Fetch and parse the collapse listIds from the local storage
        var expandedIds = utils.localDataStorage().get('expanded') || [];

        _.each(items, function(item) {

            // Add the listId to the local storage if expanded
            if (item.expanded) {
                expandedIds.push(item.id);

            // Remove the listId from the local storage if not expanded
            } else {
                _.remove(expandedIds, function(listId) { return listId === item.id; });
            }
        });

        // Store the expanded listIds
        utils.localDataStorage().store('expanded', _.uniq(_.compact(expandedIds)));
    };

    /**
     * Toggle a list item's children's visibility and update the icon classes
     *
     * @private
     */
    var toggleList = function() {
        // Toggle the child lists
        var $module = $($(this).closest('.list-group-item'));
        $module.toggleClass('gh-list-group-item-open');
        // Toggle the caret class of the icon that was clicked
        $(this).find('i').toggleClass('fa-caret-right fa-caret-down');

        // Fetch the IDs of the expanded list
        var expandedItems = $('#gh-modules-list > .list-group-item', $(this).closest('#gh-modules-container')).map(function(index, module) {
            return {
                'id': $(module).attr('data-id'),
                'expanded': $(module).hasClass('gh-list-group-item-open')
            };
        });

        // Send an event when the module has been opened or closed
        var verb = $module.hasClass('gh-list-group-item-open') ? 'opened' : 'closed';
        utils.trackEvent(['Navigation', 'Module ' + verb], {
            'module': $module.attr('data-id')
        });

        // Store the expanded list items
        updateListExpandedStatus(expandedItems);
    };

    /**
     * Toggle the collapse class on the html which hides certain things from view
     *
     * @private
     */
    var toggleModulesCollapse = function() {
        // Scroll to the top first for the best animation experience
        window.scrollTo(0, 0);

        // Toggle the gh-collapsed class which triggers all animations
        $('html').toggleClass('gh-collapsed');

        // If the modules are toggled, set the display of the module list to none
        if ($('html').hasClass('gh-collapsed')) {
            setTimeout(function() {
                // Hide the modules list after the animations complete
                $('#gh-modules-list').css('display', 'none');
                // Toggle the animation finished class
                $('html').toggleClass('gh-collapsed-finished');
                // Trigger a window resize event to let all components adjust themselves
                $(window).trigger('resize');
            }, 300);
        } else {
            // Show the modules list before the animation starts
            $('#gh-modules-list').css('display', 'block');
            // Toggle the animation finished class
            $('html').toggleClass('gh-collapsed-finished');
            setTimeout(function() {
                // Trigger a window resize event to let all components adjust themselves
                $(window).trigger('resize');
            }, 300);
        }
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various listview elements
     *
     * @private
     */
    var addBinding = function() {
        // Toggle a list item
        $('body').on('click', '.gh-toggle-list', toggleList);

        // Set up the modules list
        $(document).on('gh.part.selected', setUpModules);
        // Refresh the modules list
        $(document).on('gh.listview.refresh', setUpModules);
        // Select the first module and series in the list
        $(document).on('gh.listview.preselect', preselectSeries);
        // Responsive collapse/expand
        $(document).on('click', '.gh-collapse-modules', toggleModulesCollapse);
    };

    addBinding();
});

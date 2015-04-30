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

define(['gh.core', 'gh.constants', 'gh.api.series', 'gh.api.orgunit'], function(gh, constants, seriesAPI, orgUnitAPI) {

    // Cache whether the series is borrowed from another module
    var isBorrowedFrom = false;

    /**
     * Remove the series from the current hash state
     *
     * @private
     */
    var removeSeriesFromState = function() {
        gh.utils.removeFromState(['series', 'module']);
    };

    /**
     * Remove a series from the module
     *
     * @private
     */
    var removeSeriesFromModule = function() {
        // Get the ID of the series to remove
        var seriesId = parseInt(History.getState().data.series, 10);
        // Get the ID of the module to remove the series from
        var moduleId = parseInt(History.getState().data.module, 10);

        // Remove the series from the module
        gh.api.orgunitAPI.deleteOrgUnitSeries(moduleId, seriesId, function(err) {
            if (err) {
                // Show a failure notification
                return gh.utils.notification('Could not remove series ' + $('.gh-jeditable-series-title').text(), constants.messaging.default.error, 'error');
            }

            // Hide the modal
            $('#gh-delete-series-modal').modal('hide');

            // Remove the series from the navigation
            $('.list-group-item[data-id="' + seriesId + '"]').remove();

            // Remove the series from the state
            removeSeriesFromState();

            // Show a success notification
            gh.utils.notification($('.gh-jeditable-series-title').text() + ' has been removed', null, 'success');
        });
    };

    /**
     * Delete the series from the module and system
     *
     * @private
     */
    var deleteSeries = function() {
        // Get the ID of the series to delete
        var seriesId = parseInt(History.getState().data.series, 10);

        // Delete the series
        gh.api.seriesAPI.deleteSeries(seriesId, function(err) {
            if (err) {
                // Show a failure notification
                return gh.utils.notification('Could not delete series ' + $('.gh-jeditable-series-title').text(), constants.messaging.default.error, 'error');
            }

            // Hide the modal
            $('#gh-delete-series-modal').modal('hide');

            // Remove the series from the navigation
            $('.list-group-item[data-id="' + seriesId + '"]').remove();

            // Remove the series from the state
            removeSeriesFromState();

            // Show a success notification
            gh.utils.notification($('.gh-jeditable-series-title').text() + ' deleted successfully', null, 'success');
        });
    };

    /**
     * Retrieve data for organisational units linked to a series through having borrowed the series
     *
     * @param  {Object}      series             The series to get the associated modules' data for
     * @param  {Function}    callback           Standard callback function
     * @param  {Object}      callback.series    The modified series object with a `part` and `tripos` data object on each organisational unit
     * @private
     */
    var getModuleData = function(series, callback) {
        var todo = series.OrgUnits.length;
        var done = 1;

        /**
         * Retrieve data for an organisational unit and its parent tripos
         *
         * @param  {Object}      orgUnit      The organisational unit to get data for
         * @param  {Function}    _callback    Standard callback function
         * @private
         */
        var getModule = function(orgUnit, _callback) {
            // Get the organisational unit (part)
            orgUnitAPI.getOrgUnit(orgUnit.ParentId, false, function(err, _orgUnit) {
                if (err) {
                    // Show a failure notification
                    return gh.utils.notification('Could not fetch module', constants.messaging.default.error, 'error');
                }

                // Cache the part object on the series
                series.OrgUnits[done].part = _orgUnit;

                // Get the parent of the organisational unit (tripos)
                orgUnitAPI.getOrgUnit(_orgUnit.ParentId, false, function(err, _orgUnit) {
                    if (err) {
                        // Show a failure notification
                        return gh.utils.notification('Could not fetch module', constants.messaging.default.error, 'error');
                    }

                    // Cache the tripos object on the series
                    series.OrgUnits[done].tripos = _orgUnit;

                    done++;
                    // When we're done, execute the callback
                    if (todo === done) {
                        _callback();
                    // Call itself when more organisational units need to be fetched
                    } else {
                        getModule(series.OrgUnits[done], _callback);
                    }
                });
            });
        };

        // The first orgunit in the series is the original module where other modules borrow from,
        // so we start fetching data from the second orgunit on.
        if (todo >= 2) {
            getModule(series.OrgUnits[1], function() {
                callback(series);
            });
        } else {
            callback(series);
        }
    };

    /**
     * Determine how to remove the series from the module
     *
     * @private
     */
    var submitDeleteSeries = function() {
        // If the series is borrowed from another module, only remove it from this series
        if (isBorrowedFrom) {
            removeSeriesFromModule();
            // Track the user removing a borrowed series from a module
            gh.utils.trackEvent(['Manage', 'Remove borrowed series'], {
                'is_borrowed': true
            });
        // If the series is not borrowed by or from another module, it can be deleted
        } else {
            // Track the user removing a series from a module
            gh.utils.trackEvent(['Manage', 'Delete series'], {
                'is_borrowed': false
            });
            deleteSeries();
        }
    };

    /**
     * Return whether or not the series is borrowed to another module
     *
     * @param  {Object}     series    The series to determine it was borrowed to another module or not
     * @return {Boolean}              Return `true` if the series was borrowed to another module, `false` if not
     * @private
     */
    var getIsBorrowedTo = function(series) {
        return (series.OrgUnits.length > 1);
    };

    /**
     * Return whether or not the series is borrowed from another module
     *
     * @param  {Object}     series     The series to determine was borrowed or not
     * @param  {Object}     module     The module in which the series is found
     * @return {Boolean}               Return `true` if the series was borrowed from another module, `false` if not
     * @private
     */
    var getIsBorrowedFrom = function(series, module) {
        var isBorrowed = false;

        // The backend returns the original module as the first item in the OrgUnits Array.
        // If that module is not the same as the module we're in, the series is borrowed from another module.
        if (series.OrgUnits && series.OrgUnits.length) {
            if (series.OrgUnits[0].id !== module.id) {
                isBorrowed = true;
            }
        }

        return isBorrowed;
    };

    /**
     * Render and show the 'delete series' modal dialog
     *
     * @private
     */
    var setUpDeleteSeriesModal = function() {
        var seriesId = parseInt(History.getState().data.series, 10);
        var moduleId = parseInt(History.getState().data.module, 10);

        gh.api.seriesAPI.getSeries(seriesId, true, function(seriesErr, series) {
            if (seriesErr) {
                gh.utils.notification('Could not fetch series', constants.messaging.default.error, 'error');
            }

            gh.api.orgunitAPI.getOrgUnit(moduleId, false, function(moduleErr, module) {
                if (moduleErr) {
                    gh.utils.notification('Could not fetch module', constants.messaging.default.error, 'error');
                }

                isBorrowedFrom = getIsBorrowedFrom(series, module);
                var isBorrowedTo = getIsBorrowedTo(series, module);

                getModuleData(series, function(series) {
                    // Render the modal
                    gh.utils.renderTemplate('delete-series-modal', {
                        'data': {
                            'series': series,
                            'module': module,
                            'isBorrowedFrom': isBorrowedFrom,
                            'isBorrowedTo': isBorrowedTo
                        }
                    }, $('#gh-delete-series-modal-container'), function() {

                        // Show the modal
                        $('#gh-delete-series-modal').modal();
                    });
                });
            });
        });
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the delete series modal
     *
     * @private
     */
    var addBinding = function() {
        $('body').on('click', '.gh-delete-series', setUpDeleteSeriesModal);
        $('body').on('click', '#gh-delete-series-delete', submitDeleteSeries);
    };

    addBinding();
});

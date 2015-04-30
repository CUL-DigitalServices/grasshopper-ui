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

define(['gh.core', 'gh.constants', 'gh.api.orgunit', 'gh.api.series'], function(gh, constants, orgUnitAPI, seriesAPI) {

    // Cache the ID of the module that's being deleted
    var moduleId = null;
    // Cache the IDs of the series that where borrowed elsewhere
    var borrowedElsewhere = [];
    // Cache the template data as we'll be able to reuse it when processing the delete
    var templateData = {};


    ///////////////
    // UTILITIES //
    ///////////////

    /**
     * Validate that the delete confirmation message has been correctly entered and enable or disable
     * the submit button appropriately
     *
     * @return {Boolean}    Returns `true` if the form can be submitted, returns `false` if the confirmation message hasn't been entered correctly
     * @private
     */
    var validateDeleteConfirmation = function() {
        // The required confirmation message
        var required = 'DELETE';
        // The actual, typed, message
        var actual = $.trim($('#gh-delete-module-form input').val());
        // Disable the submit button if the message was correctly entered
        if (required === actual) {
            $('#gh-delete-module-delete').removeAttr('disabled');
            return true;
        } else {
            $('#gh-delete-module-delete').attr('disabled', 'disabled');
            return false;
        }
    };

    /**
     * Render the delete module template, displaying the consequences of deleting the module so
     * the user can make an informed decision on whether or not to go ahead
     *
     * @private
     */
    var renderDeleteModule = function() {
        // Render the module overview
        gh.utils.renderTemplate('delete-module-overview', {
            'data': templateData
        }, $('#delete-module-overview-container'), function() {

            // Hide the loading indicator
            $('#delete-module-body-preload-container').hide();

            // Show the confirmation footer
            $('#delete-module-confirm-container').show();
        });
    };

    /**
     * Delete the module and all series inside of it
     *
     * @return {Boolean}    Returns `false` to avoid default form submit behaviour
     * @private
     */
    var submitDeleteModal = function() {
        // Only submit the form when the correct message has been typed
        if (!validateDeleteConfirmation()) {
            return false;
        }

        var seriesToDelete = [];
        var todo = null;
        var done = 0;

        /**
         * Delete a series
         *
         * @param  {Number}      series      The series to delete
         * @param  {Function}    callback    Standard callback function
         * @private
         */
        var deleteSeries = function(series, callback) {
            // If the series was originally created in the module to be deleted and it's borrowed
            // into a different module, delete it from the system to delete it everywhere
            if (series && series.id && _.contains(_.pluck(templateData.borrowedElsewhere, 'seriesId'), series.id)) {
                // Remove the series from the module
                seriesAPI.deleteSeries(series.id, function(err) {
                    done++;
                    // When we're done, execute the callback
                    if (todo === done) {
                        callback(null);
                    // Call itself when more series need to be fetched
                    } else {
                        deleteSeries(seriesToDelete[done], callback);
                    }
                });
            // If the series isn't borrowed into any other modules and was not originally created
            // in this module only unlink it from the series
            } else if (series && series.id && !_.contains(templateData.borrowedElsewhere, series.id)) {
                // Remove the series from the module
                orgUnitAPI.deleteOrgUnitSeries(moduleId, series.id, function(err) {
                    done++;
                    // When we're done, execute the callback
                    if (todo === done) {
                        callback(null);
                    // Call itself when more series need to be fetched
                    } else {
                        deleteSeries(seriesToDelete[done], callback);
                    }
                });
            } else {
                callback(null);
            }
        };

        // Get all series inside of the module
        orgUnitAPI.getOrgUnit(moduleId, true, function(err, moduleOrgUnit) {
            // Keep track of how much work we have to do
            todo = moduleOrgUnit.Series.length;
            seriesToDelete = moduleOrgUnit.Series;

            // Delete the series
            deleteSeries(seriesToDelete[0], function() {
                // Delete the module
                orgUnitAPI.deleteOrgUnit(moduleId, function(err) {
                    if (err) {
                        return gh.utils.notification('Could not delete the module', constants.messaging.default.error, 'error');
                    }

                    // Hide the modal
                    $('#gh-delete-module-modal').modal('hide');

                    // Show a success notification after the module and all its series have been deleted
                    gh.utils.notification('The module has been removed', null, 'success');

                    // Remove the module from the navigation
                    $('.list-group-item[data-id="' + moduleId + '"]').remove();

                    // Remove the module and series from the state
                    gh.utils.removeFromState(['series', 'module']);
                });
            });
        });

        // Avoid default form submit behaviour
        return false;
    };


    ////////////////////
    // INITIALISATION //
    ////////////////////

    /**
     * Render and show the 'delete module' modal dialog
     *
     * @private
     */
    var setUpDeleteModuleModal = function() {
        // Cache the module ID
        moduleId = parseInt($(this).attr('data-id'), 10);

        // Render the modal
        gh.utils.renderTemplate('delete-module-modal', {
            'data': null
        }, $('#gh-delete-module-modal-container'), function() {

            // Show the modal
            $('#gh-delete-module-modal').modal();
        });
    };

    /**
     * Create a list of organisational units from which series are borrowed from
     *
     * @param  {Object}      orgunit     The organisational unit (module) to delete
     * @param  {Function}    callback    Standard callback function
     * @private
     */
    var retrieveBorrowedOrgUnits = function(orgunit, callback) {
        borrowedElsewhere = [];
        _.each(orgunit.Series, function(series) {
            _.each(series.OrgUnits, function(orgunit, index) {
                // If the first orgunit in the list is the current module,
                // any next modules have borrowed this series and should be added to the list
                if (index !== 0 && series.OrgUnits[0].id === moduleId) {
                    orgunit.seriesId = series.id;
                    borrowedElsewhere.push(orgunit);
                }
            });
        });

        // Make sure each entry is unique
        borrowedElsewhere = _.uniq(borrowedElsewhere, function(item) {
            return item.id;
        });

        var todo = borrowedElsewhere.length;
        var done = 0;

        /**
         * Get the parent organisational units for modules which borrow a series from the module to delete
         *
         * @param  {Object}      module       The module to get the parent organisational units for
         * @param  {Function}    _callback    Standard callback function
         * @private
         */
        var getBorrowedParents = function(module, _callback) {
            // Get the module's parent's info (part)
            orgUnitAPI.getOrgUnit(module.ParentId, false, function(err, part) {
                if (err) {
                    return gh.utils.notification('Could not get the part\'s information', constants.messaging.default.error, 'error');
                }

                module.part = part;

                // Get the part's parent's info (tripos)
                orgUnitAPI.getOrgUnit(part.ParentId, false, function(err, tripos) {
                    if (err) {
                        return gh.utils.notification('Could not get the tripos\' information', constants.messaging.default.error, 'error');
                    }

                    module.tripos = tripos;

                    done++;
                    // When we're done, execute the callback
                    if (todo === done) {
                        _callback(null, borrowedElsewhere);
                    // Call itself when more series need to be fetched
                    } else {
                        getBorrowedParents(borrowedElsewhere[done], _callback);
                    }
                });
            });
        };

        // Only retrieve modules parents if there are modules that borrow a series from the module to delete
        if (borrowedElsewhere.length) {
            getBorrowedParents(borrowedElsewhere[0], callback);
        } else {
            callback(null, borrowedElsewhere);
        }
    };

    /**
     * Retrieve information on all series inside of the organisational unit to delete
     *
     * @param  {Object}      orgunit     The organisational unit (module) to delete
     * @param  {Function}    callback    Standard callback function
     * @private
     */
    var retrieveSeriesInfo = function(orgunit, callback) {
        var todo = orgunit.Series.length;
        var done = 0;

        /**
         * Retrieve information on a series inside of the organisational unit to delete
         *
         * @param  {Object}      series       The series to retrieve extra information for
         * @param  {Function}    _callback    Standard callback function
         * @private
         */
        var getSeriesInfo = function(series, _callback) {
            gh.api.seriesAPI.getSeries(series.id, true, function(seriesErr, series) {

                // Cache the full series profile
                orgunit.Series[done] = series;

                done++;
                // When we're done, execute the callback
                if (todo === done) {
                    _callback(null, orgunit);
                // Call itself when more series need to be fetched
                } else {
                    getSeriesInfo(orgunit.Series[done], _callback);
                }
            });
        };

        // Only attempt to fetch the module's series if it has any
        if (orgunit.Series && orgunit.Series.length) {
            getSeriesInfo(orgunit.Series[0], callback);
        } else {
            callback(null, orgunit);
        }
    };

    /**
     * Retrieve all data required to fully inform the user about the decision to delete the module.
     * This includes data on series that are borrowed into other modules
     *
     * @private
     */
    var retrieveModuleInfo = function() {
        // Get the organisational unit info (module)
        orgUnitAPI.getOrgUnit(moduleId, true, function(err, moduleOrgUnit) {
            if (err) {
                return gh.utils.notification('Could not fetch module information', constants.messaging.default.error, 'error');
            }

            // Cache the module on the template data object
            templateData.moduleOrgUnit = moduleOrgUnit;

            // Get the module's parent's info (part)
            orgUnitAPI.getOrgUnit(moduleOrgUnit.ParentId, false, function(err, partOrgUnit) {
                // Cache the module's parent on the template data object
                templateData.partOrgUnit = partOrgUnit;

                // Get the part's parent's info (tripos)
                orgUnitAPI.getOrgUnit(partOrgUnit.ParentId, false, function(err, triposOrgUnit) {
                    // Cache the part's parent on the template data object
                    templateData.triposOrgUnit = triposOrgUnit;

                    // For each series inside of the module, get the series info and place it on the
                    // moduleOrgUnit object
                    retrieveSeriesInfo(moduleOrgUnit, function(err, moduleOrgUnit) {

                        // Compile an object with the orgunits from which the series are borrowed
                        retrieveBorrowedOrgUnits(moduleOrgUnit, function(err, borrowedElsewhere) {
                            templateData.borrowedElsewhere = borrowedElsewhere;

                            // Render the delete module overview
                            renderDeleteModule();
                        });
                    });
                });
            });
        });
    };


    /////////////
    // BINDING //
    /////////////

    /**
     * Add handlers to various elements in the delete module modal
     *
     * @private
     */
    var addBinding = function() {
        $('body').on('shown.bs.modal', '#gh-delete-module-modal', retrieveModuleInfo);
        $('body').on('click', '.gh-delete-module', setUpDeleteModuleModal);
        $('body').on('keyup', '#gh-delete-module-confirm-text', validateDeleteConfirmation);
        $('body').on('click', '#gh-delete-module-delete', submitDeleteModal);
        $('body').on('submit', '#gh-delete-module-form', submitDeleteModal);
    };

    addBinding();
});

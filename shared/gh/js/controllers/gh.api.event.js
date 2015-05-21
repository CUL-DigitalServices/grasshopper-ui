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

define(['exports'], function(exports) {

    /**
     * Get an event
     *
     * @param  {Number}      eventId             The ID of the event to retrieve
     * @param  {Function}    callback            Standard callback function
     * @param  {Error}       callback.err        Error object containing the error code and error message
     * @param  {Event}       callback.reponse    The requested event
     * @throws {Error}                           A parameter validation error
     */
    var getEvent = exports.getEvent = function(eventId, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(eventId)) {
            return callback({'code': 400, 'msg': 'A valid value for \'eventId\' should be provided'});
        }

        $.ajax({
            'url': '/api/events/' + eventId,
            'type': 'GET',
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Create a new event in the current app
     *
     * @param  {String}      displayName         The name of the event
     * @param  {String}      start               The timestamp (ISO 8601) at which the event starts
     * @param  {String}      end                 The timestamp (ISO 8601) at which the event ends
     * @param  {String}      [description]       The description of the event
     * @param  {Number}      [groupId]           The id of the group that can manage the event
     * @param  {String}      [location]          The location of the event
     * @param  {String}      [notes]             The notes for the event
     * @param  {String[]}    [organiserOther]    The name(s) of the unrecognised user(s) that organise the event. If no organisers are added, the current user will be added as the organiser
     * @param  {Number[]}    [organiserUsers]    The id(s) of the recognised user(s) that organise the event
     * @param  {Number[]}    [seriesId]          The id(s) of the serie(s) that the event belongs to
     * @param  {String}      [type]              The type of the event
     * @param  {Function}    callback            Standard callback function
     * @param  {Error}       callback.err        Error object containing the error code and error message
     * @param  {Event}       callback.reponse    The created event
     * @throws {Error}                           A parameter validation error
     */
    var createEvent = exports.createEvent = function(displayName, start, end, description, groupId, location, notes, organiserOther, organiserUsers, seriesId, type, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid value for \'displayName\' should be provided'});
        } else if (!_.isString(start)) {
            return callback({'code': 400, 'msg': 'A valid value for \'start\' should be provided'});
        } else if (!_.isString(end)) {
            return callback({'code': 400, 'msg': 'A valid value for \'end\' should be provided'});
        } else if (description && !_.isString(description)) {
            return callback({'code': 400, 'msg': 'A valid value for \'description\' should be provided'});
        } else if (groupId && !_.isNumber(groupId)) {
            return callback({'code': 400, 'msg': 'A valid value for \'groupId\' should be provided'});
        } else if (location && !_.isString(location)) {
            return callback({'code': 400, 'msg': 'A valid value for \'location\' should be provided'});
        } else if (notes && !_.isString(notes)) {
            return callback({'code': 400, 'msg': 'A valid value for \'notes\' should be provided'});
        } else if (organiserOther && (!_.isString(organiserOther) && !_.isArray(organiserOther))) {
            return callback({'code': 400, 'msg': 'A valid value for \'organiserOther\' should be provided'});
        } else if (organiserUsers && (!_.isNumber(organiserUsers) && !_.isArray(organiserUsers))) {
            return callback({'code': 400, 'msg': 'A valid value for \'organiserUsers\' should be provided'});
        } else if (seriesId && (!_.isNumber(seriesId) && !_.isArray(seriesId))) {
            return callback({'code': 400, 'msg': 'A valid value for \'seriesId\' should be provided'});
        } else if (type && !_.isString(type)) {
            return callback({'code': 400, 'msg': 'A valid value for \'type\' should be provided'});
        }

        // Request data object
        var data = {
            'displayName': displayName,
            'start': start,
            'end': end
        };

        // Only add the parameters to the request object if they have been explicitly specified
        if (description) {
            data['description'] = description;
        }
        if (groupId) {
            data['group'] = groupId;
        }
        if (location) {
            data['location'] = location;
        }
        if (notes) {
            data['notes'] = notes;
        }
        if (organiserOther) {
            data['organiserOther'] = organiserOther;
        }
        if (organiserUsers) {
            data['organiserUsers'] = organiserUsers;
        }
        if (seriesId) {
            data['series'] = seriesId;
        }
        if (type) {
            data['type'] = type;
        }

        $.ajax({
            'url': '/api/events',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Create a new event in an app
     *
     * @param  {Number}      appId               The id of the app to create the event for
     * @param  {String}      displayName         The name of the event
     * @param  {String}      start               The timestamp (ISO 8601) at which the event starts
     * @param  {String}      end                 The timestamp (ISO 8601) at which the event ends
     * @param  {String}      [description]       The description of the event
     * @param  {Number}      [groupId]           The id of the group that can manage the event
     * @param  {String}      [location]          The location of the event
     * @param  {String}      [notes]             The notes for the event
     * @param  {String[]}    [organiserOther]    The name(s) of the unrecognised user(s) that organise the event. If no organisers are added, the current user will be added as the organiser
     * @param  {Number[]}    [organiserUsers]    The id(s) of the recognised user(s) that organise the event
     * @param  {Number[]}    [seriesId]          The id(s) of the serie(s) that the event belongs to
     * @param  {String}      [type]              The type of the event
     * @param  {Function}    callback            Standard callback function
     * @param  {Error}       callback.err        Error object containing the error code and error message
     * @param  {Event}       callback.reponse    The created event
     * @throws {Error}                           A parameter validation error
     */
    var createEventByApp = exports.createEventByApp = function(appId, displayName, start, end, description, groupId, location, notes, organiserOther, organiserUsers, seriesId, type, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(appId)) {
            return callback({'code': 400, 'msg': 'A valid value for \'appId\' should be provided'});
        } else if (!_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid value for \'displayName\' should be provided'});
        } else if (!_.isString(start)) {
            return callback({'code': 400, 'msg': 'A valid value for \'start\' should be provided'});
        } else if (!_.isString(end)) {
            return callback({'code': 400, 'msg': 'A valid value for \'end\' should be provided'});
        } else if (description && !_.isString(description)) {
            return callback({'code': 400, 'msg': 'A valid value for \'description\' should be provided'});
        } else if (groupId && !_.isNumber(groupId)) {
            return callback({'code': 400, 'msg': 'A valid value for \'groupId\' should be provided'});
        } else if (location && !_.isString(location)) {
            return callback({'code': 400, 'msg': 'A valid value for \'location\' should be provided'});
        } else if (notes && !_.isString(notes)) {
            return callback({'code': 400, 'msg': 'A valid value for \'notes\' should be provided'});
        } else if (organiserOther && (!_.isString(organiserOther) && !_.isArray(organiserOther))) {
            return callback({'code': 400, 'msg': 'A valid value for \'organiserOther\' should be provided'});
        } else if (organiserUsers && (!_.isNumber(organiserUsers) && !_.isArray(organiserUsers))) {
            return callback({'code': 400, 'msg': 'A valid value for \'organiserUsers\' should be provided'});
        } else if (seriesId && (!_.isNumber(seriesId) && !_.isArray(seriesId))) {
            return callback({'code': 400, 'msg': 'A valid value for \'seriesId\' should be provided'});
        } else if (type && !_.isString(type)) {
            return callback({'code': 400, 'msg': 'A valid value for \'type\' should be provided'});
        }

        // Request data object
        var data = {
            'app': appId,
            'displayName': displayName,
            'start': start,
            'end': end
        };

        // Only add the parameters to the request object if they have been explicitly specified
        if (description) {
            data['description'] = description;
        }
        if (groupId) {
            data['group'] = groupId;
        }
        if (location) {
            data['location'] = location;
        }
        if (notes) {
            data['notes'] = notes;
        }
        if (organiserOther) {
            data['organiserOther'] = organiserOther;
        }
        if (organiserUsers) {
            data['organiserUsers'] = organiserUsers;
        }
        if (seriesId) {
            data['serie'] = seriesId;
        }
        if (type) {
            data['type'] = type;
        }

        $.ajax({
            'url': '/api/events/',
            'type': 'POST',
            'data': data,
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Update an event
     *
     * @param  {Number}      eventId             The ID of the event to update
     * @param  {String}      [displayName]       The updated event display name
     * @param  {String}      [description]       The updated event description
     * @param  {Number}      [groupId]           The updated ID of the group that can manage the event
     * @param  {Number}      [start]             The updated timestamp (ISO 8601) at which the event starts
     * @param  {Number}      [end]               The updated timestamp (ISO 8601) at which the event ends
     * @param  {String}      [location]          The updated location of the event
     * @param  {String}      [notes]             The updated notes for the event
     * @param  {String}      [type]              The updated type for the event
     * @param  {Function}    callback            Standard callback function
     * @param  {Error}       callback.err        Error object containing the error code and error message
     * @param  {Event}       callback.reponse    The updated event
     * @throws {Error}                           A parameter validation error
     */
    var updateEvent = exports.updateEvent = function(eventId, displayName, description, groupId, start, end, location, notes, type, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(eventId)) {
            return callback({'code': 400, 'msg': 'A valid value for \'eventId\' should be provided'});
        } else if (displayName && !_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid value for \'displayName\' should be provided'});
        } else if (description && !_.isString(description)) {
            return callback({'code': 400, 'msg': 'A valid value for \'description\' should be provided'});
        } else if (groupId && !_.isNumber(groupId)) {
            return callback({'code': 400, 'msg': 'A valid value for \'groupId\' should be provided'});
        } else if (start && !_.isString(start)) {
            return callback({'code': 400, 'msg': 'A valid value for \'start\' should be provided'});
        } else if (end && !_.isString(end)) {
            return callback({'code': 400, 'msg': 'A valid value for \'end\' should be provided'});
        } else if (location && !_.isString(location)) {
            return callback({'code': 400, 'msg': 'A valid value for \'location\' should be provided'});
        } else if (notes && !_.isString(notes)) {
            return callback({'code': 400, 'msg': 'A valid value for \'notes\' should be provided'});
        } else if (type && !_.isString(type)) {
            return callback({'code': 400, 'msg': 'A valid value for \'type\' should be provided'});
        }

        // Request data object
        var data = {};

        // Only add the parameters to the request object if they have been explicitly specified
        if (displayName) {
            data['displayName'] = displayName;
        }
        if (description) {
            data['description'] = description;
        }
        if (groupId) {
            data['group'] = groupId;
        }
        if (start) {
            data['start'] = start;
        }
        if (end) {
            data['end'] = end;
        }
        if (location) {
            data['location'] = location;
        }
        if (notes) {
            data['notes'] = notes;
        }
        if (type) {
            data['type'] = type;
        }

        $.ajax({
            'url': '/api/events/' + eventId,
            'type': 'POST',
            'data': data,
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Update the organisers of an event
     *
     * @param  {Number}                  eventId             The id of the group for which to update the organisers
     * @param  {EventOrganiserUpdate}    body                Object that describes the event organiser changes to apply
     * @param  {Function}                callback            Standard callback function
     * @param  {Error}                   callback.err        Error object containing the error code and error message
     * @param  {Event}                   callback.reponse    The updated event
     * @throws {Error}                                       A parameter validation error
     */
    var updateEventOrganisers = exports.updateEventOrganisers = function(eventId, body, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(eventId)) {
            return callback({'code': 400, 'msg': 'A valid value for \'eventId\' should be provided'});
        } else if (!_.isObject(body) || $.isEmptyObject(body)) {
            return callback({'code': 400, 'msg': 'A valid updates object should be provided'});
        }

        $.ajax({
            'url': '/api/events/' + eventId + '/organisers',
            'type': 'POST',
            'data': body,
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Delete an event
     *
     * @param  {Number}      eventId           The ID of the event to delete
     * @param  {Function}    [callback]        Standard callback function
     * @param  {Function}    [callback.err]    Error object containing the error code and error message
     * @throws {Error}                         A parameter validation error
     */
    var deleteEvent = exports.deleteEvent = function(eventId, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A valid callback function should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        if (!_.isNumber(eventId)) {
            return callback({'code': 400, 'msg': 'A valid value for \'eventId\' should be provided'});
        }

        $.ajax({
            'url': '/api/events/' + eventId,
            'type': 'DELETE',
            'success': function() {
                return callback();
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the users that have subscribed to an event series
     *
     * @param  {Number}      eventId             The id of the event to get the subscribers for
     * @param  {Number}      limit               The maximum number of results to retrieve. Default: 10
     * @param  {Number}      offset              The paging number of the results to retrieve
     * @param  {Function}    callback            Standard callback functions
     * @param  {Error}       callback.err        Error object containing the error code and error message
     * @param  {User[]}      callback.reponse    The users that have subscribed to the event
     * @throws {Error}                           A parameter validation error
     */
    var getEventSubscribers = exports.getEventSubscribers = function(eventId, limit, offset, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(eventId)) {
            return callback({'code': 400, 'msg': 'A valid value for \'eventId\' should be provided'});
        } else if (limit && !_.isNumber(limit)) {
            return callback({'code': 400, 'msg': 'A valid value for \'limit\' should be provided'});
        } else if (offset && !_.isNumber(offset)) {
            return callback({'code': 400, 'msg': 'A valid value for \'offset\' should be provided'});
        }

        $.ajax({
            'url': '/api/events/' + eventId + '/subscribers',
            'type': 'GET',
            'data': {
                'limit': limit,
                'offset': offset
            },
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Subscribe to an event
     *
     * @param  {Number}      eventId           The id of the event to subscribe to
     * @param  {Function}    [callback]        Standard callback functions
     * @param  {Error}       [callback.err]    Error object containing the error code and error message
     * @throws {Error}                         A parameter validation error
     */
    var subscribeEvent = exports.subscribeEvent = function(eventId, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A valid callback function should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        if (!_.isNumber(eventId)) {
            return callback({'code': 400, 'msg': 'A valid value for \'eventId\' should be provided'});
        }

        $.ajax({
            'url': '/api/events/' + eventId + '/subscribe',
            'type': 'POST',
            'success': function() {
                return callback();
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };
});

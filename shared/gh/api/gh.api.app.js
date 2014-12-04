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

define(['exports'], function(exports) {

    /**
     * Get all apps in a tenant
     *
     * @param  {Number}      tenantId             The ID of the tenant to retrieve the apps for
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The tenant's applications
     */
    var getApps = exports.getApps = function(tenantId, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(tenantId)) {
            return callback({'code': 400, 'msg': 'A valid value for tenantId should be provided'});
        }

        $.ajax({
            'url': '/api/apps?tenantId=' + tenantId,
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get an app
     *
     * @param  {Number}      appId                The ID of the app to retrieve
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The requested application
     */
    var getApp = exports.getApp = function(appId, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(appId)) {
            return callback({'code': 400, 'msg': 'A valid value for appId should be provided'});
        }

        $.ajax({
            'url': '/api/apps/' + appId,
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Get the administrators for an app
     *
     * @param  {Number}      appId                The ID of the app to retrieve the administrators for
     * @param  {Number}      [limit]              The maximum number of results to retrieve
     * @param  {Number}      [offset]             The paging number of the results to retrieve
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The application's administrators
     */
    var getAppAdmins = exports.getAppAdmins = function(appId, limit, offset, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(appId)) {
            return callback({'code': 400, 'msg': 'A valid value for appId should be provided'});
        } else if (!_.isEmpty(limit) && !_.isNumber(limit)) {
            return callback({'code': 400, 'msg': 'A valid value for offset should be provided'});
        } else if (!_.isEmpty(offset) && !_.isNumber(offset)) {
            return callback({'code': 400, 'msg': 'A valid value for offset should be provided'});
        }

        $.ajax({
            'url': '/api/apps/' + appId + '/admins?limit=' + limit + '&offset=' + offset,
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };

    /**
     * Create a new app
     *
     * @param  {String}      displayName          The name of the app
     * @param  {String}      host                 The host on which the app can be found
     * @param  {Number}      tenantId             The ID of the tenant on wich to create the app
     * @param  {Number}      type                 The type of the app
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The created app
     */
    var createApp = exports.createApp = function(displayName, host, tenantId, type, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid value for displayName should be provided'});
        } else if (!_.isString(host)) {
            return callback({'code': 400, 'msg': 'A valid value for host should be provided'});
        } else if (!_.isNumber(tenantId)) {
            return callback({'code': 400, 'msg': 'A valid value for tenantId should be provided'});
        } else if (!_.isString(type)) {
            return callback({'code': 400, 'msg': 'A valid value for type should be provided'});
        }

        var data = {
            'displayName': displayName,
            'host': host,
            'tenantId': tenantId,
            'type': type
        };

        $.ajax({
            'url': '/api/apps',
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
     * Update an app
     *
     * @param  {Number}      appId                The ID of the app to update
     * @param  {String}      [displayName]        The updated app name
     * @param  {Boolean}     [enabled]            Whether the app should be enabled or not
     * @param  {String}      [host]               The updated app host
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The updated app
     */
    var updateApp = exports.updateApp = function(appId, displayName, enabled, host, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(appId)) {
            return callback({'code': 400, 'msg': 'A valid value for appId should be provided'});
        } else if (displayName && !_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid value for displayName should be provided'});
        } else if (!_.isEmpty(enabled) && !_.isBoolean(enabled)) {
            return callback({'code': 400, 'msg': 'A valid value for enabled should be provided'});
        } else if (host && !_.isString(host)) {
            return callback({'code': 400, 'msg': 'A valid value for host should be provided'});
        }

        var data = {
            'displayName': displayName,
            'enabled': enabled,
            'host': host
        };

        $.ajax({
            'url': '/api/apps/' + appId,
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
     * Update the administrators of an app
     *
     * @param  {Number}      appId                The ID of the app for which to update the administrators
     * @param  {Object}      adminUpdates         Object that describes the app administrator changes to apply. e.g., {'johndoe': true}
     * @param  {Function}    [callback]           Standard callback function
     * @param  {Object}      [callback.err]       Error object containing the error code and error message
     */
    var updateAppAdmins = exports.updateAppAdmins = function(appId, adminUpdates, callback) {
        if (callback && !_.isFunction(callback)) {
            throw new Error('A valid callback function should be provided');
        }

        // Set a default callback function in case no callback function has been provided
        callback = callback || function() {};

        if (!_.isNumber(appId)) {
            return callback({'code': 400, 'msg': 'A valid value for appId should be provided'});
        } else if (!_.isObject(adminUpdates)) {
            return callback({'code': 400, 'msg': 'A valid value for adminUpdates should be provided'});
        }

        $.ajax({
            'url': '/api/apps/' + appId + '/admins',
            'type': 'POST',
            'data': adminUpdates,
            'success': function() {
                return callback();
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
    };
});

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
     * Create a new global administrator
     *
     * @param  {String}      username               The username for the new administrator
     * @param  {String}      displayName            The display name for the new administrator
     * @param  {String}      password               The password for the new administrator
     * @param  {Function}    callback               Standard callback function
     * @param  {Object}      callback.err           Error object containing the error code and error message
     * @param  {Object}      callback.response      The created global administrator
     */
    var createAdmin = exports.createAdmin = function(username, displayName, password, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isString(username)) {
            return callback({'code': 400, 'msg': 'A valid user name should be provided'});
        } else if (!_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid display name should be provided'});
        } else if (!_.isString(password)) {
            return callback({'code': 400, 'msg': 'A valid value for password should be provided'});
        }

        var data = {
            'username': username,
            'displayName': displayName,
            'password': password
        };

        $.ajax({
            'url': '/api/admins',
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
     * Get all global administrators
     *
     * @param  {Number}      [limit]              The maximum number of results to retrieve
     * @param  {Number}      [offset]             The paging number of the results to retrieve
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    Object containing all the global administrators
     */
    var getAdmins = exports.getAdmins = function(limit, offset, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (limit && !_.isNumber(limit)) {
            return callback({'code': 400, 'msg': 'A valid value for limit should be provided'});
        } else if (offset && !_.isNumber(offset)) {
            return callback({'code': 400, 'msg': 'A valid value for offset should be provided'});
        }

        $.ajax({
            'url': '/api/admins?limit=' + limit + '&offset=' + offset,
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
     * Update a global administrator
     *
     * @param  {Number}      userId               The ID of the administrator to update
     * @param  {String}      displayName          The updated display name for the administrator
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    Object representing the updated global administrator

     */
    var updateAdmin = exports.updateAdmin = function(userId, displayName, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(userId)) {
            return callback({'code': 400, 'msg': 'A valid user id should be provided'});
        } else if (!_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid display name should be provided'});
        }

        data = {
            'displayName': displayName
        };

        $.ajax({
            'url': '/api/admins/' + userId,
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
});

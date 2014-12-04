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
     * Get all tenants
     *
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    All available tenants
     */
    var getTenants = exports.getTenants = function(callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        }

        $.ajax({
            'url': '/api/tenants',
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
     * Get a tenant
     *
     * @param  {Number}      tenantId             The ID of the tenant to retrieve
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The requested tenant
     */
    var getTenant = exports.getTenant = function(tenantId, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(tenantId)) {
            return callback({'code': 400, 'msg': 'A valid tenantId should be provided'});
        }

        $.ajax({
            'url': '/api/tenants/' + tenantId,
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
     * Create a new tenant
     *
     * @param  {String}      displayName          The display name of the tenant
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The created tenant
     */
    var createTenant = exports.createTenant = function(displayName, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid displayName should be provided'});
        }

        var data = {
            'displayName': displayName
        };

        $.ajax({
            'url': '/api/tenants',
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
     * Update a tenant
     *
     * @param  {Number}      tenantId             The ID of the tenant to update
     * @param  {String}      displayName          The updated tenant display name
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The updated tenant
     */
    var updateTenant = exports.updateTenant = function(tenantId, displayName, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(tenantId)) {
            return callback({'code': 400, 'msg': 'A valid tenantId should be provided'});
        } else if (!_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid displayName should be provided'});
        }

        var data = {
            'displayName': displayName
        };

        $.ajax({
            'url': '/api/tenants/' + tenantId,
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

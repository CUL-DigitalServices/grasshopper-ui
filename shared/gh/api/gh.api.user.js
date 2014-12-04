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
     * Get the current user
     *
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    Object representing the current user
     */
    var getMe = exports.getMe = function(callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        }

        $.ajax({
            'url': '/api/me',
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
     * Get a user
     *
     * @param  {Number}      userId               The ID of the user to retrieve
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The requested user
     */
    var getUser = exports.getUser = function(userId, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(userId)) {
            return callback({'code': 400, 'msg': 'A valid user id should be provided'});
        }

        return callback();

        /**
         * TODO: wait for back-end implementation
         *
        $.ajax({
            'url': '/api/users/' + userId,
            'type': 'GET',
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
        */
    };

    /**
     * Get all users for an app
     *
     * @param  {Number}      appId                The ID of the app to retrieve the users for
     * @param  {Number}      [limit]              The maximum number of results to retrieve
     * @param  {Number}      [offset]             The paging number of the results to retrieve
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The users for the requested tenant or app
     */
    var getUsers = exports.getUsers = function(appId, limit, offset, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(appId)) {
            return callback({'code': 400, 'msg': 'A valid value for app id should be provided'});
        } else if (!_.isEmpty(limit) && !_.isNumber(limit)) {
            return callback({'code': 400, 'msg': 'A valid value for limit should be provided'});
        } else if (!_.isEmpty(offset) && (!_.isNumber(offset))) {
            return callback({'code': 400, 'msg': 'A valid value for offset should be provided'});
        }

        return callback();

        /**
         * TODO: wait for back-end implementation
         *
        $.ajax({
            'url': '/api/users',
            'type': 'GET',
            'success': function(data) {
                return callback(null, data);
            },
            'error': function(jqXHR, textStatus) {
                return callback({'code': jqXHR.status, 'msg': jqXHR.responseText});
            }
        });
        */
    };

    /**
     * Get the calendar for a user
     *
     * @param  {Number}      userId               The ID of the user to get the calendar for
     * @param  {String}      from                 The timestamp (ISO 8601) from which to get the calendar for the user
     * @param  {String}      to                   The timestamp (ISO 8601) until which to get the calendar for the user
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The requested user calendar
     */
    var getUserCalendar = exports.getUserCalendar = function(userId, from, to, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(userId)) {
            return callback({'code': 400, 'msg': 'A valid user id should be provided'});
        } else if (!_.isString(from)) {
            return callback({'code': 400, 'msg': 'A valid value for from should be provided'});
        } else  if (!_.isString(to)) {
            return callback({'code': 400, 'msg': 'A valid value for to should be provided'});
        }

        return callback();
    };

    /**
     * Get the calendar for a user in iCal
     *
     * @param  {Number}      userId               The ID of the user to get the calendar for
     * @param  {String}      [signature]          The access control signature
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The requested user calendar in iCal format
     */
    var getUserCalendarIcal = exports.getUserCalendarIcal = function(userId, signature, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(userId)) {
            return callback({'code': 400, 'msg': 'A valid user id should be provided'});
        } else if (!_.isEmpty(signature) && !_.isString(signature)) {
            return callback({'code': 400, 'msg': 'A valid value for signature should be provided'});
        }

        return callback();
    };

    /**
     * Get the calendar for a user in RSS
     *
     * @param  {Number}      userId               The ID of the user to get the calendar for
     * @param  {String}      [signature]          The access control signature
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The requested event series calendar in RSS format
     */
    var getUserCalendarRss = exports.getUserCalendarRss = function(userId, signature, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(userId)) {
            return callback({'code': 400, 'msg': 'A valid user id should be provided'});
        } else if (!_.isEmpty(signature) && !_.isString(signature)) {
            return callback({'code': 400, 'msg': 'A valid value for signature should be provided'});
        }

        return callback();
    };

    /**
     * Get the upcoming events for a user
     *
     * @param  {Number}      userId               The ID of the user to get the upcoming events for
     * @param  {Number}      [limit]              The maximum number of results to retrieve
     * @param  {Number}      [offset]             The paging number of the results to retrieve
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The upcoming events for the user
     */
    var getUserUpcoming = exports.getUserUpcoming = function(userId, limit, offset, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(userId)) {
            return callback({'code': 400, 'msg': 'A valid user id should be provided'});
        } else if (!_.isEmpty(limit) && !_.isNumber(limit)) {
            return callback({'code': 400, 'msg': 'A valid value for limit should be provided'});
        } else if (!_.isEmpty(offset) && (!_.isNumber(offset))) {
            return callback({'code': 400, 'msg': 'A valid value for offset should be provided'});
        }

        return callback();
    };

    /**
     * Get the terms and conditions
     *
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The Terms and Conditions for the current app
     */
    var getTermsAndConditions = exports.getTermsAndConditions = function(callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        }

        return callback();
    };

    /**
     * Accept the terms and conditions
     *
     * @param  {Number}      userId               The id of the user for which to accept the Terms and Conditions on the current app
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The updated status of the Terms and Conditions for the user on the current app
     */
    var acceptTermsAndConditions = exports.acceptTermsAndConditions = function(userId, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(userId)) {
            return callback({'code': 400, 'msg': 'A valid user id should be provided'});
        }

        return callback();
    };

    /**
     * Create a new user with a local authentication strategy
     *
     * @param  {Number}      appId                   The ID of the app on which the user should be created
     * @param  {String}      displayName             The display name of the user
     * @param  {String}      email                   The email address for the user. This will be used as the username for the user
     * @param  {String}      password                The password with which the user will authenticate
     * @param  {String}      [emailPreference]       The email preference for the user
     * @param  {Boolean}     [isAdmin]               Whether the user is an app administrator
     * @param  {String}      [recaptchaChallenge]    The identifier for the recaptcha challenge. Only required when the current user is not an app administrator
     * @param  {String}      [recaptchaResponse]     The recaptcha response entered for the presented challenge. Only required when the current user is not an app administrator
     * @param  {Function}    callback                Standard callback function
     * @param  {Object}      callback.err            Error object containing the error code and error message
     * @param  {Object}      callback.response       The created user
     */
    var createUser = exports.createUser = function(appId, displayName, email, password, emailPreference, isAdmin, recaptchaChallenge, recaptchaResponse, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(appId)) {
            return callback({'code': 400, 'msg': 'A valid value for app id should be provided'});
        } else if (!_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid display name should be provided'});
        } else if (!_.isString(email)) {
            return callback({'code': 400, 'msg': 'A valid email should be provided'});
        } else if (!_.isString(password)) {
            return callback({'code': 400, 'msg': 'A valid value for password should be provided'});
        } else if (!_.isEmpty(emailPreference) && !_.isString(emailPreference)) {
            return callback({'code': 400, 'msg': 'A valid value for emailPreference should be provided'});
        } else if (!_.isEmpty(isAdmin) && !_.isBoolean(isAdmin)) {
            return callback({'code': 400, 'msg': 'A valid value for isAdmin should be provided'});
        } else if (!_.isEmpty(recaptchaChallenge) && !_.isString(recaptchaChallenge)) {
            return callback({'code': 400, 'msg': 'A valid value for recaptchaChallenge should be provided'});
        } else if (!_.isEmpty(recaptchaResponse) && !_.isString(recaptchaResponse)) {
            return callback({'code': 400, 'msg': 'A valid value for recaptchaResponse should be provided'});
        }

        var data = {
            'appId': appId,
            'displayName': displayName,
            'email': email,
            'password': password,
            'emailPreference': emailPreference,
            'isAdmin': isAdmin,
            'recaptchaChallenge': recaptchaChallenge,
            'recaptchaResponse': recaptchaResponse
        };

        $.ajax({
            'url': '/api/users',
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
     * Import users using a CSV file
     *
     * @param  {String}      authenticationStrategy    The authentication strategy for the user
     * @param  {File}        file                      The CSV file to import
     * @param  {Number}      tenantId                  The ID of the tenant to which the users should be imported
     * @param  {String[]}    appIds                    The ID(s) of the app(s) to which the users should be associated
     * @param  {Boolean}     [forceProfileUpdate]      Whether the user information should be updated, even when other user information is already present
     * @param  {Function}    callback                  Standard callback function
     * @param  {Object}      callback.err              Error object containing the error code and error message
     */
    var importUsers = exports.importUsers = function(authenticationStrategy, file, tenantId, appIds, forceProfileUpdate, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isString(authenticationStrategy)) {
            return callback({'code': 400, 'msg': 'A valid authenticationStrategy should be provided'});
        } else if (!file) {
            return callback({'code': 400, 'msg': 'A valid file should be provided'});
        } else if (!_.isNumber(tenantId)) {
            return callback({'code': 400, 'msg': 'A valid tenant id should be provided'});
        } else if (!_.isArray(appIds)) {
            return callback({'code': 400, 'msg': 'A valid value for appIds should be provided'});
        } else if (!_.isEmpty(forceProfileUpdate) && !_.isBoolean(forceProfileUpdate)) {
            return callback({'code': 400, 'msg': 'A valid value for forceProfileUpdate should be provided'});
        }

        return callback();
    };

    /**
     * Update a user
     *
     * @param  {Number}      userId               The ID of the user to update
     * @param  {Number}      appId                The ID of the app for which to update the app-specific user values
     * @param  {String}      [displayName]        The updated user display name
     * @param  {String}      [email]              The updated user email address
     * @param  {String}      [emailPreference]    The updated user email preference
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The updated user
     */
    var updateUser = exports.updateUser = function(userId, appId, displayName, email, emailPreference, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(userId)) {
            return callback({'code': 400, 'msg': 'A valid user id should be provided'});
        } else if (!_.isNumber(appId)) {
            return callback({'code': 400, 'msg': 'A valid app id should be provided'});
        } else if (!_.isEmpty(displayName) && !_.isString(displayName)) {
            return callback({'code': 400, 'msg': 'A valid value for displayName should be provided'});
        } else if (!_.isEmpty(email) && !_.isBoolean(email)) {
            return callback({'code': 400, 'msg': 'A valid value for email should be provided'});
        } else if (!_.isEmpty(emailPreference) && !_.isBoolean(emailPreference)) {
            return callback({'code': 400, 'msg': 'A valid value for emailPreference should be provided'});
        }

        return callback();
    };

    /**
     * Update the app administrator status for a user
     *
     * @param  {Number}      userId               The id of the user to update the app administrator status for
     * @param  {Boolean}     isAdmin              Whether the user should be an app administrator
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The updated user
     */
    var updateAdminStatus = exports.updateAdminStatus = function(userId, isAdmin, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(userId)) {
            return callback({'code': 400, 'msg': 'A valid user id should be provided'});
        } else if (!_.isBoolean(isAdmin)) {
            return callback({'code': 400, 'msg': 'A valid value for isAdmin should be provided'});
        }

        return callback();
    };

    /**
     * Store a profile picture for a user
     *
     * @param  {Number}      userId               The ID of the user to store the profile picture for
     * @param  {File}        file                 The image that should be stored as the user profile picture
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The updated user
     */
    var setUserPicture = exports.setUserPicture = function(userId, file, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(userId)) {
            return callback({'code': 400, 'msg': 'A valid user id should be provided'});
        } else if (!file) {
            return callback({'code': 400, 'msg': 'A valid file should be provided'});
        }

        return callback();
    };

    /**
     * Crop the profile picture for a user
     *
     * @param  {Number}      userId               The ID of the user to crop the profile picture for
     * @param  {Number}      width                The width of the square that needs to be cropped out
     * @param  {Number}      x                    The x coordinate of the top left corner to start cropping at
     * @param  {Number}      y                    The y coordinate of the top left corner to start cropping at
     * @param  {Function}    callback             Standard callback function
     * @param  {Object}      callback.err         Error object containing the error code and error message
     * @param  {Object}      callback.response    The updated user
     */
    var cropPicture = exports.cropPicture = function(userId, width, x, y, callback) {
        if (!_.isFunction(callback)) {
            throw new Error('A callback function should be provided');
        } else if (!_.isNumber(userId)) {
            return callback({'code': 400, 'msg': 'A valid user id should be provided'});
        } else if (!_.isNumber(width)) {
            return callback({'code': 400, 'msg': 'A valid value for width should be provided'});
        } else if (!_.isNumber(x)) {
            return callback({'code': 400, 'msg': 'A valid value for x should be provided'});
        } else if (!_.isNumber(y)) {
            return callback({'code': 400, 'msg': 'A valid value for y should be provided'});
        }

        return callback();
    };
});

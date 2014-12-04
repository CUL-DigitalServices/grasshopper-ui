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

require(['gh.core', 'gh.api.tests', 'sinon'], function(gh, testAPI, sinon) {
    QUnit.module('User API');

    /*!
     * Generates a random user
     *
     * @param  {Function}    callback         Standard callback function
     * @param  {Object}      callback.err     Error object containing error code and error message
     * @param  {Object}      callback.user    Response object containing the created user
     * @private
     */
    var _generateRandomUser = function(callback) {

        // Login with the global administrator
        gh.api.authenticationAPI.login('administrator', 'administrator', function(err, data) {
            if (err) {
                return callback(err);
            }

            var appId = testAPI.getRandomApp().id;
            var user = {
                'displayName': gh.api.utilAPI.generateRandomString(),
                'email': gh.api.utilAPI.generateRandomString(),
                'password': gh.api.utilAPI.generateRandomString()
            };

            // Create a new user
            gh.api.userAPI.createUser(appId, user.displayName, user.email, user.password, null, false, null, null, function(err, user) {
                if (err) {
                    return callback(err);
                }
                return callback(null, user);
            });
        });
    };

    // Test the getUsers functionality
    QUnit.asyncTest('getUsers', function(assert) {
        expect(6);

        var app = testAPI.getRandomApp();

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when no app id was provided
            gh.api.userAPI.getUsers(null, 1, 2, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid app id was provided');

                // Verify that an error is thrown when no app id was provided
                gh.api.userAPI.getUsers('invalid_appId', 1, 2, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid app id was provided');

                    // Verify that an error is thrown when an invalid value for limit was provided
                    gh.api.userAPI.getUsers(app.id, 'invalid_limit', 1, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for limit was provided');

                        // Verify that an error is thrown when an invalid value for offset was provided
                        gh.api.userAPI.getUsers(app.id, 1, 'invalid_offset', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for offset was provided');

                            // Verify that an error is thrown when an invalid callback was provided
                            assert.throws(function() {
                                gh.api.userAPI.getUsers(app.id, null, null);
                            }, 'Verify that an error is thrown when an invalid callback was provided');

                            // Verify that an error is thrown when an invalid value for offset was provided
                            gh.api.userAPI.getUsers(app.id, null, null, function(err, data) {

                                /*
                                 * TODO: wait for back-end implementation
                                 *
                                assert.ok(err, 'Verify that users can be retrieved without an error');
                                 */

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the getUser functionality
    QUnit.asyncTest('getUser', function(assert) {
        expect(4);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when no user id was provided
            gh.api.userAPI.getUser(null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no user id was provided');

                // Verify that an error is thrown when an invalid user id was provided
                gh.api.userAPI.getUser('stringId', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                    // Verify that an error is thrown when an invalid callback was provided
                    assert.throws(function() {
                        gh.api.userAPI.getUser(user.id);
                    }, 'Verify that an error is thrown when an invalid callback was provided');

                    // Verifty that a user can be retrieved without errors
                    gh.api.userAPI.getUser(user.id, function(err, data) {

                        /*
                         * TODO: wait for back-end implementation
                         *
                        assert.ok(!err, 'Verify that a user can be retrieved without errors');
                        assert.ok(data, 'Verify that the requested user is returned');
                         */

                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the getMe functionality
    QUnit.asyncTest('getMe', function(assert) {
        expect(2);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.userAPI.getMe();
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that users can be retrieved without errors
            gh.api.userAPI.getMe(function(err, data) {

                /**
                 * TODO: wait for back-end implementation
                 *
                assert.ok(!err, 'Verify that the current can be retrieved without errors');
                assert.ok(data, 'Verify that the current user is returned');
                 */

                QUnit.start();
            });
        });
    });

    // Test the getUserCalender functionality
    QUnit.asyncTest('getUserCalender', function(assert) {
        expect(7);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid user id was provided
            gh.api.userAPI.getUserCalendar(null, '2013-10-01', '2014-07-31', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                // Verify that an error is thrown when no value for 'from' was provided
                gh.api.userAPI.getUserCalendar(user.id, null, '2014-07-31', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no value for from was provided');

                    // Verify that an error is thrown when an invalid value for 'from' was provided
                    gh.api.userAPI.getUserCalendar(user.id, 123, '2014-07-31', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for from was provided');

                        // Verify that an error is thrown when no value for 'to' was provided
                        gh.api.userAPI.getUserCalendar(user.id, '2013-10-01', null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for to was provided');

                            // Verify that an error is thrown when an invalid for 'to' was provided
                            gh.api.userAPI.getUserCalendar(user.id, '2013-10-01', 123, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid value for to was provided');

                                // Verify that an error is thrown when an invalid callback was provided
                                assert.throws(function() {
                                    gh.api.userAPI.getUserCalendar(user.id, '2013-10-01', '2014-07-31');
                                }, 'Verify that an error is thrown when an invalid callback was provided');

                                // Verify that a calendar can be retrieved without errors
                                gh.api.userAPI.getUserCalendar(user.id, '2013-10-01', '2014-07-31', function(err, data) {

                                    /**
                                     * Wait for back-end implementation
                                     *
                                    assert.ok(!err, 'Verify that a calendar can be retrieved without errors');
                                    assert.ok(data, 'Verify that a calendar is returned');
                                     */

                                    QUnit.start();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the getUserCalenderIcal functionality
    QUnit.asyncTest('getUserCalenderIcal', function(assert) {
        expect(5);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when no user id was provided
            gh.api.userAPI.getUserCalendarIcal(null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no user id was provided');

                // Verify that an error is thrown when an invalid user id was provided
                gh.api.userAPI.getUserCalendarIcal('invalid user id', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                    // Verify that an error is thrown when an invalid value for signature was provided
                    gh.api.userAPI.getUserCalendarIcal(user.id, ['invalid_value'], function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for signature was provided');

                        // Verify that an error is thrown when an invalid callback was provided
                        assert.throws(function() {
                            gh.api.userAPI.getUserCalendarIcal(user.id, null);
                        }, 'Verify that an error is thrown when an invalid callback was provided');

                        // Verify that calendars can be retrieved without errors
                        gh.api.userAPI.getUserCalendarIcal(user.id, null, function(err, data) {

                            /**
                             * Wait for back-end implementation
                             *
                            assert.ok(!err, 'Verify that users can be retrieved without errors');
                            assert.ok(data, 'Verify that the users are returned');
                             */

                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    // Test the getUserCalenderRss functionality
    QUnit.asyncTest('getUserCalenderRss', function(assert) {
        expect(5);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when no user id was provided
            gh.api.userAPI.getUserCalendarRss(null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no user id was provided');

                // Verify that an error is thrown when an invalid user id was provided
                gh.api.userAPI.getUserCalendarRss('invalid user id', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                    // Verify that an error is thrown when an invalid value for signature was provided
                    gh.api.userAPI.getUserCalendarRss(user.id, ['invalid_value'], function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for signature was provided');

                        // Verify that an error is thrown when an invalid callback was provided
                        assert.throws(function() {
                            gh.api.userAPI.getUserCalendarRss(user.id, null);
                        }, 'Verify that an error is thrown when an invalid callback was provided');

                        // Verify that calendars can be retrieved without errors
                        gh.api.userAPI.getUserCalendarRss(user.id, null, function(err, data) {

                            /**
                             * Wait for back-end implementation
                             *
                            assert.ok(!err, 'Verify that users can be retrieved without errors');
                            assert.ok(data, 'Verify that the users are returned');
                             */

                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    // Test the getUserUpcoming functionality
    QUnit.asyncTest('getUserUpcoming', function(assert) {
        expect(5);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid user id was provided
            gh.api.userAPI.getUserUpcoming(null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                // Verify that an error is thrown when an invalid value for 'limit' was provided
                gh.api.userAPI.getUserUpcoming(user.id, 'invalid_limit', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for offset was provided');

                    // Verify that an error is thrown when an invalid value for 'offset' was provided
                    gh.api.userAPI.getUserUpcoming(user.id, null, 'invalid_offset', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for offset was provided');

                        // Verify that an error is thrown when an invalid callback was provided
                        assert.throws(function() {
                            gh.api.userAPI.getUserUpcoming(user.id, null, null);
                        }, 'Verify that an error is thrown when an invalid callback was provided');

                        // Verify that the terms and conditions can be retrieved without errors
                        gh.api.userAPI.getUserUpcoming(user.id, null, null, function(err, data) {

                            /**
                             * Wait for back-end implementation
                             *
                            assert.ok(!err, 'Verify that the upcoming events can be retrieved without errors');
                            assert.ok(data, 'Verify that the upcoming events and conditions are returned');
                             */

                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    // Test the getTermsAndConditions functionality
    QUnit.asyncTest('getTermsAndConditions', function(assert) {
        expect(3);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when no callback was provided
            assert.throws(function() {
                gh.api.userAPI.getTermsAndConditions();
            }, 'Verify that an error is thrown when no callback was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.userAPI.getTermsAndConditions('invalid callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that the terms and conditions can be retrieved without errors
            gh.api.userAPI.getTermsAndConditions(function(err, data) {

                /**
                 * Wait for back-end implementation
                 *
                assert.ok(!err, 'Verify that the terms and conditions can be retrieved without errors');
                assert.ok(data, 'Verify that the terms and conditions are returned');
                 */

                QUnit.start();
            });
        });
    });

    // Test the acceptTermsAndConditions functionality
    QUnit.asyncTest('acceptTermsAndConditions', function(assert) {
        expect(4);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when no user id was provided
            gh.api.userAPI.acceptTermsAndConditions(null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no user id was provided');

                // Verify that an error is thrown when an invalid user id was provided
                gh.api.userAPI.acceptTermsAndConditions('invalid user id', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                    // Verify that an error is thrown when an invalid callback was provided
                    assert.throws(function() {
                        gh.api.userAPI.acceptTermsAndConditions(user.id);
                    }, 'Verify that an error is thrown when an invalid callback was provided');

                    // Verify that the terms and conditions can be accepted without errors
                    gh.api.userAPI.acceptTermsAndConditions(user.id, function(err, data) {

                        /**
                         * Wait for back-end implementation
                         *
                        assert.ok(err, 'Verify that the terms and conditions can be accepted without errors');
                         */

                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the createUser functionality
    QUnit.asyncTest('createUser', function(assert) {
        expect(14);

        var appId = testAPI.getRandomApp().id;
        var user = {
            'displayName': gh.api.utilAPI.generateRandomString(),
            'email': gh.api.utilAPI.generateRandomString(),
            'password': gh.api.utilAPI.generateRandomString()
        };

        // Verify that an error is thrown when no app id was provided
        gh.api.userAPI.createUser(null, null, user.email, user.password, null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no app id was provided');

            // Verify that an error is thrown when an invalid app id was provided
            gh.api.userAPI.createUser(999999, null, user.email, user.password, null, null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid app id was provided');

                // Verify that an error is thrown when an invalid value for 'displayName' was provided
                gh.api.userAPI.createUser(appId, null, user.email, user.password, null, null, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid display name was provided');

                    // Verify that an error is thrown when an invalid value for 'email' was provided
                    gh.api.userAPI.createUser(appId, user.displayName, null, user.password, null, null, null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid email address was provided');

                        // Verify that an error is thrown when an invalid value for 'password' was provided
                        gh.api.userAPI.createUser(appId, user.displayName, user.email, null, null, null, null, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for password was provided');

                            // Verify that an error is thrown when an invalid value for 'emailPreference' was provided
                            gh.api.userAPI.createUser(appId, user.displayName, user.email, user.password, ['invalid_value'], null, null, null, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid value for emailPreference was provided');

                                // Verify that an error is thrown when an invalid value for 'isAdmin' was provided
                                gh.api.userAPI.createUser(appId, user.displayName, user.email, user.password, null, 'invalid_isAdmin', null, null, function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when an invalid value for isAdmin was provided');

                                    // Verify that an error is thrown when an invalid value for 'recaptchaChallenge' was provided
                                    gh.api.userAPI.createUser(appId, user.displayName, user.email, user.password, null, null, ['invalid_value'], null, function(err, data) {
                                        assert.ok(err, 'Verify that an error is thrown when an invalid value for recaptchaChallenge was provided');

                                        // Verify that an error is thrown when an invalid value for 'recaptchaResponse' was provided
                                        gh.api.userAPI.createUser(appId, user.displayName, user.email, user.password, null, null, null, ['invalid_value'], function(err, data) {
                                            assert.ok(err, 'Verify that an error is thrown when an invalid value for recaptchaResponses was provided');

                                            // Verify that an error is thrown when an invalid callback was provided
                                            assert.throws(function() {
                                                gh.api.userAPI.createUser(appId, user.displayName, user.email, user.password, null, null, null, null);
                                            }, 'Verify that an error is thrown when an invalid callback was provided');

                                            // Verify that a user can be created without errors
                                            gh.api.userAPI.createUser(appId, user.displayName, user.email, user.password, null, null, null, null, function(err, data) {
                                                assert.ok(!err, 'Verify that a user can be created without errors');
                                                assert.ok(data, 'Verify that the created user is returned');

                                                // Mock an error from the back-end
                                                var body = {'code': 400, 'msg': 'Bad Request'};
                                                gh.api.utilAPI.mockRequest('POST', '/api/users', 400, {'Content-Type': 'application/json'}, body, function() {
                                                    gh.api.userAPI.createUser(appId, user.displayName, user.email, user.password, null, null, null, null, function(err, data) {
                                                        assert.ok(err);
                                                        assert.ok(!data);
                                                    });

                                                    QUnit.start();
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the importUsers functionality
    QUnit.asyncTest('importUsers', function(assert) {
        expect(8);

        // Get a random tenant id
        var tenantId = testAPI.getRandomTenant().id;

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid value for 'authenticationStrategy' was provided
            gh.api.userAPI.importUsers(null, 'some_file', tenantId, [user.AppId], true, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for authenticationStrategy was provided');

                // Verify that an error is thrown when an invalid value for 'file' was provided
                gh.api.userAPI.importUsers('local', null, tenantId, [user.AppId], true, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for file was provided');

                    // Verify that an error is thrown when an invalid value for 'tenantId' was provided
                    gh.api.userAPI.importUsers('local', 'some_file', null, [user.AppId], true, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for tenantId was provided');

                        // Verify that an error is thrown when an invalid value for 'appIds' was provided
                        gh.api.userAPI.importUsers('local', 'some_file', tenantId, null, true, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for appIds was provided');

                            // Verify that an error is thrown when an invalid value for 'appIds' was provided
                            gh.api.userAPI.importUsers('local', 'some_file', tenantId, 'invalid_appIds', true, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid value for appIds was provided');

                                // Verify that an error is thrown when an invalid value for 'forceProfileUpdate' was provided
                                gh.api.userAPI.importUsers('local', 'some_file', tenantId, [user.AppId], 'invalid_value', function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when an invalid value for forceProfileUpdate was provided');

                                    // Verify that an error is thrown when an invalid callback was provided
                                    assert.throws(function() {
                                        gh.api.userAPI.importUsers('local', 'some_file', tenantId, [user.AppId], true);
                                    }, 'Verify that an error is thrown when an invalid callback was provided');

                                    // Verify that users can be imported without errors
                                    gh.api.userAPI.importUsers('local', 'some_file', tenantId, [user.AppId], true, function(err, data) {

                                        /**
                                         * TODO: wait for back-end implementation
                                         *
                                        assert.ok(!err, 'Verify that users can be imported without errors');
                                        assert.ok(data, 'Verify that users can be imported without errors');
                                         */

                                        QUnit.start();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the updateUser functionality
    QUnit.asyncTest('updateUser', function(assert) {
        expect(8);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid value for 'userId' was provided
            gh.api.userAPI.updateUser(null, null, null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for userId was provided');

                // Verify that an error is thrown when no value for 'appId' was provided
                gh.api.userAPI.updateUser(user.id, null, null, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no value for appId was provided');

                    // Verify that an error is thrown when an invalid value for 'appId' was provided
                    gh.api.userAPI.updateUser(user.id, 'invalid app id', null, null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for appId was provided');

                        // Verify that an error is thrown when an invalid value for displayName was provided
                        gh.api.userAPI.updateUser(user.id, user.AppId, ['invalid_value'], null, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for displayName was provided');

                            // Verify that an error is thrown when an invalid value for email was provided
                            gh.api.userAPI.updateUser(user.id, user.AppId, null, ['invalid_value'], null, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid value for email was provided');

                                // Verify that an error is thrown when an invalid value for emailPreference was provided
                                gh.api.userAPI.updateUser(user.id, user.AppId, null, null, ['invalid_value'], function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when an invalid value for emailPreference was provided');

                                    // Verify that an error is thrown when an invalid callback was provided
                                    assert.throws(function() {
                                        gh.api.userAPI.updateUser(user.id, user.AppId, null, null, null);
                                    }, 'Verify that an error is thrown when an invalid callback was provided');

                                    // Verify that a user can be updated without errors
                                    gh.api.userAPI.updateUser(user.id, user.AppId, null, null, null, function(err, data) {

                                        /**
                                         * TODO: wait for back-end implementation
                                         *
                                        assert.ok(!err, 'Verify that a user can be updated without errors');
                                         */

                                        QUnit.start();
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the updateAdminStatus functionality
    QUnit.asyncTest('updateAdminStatus', function(assert) {
        expect(4);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid value for 'userId' was provided
            gh.api.userAPI.updateAdminStatus(null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for userId was provided');

                // Verify that an error is thrown when an invalid value for 'isAdmin' was provided
                gh.api.userAPI.updateAdminStatus(user.id, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for isAdmin was provided');

                    // Verify that an error is thrown when an invalid callback was provided
                    assert.throws(function() {
                        gh.api.userAPI.updateAdminStatus(user.id, true);
                    }, 'Verify that an error is thrown when an invalid callback was provided');

                    // Verify that the admin status can be updated without errors
                    gh.api.userAPI.updateAdminStatus(user.id, true, function(err, data) {

                        /**
                         * TODO: wait for back-end implementation
                         *
                        assert.ok(!err, 'Verify that the admin status can be updated without errors');
                        assert.ok(data, 'Verify that the updated user is returned');
                         */

                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the setUserPicture functionality
    QUnit.asyncTest('setUserPicture', function(assert) {
        expect(4);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid value for 'userId' was provided
            gh.api.userAPI.setUserPicture(null, 'some_file', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for userId was provided');

                // Verify that an error is thrown when an invalid value for 'file' was provided
                gh.api.userAPI.setUserPicture(user.id, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for file was provided');

                    // Verify that an error is thrown when an invalid callback was provided
                    assert.throws(function() {
                        gh.api.userAPI.setUserPicture(user.id, 'some_file');
                    }, 'Verify that an error is thrown when an invalid callback was provided');

                    // Verify that a picture can be set without errors
                    gh.api.userAPI.setUserPicture(user.id, 'some_file', function(err, data) {

                        /**
                         * TODO: wait for back-end implementation
                         *
                        assert.ok(!err, 'Verify that a picture can be set without errors');
                        assert.ok(data, 'Verify that the updated user is returned');
                         */

                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the cropPicture functionality
    QUnit.asyncTest('cropPicture', function(assert) {
        expect(9);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid value for 'userId' was provided
            gh.api.userAPI.cropPicture(null, 0, 0, 0, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for userId was provided');

                // Verify that an error is thrown when no value for 'width' was provided
                gh.api.userAPI.cropPicture(user.id, null, 0, 0, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no value for width was provided');

                    // Verify that an error is thrown when an invalid value for 'width' was provided
                    gh.api.userAPI.cropPicture(user.id, 'invalid width', 0, 0, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for width was provided');

                        // Verify that an error is thrown when an invalid value for 'x' was provided
                        gh.api.userAPI.cropPicture(user.id, 10, null, 0, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for x was provided');

                            // Verify that an error is thrown when an invalid value for 'x' was provided
                            gh.api.userAPI.cropPicture(user.id, 10, 'invalid x', 0, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid value for x was provided');

                                // Verify that an error is thrown when no value for 'y' was provided
                                gh.api.userAPI.cropPicture(user.id, 10, 10, null, function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when no value for y was provided');

                                    // Verify that an error is thrown when an invalid value for 'y' was provided
                                    gh.api.userAPI.cropPicture(user.id, 10, 10, 'invalid y', function(err, data) {
                                        assert.ok(err, 'Verify that an error is thrown when an invalid value for y was provided');

                                        // Verify that an error is thrown when an invalid callback was provided
                                        assert.throws(function() {
                                            gh.api.userAPI.cropPicture(user.id, 10, 10, 10);
                                        }, 'Verify that an error is thrown when an invalid callback was provided');

                                        // Verify that a picture can be cropped without errors
                                        gh.api.userAPI.cropPicture(user.id, 0, 0, 0, function(err, data) {

                                            /**
                                             * TODO: wait for back-end implementation
                                             *
                                            assert.ok(err, 'Verify that a picture can be cropped without errors');
                                            assert.ok(err, 'Verify that the updated user is returned');
                                             */

                                            QUnit.start();
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    testAPI.init();
});

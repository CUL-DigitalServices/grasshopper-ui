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

require(['gh.core', 'gh.api.tests'], function(gh, testAPI) {
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

            var appId = testAPI.getTestApp().id;
            var user = {
                'displayName': gh.utils.generateRandomString(),
                'email': gh.utils.generateRandomString() + '@mail.com',
                'password': gh.utils.generateRandomString()
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
        expect(10);

        var app = testAPI.getTestApp();

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when no app id was provided
            gh.api.userAPI.getUsers(null, 1, 2, 'query', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid app id was provided');

                // Verify that an error is thrown when no app id was provided
                gh.api.userAPI.getUsers('invalid_appId', 1, 2, 'query', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid app id was provided');

                    // Verify that an error is thrown when an invalid value for limit was provided
                    gh.api.userAPI.getUsers(app.id, 'invalid_limit', 1, 'query', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for limit was provided');

                        // Verify that an error is thrown when an invalid value for offset was provided
                        gh.api.userAPI.getUsers(app.id, 1, 'invalid_offset', 'query', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for offset was provided');

                            // Verify that an error is thrown when an invalid callback was provided
                            assert.throws(function() {
                                gh.api.userAPI.getUsers(app.id, null, null, null);
                            }, 'Verify that an error is thrown when an invalid callback was provided');

                            // Verify that an error is thrown when an invalid value for offset was provided
                            gh.api.userAPI.getUsers(app.id, null, null, 'query', function(err, data) {

                                // Verify that an error is thrown when an invalid value for query was provided
                                gh.api.userAPI.getUsers(app.id, null, null, 123, function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when an invalid value for query was provided');

                                    // Verify that users can be retrieved without an error
                                    gh.api.userAPI.getUsers(app.id, null, null, null, function(err, data) {
                                        assert.ok(!err, 'Verify that users can be retrieved without an error');
                                        assert.ok(data.results.length !== 0, 'Verify that users are returned');

                                        // Verify that the error is handled when the users can't be retrieved
                                        body = {'code': 400, 'msg': 'Bad Request'};
                                        gh.utils.mockRequest('GET', '/api/users?app=' + app.id + '&limit=&offset=&q=', 400, {'Content-Type': 'application/json'}, body, function() {
                                            gh.api.userAPI.getUsers(app.id, null, null, null, function(err, data) {
                                                assert.ok(err, 'Verify that the error is handled when the users can\'t be successfully retrieved');

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

    // Test the getUser functionality
    QUnit.asyncTest('getUser', function(assert) {
        expect(5);

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

                        // Verify that the error is handled when the users can't be retrieved
                        body = {'code': 400, 'msg': 'Bad Request'};
                        gh.utils.mockRequest('GET', '/api/users/' + user.id, 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.userAPI.getUser(user.id, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the user can\'t be successfully retrieved');

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the getUserMemberships functionality
    QUnit.asyncTest('getUserMemberships', function(assert) {
        expect(12);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when no callback was provided
            assert.throws(function() {
                gh.api.userAPI.getUserMemberships(user.id);
            }, 'Verify that an error is thrown when no callback was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.userAPI.getUserMemberships(user.id, null, null, 'invalid_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when an invalid limit was provided
            gh.api.userAPI.getUserMemberships(user.id, 'invalid_limit', null, function(err) {
                assert.ok(err, 'Verify that an error is thrown when an invalid limit was provided');

                // Verify that an error is thrown when an invalid offset was provided
                gh.api.userAPI.getUserMemberships(user.id, null, 'invalid_offset', function(err) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid offset was provided');

                    // Verify that an error is thrown when no user ID was provided
                    gh.api.userAPI.getUserMemberships(null, null, null, function(err) {
                        assert.ok(err, 'Verify that an error is thrown when no user ID was provided');

                        // Verify that an error is thrown when an invalid user ID was provided
                        gh.api.userAPI.getUserMemberships('invalid_userid', null, null, function(err) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid user ID was provided');

                            var testOrgUnit = testAPI.getRandomOrgUnit('part');

                            // Add the user to at least one group to test membership of
                            var update = {};
                            update[user.id] = true;
                            gh.api.groupsAPI.updateGroupMembers(testOrgUnit.id, update, function(err) {
                                assert.ok(!err, 'Verify that a user can be added to a group without getting an error');

                                // Verify that group membership can be successfully retrieved
                                gh.api.userAPI.getUserMemberships(user.id, 25, 0, function(err, memberships) {
                                    assert.ok(!err, 'Verify that group membership can be retrieved without getting an error');
                                    assert.equal(memberships.results.length, 1, 'Verify that the user is a member of exactly 1 group');
                                    assert.equal(memberships.results[0].id, testOrgUnit.id, 'Verify that the user is a member of the group we added the user to');

                                    // Verify that the error is handled when the group membership can't be retrieved
                                    body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.utils.mockRequest('GET', '/api/users/' + user.id + '/memberships', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.userAPI.getUserMemberships(user.id, null, null, function(err) {
                                            assert.ok(err, 'Verify that the error is handled when the group membership can\'t be successfully retrieved');

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

    // Test the getMe functionality
    QUnit.asyncTest('getMe', function(assert) {
        expect(5);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.userAPI.getMe();
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that the me feed can be successfully retrieved
            gh.api.userAPI.getMe(function(err, data) {
                assert.ok(!err, 'Verify that the me feed can be successfully retrieved');

                // Verify that the error is handled when the calendar can't be retrieved
                var body = {'code': 400, 'msg': 'Bad Request'};
                gh.utils.mockRequest('GET', '/api/me', 400, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.userAPI.getMe(function(err, data) {
                        assert.ok(err, 'Verify that the error is handled when the me feed can\'t be successfully retrieved');
                        assert.ok(!data, 'Verify that no data returns when the me feed can\'t be successfully retrieved');

                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the getUserCalender functionality
    QUnit.asyncTest('getUserCalender', function(assert) {
        expect(11);

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
                                gh.api.userAPI.getUserCalendar(user.id, '2010-01-01', '2015-12-31', function(err, data) {
                                    assert.ok(!err, 'Verify that a calendar can be retrieved without errors');
                                    assert.ok(data, 'Verify that a calendar is returned');

                                    // Mock an error from the back-end
                                    var body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.utils.mockRequest('GET', '/api/users/' + user.id + '?start=2010-01-01&end=2015-12-31', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.userAPI.getUserCalendar(user.id, '2010-01-01', '2015-12-31', function(err, data) {
                                            assert.ok(err, 'Verify that the error is handled when the user\'s calendar can\'t be successfully retrieved');
                                            assert.ok(!data, 'Verify that no data returns when the user\'s calendar can\'t be successfully retrieved');
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

    // Test the getUserCalenderIcal functionality
    QUnit.asyncTest('getUserCalenderIcal', function(assert) {
        expect(10);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when no user id was provided
            gh.api.userAPI.getUserCalendarIcal(null, 'signature', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no user id was provided');

                // Verify that an error is thrown when an invalid user id was provided
                gh.api.userAPI.getUserCalendarIcal('invalid user id', 'signature', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                    // Verify that an error is thrown when no signature was provided
                    gh.api.userAPI.getUserCalendarIcal(user.id, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when no signature was provided');

                        // Verify that an error is thrown when an invalid value for signature was provided
                        gh.api.userAPI.getUserCalendarIcal(user.id, ['invalid_value'], function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for signature was provided');

                            // Verify that an error is thrown when an invalid callback was provided
                            assert.throws(function() {
                                gh.api.userAPI.getUserCalendarIcal(user.id, null);
                            }, 'Verify that an error is thrown when an invalid callback was provided');

                            // Verify that calendars can be retrieved without errors
                            gh.api.userAPI.getUserCalendarIcal(user.id, user.calendarToken, function(err, data) {
                                assert.ok(!err, 'Verify that a user\'s iCal feed can be retrieved without errors');
                                assert.ok(data, 'Verify that the iCal feed is returned');

                                // Mock an error from the back-end
                                var body = {'code': 400, 'msg': 'Bad Request'};
                                gh.utils.mockRequest('GET', '/api/users/' + user.id + '/' + user.calendarToken + '/calendar.ical', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.userAPI.getUserCalendarIcal(user.id, user.calendarToken, function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the user\'s calendar can\'t be successfully retrieved');
                                        assert.ok(!data, 'Verify that no data returns when the user\'s calendar can\'t be successfully retrieved');

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

    // Test the getUserCalenderRss functionality
    QUnit.asyncTest('getUserCalenderRss', function(assert) {
        expect(8);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when no user id was provided
            gh.api.userAPI.getUserCalendarRss(null, 'signature', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no user id was provided');

                // Verify that an error is thrown when an invalid user id was provided
                gh.api.userAPI.getUserCalendarRss('invalid user id', 'signature', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                    // Verify that an error is thrown when no signature was provided
                    gh.api.userAPI.getUserCalendarRss(user.id, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when no signature was provided');

                        // Verify that an error is thrown when an invalid value for signature was provided
                        gh.api.userAPI.getUserCalendarRss(user.id, ['invalid_value'], function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for signature was provided');

                            // Verify that an error is thrown when an invalid callback was provided
                            assert.throws(function() {
                                gh.api.userAPI.getUserCalendarRss(user.id, 'signature', null);
                            }, 'Verify that an error is thrown when an invalid callback was provided');

                            // Verify that calendars can be retrieved without errors
                            gh.api.userAPI.getUserCalendarRss(user.id, user.calendarToken, function(err, data) {
                                // Mock an error from the back-end
                                var body = {'code': 400, 'msg': 'Bad Request'};
                                gh.utils.mockRequest('GET', '/api/users/' + user.id + '/' + user.calendarToken + '/calendar.rss', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.userAPI.getUserCalendarRss(user.id, user.calendarToken, function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the user\'s calendar can\'t be successfully retrieved');
                                        assert.ok(!data, 'Verify that no data returns when the user\'s calendar can\'t be successfully retrieved');

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

    // Test the resetToken functionality
    QUnit.asyncTest('resetToken', function(assert) {
        expect(9);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when no callback was provided
            assert.throws(function() {
                gh.api.userAPI.resetToken(user.id, null);
            }, 'Verify that an error is thrown when no callback was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.userAPI.resetToken(user.id, 'invalid callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no userId was provided
            gh.api.userAPI.resetToken(null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no userId was provided');

                // Verify that an error is thrown when an invalid userId was provided
                gh.api.userAPI.resetToken('invalid userid', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for userId was provided');

                    // Verify that a calendar token can be reset without errors
                    var oldCalendarToken = user.calendarToken;
                    gh.api.userAPI.resetToken(user.id, function(err, data) {
                        assert.ok(!err, 'Verify that a calendar token can be reset without errors');
                        assert.ok(data.calendarToken !== oldCalendarToken, 'Verify that the updated calendar token returns after resetting it');

                        // Mock an error from the back-end
                        var body = {'code': 400, 'msg': 'Bad Request'};
                        gh.utils.mockRequest('POST', '/api/users/' + user.id + '/token', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.userAPI.resetToken(user.id, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the user\'s token can\'t be successfully reset');
                                assert.ok(!data, 'Verify that no data returns when the user\'s token can\'t be successfully reset');
                            });

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
            gh.api.userAPI.getUserUpcoming(null, 0, 0, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                // Verify that an error is thrown when an invalid value for 'limit' was provided
                gh.api.userAPI.getUserUpcoming(user.id, 'invalid_limit', 0, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for offset was provided');

                    // Verify that an error is thrown when an invalid value for 'offset' was provided
                    gh.api.userAPI.getUserUpcoming(user.id, 0, 'invalid_offset', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for offset was provided');

                        // Verify that an error is thrown when an invalid callback was provided
                        assert.throws(function() {
                            gh.api.userAPI.getUserUpcoming(user.id, 0, 0);
                        }, 'Verify that an error is thrown when an invalid callback was provided');

                        // Verify that the terms and conditions can be retrieved without errors
                        gh.api.userAPI.getUserUpcoming(user.id, 0, 0, function(err, data) {

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

        var appId = testAPI.getTestApp().id;
        var user = {
            'displayName': gh.utils.generateRandomString(),
            'email': gh.utils.generateRandomString() + '@mail.com',
            'password': gh.utils.generateRandomString()
        };

        // Verify that an error is thrown when no app id was provided
        gh.api.userAPI.createUser(null, user.displayName, user.email, user.password, null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no app id was provided');

            // Verify that an error is thrown when an invalid app id was provided
            gh.api.userAPI.createUser(999999, user.displayName, user.email, user.password, null, null, null, null, function(err, data) {
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
                                            gh.api.userAPI.createUser(appId, user.displayName, user.email, user.password, 'immediate', true, null, null, function(err, data) {
                                                assert.ok(!err, 'Verify that a user can be created without errors');
                                                assert.ok(data, 'Verify that the created user is returned');

                                                // Mock an error from the back-end
                                                var body = {'code': 400, 'msg': 'Bad Request'};
                                                gh.utils.mockRequest('POST', '/api/users', 400, {'Content-Type': 'application/json'}, body, function() {
                                                    gh.api.userAPI.createUser(appId, user.displayName, user.email, user.password, null, null, null, null, function(err, data) {
                                                        assert.ok(err, 'Verify that the error is handled when the user can\'t be successfully created');
                                                        assert.ok(!data, 'Verify that no data returns when the user can\'t be successfully created');
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
        expect(15);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.userAPI.updateUser(user.id, null, null, null);
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when an invalid value for 'userId' was provided
            gh.api.userAPI.updateUser(null, null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for userId was provided');

                // Verify that an error is thrown when an invalid value for displayName was provided
                gh.api.userAPI.updateUser(user.id, ['invalid_value'], null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for displayName was provided');

                    // Verify that an error is thrown when an invalid value for email was provided
                    gh.api.userAPI.updateUser(user.id, null, ['invalid_value'], null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for email was provided');

                        // Verify that an error is thrown when an invalid value for emailPreference was provided
                        gh.api.userAPI.updateUser(user.id, null, null, ['invalid_value'], function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for emailPreference was provided');

                            // Verify that a user can be updated without errors when only specifying a new display name
                            var displayName = gh.utils.generateRandomString();
                            gh.api.userAPI.updateUser(user.id, displayName, null, null, function(err, data) {
                                assert.ok(!err, 'Verify that a user can be updated without errors');
                                assert.strictEqual(data.displayName, displayName, 'Verify that the user was updated successfully');

                                // Verify that a user can be updated without errors when only specifying a new email address
                                var emailAddress = gh.utils.generateRandomString() + '@name.com';
                                gh.api.userAPI.updateUser(user.id, null, emailAddress, null, function(err, data) {
                                    assert.ok(!err, 'Verify that a user can be updated without errors');
                                    assert.strictEqual(data.email, emailAddress, 'Verify that the user was updated successfully');

                                    // Verify that a user can be updated without errors when only specifying the email preference
                                    var emailPreference = 'immediate';
                                    gh.api.userAPI.updateUser(user.id, null, null, emailPreference, function(err, data) {
                                        assert.ok(!err, 'Verify that a user can be updated without errors');
                                        assert.strictEqual(data.emailPreference, emailPreference, 'Verify that the user was updated successfully');

                                        // Verify that a user can be updated without errors when all the parameters have been specified
                                        gh.api.userAPI.updateUser(user.id, 'someDisplayName', gh.utils.generateRandomString() + '@name.com', 'no', function(err, data) {
                                            assert.ok(!err, 'Verify that a user can be updated without errors');

                                            // Mock an error from the back-end
                                            var body = {'code': 400, 'msg': 'Bad Request'};
                                            gh.utils.mockRequest('POST', '/api/users/' + user.id + '?displayName=testdisplayname&email=display@name.com&emailPreference=no', 400, {'Content-Type': 'application/json'}, body, function() {
                                                gh.api.userAPI.updateUser(user.id, 'testdisplayname', 'display@name.com', 'no', function(err, data) {
                                                    assert.ok(err, 'Verify that the error is handled when the user can\'t be successfully updated');
                                                    assert.ok(!data, 'Verify that no data returns when the user can\'t be successfully updated');
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

    // Test the updateAdminStatus functionality
    QUnit.asyncTest('updateAdminStatus', function(assert) {
        expect(8);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid value for 'userId' was provided
            gh.api.userAPI.updateAdminStatus(null, true, function(err, data) {
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
                        assert.ok(!err, 'Verify that the admin status can be updated without errors');
                        assert.strictEqual(data.isAdmin, true, 'Verify that the admin status can be updated without errors');

                        // Mock an error from the back-end
                        var body = {'code': 400, 'msg': 'Bad Request'};
                        gh.utils.mockRequest('POST', '/api/users/' + user.id + '/admin', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.userAPI.updateAdminStatus(user.id, true, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the admin status can\'t be successfully updated');
                                assert.ok(!data, 'Verify that no data returns when the admin status can\'t be successfully updated');
                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the changePassword functionality
    QUnit.asyncTest('changePassword', function(assert) {
        expect(8);

        // Create a new user
        _generateRandomUser(function(err, user) {
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.userAPI.changePassword(user.id, 'new password', 'old password', 'not_a_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that a default callback is set when none is provided and no error is thrown
            assert.equal(null, gh.api.userAPI.changePassword(user.id, 'new password', 'old password'), 'Verify that a default callback is set when none is provided and no error is thrown');

            // Verify that an error is thrown when no userId was provided
            gh.api.userAPI.changePassword(null, 'new password', 'old password', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no userId was provided');

                // Verify that an error is thrown when an invalid value for userId was provided
                gh.api.userAPI.changePassword('invalid userid', 'new password', 'old password', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for userId was provided');

                    // Verify that an error is thrown when no newPassword was provided
                    gh.api.userAPI.changePassword(user.id, null, 'old password', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when no newPassword was provided');

                        // Verify that an error is thrown when an invalid value for newPassword was provided
                        gh.api.userAPI.changePassword(user.id, 123, 'old password', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for newPassword was provided');

                            // Verify that an error is thrown when an invalid value for newPassword was provided
                            gh.api.userAPI.changePassword(user.id, 'new password', 123, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid value for oldPassword was provided');
                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    testAPI.init();
});

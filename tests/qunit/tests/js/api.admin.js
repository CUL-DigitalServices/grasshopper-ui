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
    QUnit.module('Admin API');

    /*!
     * Generates a random user
     *
     * @param  {Function}    callback         Standard callback function
     * @param  {Object}      callback.err     Error object containing error code and error message
     * @param  {Object}      callback.user    Response object containing the created administrator
     * @private
     */
    var _generateRandomAdmin = function(callback) {

        var user = {
            'username': gh.api.utilAPI.generateRandomString(),
            'displayName': gh.api.utilAPI.generateRandomString(),
            'password': gh.api.utilAPI.generateRandomString()
        };

        // Create a new user
        gh.api.adminAPI.createAdmin(user.username, user.displayName, user.password, function(err, data) {
            if (err) {
                return callback(err);
            }
            return callback(null, data);
        });
    };

    // Test the getGlobalAdmins functionality
    QUnit.asyncTest('getGlobalAdmins', function(assert) {
        expect(9);

        // Create a new user
        _generateRandomAdmin(function(err, user) {
            assert.ok(!err, 'Verify that administrators can be created without retrieving an error');

            // Verify that an error is thrown when an invalid value for 'limit' was provided
            gh.api.adminAPI.getAdmins('some_string', null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for limit was provided');

                // Verify that an error is thrown when an invalid value for 'offset' was provided
                gh.api.adminAPI.getAdmins(null, 'some_string', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for offset was provided');

                    // Verify administrators can be retrieved without error when providing a limit and an offset
                    gh.api.adminAPI.getAdmins(10, 0, function(err, data) {
                        assert.ok(!err, 'Verify administrators can be retrieved without retrieving an error');

                        // Verify that an error is thrown when an invalid callback was provided
                        assert.throws(function() {
                            gh.api.adminAPI.getAdmins(null, null);
                        }, 'Verify that an error is thrown when an invalid callback was provided');

                        // Verify administrators can be retrieved without error
                        gh.api.adminAPI.getAdmins(null, null, function(err, data) {
                            assert.ok(!err, 'Verify that administrators can be retrieved without retrieving an error');
                            assert.ok(data, 'Verify that the administrators are returned');

                            // Mock an error from the back-end
                            var body = {'code': 400, 'msg': 'Bad Request'};
                            gh.api.utilAPI.mockRequest('GET', '/api/admins?limit=1&offset=1', 400, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.adminAPI.getAdmins(1, 1, function(err, data) {
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

    // Test the createGlobalAdmin functionality
    QUnit.asyncTest('createGlobalAdmin', function(assert) {
        expect(10);

        var user = {
            'username': gh.api.utilAPI.generateRandomString(),
            'displayName': gh.api.utilAPI.generateRandomString(),
            'password': gh.api.utilAPI.generateRandomString()
        };

        // Verify that an error is thrown when an invalid value for 'username' was provided
        gh.api.adminAPI.createAdmin(null, user.displayName, user.password, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid value for username was provided');

            // Verify that an error is thrown when an invalid value for 'displayName' was provided
            gh.api.adminAPI.createAdmin(user.username, null, user.password, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for displayName was provided');

                // Verify that an error is thrown when an invalid value for 'password' was provided
                gh.api.adminAPI.createAdmin(user.username, user.displayName, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for password was provided');

                    // Verify that an error is thrown when an invalid callback was provided
                    assert.throws(function() {
                        gh.api.adminAPI.createAdmin(user.username, user.displayName, user.password, null);
                    }, 'Verify that an error is thrown when an invalid callback was provided');

                    // Verify that administrators can be created without retrieving an error
                    gh.api.adminAPI.createAdmin(user.username, user.displayName, user.password, function(err, data) {
                        assert.ok(!err, 'Verify that administrators can be created without retrieving an error');
                        assert.ok(data, 'Verify that the created administrator is returned');
                        assert.strictEqual(data.username, user.username, 'Verify that the created administrator has the correct user name');
                        assert.strictEqual(data.displayName, user.displayName, 'Verify that the created administrator has the correct display name');

                        // Mock an error from the back-end
                        var body = {'code': 400, 'msg': 'Bad Request'};
                        gh.api.utilAPI.mockRequest('POST', '/api/admins', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.adminAPI.createAdmin(user.username, user.displayName, user.password, function(err, data) {
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

    // Test the updateGlobalAdmin functionality
    QUnit.asyncTest('updateGlobalAdmin', function(assert) {
        expect(11);

        // Create a new user
        _generateRandomAdmin(function(err, user) {
            assert.ok(!err, 'Verify that administrators can be created without retrieving an error');

            // Verify that an error is thrown when an invalid value for 'userId' was provided
            gh.api.adminAPI.updateAdmin(null, user.displayName, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for userId was provided');

                // Verify that an error is thrown when an invalid value for 'displayName' was provided
                gh.api.adminAPI.updateAdmin(user.id, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for displayName was provided');

                    // Generate a new display name for the administrator
                    var newDisplayName = gh.api.utilAPI.generateRandomString();

                    // Verify that an error is thrown when an invalid callback was provided
                    assert.throws(function() {
                        gh.api.adminAPI.updateAdmin(user.id, newDisplayName);
                    }, 'Verify that an error is thrown when an invalid callback was provided');

                    // Verify that an administrator can be updated without retrieving an error
                    gh.api.adminAPI.updateAdmin(user.id, newDisplayName, function(err, data) {
                        assert.ok(!err, 'Verify that an administrator can be updated without retrieving an error');
                        assert.ok(data, 'Verify that the updated administrator is returned');
                        assert.strictEqual(data.id, user.id, 'Verify that the correct administrator has been updated');
                        assert.strictEqual(data.username, user.username, 'Verify that the username remained unchanged');
                        assert.strictEqual(data.displayName, newDisplayName, 'Verify that the displayName was updated');

                        // Mock an error from the back-end
                        var body = {'code': 400, 'msg': 'Bad Request'};
                        gh.api.utilAPI.mockRequest('POST', '/api/admins', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.adminAPI.updateAdmin(user.id, newDisplayName, function(err, data) {
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

    testAPI.init();
});

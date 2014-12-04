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
    module('Authentication API');

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
            var displayName = gh.api.utilAPI.generateRandomString();
            var email = gh.api.utilAPI.generateRandomString() + '@' + gh.api.utilAPI.generateRandomString() + '.com';
            var password = gh.api.utilAPI.generateRandomString();

            // Create a new user
            gh.api.userAPI.createUser(appId, displayName, email, password, null, false, null, null, function(err, user) {
                if (err) {
                    return callback(err);
                }
                return callback(null, user, password);
            });
        });
    };


    //////////////////////////
    // LOCAL AUTHENTICATION //
    //////////////////////////

    // Test the login functionality
    QUnit.asyncTest('login', function(assert) {
        expect(7);

        // Create a new user
        _generateRandomUser(function(err, user, password) {
            // Stringify the user ID
            user.id = '' + user.id;
            assert.ok(!err, 'Verify that users can be created without retrieving an error');

            // Verify that an error is thrown when an invalid user id was provided
            gh.api.authenticationAPI.login(null, password, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                // Verify that an error is thrown when an invalid password was provided
                gh.api.authenticationAPI.login(user.id, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid password was provided');

                    // Verify that an error is thrown when an invalid callback was provided
                    assert.throws(function() {
                        gh.api.authenticationAPI.login(user.id, password);
                    }, 'Verify that an error is thrown when an invalid callback was provided');

                    // Verifty that a user can login without errors
                    // Since we're testing on global admin we're just using the default admin user and password here
                    gh.api.authenticationAPI.login('administrator', 'administrator', function(err, data) {
                        assert.ok(!err, 'Verifty that a user can login without errors');

                        // Mock an error from the back-end
                        var body = {'code': 400, 'msg': 'Bad Request'};
                        gh.api.utilAPI.mockRequest('POST', '/api/auth/login', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.authenticationAPI.login('administrator', 'administrator', function(err, data) {
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

    // Test the changePassword functionality


    ///////////////////////////////
    // SHIBBOLETH AUTHENTICATION //
    ///////////////////////////////

    // Test the shibbolethLogin functionality

    // Test the redirectToIdentityProvider functionality

    // Test the identityProviderCallback functionality

    // Test the redirectToOriginatingApp functionality


    //////////////////////////
    // SIGNED AUTHENTICATON //
    //////////////////////////

    // Test the becomeUser functionality
    QUnit.asyncTest('becomeUser', function(assert) {
        expect(3);

        // Verify that an error is thrown when no user id was provided
        gh.api.authenticationAPI.becomeUser(null, function(err) {
            assert.ok(err, 'Verify that an error is thrown when no user id was provided');

            // Verify that an error is thrown when an invalid user id was provided
            gh.api.authenticationAPI.becomeUser('invalid_user_id', function(err) {
                assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                // Verify that an error is thrown when an invalid callback was provided
                assert.throws(function() {
                    gh.api.authenticationAPI.becomeUser(1234, null);
                }, 'Verify that an error is thrown when an invalid callback was provided');

                // Verify that an administrator can login as another user without errors
                gh.api.authenticationAPI.becomeUser(1234, function(err, data) {

                    /*
                     * TODO: wait for back-end implementation
                     *
                    assert.ok(!err, 'Verify that an administrator can login as another user without errors');
                    */

                    QUnit.start();
                });
            });
        });
    });


    testAPI.init();
});

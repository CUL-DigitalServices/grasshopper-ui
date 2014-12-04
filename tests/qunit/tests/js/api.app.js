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
    module('App API');

    // Test the getApps functionality
    QUnit.asyncTest('getApps', function(assert) {
        expect(7);

        // Fetch a random test tenant
        var tenant = testAPI.getRandomTenant();

        // Verify that an error is thrown when an invalid tenantId was provided
        gh.api.appAPI.getApps(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid tenantId was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.appAPI.getApps(tenant.id);
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that the apps can be retrieved without errors
            gh.api.appAPI.getApps(tenant.id, function(err, data) {
                assert.ok(!err, 'Verify that the apps can be retrieved without errors');
                assert.ok(data, 'Verify that the apps are returned');
                assert.strictEqual(tenant.apps.length, data.length, 'Verify that the correct apps are returned');

                // Mock an error from the back-end
                var body = {'code': 400, 'msg': 'Bad Request'};
                gh.api.utilAPI.mockRequest('GET', '/api/apps?tenantId=' + tenant.id, 400, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.appAPI.getApps(tenant.id, function(err, data) {
                        assert.ok(err);
                        assert.ok(!data);
                    });

                    QUnit.start();
                });
            });
        });
    });

    // Test the getApp functionality
    QUnit.asyncTest('getApp', function(assert) {
        expect(14);

        // Fetch a random test app
        var app = testAPI.getRandomApp();

        // Verify that an error is thrown when an invalid appId was provided
        gh.api.appAPI.getApp(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid appId was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.appAPI.getApp(app.id);
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an app can be retrieved without errors
            gh.api.appAPI.getApp(app.id, function(err, data) {
                assert.ok(!err, 'Verify that an app can be retrieved without errors');
                assert.ok(data, 'Verify that the requested app is returned');
                assert.strictEqual(data.id, app.id, 'Verify that the appId corresponds');
                assert.strictEqual(data.displayName, app.displayName, 'Verify that the displayName corresponds');
                assert.strictEqual(data.host, app.host, 'Verify that the host corresponds');
                assert.strictEqual(data.type, app.type, 'Verify that the type corresponds');
                assert.strictEqual(data.enabled, app.enabled, 'Verify that the enabled value corresponds');
                assert.strictEqual(data.createdAt, app.createdAt, 'Verify that the createdAt value corresponds');
                assert.strictEqual(data.updatedAt, app.updatedAt, 'Verify that the updatedAt value corresponds');
                assert.strictEqual(data.TenantId, app.TenantId, 'Verify that the tenantId corresponds');

                // Mock an error from the back-end
                var body = {'code': 400, 'msg': 'Bad Request'};
                gh.api.utilAPI.mockRequest('GET', '/api/apps/' + app.id, 400, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.appAPI.getApp(app.id, function(err, data) {
                        assert.ok(err);
                        assert.ok(!data);
                    });

                    QUnit.start();
                });
            });
        });
    });

    // Test the getAppAdmins functionality
    QUnit.asyncTest('getAppAdmins', function(assert) {
        expect(8);

        // Fetch a random test app
        var app = testAPI.getRandomApp();

        // Verify that an error is thrown when an invalid appId was provided
        gh.api.appAPI.getAppAdmins(null, 0, 0, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid appId was provided');

            // Verify that an error is thrown when an invalid value for 'limit' was provided
            gh.api.appAPI.getAppAdmins(app.id, 'invalid_limit', 0, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid value for limit was provided');

                // Verify that an error is thrown when an invalid value for 'offset' was provided
                gh.api.appAPI.getAppAdmins(app.id, 0, 'invalid_offset', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for limit was provided');

                    // Verify that an error is thrown when an invalid callback was provided
                    assert.throws(function() {
                        gh.api.appAPI.getAppAdmins(app.id, 0, 0);
                    }, 'Verify that an error is thrown when an invalid callback was provided');

                    // Verify that an application's administrators can be retrieved without errors
                    gh.api.appAPI.getAppAdmins(app.id, 0, 0, function(err, data) {
                        assert.ok(!err, 'Verify that an application\'s administrators can be retrieved without errors');
                        assert.ok(data, 'Verify that the administrators are returned');

                        // Mock an error from the back-end
                        var body = {'code': 400, 'msg': 'Bad Request'};
                        gh.api.utilAPI.mockRequest('GET', '/api/apps/' + app.id + '/admins?limit=0&offset=0', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.appAPI.getAppAdmins(app.id, 0, 0, function(err, data) {
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

    // Test the createApp functionality
    QUnit.asyncTest('createApp', function(assert) {
        expect(13);

        var displayName = gh.api.utilAPI.generateRandomString(true);
        var host = gh.api.utilAPI.generateRandomString(true);
        var tenant = testAPI.getRandomTenant();
        var types = testAPI.getTypes();

        // Verify that an error is thrown when an invalid displayName was provided
        gh.api.appAPI.createApp(null, host, tenant.id, types.TIMETABLE, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

            // Verify that an error is thrown when an invalid host was provided
            gh.api.appAPI.createApp(displayName, null, tenant.id, types.TIMETABLE, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid host was provided');

                // Verify that an error is thrown when an invalid tenantId was provided
                gh.api.appAPI.createApp(displayName, host, null, types.TIMETABLE, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid tenantId was provided');

                    // Verify that an error is thrown when an invalid type was provided
                    gh.api.appAPI.createApp(displayName, host, tenant.id, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid type was provided');

                        // Verify that an error is thrown when an invalid callback was provided
                        assert.throws(function() {
                            gh.api.appAPI.createApp(displayName, host, tenant.id, types.TIMETABLE);
                        }, 'Verify that an error is thrown when an invalid callback was provided');

                        // Verify that an app can be created without errors
                        gh.api.appAPI.createApp(displayName, host, tenant.id, types.TIMETABLE, function(err, data) {
                            assert.ok(!err, 'Verify that an app can be created without errors');
                            assert.ok(data, 'Verify that the created app is returned');
                            assert.strictEqual(data.displayName, displayName, 'Verify that the displayName corresponds');
                            assert.strictEqual(data.host, host, 'Verify that the host corresponds');
                            assert.strictEqual(data.TenantId, tenant.id, 'Verify that the tenantId corresponds');
                            assert.strictEqual(data.type, types.TIMETABLE, 'Verify that the type corresponds');

                            // Mock an error from the back-end
                            var body = {'code': 400, 'msg': 'Bad Request'};
                            gh.api.utilAPI.mockRequest('POST', '/api/apps', 400, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.appAPI.createApp(displayName, host, tenant.id, types.TIMETABLE, function(err, data) {
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

    // Test the updateApp functionality
    QUnit.asyncTest('updateApp', function(assert) {
        expect(17);

        // Fetch a random app
        var app = testAPI.getRandomApp();

        var displayName = gh.api.utilAPI.generateRandomString(true);
        var enabled = !app.enabled;
        var host = gh.api.utilAPI.generateRandomString(true);

        // Verify that an error is thrown when an invalid appId was provided
        gh.api.appAPI.updateApp(null, displayName, enabled, host, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid appId was provided');

            // Verify that an error is thrown when an invalid displayName was provided
            gh.api.appAPI.updateApp(app.id, {}, enabled, host, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

                // Verify that an error is thrown when an invalid value for enabled was provided
                gh.api.appAPI.updateApp(app.id, displayName, 'invalid_value_for_enabled', host, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid value for enabled was provided');

                    // Verify that an error is thrown when an invalid host was provided
                    gh.api.appAPI.updateApp(app.id, displayName, enabled, {}, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid host was provided');

                        // Verify that an error is thrown when an invalid callback was provided
                        assert.throws(function() {
                            gh.api.appAPI.updateApp(app.id, displayName, enabled, host);
                        }, 'Verify that an error is thrown when an invalid callback was provided');

                        // Verify that an app can be updated without errors
                        gh.api.appAPI.updateApp(app.id, displayName, enabled, host, function(err, data) {
                            assert.ok(!err, 'Verify that an app can be updated without errors');
                            assert.ok(data, 'Verify that the updated app is returned');
                            assert.strictEqual(data.displayName, displayName, 'Verify that the displayName corresponds');
                            assert.strictEqual(data.enabled, enabled, 'Verify that the value for enabled corresponds');
                            assert.strictEqual(data.host, host, 'Verify that the host corresponds');
                            assert.strictEqual(data.id, app.id, 'Verify that the app id remained the same');
                            assert.strictEqual(data.type, app.type, 'Verify that the type remained the same');
                            assert.strictEqual(data.createdAt, app.createdAt, 'Verify that the value for createdAt remained the same');
                            assert.strictEqual(data.TenantId, app.TenantId, 'Verify that the tenant id remained the same');
                            assert.ok(data.updatedAt !== app.updatedAt, 'Verify that the value for updatedAt was changed');

                            // Mock an error from the back-end
                            var body = {'code': 400, 'msg': 'Bad Request'};
                            gh.api.utilAPI.mockRequest('POST', '/api/apps/' + app.id, 400, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.appAPI.updateApp(app.id, displayName, enabled, host, function(err, data) {
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

    // Test the updateAppAdmins functionality
    QUnit.asyncTest('updateAppAdmins', function(assert) {
        expect(12);

        // Fetch a random test app
        var app = testAPI.getRandomApp();

        // Login with the global administrator
        gh.api.authenticationAPI.login('administrator', 'administrator', function(err, data) {
            assert.ok(!err, 'Verify that the administrator is logged in successfully');

            var displayName = gh.api.utilAPI.generateRandomString();
            var email = gh.api.utilAPI.generateRandomString();
            var password = gh.api.utilAPI.generateRandomString();

            // Create a new user
            gh.api.userAPI.createUser(app.id, displayName, email, password, null, true, null, null, function(err, user) {
                assert.ok(!err, 'Verify that the user was created without errors');

                // Fetch the app administrators
                gh.api.appAPI.getAppAdmins(app.id, null, null, function(err, data) {
                    assert.ok(!err, 'Verify that an application\'s administrators can be retrieved without errors');
                    assert.ok(data, 'Verify that the administrators are returned');

                    // Get the administrator that needs to be updated
                    var administrator = _.find(data.rows, {'id': user.id});

                    // Verify that an error is thrown when an invalid appId was provided
                    gh.api.appAPI.updateAppAdmins(null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid appId was provided');

                        // Verify that an error is thrown when an invalid value for administrators was provided
                        gh.api.appAPI.updateAppAdmins(app.id, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for administrators was provided');

                            // Verify that an error is thrown when an invalid value for administrators was provided
                            gh.api.appAPI.updateAppAdmins(app.id, 'invalid_value', function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid value for administrators was provided');

                                // Verify that an error is thrown when an invalid callback was provided
                                assert.throws(function() {
                                    gh.api.appAPI.updateAppAdmins(app.id, {}, 'invalid_callback');
                                }, 'Verify that an error is thrown when an invalid callback was provided');

                                // Verify that a default callback is set when none is provided and no error is thrown
                                assert.equal(null, gh.api.appAPI.updateAppAdmins(app.id, {}), 'Verify that a default callback is set when none is provided and no error is thrown');

                                var adminUpdates = {};
                                adminUpdates[administrator.id] = false;

                                // Verify that an app admin can be updated without errors
                                gh.api.appAPI.updateAppAdmins(app.id, adminUpdates, function(err) {
                                    assert.ok(!err, 'Verify that an app administrator can be updated without errors');

                                    // Mock an error from the back-end
                                    var body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.api.utilAPI.mockRequest('POST', '/api/apps/' + app.id + '/admins', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.appAPI.updateAppAdmins(app.id, adminUpdates, function(err) {
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

    testAPI.init();
});

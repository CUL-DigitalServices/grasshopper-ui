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
    module('Tenant API');

    // Test the getTenants functionality
    QUnit.asyncTest('getTenants', function(assert) {
        expect(5);

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.tenantAPI.getTenants();
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that the tenants can be retrieved without errors
        gh.api.tenantAPI.getTenants(function(err, data) {
            assert.ok(!err, 'Verify that the tenants can be retrieved without errors');
            assert.ok(data, 'Verify that the tenants are returned');

            // Mock an error from the back-end
            var body = {'code': 400, 'msg': 'Bad Request'};
            gh.api.utilAPI.mockRequest('GET', '/api/tenants', 400, {'Content-Type': 'application/json'}, body, function() {
                gh.api.tenantAPI.getTenants(function(err, data) {
                    assert.ok(err);
                    assert.ok(!data);
                });

                QUnit.start();
            });
        });
    });

    // Test the getTenant functionality
    QUnit.asyncTest('getTenant', function(assert) {
        expect(6);

        // Fetch a random tenant
        var tenant = testAPI.getRandomTenant();

        // Verify that an error is thrown when an invalid tenant id was provided
        gh.api.tenantAPI.getTenant(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid tenant id was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.tenantAPI.getTenant(tenant.id);
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that a tenant can be returend without errors
            gh.api.tenantAPI.getTenant(tenant.id, function(err, data) {
                assert.ok(!err, 'Verify that a tenant can be returend without errors');
                assert.ok(data, 'Verify that the tenant is returned');

                // Mock an error from the back-end
                var body = {'code': 400, 'msg': 'Bad Request'};
                gh.api.utilAPI.mockRequest('GET', '/api/tenants/' + tenant.id, 400, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.tenantAPI.getTenant(tenant.id, function(err, data) {
                        assert.ok(err);
                        assert.ok(!data);
                    });

                    QUnit.start();
                });
            });
        });
    });

    // Test the createTenant functionality
    QUnit.asyncTest('createTenant', function(assert) {
        expect(7);

        // Generate a display name
        var displayName = gh.api.utilAPI.generateRandomString(true);

        // Verify that an error is thrown when an invalid displayName was provided
        gh.api.tenantAPI.createTenant(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.tenantAPI.createTenant(displayName);
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that a tenant can be created without errors
            gh.api.tenantAPI.createTenant(displayName, function(err, data) {
                assert.ok(!err, 'Verify that a tenant can be created without errors');
                assert.ok(data, 'Verify that the created tenant is returned');
                assert.strictEqual(data.displayName, displayName, 'Verify that the displayName corresponds');

                // Mock an error from the back-end
                var body = {'code': 400, 'msg': 'Bad Request'};
                gh.api.utilAPI.mockRequest('POST', '/api/tenants', 400, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.tenantAPI.createTenant(displayName, function(err, data) {
                        assert.ok(err);
                        assert.ok(!data);
                    });

                    QUnit.start();
                });
            });
        });
    });

    // Test the updateTenant functionality
    QUnit.asyncTest('updateTenant', function(assert) {
        expect(8);

        // Fetch a random tenant
        var tenant = testAPI.getRandomTenant();

        // Generate a display name
        var displayName = gh.api.utilAPI.generateRandomString(true);

        // Verify that an error is thrown when an invalid tenantId was provided
        gh.api.tenantAPI.updateTenant(null, displayName, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when an invalid tenantId was provided');

            // Verify that an error is thrown when an invalid displayName was provided
            gh.api.tenantAPI.updateTenant(tenant.id, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

                // Verify that an error is thrown when an invalid callback was provided
                assert.throws(function() {
                    gh.api.tenantAPI.updateTenant(tenant.id, displayName);
                }, 'Verify that an error is thrown when an invalid callback was provided');

                // Verify that a tenant can be updated without errors
                gh.api.tenantAPI.updateTenant(tenant.id, displayName, function(err, data) {
                    assert.ok(!err, 'Verify that a tenant can be updated without errors');
                    assert.ok(data, 'Verify that the updated tenant is returned');
                    assert.strictEqual(data.displayName, displayName, 'Verify that the displayName corresponds');

                    // Mock an error from the back-end
                    var body = {'code': 400, 'msg': 'Bad Request'};
                    gh.api.utilAPI.mockRequest('POST', '/api/tenants/' + tenant.id, 400, {'Content-Type': 'application/json'}, body, function() {
                        gh.api.tenantAPI.updateTenant(tenant.id, displayName, function(err, data) {
                            assert.ok(err);
                            assert.ok(!data);
                        });

                        QUnit.start();
                    });
                });
            });
        });
    });

    testAPI.init();
});

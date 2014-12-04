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
    module('Config API');

    // Test the getConfigSchema functionality
    QUnit.asyncTest('getConfigSchema', function(assert) {
        expect(2);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.configAPI.getConfigSchema();
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.configAPI.getConfigSchema('invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that the config schema can be retrieved without errors
        gh.api.configAPI.getConfigSchema(function(err, data) {

            /*
             * TODO: wait for back-end implementation
             *
            assert.ok(!err, 'Verify that the config schema can be retrieved without errors');
            assert.ok(data, 'Verify that the config schema is returned');
            */

            QUnit.start();
        });
    });

    // Test the getConfig functionality
    QUnit.asyncTest('getConfig', function(assert) {
        expect(2);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.configAPI.getConfig();
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.configAPI.getConfig('invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that the configurations can be retrieved without errors
        gh.api.configAPI.getConfig(function(err, data) {

            /*
             * TODO: wait for back-end implementation
             *
            assert.ok(!err. 'Verify that the configurations can be retrieved without errors');
            assert.ok(data, 'Verify that the configurations are returned');
            */

            QUnit.start();
        });
    });

    // Test the getConfigByApp functionality
    QUnit.asyncTest('getConfigByApp', function(assert) {
        expect(4);

        // Verify that an error is thrown when no appId was provided
        gh.api.configAPI.getConfigByApp(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no appId was provided');

            // Verify that an error is thrown when an invalid appId was provided
            gh.api.configAPI.getConfigByApp('invalid_app_id', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid appId was provided');

                // Fetch a random test app
                var app = testAPI.getRandomApp();

                // Verify that an error is thrown when no callback was provided
                assert.throws(function() {
                    gh.api.configAPI.getConfigByApp(app.id);
                }, 'Verify that an error is thrown when no callback was provided');

                // Verify that an error is thrown when an invalid callback was provided
                assert.throws(function() {
                    gh.api.configAPI.getConfigByApp(app.id, 'invalid_callback');
                }, 'Verify that an error is thrown when an invalid callback was provided');

                // Verify that the configurations can be retrieved without errors
                gh.api.configAPI.getConfigByApp(app.id, function(err, data) {

                    /*
                     * TODO: wait for back-end implementation
                     *
                    assert.ok(!err. 'Verify that the configurations can be retrieved without errors');
                    assert.ok(data, 'Verify that the configurations are returned');
                    */

                    QUnit.start();
                });
            });
        });
    });

    // Test the updateConfig functionality
    QUnit.asyncTest('updateConfig', function(assert) {
        expect(3);

        // Verify that an error is thrown when no configValues were provided
        gh.api.configAPI.updateConfig(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no configValues are provided');

            // Verify that an error is thrown when invalid configValues were provided
            gh.api.configAPI.updateConfig('invalid_configuration_values', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when invalid configValues are provided');

                // Verify that an error is thrown when an invalid callback was provided
                assert.throws(function() {
                    gh.api.configAPI.updateConfig({'key1': 'val1'}, 'invalid_callback');
                }, 'Verify that an error is thrown when an invalid callback was provided');

                gh.api.configAPI.updateConfig({'key1': 'val1'}, function(err) {

                    /*
                     * TODO: wait for back-end implementation
                     *
                    assert.ok(!err. 'Verify that the configurations can be updated without errors');
                     */

                    // Invoke the funtionality without callback
                    gh.api.configAPI.updateConfig({'key1': 'val1'});

                    QUnit.start();
                });
            });
        });
    });

    // Test the updateConfigByApp functionality
    QUnit.asyncTest('updateConfigByApp', function(assert) {
        expect(4);

        // Fetch a random test app
        var app = testAPI.getRandomApp();

        // Verify that an error is thrown when no appId was provided
        gh.api.configAPI.updateConfigByApp(null, {'key1': 'val1'}, function(err) {
            assert.ok(err, 'Verify that an error is thrown when no appId was provided');

            // Verify that an error is thrown when no configValues were provided
            gh.api.configAPI.updateConfigByApp(app.id, null, function(err) {
                assert.ok(err, 'Verify that an error is thrown when no configValues were provided');

                // Verify that an error is thrown when invalid configValues were provided
                gh.api.configAPI.updateConfigByApp(app.id, 'invalid_configuration_values', function(err) {
                    assert.ok(err, 'Verify that an error is thrown when invalid configValues were provided');

                    // Verify that an error is thrown when an invalid callback was provided
                    assert.throws(function() {
                        gh.api.configAPI.updateConfigByApp(app.id, {'key1': 'val1'}, 'invalid_callback');
                    }, 'Verify that an error is thrown when an invalid callback was provided');

                    gh.api.configAPI.updateConfigByApp(app.id, {'key1': 'val1'}, function(err) {

                        /*
                         * TODO: wait for back-end implementation
                         *
                        assert.ok(!err. 'Verify that the configurations can be updated without errors');
                         */

                        // Invoke the funtionality without callback
                        gh.api.configAPI.updateConfigByApp(app.id, {'key1': 'val1'});

                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the clearConfig functionality
    QUnit.asyncTest('clearConfig', function(assert) {
        expect(3);

        // Verify that an error is thrown when no configuration values were provided
        gh.api.configAPI.clearConfig(null, function(err) {
            assert.ok(err, 'Verify that an error is thrown when no configuration values were provided');

            // Verify that an error is thrown when invalid configuration values were provided
            gh.api.configAPI.clearConfig('invalid_configuration_values', function(err) {
                assert.ok(err, 'Verify that an error is thrown when invalid configuration values were provided');

                // Fetch a random test app
                var app = testAPI.getRandomApp();

                // Verify that an error is thrown when an invalid callback was provided
                assert.throws(function() {
                    gh.api.configAPI.clearConfig(['key1', 'key2'], 'invalid_callback');
                }, 'Verify that an error is thrown when an invalid callback was provided');

                // Verify that the configurations can be cleared without errors
                gh.api.configAPI.clearConfig(['key1', 'key2'], function(err) {

                    /*
                     * TODO: wait for back-end implementation
                     *
                    assert.ok(!err. 'Verify that the configurations can be cleared without errors');
                     */

                    // Invoke the funtionality without callback
                    gh.api.configAPI.clearConfig(['key1', 'key2']);

                    QUnit.start();
                });
            });
        });
    });

    // Test the clearConfigByApp functionality
    QUnit.asyncTest('clearConfigByApp', function(assert) {
        expect(4);

        // Fetch a random test app
        var app = testAPI.getRandomApp();

        // Verify that an error is thrown when no appId was provided
        gh.api.configAPI.clearConfigByApp(null, ['key1', 'key2'], function(err) {
            assert.ok(err, 'Verify that an error is thrown when no appId was provided');

            // Verify that an error is thrown when no configuration values were provided
            gh.api.configAPI.clearConfigByApp(app.id, null, function(err) {
                assert.ok(err, 'Verify that an error is thrown when no configuration values were provided');

                // Verify that an error is thrown when invalid configuration values were provided
                gh.api.configAPI.clearConfigByApp(app.id, 'invalid_configuration_values', function(err) {
                    assert.ok(err, 'Verify that an error is thrown when invalid configuration values were provided');

                    // Verify that an error is thrown when an invalid callback function was provided
                    assert.throws(function() {
                        gh.api.configAPI.clearConfigByApp(app.id, ['key1', 'key2'], 'invalid_callback');
                    }, 'Verify that an error is thrown when an invalid callback was provided');

                    // Verify that the configurations can be cleared without errors
                    gh.api.configAPI.clearConfigByApp(app.id, ['key1', 'key2'], function(err) {

                        /*
                         * TODO: wait for back-end implementation
                         *
                        assert.ok(!err. 'Verify that the configurations can be cleared without errors');
                         */

                        // Invoke the funtionality without callback
                        gh.api.configAPI.clearConfigByApp(app.id, ['key1', 'key2']);

                        QUnit.start();
                    });
                });
            });
        });
    });

    testAPI.init();
});

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
    module('Event API');


    /////////////////
    //  UTILITIES  //
    /////////////////

    /**
     * Create a random event
     *
     * @param  {Object}      opts                 Object containing event properties
     * @param  {Function}    callback             Standard callback function
     * @param  {Error}       callback.err         Error object containing the error code and error message
     * @param  {Event}       callback.response    The created event
     * @private
     */
    var createRandomEvent = function(opts, callback) {

        // Fetch a random test app
        var app = testAPI.getTestApp();
        // Create a random user
        testAPI.createTestUser(app.id, false, function(err, user) {
            if (err) {
                throw new Error('The test user could not be created successfully');
            }

            opts = _.extend({
                'displayName': gh.utils.generateRandomString(true),
                'start': '2014-12-31',
                'end': '2015-01-01',
                'description': null,
                'group': null,
                'location': null,
                'notes': null,
                'organiserOther': null,
                'organiserUsers': [user.id],
                'serie': null,
                'type': null
            }, opts);

            gh.api.eventAPI.createEventByApp(app.id, opts.displayName, opts.start, opts.end, opts.description, opts.group, opts.location, opts.notes, opts.organiserOther, opts.organiserUsers, opts.serie, opts.type, function(err, data) {
                if (err) {
                    return callback(err);
                }
                return callback(null, data);
            });
        });
    };


    /////////////
    //  TESTS  //
    /////////////

    // Test the getEvent functionality
    QUnit.asyncTest('getEvent', function(assert) {
        expect(9);

        // Create a test event
        createRandomEvent(null, function(err, evt) {
            assert.ok(!err, 'Verify that an event can be created without errors');

            // Verify that an error is thrown when no callback was provided
            assert.throws(function() {
                gh.api.eventAPI.getEvent(evt.id);
            }, 'Verify that an error is thrown when no callback was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.eventAPI.getEvent(evt.id, 'invalid_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no eventId was provided
            gh.api.eventAPI.getEvent(null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no eventId was provided');

                // Verify that an error is thrown when an invalid eventId was provided
                gh.api.eventAPI.getEvent('invalid_event_id', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid eventId was provided');

                    // Verify that an event can be retrieved without errors
                    gh.api.eventAPI.getEvent(evt.id, function(err, data) {
                        assert.ok(!err, 'Verify that an event can be retrieved without errors');
                        assert.ok(data, 'Verify that the requested event is returned');

                        // Verify that a thrown is handled successfully
                        var body = {'code': 400, 'msg': 'Bad Request'};
                        gh.utils.mockRequest('GET', '/api/events/' + evt.id, 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.eventAPI.getEvent(evt.id, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when the back-end errored');
                                assert.ok(!data, 'Verify that no data is returned when an error is thrown');
                            });

                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    // Test the createEvent functionality
    QUnit.asyncTest('createEvent', function(assert) {
        expect(21);

        // Fetch a random test app
        var app = testAPI.getTestApp();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.eventAPI.createEvent('displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.eventAPI.createEvent('displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no displayName was provided
        gh.api.eventAPI.createEvent(null, '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no displayName was provided');

            // Verify that an error is thrown when an invalid displayName was provided
            gh.api.eventAPI.createEvent(1234, '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

                // Verify that an error is thrown when no value for start was provided
                gh.api.eventAPI.createEvent('displayName', null, '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no value for start was provided');

                    // Verify that an error is thrown when an invalid value for start was provided
                    gh.api.eventAPI.createEvent('displayName', 1234, '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for start was provided');

                        // Verify that an error is thrown when no value for end was provided
                        gh.api.eventAPI.createEvent('displayName', '2014-12-31', null, 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no value for end was provided');

                            // Verify that an error is thrown when an invalid value for end was provided
                            gh.api.eventAPI.createEvent('displayName', '2014-12-31', 1234, 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid value for end was provided');

                                // Verify that an error is thrown when an invalid value for description was provided
                                gh.api.eventAPI.createEvent('displayName', '2014-12-31', '2015-01-01', 1234, null, 'location', 'notes', null, null, null, null, function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when an invalid value for description was provided');

                                    // Verify that an error is thrown when an invalid value for groupId was provided
                                    gh.api.eventAPI.createEvent('displayName', '2014-12-31', '2015-01-01', 'description', 'invalid_group_id', 'location', 'notes', null, null, null, null, function(err, data) {
                                        assert.ok(err, 'Verify that an error is thrown when an invalid value for groupId was provided');

                                        // Verify that an error is thrown when an invalid value for location was provided
                                        gh.api.eventAPI.createEvent('displayName', '2014-12-31', '2015-01-01', 'description', null, 1234, 'notes', null, null, null, null, function(err, data) {
                                            assert.ok(err, 'Verify that an error is thrown when an invalid value for location was provided');

                                            // Verify that an error is thrown when an invalid value for notes was provided
                                            gh.api.eventAPI.createEvent('displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 1234, null, null, null, null, function(err, data) {
                                                assert.ok(err, 'Verify that an error is thrown when an invalid value for notes was provided');

                                                // Verify that an error is thrown when an invalid value for organiserOther was provided
                                                gh.api.eventAPI.createEvent('displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', 1234, null, null, null, function(err, data) {
                                                    assert.ok(err, 'Verify that an error is thrown when an invalid value for organiserOther was provided');

                                                    // Verify that an error is thrown when an invalid value for organiserUsers was provided
                                                    gh.api.eventAPI.createEvent('displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, 'invalid_organiser_users', null, null, function(err, data) {
                                                        assert.ok(err, 'Verify that an error is thrown when an invalid value for organiserUsers was provided');

                                                        // Verify that an error is thrown when an invalid value for seriesId was provided
                                                        gh.api.eventAPI.createEvent('displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, 'invalid_series_id', null, function(err, data) {
                                                            assert.ok(err, 'Verify that an error is thrown when an invalid value for seriesId was provided');

                                                            // Verify that an error is thrown when an invalid value for type was provided
                                                            gh.api.eventAPI.createEvent('displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, 1234, function(err, data) {
                                                                assert.ok(err, 'Verify that an error is thrown when an invalid value for type was provided');

                                                                // Create a test series
                                                                gh.api.seriesAPI.createSeries(app.id, 'displayName', 'Test description', 1, function(err, data) {
                                                                    assert.ok(!err, 'Verify that the test series have been created without errors');

                                                                    // Verify that an event can be created without errors
                                                                    var body = {'code': 200, 'msg': 'OK'};
                                                                    gh.utils.mockRequest('POST', '/api/events', 200, {'Content-Type': 'application/json'}, body, function() {
                                                                        gh.api.eventAPI.createEvent('displayName', '2014-12-31', '2015-01-01', 'description', 1, 'location', 'notes', ['John Doe', 'Jane Doe'], ['jd232', 'jd539'], data.id, 'Lecture', function(err, data) {
                                                                            assert.ok(!err, 'Verify that an event can be created without errors');
                                                                            assert.ok(data, 'Verify that the created event is returned');

                                                                            // Verify that a thrown error is handled successfully
                                                                            var body = {'code': 400, 'msg': 'Bad Request'};
                                                                            gh.utils.mockRequest('POST', '/api/events', 400, {'Content-Type': 'application/json'}, body, function() {
                                                                                gh.api.eventAPI.createEvent('displayName', '2014-12-31', '2015-01-01', null, null, null, null, null, null, null, null, function(err, data) {
                                                                                    assert.ok(err, 'Verify that an error is thrown when the back-end errored');
                                                                                    assert.ok(!data, 'Verify that no data is returned when an error is thrown');
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
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the createEventByApp functionality
    QUnit.asyncTest('createEventByApp', function(assert) {
        expect(23);

        // Fetch a random test app
        var app = testAPI.getTestApp();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no appId was provided
        gh.api.eventAPI.createEventByApp(null, 'displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no appId was provided');

            // Verify that an error is thrown when an invalid appId was provided
            gh.api.eventAPI.createEventByApp('invalid_app_id', 'displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid appId was provided');

                // Verify that an error is thrown when no displayName was provided
                gh.api.eventAPI.createEventByApp(app.id, null, '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no displayName was provided');

                    // Verify that an error is thrown when an invalid displayName was provided
                    gh.api.eventAPI.createEventByApp(app.id, 1234, '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

                        // Verify that an error is thrown when no value for start was provided
                        gh.api.eventAPI.createEventByApp(app.id, 'displayName', null, '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no value for start was provided');

                            // Verify that an error is thrown when an invalid value for start was provided
                            gh.api.eventAPI.createEventByApp(app.id, 'displayName', 1234, '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid value for start was provided');

                                // Verify that an error is thrown when no value for end was provided
                                gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', null, 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when no value for end was provided');

                                    // Verify that an error is thrown when an invalid value for end was provided
                                    gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', 1234, 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                                        assert.ok(err, 'Verify that an error is thrown when an invalid value for end was provided');

                                        // Verify that an error is thrown when an invalid value for description was provided
                                        gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', '2015-01-01', 1234, null, 'location', 'notes', null, null, null, null, function(err, data) {
                                            assert.ok(err, 'Verify that an error is thrown when an invalid value for description was provided');

                                            // Verify that an error is thrown when an invalid value for groupId was provided
                                            gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', '2015-01-01', 'description', 'invalid_group_id', 'location', 'notes', null, null, null, null, function(err, data) {
                                                assert.ok(err, 'Verify that an error is thrown when an invalid value for groupId was provided');

                                                // Verify that an error is thrown when an invalid value for location was provided
                                                gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', '2015-01-01', 'description', null, 1234, 'notes', null, null, null, null, function(err, data) {
                                                    assert.ok(err, 'Verify that an error is thrown when an invalid value for location was provided');

                                                    // Verify that an error is thrown when an invalid value for notes was provided
                                                    gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 1234, null, null, null, null, function(err, data) {
                                                        assert.ok(err, 'Verify that an error is thrown when an invalid value for notes was provided');

                                                        // Verify that an error is thrown when an invalid value for organiserOther was provided
                                                        gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', 1234, null, null, null, function(err, data) {
                                                            assert.ok(err, 'Verify that an error is thrown when an invalid value for organiserOther was provided');

                                                            // Verify that an error is thrown when an invalid value for organiserUsers was provided
                                                            gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, 'invalid_organiser_users', null, null, function(err, data) {
                                                                assert.ok(err, 'Verify that an error is thrown when an invalid value for organiserUsers was provided');

                                                                // Verify that an error is thrown when an invalid value for seriesId was provided
                                                                gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, 'invalid_series_id', null, function(err, data) {
                                                                    assert.ok(err, 'Verify that an error is thrown when an invalid value for seriesId was provided');

                                                                    // Verify that an error is thrown when an invalid value for type was provided
                                                                    gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, 1234, function(err, data) {
                                                                        assert.ok(err, 'Verify that an error is thrown when an invalid value for type was provided');

                                                                        // Create a test series
                                                                        gh.api.seriesAPI.createSeries(app.id, 'displayName', 'Test description', 1, function(err, data) {
                                                                            assert.ok(!err, 'Verify that the test series have been created without errors');

                                                                            // Verify that an event can be created without errors
                                                                            gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', '2015-01-01', 'description', 1, 'location', 'notes', ['John Doe', 'Jane Doe'], null, data.id, 'Lecture', function(err, data) {
                                                                                assert.ok(!err, 'Verify that an event can be created without errors');
                                                                                assert.ok(data, 'Verify that the created event is returned');

                                                                                // Verify that a thrown error is handled successfully
                                                                                var body = {'code': 400, 'msg': 'Bad Request'};
                                                                                gh.utils.mockRequest('POST', '/api/events', 400, {'Content-Type': 'application/json'}, body, function() {
                                                                                    gh.api.eventAPI.createEventByApp(app.id, 'displayName', '2014-12-31', '2015-01-01', 'description', null, 'location', 'notes', null, null, null, null, function(err, data) {
                                                                                        assert.ok(err, 'Verify that an error is thrown when the back-end errored');
                                                                                        assert.ok(!data, 'Verify that no data is returned when an error is thrown');
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
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the updateEvent functionality
    QUnit.asyncTest('updateEvent', function(assert) {
        expect(19);

        // Create a test event
        createRandomEvent(null, function(err, evt) {
            assert.ok(!err, 'Verify that an event can be created without errors');

            // Verify that an error is thrown when no callback was provided
            assert.throws(function() {
                gh.api.eventAPI.updateEvent(evt.id, 'displayName', 'description', null, '2014-12-31', '2015-01-01', 'location', 'notes', 'Lecture');
            }, 'Verify that an error is thrown when no callback was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.eventAPI.updateEvent(evt.id, 'displayName', 'description', null, '2014-12-31', '2015-01-01', 'location', 'notes', 'Lecture', 'invalid_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no eventId was provided
            gh.api.eventAPI.updateEvent(null, 'displayName', 'description', null, '2014-12-31', '2015-01-01', 'location', 'notes', 'Lecture', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no eventId was provided');

                // Verify that an error is thrown when an invalid eventId was provided
                gh.api.eventAPI.updateEvent('invalid_event_id', 'displayName', 'description', null, '2014-12-31', '2015-01-01', 'location', 'notes', 'Lecture', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid eventId was provided');

                    // Verify that an error is thrown when an invalid value for displayName was provided
                    gh.api.eventAPI.updateEvent(evt.id, 1234, 'description', null, '2014-12-31', '2015-01-01', 'location', 'notes', 'Lecture', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for displayName was provided');

                        // Verify that an error is thrown when an invalid value for description was provided
                        gh.api.eventAPI.updateEvent(evt.id, 'displayName', 1234, null, '2014-12-31', '2015-01-01', 'location', 'notes', 'Lecture', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for description was provided');

                            // Verify that an error is thrown when an invalid value for groupId was provided
                            gh.api.eventAPI.updateEvent(evt.id, 'displayName', 'description', 'invalid_group_id', '2014-12-31', '2015-01-01', 'location', 'notes', 'Lecture', function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid value for groupId was provided');

                                // Verify that an error is thrown when an invalid value for start was provided
                                gh.api.eventAPI.updateEvent(evt.id, 'displayName', 'description', null, 1234, '2015-01-01', 'location', 'notes', 'Lecture', function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when an invalid value for start was provided');

                                    // Verify that an error is thrown when an invalid value for end was provided
                                    gh.api.eventAPI.updateEvent(evt.id, 'displayName', 'description', null, '2014-12-31', 1234, 'location', 'notes', 'Lecture', function(err, data) {
                                        assert.ok(err, 'Verify that an error is thrown when an invalid value for end was provided');

                                        // Verify that an error is thrown when an invalid value for location was provided
                                        gh.api.eventAPI.updateEvent(evt.id, 'displayName', 'description', null, '2014-12-31', '2015-01-01', 1234, 'notes', 'Lecture', function(err, data) {
                                            assert.ok(err, 'Verify that an error is thrown when an invalid value for location was provided');

                                            // Verify that an error is thrown when an invalid value for notes was provided
                                            gh.api.eventAPI.updateEvent(evt.id, 'displayName', 'description', null, '2014-12-31', '2015-01-01', 'location', 1234, 'Lecture', function(err, data) {
                                                assert.ok(err, 'Verify that an error is thrown when an invalid value for notes was provided');

                                                // Verify that an error is thrown when an invalid value for type was provided
                                                gh.api.eventAPI.updateEvent(evt.id, 'displayName', 'description', null, '2014-12-31', '2015-01-01', 'location', 'notes', 1234, function(err, data) {
                                                    assert.ok(err, 'Verify that an error is thrown when an invalid value for type was provided');

                                                    // Verify that an event can be updated without errors when all the parameters have been specified
                                                    gh.api.eventAPI.updateEvent(evt.id, 'displayName', 'description', null, '2014-12-31', '2015-01-01', 'location', 'notes', 'Lecture', function(err, data) {
                                                        assert.ok(!err, 'Verify that an event can be updated without errors');
                                                        assert.ok(data, 'Verify that the updated event is returned');

                                                        // Verify that an event can be updated without errors when only one parameter has been specified
                                                        gh.api.eventAPI.updateEvent(evt.id, null, null, 1, null, null, null, null, null, function(err, data) {
                                                            assert.ok(!err, 'Verify that an event can be updated without errors');
                                                            assert.ok(data, 'Verify that the updated event is returned');

                                                            // Verify that a thrown error is handled successfully
                                                            body = {'code': 400, 'msg': 'Bad Request'};
                                                            gh.utils.mockRequest('POST', '/api/events/' + evt.id, 400, {'Content-Type': 'application/json'}, body, function() {
                                                                gh.api.eventAPI.updateEvent(evt.id, 'displayName', 'description', null, '2014-12-31', '2015-01-01', 'location', 'notes', 'Lecture', function(err, data) {
                                                                    assert.ok(err, 'Verify that a thrown error is handled successfully');
                                                                    assert.ok(!data, 'Verity that no event is returned');
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
            });
        });
    });

    // Test the updateEventOrganisers functionality
    QUnit.asyncTest('updateEventOrganisers', function(assert) {
        expect(10);

        // Create a test event
        createRandomEvent(null, function(err, evt) {
            assert.ok(!err, 'Verify that an event can be created without errors');

            // Create an updates object
            var updates = {};
            updates[evt.organisers[0]['id']] = false;

            // Verify that an error is thrown when no callback was provided
            assert.throws(function() {
                gh.api.eventAPI.updateEventOrganisers(evt.id, {'foo': 'bar'});
            }, 'Verify that an error is thrown when no callback was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.eventAPI.updateEventOrganisers(evt.id, {'foo': 'bar'}, 'invalid_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no eventId was provided
            gh.api.eventAPI.updateEventOrganisers(null, updates, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no eventId was provided');

                // Verify that an error is thrown when an invalid eventId was provided
                gh.api.eventAPI.updateEventOrganisers('invalid_event_id', updates, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no eventId was provided');

                    // Verify that an error is thrown when no updates object was provided
                    gh.api.eventAPI.updateEventOrganisers(evt.id, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when no updates object was provided');

                        // Verify that an error is thrown when an invalid updates object was provided
                        gh.api.eventAPI.updateEventOrganisers(evt.id, 'invalid_updates_object', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid updates object was provided');

                            // Verify that an error is thrown when an empty updates object was provided
                            gh.api.eventAPI.updateEventOrganisers(evt.id, {}, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an empty updates object was provided');

                                /**
                                 * TODO: wait for back-end implementation
                                 *
                                 * Mock a successful response from the server
                                 */
                                var body = {'code': 200, 'msg': 'OK'};
                                gh.utils.mockRequest('POST', '/api/events/' + evt.id + '/organisers', 200, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.eventAPI.updateEventOrganisers(evt.id, updates, function(err, data) {
                                        assert.ok(!err, 'Verify that an error is thrown when the back-end errored');
                                    });

                                    // Verify that a thrown error is handled successfully
                                    body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.utils.mockRequest('POST', '/api/events/' + evt.id + '/organisers', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.eventAPI.updateEventOrganisers(evt.id, updates, function(err, data) {
                                            assert.ok(err, 'Verify that a thrown error is handled successfully');
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

    // Test the deleteEvent functionality
    QUnit.asyncTest('deleteEvent', function(assert) {
        expect(7);

        // Create a test event
        createRandomEvent(null, function(err, evt) {
            assert.ok(!err, 'Verify that an event can be created without errors');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.eventAPI.deleteEvent(evt.id, 'invalid_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no eventId was provided
            gh.api.eventAPI.deleteEvent(null, function(err) {
                assert.ok(err, 'Verify that an error is thrown when no eventId was provided');

                // Verify that an error is thrown when an invalid eventId was provided
                gh.api.eventAPI.deleteEvent('invalid_event_id', function(err) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid eventId was provided');

                    // Verify that an event can be deleted without errors
                    var body = {'code': 200, 'msg': 'OK'};
                    gh.utils.mockRequest('DELETE', '/api/events/' + evt.id, 200, {'Content-Type': 'application/json'}, body, function() {
                        gh.api.eventAPI.deleteEvent(evt.id, function(err, data) {
                            assert.ok(!err, 'Verify that an event can be deleted without errors');
                        });

                        assert.equal(null, gh.api.eventAPI.deleteEvent(evt.id), 'Verify that a default callback is set when none is provided and no error is thrown');

                        // Verify that a thrown error is handled successfully
                        body = {'code': 400, 'msg': 'Bad Request'};
                        gh.utils.mockRequest('DELETE', '/api/events/' + evt.id, 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.eventAPI.deleteEvent(evt.id, function(err, data) {
                                assert.ok(err, 'Verify that a thrown error is handled successfully');
                            });

                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    // Test the getEventSubscribers functionality
    QUnit.asyncTest('getEventSubscribers', function(assert) {
        expect(11);

        // Create a test event
        createRandomEvent(null, function(err, evt) {
            assert.ok(!err, 'Verify that an event can be created without errors');

            // Verify that an error is thrown when no callback was provided
            assert.throws(function() {
                gh.api.eventAPI.getEventSubscribers(evt.id, 0, 0);
            }, 'Verify that an error is thrown when no callback was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.eventAPI.getEventSubscribers(evt.id, 0, 0, 'invalid_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no eventId was provided
            gh.api.eventAPI.getEventSubscribers(null, 0, 0, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no eventId was provided');

                // Verify that an error is thrown when an invalid eventId was provided
                gh.api.eventAPI.getEventSubscribers('invalid_event_id', 0, 0, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid eventId was provided');

                    // Verify that an error is thrown when an invalid value for limit was provided
                    gh.api.eventAPI.getEventSubscribers(evt.id, 'invalid_limit', 0, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid value for limit was provided');

                        // Verify that an error is thrown when an invalid value for offset was provided
                        gh.api.eventAPI.getEventSubscribers(evt.id, 0, 'invalid_offset', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid value for offset was provided');

                            /**
                             * TODO: wait for back-end implementation
                             *
                             * Mock a successful response from the server
                             */
                            var body = {'code': 200, 'msg': 'OK'};
                            gh.utils.mockRequest('GET', '/api/events/' + evt.id + '/subscribers?limit=0&offset=0', 200, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.eventAPI.getEventSubscribers(evt.id, 0, 0, function(err, data) {
                                    assert.ok(!err, 'Verify that an error is thrown when the back-end errored');
                                    assert.ok(data, 'Verify that the requested subscribers are returned');
                                });

                                // Verify that a thrown error is handled successfully
                                body = {'code': 400, 'msg': 'Bad Request'};
                                gh.utils.mockRequest('GET', '/api/events/' + evt.id + '/subscribers?limit=0&offset=0', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.eventAPI.getEventSubscribers(evt.id, 0, 0, function(err, data) {
                                        assert.ok(err, 'Verify that a thrown error is handled successfully');
                                        assert.ok(!data, 'Verify that no subscribers are returned');
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

    // Test the subscribeEvent functionality
    QUnit.asyncTest('subscribeEvent', function(assert) {
        expect(7);

        // Create a test event
        createRandomEvent(null, function(err, evt) {
            assert.ok(!err, 'Verify that an event can be created without errors');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.eventAPI.subscribeEvent(evt.id, 'invalid_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no eventId was provided
            gh.api.eventAPI.subscribeEvent(null, function(err) {
                assert.ok(err, 'Verify that an error is thrown when no eventId was provided');

                // Verify that an error is thrown when an invalid eventId was provided
                gh.api.eventAPI.subscribeEvent('invalid_event_id', function(err) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid eventId was provided');

                    /**
                     * TODO: wait for back-end implementation
                     *
                     * Mock a successful response from the server
                     */
                    var body = {'code': 200, 'msg': 'OK'};
                    gh.utils.mockRequest('POST', '/api/events/' + evt.id + '/subscribe', 200, {'Content-Type': 'application/json'}, body, function() {
                        gh.api.eventAPI.subscribeEvent(evt.id, function(err) {
                            assert.ok(!err, 'Verify that an error is thrown when the back-end errored');
                        });

                        // Verify that a default callback is set when none is provided and no error is thrown
                        assert.equal(null, gh.api.eventAPI.subscribeEvent(evt.id), 'Verify that a default callback is set when none is provided and no error is thrown');

                        // Verify that a thrown error is handled successfully
                        body = {'code': 400, 'msg': 'Bad Request'};
                        gh.utils.mockRequest('POST', '/api/events/' + evt.id + '/subscribe', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.eventAPI.subscribeEvent(evt.id, function(err) {
                                assert.ok(err, 'Verify that a thrown error is handled successfully');
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

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
    module('Series API');

    // Test the `addSeriesEvents` functionality
    QUnit.asyncTest('addSeriesEvents', function(assert) {
        expect(10);

        var testSeries = testAPI.getRandomSeries();

        // Fetch a random event
        testAPI.getRandomEvent(function(err, testEvent) {
            assert.ok(!err, 'Verify that a random event is returned without errors');

            // Verify that an error is thrown when no callback was provided
            assert.throws(function() {
                gh.api.seriesAPI.addSeriesEvents(testSeries.id, testEvent.id);
            }, 'Verify that an error is thrown when no callback was provided');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.seriesAPI.addSeriesEvents(testSeries.id, testEvent.id, 'not_a_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no seriesId was provided
            gh.api.seriesAPI.addSeriesEvents(null, testEvent.id, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no series id was provided');

                // Verify that an error is thrown when an invalid seriesId was provided
                gh.api.seriesAPI.addSeriesEvents('invalid_series_id', testEvent.id, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid series id was provided');

                    // Verify that an error is thrown when no eventId was provided
                    gh.api.seriesAPI.addSeriesEvents(testSeries.id, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when no event id was provided');

                        // Verify that an error is thrown when an invalid eventId was provided
                        gh.api.seriesAPI.addSeriesEvents(testSeries.id, 'invalid_event_id', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid event id was provided');

                            // Verify that events can be successfully added to a series
                            // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                            var body = {'code': 200, 'msg': 'OK'};
                            gh.utils.mockRequest('POST', '/api/series/' + testSeries.id + '/events', 200, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.seriesAPI.addSeriesEvents(testSeries.id, testEvent.id, function(err, data) {
                                    assert.ok(!err, 'Verify that events can be successfully added to a series');

                                    // Verify that the error is handled
                                    body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.utils.mockRequest('POST', '/api/series/' + testSeries.id + '/events', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.seriesAPI.addSeriesEvents(testSeries.id, testEvent.id, function(err, data) {
                                            assert.ok(err, 'Verify that the error is handled when the event can\'t be successfully added to the series');
                                            assert.ok(!data, 'Verify that no data returns when the event can\'t be successfully added to the series');

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

    // Test the `createSeries` functionality
    QUnit.asyncTest('createSeries', function(assert) {
        expect(12);

        var testApp = testAPI.getTestApp();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.createSeries(testApp.id, 'displayName', 'Test description', null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no appId was provided
        gh.api.seriesAPI.createSeries(null, 'displayName', 'Test description', null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no app id was provided');

            // Verify that an error is thrown when an invalid appId was provided
            gh.api.seriesAPI.createSeries('invalid_app_id', 'displayName', 'Test description', null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid app id was provided');

                // Verify that an error is thrown when no displayName was provided
                gh.api.seriesAPI.createSeries(testApp.id, null, 'Test description', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no displayName was provided');

                    // Verify that an error is thrown when an invalid displayName was provided
                    gh.api.seriesAPI.createSeries(testApp.id, 123, 'Test description', null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

                        // Verify that an error is thrown when an invalid description was provided
                        gh.api.seriesAPI.createSeries(testApp.id, 'displayName', 123, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid description was provided');

                            // Verify that an error is thrown when an invalid groupId was provided
                            gh.api.seriesAPI.createSeries(testApp.id, 'displayName', 'Test description', 'invalid_groupid', function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid groupId was provided');

                                // Verify that an event series can be created when only the mandatory parameters have been specified
                                gh.api.seriesAPI.createSeries(testApp.id, 'displayName', null, null, function(err, data) {
                                    assert.ok(!err, 'Verify that an event series can be created');

                                    // Verify that an event series can be created when all the parameters have been specified
                                    gh.api.seriesAPI.createSeries(testApp.id, 'displayName', 'Test description', 1, function(err, data) {
                                        assert.ok(!err, 'Verify that an event series can be created');

                                        // Verify that a default callback is set when none is provided and no error is thrown
                                        assert.equal(null, gh.api.seriesAPI.createSeries(testApp.id, 'displayName', 'Test description', null), 'Verify that a default callback is set when none is provided and no error is thrown');

                                        // Verify that the error is handled
                                        var body = {'code': 400, 'msg': 'Bad Request'};
                                        gh.utils.mockRequest('POST', '/api/series', 400, {'Content-Type': 'application/json'}, body, function() {
                                            gh.api.seriesAPI.createSeries(testApp.id, 'displayName', 'Test description', null, function(err, data) {
                                                assert.ok(err, 'Verify that the error is handled when the event series can\'t be successfully created');
                                                assert.ok(!data, 'Verify that no data returns when the event series can\'t be successfully created');

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

    // Test the `deleteSeries` functionality
    QUnit.asyncTest('deleteSeries', function(assert) {
        expect(7);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.deleteSeries(testSeries.id, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.deleteSeries(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.deleteSeries('invalid_series_id', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that a default callback is set when none is provided and no error is thrown
                assert.equal(null, gh.api.seriesAPI.deleteSeries(testSeries.id, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                // Verify that series can be successfully deleted
                // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                var body = {'code': 200, 'msg': 'OK'};
                gh.utils.mockRequest('DELETE', '/api/series/' + testSeries.id, 200, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.seriesAPI.deleteSeries(testSeries.id, function(err, data) {
                        assert.ok(!err, 'Verify that event series can be successfully deleted');

                        // Verify that the error is handled
                        body = {'code': 400, 'msg': 'Bad Request'};
                        gh.utils.mockRequest('DELETE', '/api/series/' + testSeries.id, 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.deleteSeries(testSeries.id, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the event series can\'t be successfully deleted');
                                assert.ok(!data, 'Verify that no data returns when the event series can\'t be successfully deleted');

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the `deleteSeriesEvents` functionality
    QUnit.asyncTest('deleteSeriesEvents', function(assert) {
        expect(10);

        var testSeries = testAPI.getRandomSeries();

        // Fetch a random event
        testAPI.getRandomEvent(function(err, testEvent) {
            assert.ok(!err, 'Verify that a random event is returned without errors');

            // Verify that an error is thrown when an invalid callback was provided
            assert.throws(function() {
                gh.api.seriesAPI.deleteSeriesEvents(testSeries.id, testEvent.id, 'not_a_callback');
            }, 'Verify that an error is thrown when an invalid callback was provided');

            // Verify that an error is thrown when no serieId was provided
            gh.api.seriesAPI.deleteSeriesEvents(null, testEvent.id, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

                // Verify that an error is thrown when an invalid serieId was provided
                gh.api.seriesAPI.deleteSeriesEvents('invalid_series_id', testEvent.id, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                    // Verify that an error is thrown when no eventId was provided
                    gh.api.seriesAPI.deleteSeriesEvents(testSeries.id, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when no event id was provided');

                        // Verify that an error is thrown when an invalid eventId was provided
                        gh.api.seriesAPI.deleteSeriesEvents(testSeries.id, 'invalid_event_id', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid event id was provided');

                            // Verify that a default callback is set when none is provided and no error is thrown
                            assert.equal(null, gh.api.seriesAPI.deleteSeriesEvents(testSeries.id, testEvent.id, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                            // Verify that events can be successfully deleted from event series
                            // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                            var body = {'code': 200, 'msg': 'OK'};
                            gh.utils.mockRequest('DELETE', '/api/series/' + testSeries.id + '/events', 200, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.seriesAPI.deleteSeriesEvents(testSeries.id, testEvent.id, function(err, data) {
                                    assert.ok(!err, 'Verify that events can be successfully deleted from event series');

                                    // Verify that the error is handled
                                    body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.utils.mockRequest('DELETE', '/api/series/' + testSeries.id + '/events', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.seriesAPI.deleteSeriesEvents(testSeries.id, testEvent.id, function(err, data) {
                                            assert.ok(err, 'Verify that the error is handled when the event can\'t be successfully deleted from the event series');
                                            assert.ok(!data, 'Verify that no data returns when the event can\'t be successfully deleted from the event series');

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

    // Test the `getSeries` functionality
    QUnit.asyncTest('getSeries', function(assert) {
        expect(8);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeries(testSeries.id, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeries(testSeries.id, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeries(null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeries('invalid_series_id', null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when an invalid includeOrgUnits was provided
                gh.api.seriesAPI.getSeries(testSeries.id, 'invalid_includeOrgUnits', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid includeOrgUnits was provided');

                    // Verify that event series can be successfully retrieved
                    // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                    var body = {'code': 200, 'msg': 'OK'};
                    gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '?includeOrgUnits=true', 200, {'Content-Type': 'application/json'}, body, function() {
                        gh.api.seriesAPI.getSeries(testSeries.id, true, function(err, data) {
                            assert.ok(!err, 'Verify that event series can be successfully retrieved');

                            // Verify that the error is handled
                            body = {'code': 400, 'msg': 'Bad Request'};
                            gh.utils.mockRequest('GET', '/api/series/' + testSeries.id, 400, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.seriesAPI.getSeries(testSeries.id, null, function(err, data) {
                                    assert.ok(err, 'Verify that the error is handled when the event series can\'t be successfully retrieved');
                                    assert.ok(!data, 'Verify that no data returns when the event series can\'t be successfully retrieved');

                                    QUnit.start();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the `getSeriesCalendar` functionality
    QUnit.asyncTest('getSeriesCalendar', function(assert) {
        expect(11);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesCalendar(testSeries.id, '2014-12-04', '2014-12-08');
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesCalendar(testSeries.id, '2014-12-04', '2014-12-08', 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeriesCalendar(null, '2014-12-04', '2014-12-08', function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeriesCalendar('invalid_serieid', '2014-12-04', '2014-12-08', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when no start was provided
                gh.api.seriesAPI.getSeriesCalendar(testSeries.id, null, '2014-12-08', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no start was provided');

                    // Verify that an error is thrown when an invalid start was provided
                    gh.api.seriesAPI.getSeriesCalendar(testSeries.id, 123, '2014-12-08', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid start was provided');

                        // Verify that an error is thrown when no end was provided
                        gh.api.seriesAPI.getSeriesCalendar(testSeries.id, '2014-12-04', null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no end was provided');

                            // Verify that an error is thrown when an invalid end was provided
                            gh.api.seriesAPI.getSeriesCalendar(testSeries.id, '2014-12-04', 123, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid end was provided');

                                // Verify that the calendar for event series can be successfully retrieved
                                // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                                var body = {'code': 200, 'msg': 'OK'};
                                gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '/calendar?start=2014-12-04&end=2014-12-08', 200, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.seriesAPI.getSeriesCalendar(testSeries.id, '2014-12-04', '2014-12-08', function(err, data) {
                                        assert.ok(!err, 'Verify that the calendar for the event series can be successfully retrieved');

                                        // Verify that the error is handled
                                        body = {'code': 400, 'msg': 'Bad Request'};
                                        gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '/calendar?start=2014-12-04&end=2014-12-08', 400, {'Content-Type': 'application/json'}, body, function() {
                                            gh.api.seriesAPI.getSeriesCalendar(testSeries.id, '2014-12-04', '2014-12-08', function(err, data) {
                                                assert.ok(err, 'Verify that the error is handled when the calendar for the event series can\'t be successfully retrieved');
                                                assert.ok(!data, 'Verify that no data returns when the calendar for the event series can\'t be successfully retrieved');

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

    // Test the `getSeriesEvents` functionality
    QUnit.asyncTest('getSeriesEvents', function(assert) {
        expect(10);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesEvents(testSeries.id, 0, 0, true);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesEvents(testSeries.id, 0, 0, true, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeriesEvents(null, 0, 0, true, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeriesEvents('invalid_serie_id', 0, 0, true, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when an invalid limit was provided
                gh.api.seriesAPI.getSeriesEvents(testSeries.id, 'invalid_limit', 0, true, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid limit was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.seriesAPI.getSeriesEvents(testSeries.id, 0, 'invalid_offset', true, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset was provided');

                        // Verify that an error is thrown when an invalid upcoming was provided
                        gh.api.seriesAPI.getSeriesEvents(testSeries.id, 0, 0, 'invalid_upcoming', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid upcoming was provided');

                            // Verify that events in an event series can be successfully retrieved
                            // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                            var body = {'code': 200, 'msg': 'OK'};
                            gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '/events?limit=0&offset=0&upcoming=true', 200, {'Content-Type': 'application/json'}, body, function() {
                                gh.api.seriesAPI.getSeriesEvents(testSeries.id, 0, 0, true, function(err, data) {
                                    assert.ok(!err, 'Verify that events in an event series can be successfully retrieved');

                                    // Verify that the error is handled
                                    body = {'code': 400, 'msg': 'Bad Request'};
                                    gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '/events?limit=0&offset=0&upcoming=true', 400, {'Content-Type': 'application/json'}, body, function() {
                                        gh.api.seriesAPI.getSeriesEvents(testSeries.id, 0, 0, true, function(err, data) {
                                            assert.ok(err, 'Verify that the error is handled when the events in the event series can\'t be successfully retrieved');
                                            assert.ok(!data, 'Verify that no data returns when the events in the event series can\'t be successfully retrieved');

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

    // Test the `getSeriesICal` functionality
    QUnit.asyncTest('getSeriesICal', function(assert) {
        expect(9);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesICal(testSeries.id, '2014-12-04', '2014-12-10');
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesICal(testSeries.id, '2014-12-04', '2014-12-10', 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeriesICal(null, '2014-12-04', '2014-12-10', function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeriesICal('invalid_serie_id', '2014-12-04', '2014-12-10', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when an invalid start was provided
                gh.api.seriesAPI.getSeriesICal(testSeries.id, 123, '2014-12-10', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid start was provided');

                    // Verify that an error is thrown when an invalid end was provided
                    gh.api.seriesAPI.getSeriesICal(testSeries.id, '2014-12-04', 123, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid end was provided');

                        // Verify that events in an event series ICal feed can be successfully retrieved
                        // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                        var body = {'code': 200, 'msg': 'OK'};
                        gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '/calendar.ical?start=2014-12-04&end=2014-12-10', 200, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.getSeriesICal(testSeries.id, '2014-12-04', '2014-12-10', function(err, data) {
                                assert.ok(!err, 'Verify that events in an event series ICal feed can be successfully retrieved');

                                // Verify that the error is handled
                                body = {'code': 400, 'msg': 'Bad Request'};
                                gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '/calendar.ical?start=2014-12-04&end=2014-12-10', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.seriesAPI.getSeriesICal(testSeries.id, '2014-12-04', '2014-12-10', function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the event series ICal feed can\'t be successfully retrieved');
                                        assert.ok(!data, 'Verify that no data returns when the event series ICal feed can\'t be successfully retrieved');

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

    // Test the `getSeriesRSS` functionality
    QUnit.asyncTest('getSeriesRSS', function(assert) {
        expect(9);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesRSS(testSeries.id, '2014-12-04', '2014-12-10');
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesRSS(testSeries.id, '2014-12-04', '2014-12-10', 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeriesRSS(null, '2014-12-04', '2014-12-10', function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeriesRSS('invalid_serie_id', '2014-12-04', '2014-12-10', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when an invalid start was provided
                gh.api.seriesAPI.getSeriesRSS(testSeries.id, 123, '2014-12-10', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid start was provided');

                    // Verify that an error is thrown when an invalid end was provided
                    gh.api.seriesAPI.getSeriesRSS(testSeries.id, '2014-12-04', 123, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid end was provided');

                        // Verify that events in an event series RSS feed can be successfully retrieved
                        // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                        var body = {'code': 200, 'msg': 'OK'};
                        gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '/calendar.rss?start=2014-12-04&end=2014-12-10', 200, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.getSeriesRSS(testSeries.id, '2014-12-04', '2014-12-10', function(err, data) {
                                assert.ok(!err, 'Verify that events in an event series RSS feed can be successfully retrieved');

                                // Verify that the error is handled
                                body = {'code': 400, 'msg': 'Bad Request'};
                                gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '/calendar.rss?start=2014-12-04&end=2014-12-10', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.seriesAPI.getSeriesRSS(testSeries.id, '2014-12-04', '2014-12-10', function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the event series RSS feed can\'t be successfully retrieved');
                                        assert.ok(!data, 'Verify that no data returns when the event series RSS feed can\'t be successfully retrieved');

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

    // Test the `getSeriesUpcoming` functionality
    QUnit.asyncTest('getSeriesUpcoming', function(assert) {
        expect(9);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesUpcoming(testSeries.id, 0, 0);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesUpcoming(testSeries.id, 0, 0, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeriesUpcoming(null, 0, 0, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeriesUpcoming('invalid_serie_id', 0, 0, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when an invalid limit was provided
                gh.api.seriesAPI.getSeriesUpcoming(testSeries.id, 'invalid_limit', 0, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid limit was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.seriesAPI.getSeriesUpcoming(testSeries.id, 0, 'invalid_offset', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset was provided');

                        // Verify that events the upcoming events in an event series can be successfully retrieved
                        // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                        var body = {'code': 200, 'msg': 'OK'};
                        gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '/upcoming?limit=0&offset=0', 200, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.getSeriesUpcoming(testSeries.id, 0, 0, function(err, data) {
                                assert.ok(!err, 'Verify that events the upcoming events in an event series can be successfully retrieved');

                                // Verify that the error is handled
                                body = {'code': 400, 'msg': 'Bad Request'};
                                gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '/upcoming?limit=0&offset=0', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.seriesAPI.getSeriesUpcoming(testSeries.id, 0, 0, function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the upcoming events in an event series can\'t be successfully retrieved');
                                        assert.ok(!data, 'Verify that no data returns when the upcoming events in an event series can\'t be successfully retrieved');

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

    // Test the `getSeriesSubscribers` functionality
    QUnit.asyncTest('getSeriesSubscribers', function(assert) {
        expect(9);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesSubscribers(testSeries.id, 0, 0);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.getSeriesSubscribers(testSeries.id, 0, 0, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.getSeriesSubscribers(null, 0, 0, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.getSeriesSubscribers('invalid_serie_id', 0, 0, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when an invalid limit was provided
                gh.api.seriesAPI.getSeriesSubscribers(testSeries.id, 'invalid_limit', 0, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid limit was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.seriesAPI.getSeriesSubscribers(testSeries.id, 0, 'invalid_offset', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset was provided');

                        // Verify that the users that have subscribed to an event series can be successfully retrieved
                        // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                        var body = {'code': 200, 'msg': 'OK'};
                        gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '/subscribers?limit=0&offset=0', 200, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.getSeriesSubscribers(testSeries.id, 0, 0, function(err, data) {
                                assert.ok(!err, 'Verify that the users that have subscribed to an event series can be successfully retrieved');

                                // Verify that the error is handled
                                body = {'code': 400, 'msg': 'Bad Request'};
                                gh.utils.mockRequest('GET', '/api/series/' + testSeries.id + '/subscribers?limit=0&offset=0', 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.seriesAPI.getSeriesSubscribers(testSeries.id, 0, 0, function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the users that have subscribed to an event series can\'t be successfully retrieved');
                                        assert.ok(!data, 'Verify that no data returns when the users that have subscribed to an event series can\'t be successfully retrieved');

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

    // Test the `subscribeSeries` functionality
    QUnit.asyncTest('subscribeSeries', function(assert) {
        expect(12);

        // Fetch a random test app
        var app = testAPI.getTestApp();
        // Fetch a random series within that app
        var testSeries = testAPI.getRandomSeries(app.id);

        // Create a new organisational unit
        gh.api.orgunitAPI.createOrgUnit(parseInt(app.id, 10), 'displayName', 'part', null, null, null, null, null, function(err, orgUnit) {
            assert.ok(!err, 'Verify that an organisational unit can be created without errors');

            // Add the series to the organisational unit
            gh.api.orgunitAPI.addOrgUnitSeries(orgUnit.id, testSeries.id, function(err, data) {
                assert.ok(!err, 'Verify that the series can be added to the orgUnit without errors');

                // Create a random user
                testAPI.createTestUser(app.id, false, function(err, user) {
                    if (err) {
                        throw new Error('The test user could not be created successfully');
                    }

                    // Verify that an error is thrown when an invalid callback was provided
                    assert.throws(function() {
                        gh.api.seriesAPI.subscribeSeries(testSeries.id, null, null, 'not_a_callback');
                    }, 'Verify that an error is thrown when an invalid callback was provided');

                    // Verify that an error is thrown when no serieId was provided
                    gh.api.seriesAPI.subscribeSeries(null, null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

                        // Verify that an error is thrown when an invalid serieId was provided
                        gh.api.seriesAPI.subscribeSeries('invalid_serie_id', null, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                            // Verify that an error is thrown when an invalid userId was provided
                            gh.api.seriesAPI.subscribeSeries(testSeries.id, 'invalid_userid', null, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid user id was provided');

                                // Verify that an error is thrown when an invalid orgUnit was provided
                                gh.api.seriesAPI.subscribeSeries(testSeries.id, null, 'invalid_orgunit', function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when an invalid context was provided');

                                    // Verify that a default callback is set when none is provided and no error is thrown
                                    assert.equal(null, gh.api.seriesAPI.subscribeSeries(testSeries.id), 'Verify that a default callback is set when none is provided and no error is thrown');

                                    // Verify that no errors are thrown when all the parameters have been specified
                                    gh.api.seriesAPI.subscribeSeries(testSeries.id, user.id, orgUnit.id, function(err, data) {
                                        assert.ok(!err, 'Verify that an event series can be successfully subscribed to');

                                        // Verify that no errors are thrown when only the mandatory parameters have been specified
                                        gh.api.seriesAPI.subscribeSeries(testSeries.id, null, null, function(err, data) {
                                            assert.ok(!err, 'Verify that an event series can be successfully subscribed to');

                                            // Verify that an error is thrown when an invalid
                                            gh.api.seriesAPI.subscribeSeries(99999999999, null, null, function(err, data) {
                                                assert.ok(err, 'Verify that the error is handled when the event series can\'t be successfully subscribed to');
                                                assert.ok(!data, 'Verify that no data returns when the event series can\'t be successfully subscribed to');

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

    // Test the `unsubscribeSeries` functionality
    QUnit.asyncTest('unsubscribeSeries', function(assert) {
        expect(7);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.unsubscribeSeries(testSeries.id, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.unsubscribeSeries(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.unsubscribeSeries('invalid_serie_id', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that a default callback is set when none is provided and no error is thrown
                assert.equal(null, gh.api.seriesAPI.unsubscribeSeries(testSeries.id, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                // Verify that an event series can be successfully unsubscribed from
                // TODO: Switch this mocked call out with the proper API request once it has been implemented in the backend
                var body = {'code': 200, 'msg': 'OK'};
                gh.utils.mockRequest('POST', '/api/series/' + testSeries.id + '/unsubscribe', 200, {'Content-Type': 'application/json'}, body, function() {
                    gh.api.seriesAPI.unsubscribeSeries(testSeries.id, function(err, data) {
                        assert.ok(!err, 'Verify that an event series can be successfully unsubscribed from');

                        // Verify that the error is handled
                        body = {'code': 400, 'msg': 'Bad Request'};
                        gh.utils.mockRequest('POST', '/api/series/' + testSeries.id + '/unsubscribe', 400, {'Content-Type': 'application/json'}, body, function() {
                            gh.api.seriesAPI.unsubscribeSeries(testSeries.id, function(err, data) {
                                assert.ok(err, 'Verify that the error is handled when the event series can\'t be successfully unsubscribed from');
                                assert.ok(!data, 'Verify that no data returns when the event series can\'t be successfully unsubscribed from');

                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the `updateSeries` functionality
    QUnit.asyncTest('updateSeries', function(assert) {
        expect(10);

        var testSeries = testAPI.getRandomSeries();

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.seriesAPI.updateSeries(testSeries.id, 'displayName', 'description', null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Generate some random values
        var displayName = gh.utils.generateRandomString();
        var description = gh.utils.generateRandomString();

        // Verify that an error is thrown when no serieId was provided
        gh.api.seriesAPI.updateSeries(null, displayName, description, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no serie id was provided');

            // Verify that an error is thrown when an invalid serieId was provided
            gh.api.seriesAPI.updateSeries('invalid_series_id', displayName, description, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid serie id was provided');

                // Verify that an error is thrown when an invalid displayName was provided
                gh.api.seriesAPI.updateSeries(testSeries.id, 123, description, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid display name was provided');

                    // Verify that an error is thrown when an invalid description was provided
                    gh.api.seriesAPI.updateSeries(testSeries.id, displayName, 123, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid description was provided');

                        // Verify that an error is thrown when an invalid groupId was provided
                        gh.api.seriesAPI.updateSeries(testSeries.id, displayName, description, 'invalid_group_id', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid group id was provided');

                            // Verify that a default callback is set when none is provided and no error is thrown
                            assert.equal(null, gh.api.seriesAPI.updateSeries(testSeries.id, null, null, null, null), 'Verify that a default callback is set when none is provided and no error is thrown');

                            // Verify that an event series can be successfully updated
                            gh.api.seriesAPI.updateSeries(testSeries.id, description, displayName, testSeries.GroupId, function(err, data) {
                                assert.ok(!err, 'Verify that an event series can be successfully updated');

                                // Verify that the error is handled
                                var body = {'code': 400, 'msg': 'Bad Request'};
                                gh.utils.mockRequest('POST', '/api/series/' + testSeries.id, 400, {'Content-Type': 'application/json'}, body, function() {
                                    gh.api.seriesAPI.updateSeries(testSeries.id, null, null, null, function(err, data) {
                                        assert.ok(err, 'Verify that the error is handled when the event series can\'t be successfully updated');
                                        assert.ok(!data, 'Verify that no data returns when the event series can\'t be successfully updated');

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

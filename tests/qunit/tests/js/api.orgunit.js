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
    module('Orgunit API');

    QUnit.test('init', function(assert) {
        assert.ok(true);
    });

    // Test the getOrgUnits functionality
    QUnit.asyncTest('getOrgUnits', function(assert) {
        expect(8);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnits(1, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnits(1, null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no appId was provided
        gh.api.orgunitAPI.getOrgUnits(null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no app id was provided');

            // Verify that an error is thrown when an invalid appId was provided
            gh.api.orgunitAPI.getOrgUnits('invalid_appid', null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid app id was provided');

                // Verify that an error is thrown when an invalid includeSeries was provided
                gh.api.orgunitAPI.getOrgUnits(1, 'invalid_includeSeries', null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid includeSeries was provided');

                    // Verify that an error is thrown when an invalid parentId was provided
                    gh.api.orgunitAPI.getOrgUnits(1, null, 'invalid_parentid', null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid parent id was provided');

                        // Verify that an error is thrown when an invalid type was provided
                        gh.api.orgunitAPI.getOrgUnits(1, null, 1, 123, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid type was provided');

                            // Verify that organisational units can be successfully retrieved
                            gh.api.orgunitAPI.getOrgUnits(1, false, null, null, function(err, data) {
                                assert.ok(!err, 'Verify that organistation units can be successfully retrieved');
                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the getOrgUnitsByApp functionality

    // Test the getOrgUnit functionality
    QUnit.asyncTest('getOrgUnit', function(assert) {
        expect(6);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnit(1, false, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnit(1, false, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.getOrgUnit(null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnit id was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.getOrgUnit('invalid_orgunitid', null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnit id was provided');

                // Verify that an error is thrown when an invalid includeSeries was provided
                gh.api.orgunitAPI.getOrgUnit(1, 'invalid_includeSeries', function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid includeSeries was provided');

                    /* TODO: Enable this test once the /api/orgunit/:id endpoint is implemented */
                    // Verify that an orgunit can be successfully retrieved
                    gh.api.orgunitAPI.getOrgUnit(1, false, function(err, data) {
                        assert.ok(err, 'Verify that an orgunit can be successfully retrieved');
                        QUnit.start();
                    });
                });
            });
        });
    });

    // Test the getOrgUnitSeries functionality
    QUnit.asyncTest('getOrgUnitSeries', function(assert) {
        expect(8);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitSeries(1, null, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitSeries(1, null, null, null, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.getOrgUnitSeries(null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnit id was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.getOrgUnitSeries('invalid_orgunitid', null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnit id was provided');

                // Verify that an error is thrown when an invalid limit was provided
                gh.api.orgunitAPI.getOrgUnitSeries(1, 'invalid_limit', null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no limit id was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.orgunitAPI.getOrgUnitSeries(1, null, 'invalid_offset', null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset id was provided');

                        // Verify that an error is thrown when an invalid upcoming was provided
                        gh.api.orgunitAPI.getOrgUnitSeries(1, null, null, 'invalid_upcoming', function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid upcoming id was provided');

                            // Verify that the series in an organisational unit can be retrieved successfully
                            gh.api.orgunitAPI.getOrgUnitSeries(1, null, null, null, function(err, data) {
                                assert.ok(err, 'Verify that the series in an organisational unit can be retrieved successfully');
                                QUnit.start();
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the getOrgUnitCalendar functionality
    QUnit.asyncTest('getOrgUnitCalendar', function(assert) {
        expect(9);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitCalendar(null, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitCalendar(null, null, null, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.getOrgUnitCalendar(null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.getOrgUnitCalendar('invalid_orgunitid', null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when no from ISO 8601 timestamp was provided
                gh.api.orgunitAPI.getOrgUnitCalendar(1, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no from ISO 8601 timestamp was provided');

                    // Verify that an error is thrown when an invalid from ISO 8601 timestamp was provided
                    gh.api.orgunitAPI.getOrgUnitCalendar(1, 2014, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid from ISO 8601 timestamp was provided');

                        // Verify that an error is thrown when no to ISO 8601 timestamp was provided
                        gh.api.orgunitAPI.getOrgUnitCalendar(1, '2014-11-30', null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no to ISO 8601 timestamp was provided');

                            // Verify that an error is thrown when an invalid to ISO 8601 timestamp was provided
                            gh.api.orgunitAPI.getOrgUnitCalendar(1, '2014-11-30', 2014, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid to ISO 8601 timestamp was provided');

                                /* TODO: Enable the test once the /api/orgunit/:id/calendar endpoint is implemented */
                                // Verify that an error is thrown when an invalid to ISO 8601 timestamp was provided
                                gh.api.orgunitAPI.getOrgUnitCalendar(1, '2014-11-30', '2014-12-1', function(err, data) {
                                    assert.ok(err, 'Verify that an organisational unit\'s calendar can be retrieved successfully');
                                    QUnit.start();
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    // Test the getOrgUnitCalendarICal functionality
    QUnit.asyncTest('getOrgUnitCalendarICal', function(assert) {
        expect(5);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitCalendarICal(null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitCalendarICal(null, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.getOrgUnitCalendarICal(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.getOrgUnitCalendarICal('invalid_orgunitid', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                /* TODO: Enable the test once the /api/orgunit/:id/calendar.ical endpoint is implemented */
                // Verify that an error is thrown when an invalid to ISO 8601 timestamp was provided
                gh.api.orgunitAPI.getOrgUnitCalendarICal(1, function(err, data) {
                    assert.ok(err, 'Verify that an organisational unit\'s ICal calendar can be retrieved successfully');
                    QUnit.start();
                });
            });
        });
    });

    // Test the getOrgUnitCalendarRSS functionality
    QUnit.asyncTest('getOrgUnitCalendarRSS', function(assert) {
        expect(5);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitCalendarRSS(null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitCalendarRSS(null, 'invalid_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.getOrgUnitCalendarRSS(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.getOrgUnitCalendarRSS('invalid_orgunitid', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                /* TODO: Enable the test once the /api/orgunit/:id/calendar.rss endpoint is implemented */
                // Verify that an error is thrown when an invalid to ISO 8601 timestamp was provided
                gh.api.orgunitAPI.getOrgUnitCalendarRSS(1, function(err, data) {
                    assert.ok(err, 'Verify that an organisational unit\'s RSS calendar can be retrieved successfully');
                    QUnit.start();
                });
            });
        });
    });

    // Test the getOrgUnitUpcoming functionality
    QUnit.asyncTest('getOrgUnitUpcoming', function(assert) {
        expect(7);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitUpcoming(null, null, null, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnitUpcoming(null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.getOrgUnitUpcoming(null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.getOrgUnitUpcoming('invalid_orgunitid', null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when an invalid limit was provided
                gh.api.orgunitAPI.getOrgUnitUpcoming(1, 'invalid_limit', null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid limit was provided');

                    // Verify that an error is thrown when an invalid offset was provided
                    gh.api.orgunitAPI.getOrgUnitUpcoming(1, 2, 'invalid_offset', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid offset was provided');

                        /* TODO: Enable the test once the /api/orgunit/:id/upcoming endpoint is implemented */
                        // Verify that the upcoming events in an organisational unit can be retrieved successfully
                        gh.api.orgunitAPI.getOrgUnitUpcoming(1, null, null, function(err, data) {
                            assert.ok(err, 'Verify that the upcoming events in an organisational unit can be retrieved successfully');
                            QUnit.start();
                        });
                    });
                });
            });
        });
    });


    // Test the createOrgUnit functionality
    QUnit.asyncTest('createOrgUnit', function(assert) {
        expect(12);

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.createOrgUnit(1, 'displayName', 'tripos', null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no appId was provided
        gh.api.orgunitAPI.createOrgUnit(null, 'displayName', 'tripos', null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no app id was provided');

            // Verify that an error is thrown when an invalid appId was provided
            gh.api.orgunitAPI.createOrgUnit('invalid_appid', 'displayName', 'tripos', null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid app id was provided');

                // Verify that an error is thrown when no displayName was provided
                gh.api.orgunitAPI.createOrgUnit(1, null, null, null, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no displayName was provided');

                    // Verify that an error is thrown when an invalid displayName was provided
                    gh.api.orgunitAPI.createOrgUnit(1, 2, null, null, null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

                        // Verify that an error is thrown when no type was provided
                        gh.api.orgunitAPI.createOrgUnit(1, 'displayName', null, null, null, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when no type was provided');

                            // Verify that an error is thrown when an invalid type was provided
                            gh.api.orgunitAPI.createOrgUnit(1, 'displayName', 3, null, null, null, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid type was provided');

                                // Verify that an error is thrown when an invalid parentId was provided
                                gh.api.orgunitAPI.createOrgUnit(1, 'displayName', 'tripos', 'invalid_parentId', null, null, function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when an invalid parentId was provided');

                                    // Verify that an error is thrown when an invalid groupId was provided
                                    gh.api.orgunitAPI.createOrgUnit(1, 'displayName', 'tripos', null, 'invalid_groupid', null, function(err, data) {
                                        assert.ok(err, 'Verify that an error is thrown when an invalid groupId was provided');

                                        // Verify that an error is thrown when an invalid description was provided
                                        gh.api.orgunitAPI.createOrgUnit(1, 'displayName', 'tripos', null, null, 123, function(err, data) {
                                            assert.ok(err, 'Verify that an error is thrown when an invalid description was provided');

                                            // Verify that an error is thrown when creating an orgunit in a non-existing app
                                            gh.api.orgunitAPI.createOrgUnit(9999999, 'displayName', 'tripos', null, null, null, function(err, data) {
                                                assert.ok(err, 'Verify that an error is thrown when creating an orgunit in a non-existing app');

                                                // Verify that an organisational unit can be successfully created
                                                var testApp = testAPI.getApps()[0];
                                                gh.api.orgunitAPI.createOrgUnit(parseInt(testApp.id, 10), 'displayName', 'tripos', null, null, null, function(err, data) {
                                                    assert.ok(!err, 'Verify that an organisational unit can be successfully created');
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


    // Test the createOrgUnitByApp functionality

    // Test the updateOrgUnit functionality
    QUnit.asyncTest('updateOrgUnit', function(assert) {
        expect(9);

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.updateOrgUnit(1, null, null, null, null, null, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.updateOrgUnit(null, null, null, null, null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.updateOrgUnit('invalid_orgunitid', null, null, null, null, null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when an invalid description was provided
                gh.api.orgunitAPI.updateOrgUnit(1, 123, null, null, null, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an invalid description was provided');

                    // Verify that an error is thrown when an invalid displayName was provided
                    gh.api.orgunitAPI.updateOrgUnit(1, null, 123, null, null, null, function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid displayName was provided');

                        // Verify that an error is thrown when an invalid groupId was provided
                        gh.api.orgunitAPI.updateOrgUnit(1, null, null, 'invalid_groupid', null, null, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an invalid groupId was provided');

                            // Verify that an error is thrown when an invalid parentId was provided
                            gh.api.orgunitAPI.updateOrgUnit(1, null, null, null, 'invalid_parentid', null, function(err, data) {
                                assert.ok(err, 'Verify that an error is thrown when an invalid parentId was provided');

                                // Verify that an error is thrown when an invalid type was provided
                                gh.api.orgunitAPI.updateOrgUnit(1, null, null, null, null, 123, function(err, data) {
                                    assert.ok(err, 'Verify that an error is thrown when an invalid type was provided');

                                    // Verify that an unexisting organisational unit cannot be updated
                                    gh.api.orgunitAPI.updateOrgUnit(9999999, null, null, null, null, 'tripos', function(err, data) {
                                        assert.ok(err, 'Verify that an unexisting organisational unit cannot be updated');

                                        /* TODO: Enable the test once the /api/orgunit/:id endpoint is implemented */
                                        // Verify that an organisational unit can be updated successfully
                                        // gh.api.orgunitAPI.updateOrgUnit(1, null, null, null, null, 'tripos', function(err, data) {
                                        //     assert.ok(!err, 'Verify that an organisational unit can be updated successfully');
                                        //     QUnit.start();
                                        // });
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

    // Test the addOrgUnitSeries functionality
    QUnit.asyncTest('addOrgUnitSeries', function(assert) {
        expect(7);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.addOrgUnitSeries(1, 2, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.addOrgUnitSeries(1, 2, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.addOrgUnitSeries(null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.addOrgUnitSeries('invalid_orgunitid', null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when no serieId was provided
                gh.api.orgunitAPI.addOrgUnitSeries(1, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no serieId was provided');

                    // Verify that an error is thrown when an invalid serieId was provided
                    gh.api.orgunitAPI.addOrgUnitSeries(1, 'invalid_eventid', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid serieId was provided');

                        // Verify that an error is thrown when an event series that doesn't exist is being added to the organisational unit
                        gh.api.orgunitAPI.addOrgUnitSeries(1, 99999999, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an event series that doesn\'t exist is being added to the organisational unit');
                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    // Test the addOrgUnitEvent functionality
    QUnit.asyncTest('addOrgUnitEvent', function(assert) {
        expect(7);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.addOrgUnitEvent(1, 2, null);
        }, 'Verify that an error is thrown when no callback was provided');

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.addOrgUnitEvent(1, 2, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.addOrgUnitEvent(null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.addOrgUnitEvent('invalid_orgunitid', null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when no eventId was provided
                gh.api.orgunitAPI.addOrgUnitEvent(1, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no eventId was provided');

                    // Verify that an error is thrown when an invalid eventId was provided
                    gh.api.orgunitAPI.addOrgUnitEvent(1, 'invalid_eventid', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid eventId was provided');

                        // Verify that an error is thrown when an event that doesn't exist is being added to the organisational unit
                        gh.api.orgunitAPI.addOrgUnitEvent(1, 99999999, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an event that doesn\'t exist is being added to the organisational unit');
                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    // Test the deleteOrgUnitSeries functionality
    QUnit.asyncTest('deleteOrgUnitSeries', function(assert) {
        expect(6);

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.deleteOrgUnitSeries(1, 2, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.deleteOrgUnitSeries(null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.deleteOrgUnitSeries('invalid_orgunitid', null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when no serieId was provided
                gh.api.orgunitAPI.deleteOrgUnitSeries(1, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no serieId was provided');

                    // Verify that an error is thrown when an invalid serieId was provided
                    gh.api.orgunitAPI.deleteOrgUnitSeries(1, 'invalid_eventid', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid serieId was provided');

                        // Verify that an error is thrown when an event series that doesn't exist is being deleted from the organisational unit
                        gh.api.orgunitAPI.deleteOrgUnitSeries(1, 99999999, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an event series that doesn\'t exist is being deleted from the organisational unit');
                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    // Test the deleteOrgUnitEvent functionality
    QUnit.asyncTest('deleteOrgUnitEvent', function(assert) {
        expect(6);

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.deleteOrgUnitEvent(1, 2, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.deleteOrgUnitEvent(null, null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.deleteOrgUnitEvent('invalid_orgunitid', null, function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when no eventId was provided
                gh.api.orgunitAPI.deleteOrgUnitEvent(1, null, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when no eventId was provided');

                    // Verify that an error is thrown when an invalid eventId was provided
                    gh.api.orgunitAPI.deleteOrgUnitEvent(1, 'invalid_eventid', function(err, data) {
                        assert.ok(err, 'Verify that an error is thrown when an invalid eventId was provided');

                        // Verify that an error is thrown when an event that doesn't exist is being deleted from the organisational unit
                        gh.api.orgunitAPI.deleteOrgUnitEvent(1, 99999999, function(err, data) {
                            assert.ok(err, 'Verify that an error is thrown when an event that doesn\'t exist is being deleted from the organisational unit');
                            QUnit.start();
                        });
                    });
                });
            });
        });
    });

    // Test the deleteOrgUnit functionality
    QUnit.asyncTest('deleteOrgUnit', function(assert) {
        expect(4);

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.deleteOrgUnit(1, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.deleteOrgUnit(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.deleteOrgUnit('invalid_orgunitid', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when an orgunit that doesn't exist is being deleted
                gh.api.orgunitAPI.deleteOrgUnit(99999999, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an orgunit that doesn\'t exist is being deleted');
                    QUnit.start();
                });
            });
        });
    });

    // Test the subscribeOrgUnit functionality
    QUnit.asyncTest('subscribeOrgUnit', function(assert) {
        expect(4);

        // Verify that an error is thrown when an invalid callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.subscribeOrgUnit(1, 'not_a_callback');
        }, 'Verify that an error is thrown when an invalid callback was provided');

        // Verify that an error is thrown when no orgUnitId was provided
        gh.api.orgunitAPI.subscribeOrgUnit(null, function(err, data) {
            assert.ok(err, 'Verify that an error is thrown when no orgUnitId was provided');

            // Verify that an error is thrown when an invalid orgUnitId was provided
            gh.api.orgunitAPI.subscribeOrgUnit('invalid_orgunitid', function(err, data) {
                assert.ok(err, 'Verify that an error is thrown when an invalid orgUnitId was provided');

                // Verify that an error is thrown when an orgunit that doesn't exist is being subscribed to
                gh.api.orgunitAPI.subscribeOrgUnit(99999999, function(err, data) {
                    assert.ok(err, 'Verify that an error is thrown when an orgunit that doesn\'t exist is being subscribed to');
                    QUnit.start();
                });
            });
        });
    });

    testAPI.init();
});

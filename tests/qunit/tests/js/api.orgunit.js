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

require(['gh.core', 'gh.api.tests'], function(gh, testAPI) {
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
                    // QUnit.start();
                });
            });
        });
    });


    // Test the getOrgUnitSeries functionality

    // Test the getOrgUnitCalendar functionality

    // Test the getOrgUnitCalendarIcal functionality

    // Test the getOrgUnitCalendarRss functionality

    // Test the getOrgUnitUpcoming functionality

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

    // Test the addOrgUnitEvents functionality

    // Test the deleteOrgUnitSeries functionality

    // Test the deleteOrgUnitEvents functionality

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

    testAPI.init();
});

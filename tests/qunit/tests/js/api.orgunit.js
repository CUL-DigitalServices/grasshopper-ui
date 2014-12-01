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
        expect(7);

        // Verify that an error is thrown when no callback was provided
        assert.throws(function() {
            gh.api.orgunitAPI.getOrgUnits();
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

                // Verify that an error is thrown when no parentId was provided
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

    // Test the getOrgUnitsByApp functionality

    // Test the getOrgUnit functionality

    // Test the getOrgUnitSeries functionality

    // Test the getOrgUnitCalendar functionality

    // Test the getOrgUnitCalendarIcal functionality

    // Test the getOrgUnitCalendarRss functionality

    // Test the getOrgUnitUpcoming functionality

    // Test the createOrgUnit functionality

    // Test the createOrgUnitByApp functionality

    // Test the updateOrgUnit functionality

    // Test the addOrgUnitSeries functionality

    // Test the addOrgUnitEvents functionality

    // Test the deleteOrgUnitSeries functionality

    // Test the deleteOrgUnitEvents functionality

    // Test the deleteOrgUnit functionality

    // Test the subscribeOrgUnit functionality

    testAPI.init();
});

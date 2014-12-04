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

/*!
 * Initalize requireJS by setting paths and specifying load priorities
 */
requirejs.config({
    'baseUrl': '/shared/',
    'paths': {
        // Vendor paths
        'bootstrap': 'vendor/js/bootstrap',
        'bootstrap-notify': 'vendor/js/bootstrap-notify',
        'clickover': 'vendor/js/bootstrapx-clickover',
        'chosen': 'vendor/js/chosen.jquery',
        'fullcalendar': 'vendor/js/fullcalendar',
        'jquery': 'vendor/js/jquery-2.1.1',
        'lodash': 'vendor/js/lodash',
        'moment': 'vendor/js/moment',
        'sinon': 'vendor/js/sinon-1.12.1',
        'text': 'vendor/js/require.text',

        // GH API modules
        'gh.api': 'gh/api/gh.api',
        'gh.api.admin': 'gh/api/gh.api.admin',
        'gh.api.app': 'gh/api/gh.api.app',
        'gh.api.authentication': 'gh/api/gh.api.authentication',
        'gh.api.config': 'gh/api/gh.api.config',
        'gh.api.event': 'gh/api/gh.api.event',
        'gh.api.groups': 'gh/api/gh.api.groups',
        'gh.api.orgunit': 'gh/api/gh.api.orgunit',
        'gh.api.series': 'gh/api/gh.api.series',
        'gh.api.tenant': 'gh/api/gh.api.tenant',
        'gh.api.tests': 'gh/api/gh.api.tests',
        'gh.api.user': 'gh/api/gh.api.user',
        'gh.api.util': 'gh/api/gh.api.util',
        'gh.bootstrap': 'gh/api/gh.bootstrap',
        'gh.core': 'gh/api/gh.core',

        // GH Plugins
        'bootstrap.calendar': 'gh/js/bootstrap.calendar',
        'bootstrap.listview': 'gh/js/bootstrap.listview'
    },
    'shim' : {
        'bootstrap' : {
            'deps': ['jquery', 'fullcalendar'],
            'exports': 'Bootstrap'
        },
        'fullcalendar': {
            'deps': ['jquery', 'moment']
        }
    },
    'waitSeconds': 30
});

/*!
 * Load all of the dependencies and core GH APIs
 */
require(['gh.core'], function() {
    // Find the script that has specified both the data-main (which loaded this bootstrap script) and a data-loadmodule attribute. The
    // data-loadmodule attribute tells us which script they wish to load *after* the core APIs have been properly bootstrapped.
    var $mainScript = $('script[data-main][data-loadmodule]');
    if ($mainScript.length > 0) {
        var loadModule = $mainScript.attr('data-loadmodule');
        if (loadModule) {
            // Require the module they specified in the data-loadmodule attribute
            require([loadModule]);
        }
    }
});

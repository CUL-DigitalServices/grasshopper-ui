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

define(['exports'], function(exports) {

    var messaging = exports.messaging = {
        'default': {
            'error': 'This is a Timetable error, if you still see this after reloading a Timetable in your browser please contact <a href="mailto:help@timetable.cam.ac.uk" title="Contact support">support</a>'
        }
    };

    // Object of template names and paths needed to make the production build work
    var templates = exports.templates = {

        // GH global admin views
        'global-admin-administrators': '/shared/gh/partials/global-admin/administrators.html',
        'global-admin-app-user': '/shared/gh/partials/global-admin/app-user.html',
        'global-admin-configuration': '/shared/gh/partials/global-admin/configuration.html',
        'global-admin-global-users': '/shared/gh/partials/global-admin/global-users.html',
        'global-admin-navigation': '/shared/gh/partials/global-admin/navigation.html',
        'global-admin-tenants': '/shared/gh/partials/global-admin/tenants.html',
        'global-admin-users': '/shared/gh/partials/global-admin/users.html',

        // GH Mobile views
        'mobile-export': '/shared/gh/partials/mobile/mobile-export.html',

        // GH tenant admin views
        'admin-app': '/shared/gh/partials/tenant-admin/admin-app.html',
        'admin-app-config': '/shared/gh/partials/tenant-admin/admin-app-config.html',
        'admin-app-navigation': '/shared/gh/partials/tenant-admin/admin-app-navigation.html',
        'admin-app-user': '/shared/gh/partials/tenant-admin/admin-app-user.html',
        'admin-app-user-search': '/shared/gh/partials/tenant-admin/admin-app-user-search.html',
        'admin-batch-edit': '/shared/gh/partials/tenant-admin/admin-batch-edit.html',
        'admin-batch-edit-actions': '/shared/gh/partials/tenant-admin/admin-batch-edit-actions.html',
        'admin-batch-edit-date': '/shared/gh/partials/tenant-admin/admin-batch-edit-date.html',
        'admin-batch-edit-event-row': '/shared/gh/partials/tenant-admin/admin-batch-edit-event-row.html',
        'admin-batch-edit-event-type': '/shared/gh/partials/tenant-admin/admin-batch-edit-event-type.html',
        'admin-batch-edit-time-picker': '/shared/gh/partials/tenant-admin/admin-batch-edit-time-picker.html',
        'admin-borrow-series-modal': '/shared/gh/partials/tenant-admin/admin-borrow-series-modal.html',
        'admin-borrow-series-module-item': '/shared/gh/partials/tenant-admin/admin-borrow-series-module-item.html',
        'admin-delete-module-modal': '/shared/gh/partials/tenant-admin/admin-delete-module-modal.html',
        'admin-delete-module-overview': '/shared/gh/partials/tenant-admin/admin-delete-module-overview.html',
        'admin-delete-series-modal': '/shared/gh/partials/tenant-admin/admin-delete-series-modal.html',
        'admin-edit-date-field': '/shared/gh/partials/tenant-admin/admin-edit-date-field.html',
        'admin-edit-dates': '/shared/gh/partials/tenant-admin/admin-edit-dates.html',
        'admin-edit-dates-weeks': '/shared/gh/partials/tenant-admin/admin-edit-dates-weeks.html',
        'admin-editable-parts': '/shared/gh/partials/tenant-admin/admin-editable-parts.html',
        'admin-help': '/shared/gh/partials/tenant-admin/admin-help.html',
        'admin-login-form': '/shared/gh/partials/tenant-admin/admin-login-form.html',
        'admin-manage-orgunits': '/shared/gh/partials/tenant-admin/admin-manage-orgunits.html',
        'admin-manage-orgunits-add-modal': '/shared/gh/partials/tenant-admin/admin-manage-orgunits-add-modal.html',
        'admin-manage-orgunits-delete-modal': '/shared/gh/partials/tenant-admin/admin-manage-orgunits-delete-modal.html',
        'admin-modules': '/shared/gh/partials/tenant-admin/admin-modules.html',
        'admin-new-module-modal': '/shared/gh/partials/tenant-admin/admin-new-module-modal.html',
        'admin-new-series': '/shared/gh/partials/tenant-admin/admin-new-series.html',
        'admin-rename-module-modal': '/shared/gh/partials/tenant-admin/admin-rename-module-modal.html',
        'admin-subheader-pickers': '/shared/gh/partials/tenant-admin/admin-subheader-pickers.html',
        'admin-tripos-help': '/shared/gh/partials/tenant-admin/admin-tripos-help.html',
        'admin-video': '/shared/gh/partials/tenant-admin/admin-video.html',
        'admin-visibility-button': '/shared/gh/partials/tenant-admin/admin-visibility-button.html',
        'admin-visibility-modal': '/shared/gh/partials/tenant-admin/admin-visibility-modal.html',

        // GH student views
        'student-agenda-view': '/shared/gh/partials/tenant-student/student-agenda-view.html',
        'student-empty-timetable': '/shared/gh/partials/tenant-student/student-empty-timetable.html',
        'student-module-disabled-popover': '/shared/gh/partials/tenant-student/student-module-disabled-popover.html',
        'student-modules': '/shared/gh/partials/tenant-student/student-modules.html',
        'student-series-borrowed-published-popover': '/shared/gh/partials/tenant-student/student-series-borrowed-published-popover.html',
        'student-series-info-modal': '/shared/gh/partials/tenant-student/student-series-info-modal.html',
        'student-series-info': '/shared/gh/partials/tenant-student/student-series-info.html',
        'student-terms-and-conditions-modal': '/shared/gh/partials/tenant-student/student-terms-and-conditions-modal.html',

        // GH shared views
        'admin-config-form': '/shared/gh/partials/admin-config-form.html',
        'calendar': '/shared/gh/partials/calendar.html',
        'event': '/shared/gh/partials/event.html',
        'event-popover': '/shared/gh/partials/event-popover.html',
        'footer': '/shared/gh/partials/footer.html',
        'header': '/shared/gh/partials/header.html',
        'login-form': '/shared/gh/partials/login-form.html',
        'login-modal': '/shared/gh/partials/login-modal.html',
        'series-borrowed-popover': '/shared/gh/partials/series-borrowed-popover.html',
        'subheader-part': '/shared/gh/partials/subheader-part.html',
        'subheader-picker': '/shared/gh/partials/subheader-picker.html',
        'subheader-pickers': '/shared/gh/partials/subheader-pickers.html',

        // GH tests
        'qunit-basic-test': '/shared/gh/partials/tests/qunit-basic-test.html',
        'qunit-partial-test': '/shared/gh/partials/tests/qunit-partial-test.html'
    };

    // Time constants
    var time = exports.time = {

        // Store the shorthand names of the weekdays
        'DAYS': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'MONTHS': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

        // Keep track of number of milliseconds in a day, week and month for use in the calendar
        'PERIODS': {
            'day': 1000 * 60 * 60 * 24,
            'week': 1000 * 60 * 60 * 24 * 7,
            'month': 1000 * 60 * 60 * 24 * 7 * 30
        }
    };

    var video = exports.video = {
        'adminhowto': 'fmojPnWju54'
    };

    // The admin views
    var views = exports.views = {
        'BATCH_EDIT': 'batchEdit',
        'EDITABLE_PARTS': 'editableParts',
        'NEW_SERIES': 'newSeries'
    };
});

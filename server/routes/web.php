<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of the routes that are handled
| by your application. Just tell Laravel the URIs it should respond
| to using a Closure or controller method. Build something great!
|
*/

Route::group(['prefix' => 'secure'], function () {
    Route::get('bootstrap-data', 'BootstrapController@getBootstrapData');
    Route::get('update', 'UpdateController@update');

    //AUTH ROUTES
    Route::post('auth/register', 'Auth\RegisterController@register');
    Route::post('auth/login', 'Auth\LoginController@login');
    Route::post('auth/logout', 'Auth\LoginController@logout');
    Route::post('auth/password/email', 'Auth\ForgotPasswordController@sendResetLinkEmail');
    Route::post('auth/password/reset', 'Auth\ResetPasswordController@reset')->name('password.reset');

    //SOCIAL AUTHENTICATION
    Route::get('auth/social/{provider}/connect', 'SocialAuthController@connect');
    Route::get('auth/social/{provider}/login', 'SocialAuthController@login');
    Route::get('auth/social/{provider}/callback', 'SocialAuthController@loginCallback');
    Route::post('auth/social/extra-credentials', 'SocialAuthController@extraCredentials');
    Route::post('auth/social/{provider}/disconnect', 'SocialAuthController@disconnect');

    //SETTINGS
    Route::get('settings', 'SettingsController@index');
    Route::post('settings', 'SettingsController@persist');

    //REPORTS
    Route::get('reports/envato/earnings', 'ReportsController@envatoEarnings');
    Route::get('reports/tickets/count/daily', 'ReportsController@dailyTicketCount');
    Route::get('reports/tickets/range', 'ReportsController@generateTicketsReport');

    //VALUE LISTS
    Route::get('value-lists/{name}', 'ValueListsController@getValueList');

    //USERS
    Route::get('users/{id}', 'UsersController@show');
    Route::get('users', 'UsersController@index');
    Route::post('users', 'UsersController@store');
    Route::put('users/update-multiple', 'UsersController@updateMultiple');
    Route::put('users/{id}', 'UsersController@update');
    Route::delete('users/delete-multiple', 'UsersController@deleteMultiple');

    //USER PASSWORD
    Route::post('users/{id}/password/change', 'UserPasswordController@change');

    //USER GROUPS
    Route::post('users/{id}/groups/attach', 'UserGroupsController@attach');
    Route::post('users/{id}/groups/detach', 'UserGroupsController@detach');

    //USER PERMISSIONS
    Route::post('users/{id}/permissions/add', 'UserPermissionsController@add');
    Route::post('users/{id}/permissions/remove', 'UserPermissionsController@remove');

    //USER TAGS
    Route::post('users/{id}/tags/sync', 'UserTagsController@sync');

    //USER DETAILS
    Route::put('users/{id}/details', 'UserDetailsController@update');

    //USER EMAILS
    Route::post('users/{id}/emails/attach', 'UserEmailsController@attach');
    Route::post('users/{id}/emails/detach', 'UserEmailsController@detach');

    //USER TICKETS
    Route::get('users/{userId}/tickets', 'UserTicketsController@index');

    //USER AVATAR
    Route::post('users/{userId}/avatar', 'UserAvatarController@store');
    Route::delete('users/{userId}/avatar', 'UserAvatarController@destroy');

    //GROUPS
    Route::get('groups', 'GroupsController@index');
    Route::post('groups', 'GroupsController@store');
    Route::put('groups/{id}', 'GroupsController@update');
    Route::delete('groups/{id}', 'GroupsController@destroy');
    Route::post('groups/{id}/add-users', 'GroupsController@addUsers');
    Route::post('groups/{id}/remove-users', 'GroupsController@removeUsers');
    Route::post('groups/{id}/add-categories', 'GroupsController@addCategories');
    Route::post('groups/{id}/remote-categories', 'GroupsController@removeCategories');

    //PAGES
    Route::get('pages', 'PagesController@index');
    Route::get('pages/{id}', 'PagesController@show');
    Route::post('pages', 'PagesController@store');
    Route::put('pages/{id}', 'PagesController@update');
    Route::delete('pages', 'PagesController@destroy');

    //TICKETS
    Route::get('tickets', 'TicketController@index');
    Route::post('tickets', 'TicketController@store');
    Route::post('tickets/merge/{ticket1}/{ticket2}', 'TicketsMergeController@merge');
    Route::get('tickets/{id}', 'TicketController@show');
    Route::post('tickets/assign', 'TicketAssigneeController@change');
    Route::post('tickets/assign-priority', 'TicketAssigneeController@changePriority');
    Route::delete('tickets', 'TicketController@destroy');
    Route::get('tickets/{id}/replies', 'TicketRepliesController@index');
    Route::post('tickets/{id}/{type}', 'TicketRepliesController@store')->where('type', 'drafts|replies|notes');

    //AGENT SEARCH
    Route::get('search/all/{query}', 'SearchController@all');
    Route::get('search/users/{query}', 'SearchController@users');
    Route::get('search/tickets/{query}', 'SearchController@tickets');
    Route::get('search/articles/{query}', 'SearchController@articles');

    //REPLIES
    Route::get('replies/{id}', 'RepliesController@show');
    Route::get('replies/{id}/original', 'OriginalReplyEmailController@show');
    Route::put('replies/{id}', 'RepliesController@update');
    Route::delete('replies/{id}', 'RepliesController@destroy');

    //DRAFTS
    Route::delete('drafts/{id}', 'DraftsController@destroy');
    Route::post('drafts/{draftId}/uploads/{uploadId}/detach', 'DraftUploadsController@detach');

    //TICKET TAGS
    Route::post('tickets/status/change', 'TicketStatusController@change');
    Route::post('tickets/tags/add', 'TicketTagsController@add');
    Route::post('tickets/tags/remove', 'TicketTagsController@remove');

    //TAGS
    Route::get('tags/agent-mailbox', 'TagController@tagsForAgentMailbox');
    Route::get('tags', 'TagController@index');
    Route::post('tags', 'TagController@store');
    Route::put('tags/{id}', 'TagController@update');
    Route::delete('tags/delete-multiple', 'TagController@deleteMultiple');

    //NEW TICKET CATEGORIES
    Route::get('new-ticket/categories', 'NewTicketCategoriesController@index');

    //UPLOADS
    Route::get('uploads', 'UploadsController@index');
    Route::get('uploads/{id}', 'UploadsController@show');
    Route::get('uploads/{id}/download', 'FileDownloadController@download');
    Route::post('uploads', 'UploadsController@store');
    Route::delete('uploads', 'UploadsController@destroy');

    //CANNED REPLIES
    Route::get('canned-replies', 'CannedRepliesController@index');
    Route::post('canned-replies', 'CannedRepliesController@store');
    Route::put('canned-replies/{id}', 'CannedRepliesController@update');
    Route::delete('canned-replies', 'CannedRepliesController@destroy');

    // Escalation Rules
    Route::get('escalation-rules', 'EscalationRuleController@index');
    Route::post('escalation-rules', 'EscalationRuleController@store');
    Route::put('escalation-rules/{id}', 'EscalationRuleController@update');
    Route::delete('escalation-rules', 'EscalationRuleController@destroy');

    // Supervisors
    Route::get('supervisors', 'SupervisorController@index');
    Route::post('supervisors', 'SupervisorController@store');
    Route::put('supervisors/{id}', 'SupervisorController@update');
    Route::delete('supervisors', 'SupervisorController@destroy');

    // Stages
    Route::get('stages', 'StageController@index');
    Route::post('stages', 'StageController@store');
    Route::put('stages/{id}', 'StageController@update');
    Route::delete('stages', 'StageController@destroy');

    // Priorities
    Route::get('priorities', 'PriorityController@index');
    Route::post('priorities', 'PriorityController@store');
    Route::put('priorities/{id}', 'PriorityController@update');
    Route::delete('priorities', 'PriorityController@destroy');

    //HELP CENTER
    Route::get('help-center', 'HelpCenterController@index');

    //HELP CENTER CATEGORIES
    Route::get('help-center/categories', 'CategoriesController@index');
    Route::get('help-center/categories/{id}', 'CategoriesController@show');
    Route::post('help-center/categories', 'CategoriesController@store');
    Route::post('help-center/categories/reorder', 'CategoriesOrderController@change');
    Route::put('help-center/categories/{id}', 'CategoriesController@update');
    Route::post('help-center/categories/{id}/detach-parent', 'ChildCategoryController@detachParent');
    Route::delete('help-center/categories/{id}', 'CategoriesController@destroy');

    //HELP CENTER ARTICLES
    Route::get('help-center/articles/{id}', 'ArticlesController@show');
    Route::get('help-center/articles', 'ArticlesController@index');
    Route::post('help-center/articles', 'ArticlesController@store');
    Route::put('help-center/articles/{id}', 'ArticlesController@update');
    Route::post('help-center/articles/{id}/feedback', 'ArticleFeedbackController@submit');
    Route::post('images/static/upload', 'StaticImagesController@upload');
    Route::delete('help-center/articles', 'ArticlesController@destroy');

    //TRIGGERS
    Route::get('triggers', 'TriggersController@index');
    Route::get('triggers/conditions', 'ConditionsController@index');
    Route::get('triggers/actions', 'ActionsController@index');
    Route::get('triggers/value-options/{name}', 'TriggerValueOptionsController@show');
    Route::get('triggers/{id}', 'TriggersController@show');
    Route::post('triggers', 'TriggersController@store');
    Route::put('triggers/{id}', 'TriggersController@update');
    Route::delete('triggers', 'TriggersController@destroy');

    //ENVATO
    Route::get('envato/validate-purchase-code', 'EnvatoController@validateCode');
    Route::post('envato/items/import', 'EnvatoController@ImportItems');

    //ADMIN
    //Route::get('admin/error-log', 'AdminController@getErrorLog');
    Route::post('admin/appearance', 'AppearanceController@save');
    Route::get('admin/appearance/values', 'AppearanceController@getValues');

    //LOCALIZATIONS
    Route::get('admin/localizations', 'LocalizationsController@index');
    Route::post('admin/localizations', 'LocalizationsController@store');
    Route::put('admin/localizations/{id}', 'LocalizationsController@update');
    Route::delete('admin/localizations/{id}', 'LocalizationsController@destroy');
    Route::get('admin/localizations/{name}', 'LocalizationsController@show');

    //MAIL TEMPLATES
    Route::get('mail-templates', 'MailTemplatesController@index');
    Route::post('mail-templates/render', 'MailTemplatesController@render');
    Route::post('mail-templates/{id}/restore-default', 'MailTemplatesController@restoreDefault');
    Route::put('mail-templates/{id}', 'MailTemplatesController@update');

    //HElP CENTER IMPORT/EXPORT
    Route::post('help-center/actions/import', 'HelpCenterActionsController@import');
    Route::get('help-center/actions/export', 'HelpCenterActionsController@export');
    Route::post('help-center/actions/delete-unused-images', 'HelpCenterActionsController@deleteUnusedImages');

    //CACHE
    Route::post('cache/clear', 'CacheController@clear');

    //3RD PARTY IMPORT/EXPORT
    Route::get('ticketing/actions/helpscout/import', 'TicketingActionsController@importHelpScoutConversations');
});

//TICKETS MAIL WEBHOOKS
Route::post('tickets/mail/incoming', 'TicketsMailController@handleIncoming');
Route::post('tickets/mail/failed', 'TicketsMailController@handleFailed');

//E2E TESTS
if (App::environment() !== 'production') {
    Route::get('secure/e2e-start', function() { return Artisan::call('e2e:setup'); });
    Route::get('secure/e2e-stop', function() { return Artisan::call('e2e:teardown'); });
}

//FRONT-END ROUTES THAT NEED TO BE PRE-RENDERED
Route::get('/', 'HomeController@index')->middleware('prerenderIfCrawler:home');
Route::get('help-center', 'HomeController@index')->middleware('prerenderIfCrawler:home');
Route::get('help-center/articles/{articleId}/{slug}', 'HomeController@index')->middleware('prerenderIfCrawler:article');
Route::get('help-center/articles/{parentId}/{articleId}/{slug}', 'HomeController@index')->middleware('prerenderIfCrawler:article');
Route::get('help-center/articles/{parentId}/{childId}/{articleId}/{slug}', 'HomeController@index')->middleware('prerenderIfCrawler:article');
Route::get('help-center/categories/{categoryId}/{slug}', 'HomeController@index')->middleware('prerenderIfCrawler:category');
Route::get('help-center/search/{query}', 'HomeController@index')->middleware('prerenderIfCrawler:search');

//CACHE ALL ROUTES AND REDIRECT TO HOME
Route::get('{all}', 'HomeController@index')->where('all', '.*');
<?php

return [
    //PERMISSIONS
    'permissions' => [
        'permissions.view',
    ],

    //USER GROUPS
    'groups' => [
        'groups.view',
        'groups.create',
        'groups.update',
        'groups.delete',
        'groups.add-users',
        'groups.remove-users',
    ],

    //REPORTS
    'reports' => [
        'reports.view'
    ],

    //HELP CENTER ARTICLES
    'articles' => [
        'articles.view',
        'articles.create',
        'articles.update',
        'articles.delete',
    ],

    //ACCESS
    'access' => [
        'access.admin',
        'access.help_center_manage',
    ],

    //HELP CENTER CATEGORIES
    'categories' => [
        'categories.view',
        'categories.create',
        'categories.update',
        'categories.delete',
    ],

    //PAGES
    'pages' => [
        'pages.view',
        'pages.create',
        'pages.update',
        'pages.delete',
    ],

    //TICKETS
    'tickets' => [
        'tickets.view',
        'tickets.create',
        'tickets.update',
        'tickets.delete',
        'tickets.close',
        'tickets.all'
    ],

    //REPLIES
    'replies' => [
        'replies.view',
        'replies.create',
        'replies.update',
        'replies.delete',
        'replies.reply'
    ],

    //CANNED REPLIES
    'canned_replies' => [
        'canned_replies.view',
        'canned_replies.create',
        'canned_replies.update',
        'canned_replies.delete',
    ],

    //UPLOADS
    'uploads' => [
        'uploads.create',
        'uploads.delete',
    ],

    //USERS
    'users' => [
        'users.view',
        'users.create',
        'users.update',
        'users.delete',
    ],

    //TAGS
    'tags' => [
        'tags.view',
        'tags.create',
        'tags.update',
        'tags.delete',
        'tags.spam',
        'tags.closed'
    ],

    //LOCALIZATIONS
    'localizations' => [
        'localizations.view',
        'localizations.create',
        'localizations.update',
        'localizations.delete',
    ],

    //MAIL TEMPLATES
    'mail_templates' => [
        'mail_templates.view',
        'mail_templates.update',
    ],

    //TRIGGERS
    'trigger' => [
        'triggers.view',
        'triggers.create',
        'triggers.update',
    ],

    //CONDITIONS
    'conditions' => [
        'conditions.view',
    ],

    //ACTIONS
    'actions' => [
        'actions.view',
    ],

    //SETTINGS
    'settings' => [
        'settings.view',
        'settings.update',
    ]
];

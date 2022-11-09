<?php

return [
    ['name' => 'version', 'value' => '1.0.0'],

    //dates
    ['name' => 'dates.format', 'value' => '%b %e, %H:%M'],
    ['name' => 'dates.locale', 'value' => 'en_US'],

    //social login
    ['name' => 'social.google.enable', 'value' => 1],
    ['name' => 'social.twitter.enable', 'value' => 1],
    ['name' => 'social.facebook.enable', 'value' => 1],
    ['name' => 'social.envato.enable', 'value' => 0],

    //tickets
    ['name' => 'replies.send_email', 'value' => 0],
    ['name' => 'tickets.create_from_emails', 'value' => 0],
    ['name' => 'tickets.send_ticket_created_notification', 'value' => 0],
    ['name' => 'replies.default_redirect', 'value' => 'next_active_ticket'],

    //mail
    ['name' => 'mail.handler', 'value' => 'null', 'private' => 1],
    ['name' => 'mail.webhook_secret_key', 'value' => str_random(30), 'private' => 1],
    ['name' => 'mail.use_default_templates', 'value' => 0],
    ['name' => 'mail.store_unmatched_emails', 'value' => 0],


    //real time
    ['name' => 'realtime.enable', 'value' => 0],

    //temp
    ['name' => 'registration.disable', 'value' => 0],

    //envato
    ['name' => 'envato.filter_search', 'value' => 0],

    //cache
    ['name' => 'cache.report_minutes', 'value' => 60],

    //branding
    ['name' => 'branding.use_custom_theme', 'value' => 1],
    ['name' => 'branding.hc_logo', 'value' => 'assets/images/hc-logo.png'],
    ['name' => 'branding.site_logo', 'value' => 'assets/images/logo.png'],
    ['name' => 'branding.site_name', 'value' => 'BeDesk'],
    ['name' => 'branding.favicon', 'value' => 'favicon.ico'],

    //help center
    ['name' => 'articles.default_order', 'value' => 'created_at|desc'],
    ['name' => 'hc.search_page_limit', 'value' => 20],
    ['name' => 'hc.search_page.body_limit', 'value' => 300],
    ['name' => 'hc_home.children_per_category', 'value' => 6],
    ['name' => 'hc_home.articles_per_category', 'value' => 5],
    ['name' => 'hc.home.title', 'value' => 'How can we help you?'],
    ['name' => 'hc.home.subtitle', 'value' => 'Ask Questions. Browse Articles. Find Answers.'],
    ['name' => 'hc.home.search-placeholder', 'value' => 'Enter your question or keyword here'],
    ['name' => 'hc.home.background', 'value' => 'assets/images/pattern.svg'],

    //new ticket page
    ['name' => 'hc.new-ticket.title', 'value' => 'Submit a Ticket'],
    ['name' => 'hc.new-ticket.category_label', 'value' => 'Select the item you need help with'],
    ['name' => 'hc.new-ticket.subject_label', 'value' => 'In a few words, tell us what your enquiry is about'],
    ['name' => 'hc.new-ticket.description_label', 'value' => 'Tell us more...Please be as detailed as possible.'],
    ['name' => 'hc.new-ticket.submit_button_text', 'value' => 'Submit'],
    ['name' => 'hc.new-ticket.sidebar_title', 'value' => 'Before you submit:'],
    ['name' => 'hc.new-ticket.sidebar_tips', 'value' => json_encode([
        ['title' => 'Tell us!', 'content' => 'Add as much detail as possible, including site and page name.'],
        ['title' => 'Show us!', 'content' => 'Add a screenshot or a link to a video.']
    ])],

    //translations
    ['name' => 'i18n.default_localization', 'value' => 'English'],
    ['name' => 'i18n.enable', 'value' => 1],

    //SEO
    ['name' => 'seo.article_title', 'value' => '{{ARTICLE_TITLE}}'],
    ['name' => 'seo.article_description', 'value' => '{{ARTICLE_DESCRIPTION}}'],
    ['name' => 'seo.category_title', 'value' => '{{CATEGORY_NAME}}'],
    ['name' => 'seo.category_description', 'value' => '{{CATEGORY_DESCRIPTION}}'],
    ['name' => 'seo.search_title', 'value' => 'Search results for {{QUERY}}'],
    ['name' => 'seo.search_description', 'value' => 'Search results for {{QUERY}}'],
    ['name' => 'seo.home_title', 'value' => 'Help Center'],
    ['name' => 'seo.home_description', 'value' => "Articles, Tutorials, FAQ's and more."],

    //sentry
    ['name' => 'logging.sentry_public', 'value' => null],

    //pusher
    ['name' => 'realtime.pusher_key', 'value' => null],

    //menus
    ['name' => 'menus', 'value' => json_encode([
        ['name' => 'Header Menu', 'position' => 'header', 'items' => [
            ['type' => 'route', 'condition' => 'auth', 'label' => 'My Tickets', 'action' => '/help-center/tickets'],
            ['type' => 'route', 'condition' => 'guest', 'label' => 'Register', 'action' => '/register'],
            ['type' => 'route', 'condition' => 'guest', 'label' => 'Login', 'action' => '/login']
        ]],
    ])],
];

<?php namespace App\Providers;

use App\CannedReply;
use App\Localization;
use App\MailTemplate;
use App\Page;
use App\Tag;
use App\User;
use App\Reply;
use App\Group;
use App\Action;
use App\Upload;
use App\Ticket;
use App\Setting;
use App\Trigger;
use App\Article;
use App\Category;
use App\Condition;
use Illuminate\Contracts\Auth\Access\Gate as GateContract;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        'App\Model'         => 'App\Policies\ModelPolicy',
        'PermissionsPolicy' => \App\Policies\PermissionsPolicy::class,
        'ReportPolicy'      => \App\Policies\ReportPolicy::class,
        'AppearancePolicy'  => \App\Policies\AppearancePolicy::class,
        Ticket::class       => \App\Policies\TicketPolicy::class,
        Upload::class       => \App\Policies\UploadPolicy::class,
        Reply::class        => \App\Policies\ReplyPolicy::class,
        CannedReply::class  => \App\Policies\CannedReplyPolicy::class,
        Category::class     => \App\Policies\CategoryPolicy::class,
        Article::class      => \App\Policies\ArticlePolicy::class,
        User::class         => \App\Policies\UserPolicy::class,
        Group::class        => \App\Policies\GroupPolicy::class,
        Tag::class          => \App\Policies\TagPolicy::class,
        Setting::class      => \App\Policies\SettingPolicy::class,
        Condition::class    => \App\Policies\ConditionPolicy::class,
        Action::class       => \App\Policies\ActionPolicy::class,
        Trigger::class      => \App\Policies\TriggerPolicy::class,
        Page::class         => \App\Policies\PagePolicy::class,
        Localization::class => \App\Policies\LocalizationPolicy::class,
        MailTemplate::class => \App\Policies\MailTemplatePolicy::class,
    ];

    /**
     * Register any application authentication / authorization services.
     *
     * @param  \Illuminate\Contracts\Auth\Access\Gate  $gate
     * @return void
     */
    public function boot(GateContract $gate)
    {
        $this->registerPolicies($gate);
    }
}

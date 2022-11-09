<?php namespace App\Services;

use App\Group;
use App\Localization;
use Illuminate\Http\Request;

class BootstrapData
{
    /**
     * @var Settings
     */
    private $settings;

    /**
     * @var Request
     */
    private $request;

    /**
     * @var TagRepository
     */
    private $tags;

    /**
     * @var Localization
     */
    private $localization;

    /**
     * @var Group
     */
    private $groups;

    /**
     * BootstrapData constructor.
     *
     * @param Settings $settings
     * @param Request $request
     * @param TagRepository $tags
     * @param Localization $localization
     * @param Group $groups
     */
    public function __construct(
        Settings $settings,
        Request $request,
        TagRepository $tags,
        Localization $localization,
        Group $groups
    )
    {
        $this->tags = $tags;
        $this->groups = $groups;
        $this->request = $request;
        $this->settings = $settings;
        $this->localization = $localization;
    }

    /**
     * Get data needed to bootstrap the application.
     *
     * @return string
     */
    public function get()
    {
        $bootstrap = [];
        $bootstrap['settings'] = $this->settings->all();
        $bootstrap['settings']['base_url'] = url('');
        $bootstrap['settings']['version'] = config('site.version');
        $bootstrap['csrf_token'] = csrf_token();
        $bootstrap['user'] = $this->request->user() ? $this->request->user()->load('groups') : null;
        $bootstrap['guests_group'] = $this->groups->where('guests', 1)->first();
        $bootstrap['tags'] = $this->tags->getStatusAndCategoryTags();
        $bootstrap['i18n'] = $this->getLocalizationsData() ?: null;

        return base64_encode(json_encode($bootstrap));
    }

    /**
     * Get currently selected i18n language.
     *
     * @return Localization
     */
    private function getLocalizationsData()
    {
        if ( ! $this->settings->get('i18n.enable')) return null;

        //get user selected or default language
        $userLang = $this->request->user() ? $this->request->user()->language : null;

        if ( ! $userLang) {
            $userLang = $this->settings->get('i18n.default_localization');
        }

        if ($userLang) {
            $localization = $this->localization->where('name', $userLang)->first();
            return $localization;
        }
    }
}

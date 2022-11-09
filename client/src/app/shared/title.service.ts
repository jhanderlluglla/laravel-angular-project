import {Injectable} from "@angular/core";
import {SettingsService} from "./settings.service";
import {Translations} from "./translations/translations.service";
import {Article} from "./models/Article";
import {Category} from "./models/Category";
import {Title} from "@angular/platform-browser";
import {NavigationEnd, Router} from "@angular/router";

@Injectable()
export class TitleService {

    /**
     * Separator for items within title string.
     */
    private separator = ' | ';

    /**
     * TitleService Constructor.
     */
    constructor(
        private settings: SettingsService,
        private i18n: Translations,
        private title: Title,
        private router: Router,
    ) {}

    /**
     * Get help center home title.
     */
    public getHomeTitle() {
        return this.i18n.t('Help Center') + this.separator + this.settings.get('branding.site_name');
    }

    /**
     * Set help center home title.
     */
    public setHomeTitle() {
        let title = this.i18n.t('Help Center') + this.separator + this.settings.get('branding.site_name');
        this.title.setTitle(title);
    }

    /**
     * Set help center article title.
     */
    public setArticleTitle(article: Article) {
        this.title.setTitle(article.title + this.separator + this.getHomeTitle());
    }

    /**
     * Set help center category title.
     */
    public setCategoryTitle(category: Category) {
        this.title.setTitle(category.name + this.separator + this.getHomeTitle());
    }

    /**
     * Set help center search title.
     */
    public setSearchTitle(query: string) {
        this.title.setTitle(this.i18n.t('Search Results') + this.separator + this.getHomeTitle());
    }

    /**
     * Set default title for the site.
     */
    public setDefaultTitle() {
        return this.title.setTitle(this.settings.get('branding.site_name'));
    }

    /**
     * Initiate title service.
     */
    public init() {
        this.router.events
            .filter(event => event instanceof NavigationEnd)
            .subscribe(() => this.setDefaultTitle());
    }
}
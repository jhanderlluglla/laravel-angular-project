import {Component, ViewChild, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {TextEditorComponent} from "../../../text-editor/text-editor.component";
import {ToastService} from "../../../shared/toast/toast.service";
import {ModalService} from "../../../shared/modal/modal.service";
import {ArticleSettingsModalComponent} from "./article-settings-modal/article-settings-modal.component";
import {CategoriesManagerComponent} from "../categories-manager/categories-manager.component";
import {TagsManagerComponent} from "../tags-manager/tags-manager.component";
import {HelpCenterService} from "../../shared/help-center.service";
import {ArticleModalComponent} from "../../shared/article-modal/article-modal.component";
import {Article} from "../../../shared/models/Article";
import {CategoryModalComponent} from "../category-modal/category-modal.component";
import {Category} from "../../../shared/models/Category";

@Component({
    selector: 'new-article',
    templateUrl: './new-article.component.html',
    styleUrls: ['./new-article.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NewArticleComponent {
    @ViewChild(TextEditorComponent) private textEditor: TextEditorComponent;
    @ViewChild(CategoriesManagerComponent) private categoriesManager: CategoriesManagerComponent;
    @ViewChild(TagsManagerComponent) private tagsManager: TagsManagerComponent;

    /**
     * Whether we are currently updating or creating an article.
     */
    public updating: boolean = false;

    /**
     * New or existing article model.
     */
    public articleModel: Article = new Article();

    /**
     * HcNewArticleComponent Constructor.
     */
    constructor(
        private modal: ModalService,
        private helpCenter: HelpCenterService,
        private toast: ToastService,
        private route: ActivatedRoute,
    ) {}

    ngOnInit() {
        this.route.data.subscribe(resolves => this.hydrate(resolves['data']))
    }

    /**
     * Create a new help center article or update existing one.
     */
    public saveOrUpdateArticle() {
        let method = this.articleModel.id ? 'updateArticle' : 'createArticle';
        this.updating = true;

        this.helpCenter[method](this.getPayload()).subscribe(response => {
            this.toast.show('Article '+(this.articleModel.id ? 'updated' : 'created'));
            this.updating = false;
            this.articleModel.id = response.data.id;
        }, errors => {
            let message = errors['messages'][Object.keys(errors['messages'])[0]];
            this.toast.show(message);
            this.updating = false;
        });
    }

    /**
     * Open article preview modal.
     */
    public openPreviewModal() {
        this.modal.show(ArticleModalComponent, {article: this.getPayload()});
    }

    /**
     * Open article settings modal.
     */
    public openArticleSettingsModal() {
        this.modal.show(ArticleSettingsModalComponent, {article: this.articleModel}).onDone.subscribe(data => {
            this.articleModel = Object.assign(this.articleModel, data);
        });
    }

    /**
     * Get payload for creating or updating help center article.
     */
    private getPayload() {
        let model  = Object.assign({}, this.articleModel) as Object;
        model['body'] = this.textEditor.getContents();
        model['categories'] = this.categoriesManager.getSelectedCategories();
        model['tags'] = this.tagsManager.getSelectedTags();
        return model;
    }

    /**
     * Hydrate article model with given data.
     */
    private hydrate(data: {article?: Article, categories?: Category[]}) {
        if (data.article) {
            this.articleModel = data.article;
            this.textEditor.setContents(data.article.body);
            this.categoriesManager.setSelectedCategories(this.articleModel.categories);
            this.tagsManager.setSelectedTags(this.articleModel.tags.map(tag => tag.name));
        }

        if (data.categories) {
            this.categoriesManager.setCategories(data.categories);
        }
    }

    /**
     * Open create/update category modal.
     */
    public openNewCategoryModal() {
        this.modal.show(CategoryModalComponent).onDone.subscribe(category => {
            this.categoriesManager.refresh()
                .then(() => this.categoriesManager.toggle(category));
        });
    }
}

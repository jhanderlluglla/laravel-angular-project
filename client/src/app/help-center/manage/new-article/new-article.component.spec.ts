import {KarmaTest} from "../../../../../testing/karma-test";
import {TextEditorComponent} from "../../../text-editor/text-editor.component";
import {UploadsService} from "../../../shared/uploads.service";
import {FileValidator} from "../../../shared/file-validator";
import {ActivatedRoute} from "@angular/router";
import {ActivatedRouteStub} from "../../../../../testing/stubs/activated-route-stub";
import {BehaviorSubject, Observable} from "rxjs";
import {fakeAsync, tick} from "@angular/core/testing";
import {ToastService} from "../../../shared/toast/toast.service";
import {ModalService} from "../../../shared/modal/modal.service";
import {NewArticleComponent} from "./new-article.component";
import {ArticleSettingsModalComponent} from "./article-settings-modal/article-settings-modal.component";
import {CategoriesManagerComponent} from "../categories-manager/categories-manager.component";
import {TagsManagerComponent} from "../tags-manager/tags-manager.component";
import {HelpCenterService} from "../../shared/help-center.service";
import {ArticleModalComponent} from "../../shared/article-modal/article-modal.component";
import {LoadingIndicatorComponent} from "../../../shared/loading-indicator/loading-indicator.component";
import {CategoriesService} from "../../shared/categories.service";
import {ReorderDirective} from "../../../shared/reorder.directive";

describe('NewArticle', () => {
    let testBed: KarmaTest<NewArticleComponent>;
    let resolve;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    NewArticleComponent, TextEditorComponent, TagsManagerComponent,
                    ReorderDirective, CategoriesManagerComponent, LoadingIndicatorComponent,
                ],
                providers: [
                    HelpCenterService, UploadsService, FileValidator, CategoriesService,
                    {provide: ActivatedRoute, useClass: ActivatedRouteStub}
                ],
            },
            component: NewArticleComponent,
        });

        resolve = {data: {
            article: testBed.fake('Article', 1, {tags: testBed.fake('Tag', 2), categories: testBed.fake('Category', 2)}),
            categories: testBed.fake('Category', 2)}
        };

        testBed.get(ActivatedRoute)['testData'] = resolve;
    });

    it('hydrates article model on component init', () => {
        spyOn(testBed.getChildComponent(TextEditorComponent), 'setContents');
        testBed.component.ngOnInit();

        //hydrates model
        expect(testBed.component.articleModel).toEqual(resolve.data.article);

        //selects categories
        expect(testBed.component['categoriesManager'].getSelectedCategories()).toEqual([resolve.data.article.categories[0].id, resolve.data.article.categories[1].id]);

        //sets categories on "CategoriesManager"
        expect(testBed.component['categoriesManager'].allCategories).toEqual(resolve.data.categories);

        //selects tags
        expect(testBed.getChildComponent(TagsManagerComponent).getSelectedTags()).toEqual([resolve.data.article.tags[0].name, resolve.data.article.tags[1].name]);

        //sets text editor contents
        expect(testBed.getChildComponent(TextEditorComponent).setContents).toHaveBeenCalledWith(resolve.data.article.body);
    });

    it('updates article', fakeAsync(() => {
        testBed.fixture.detectChanges();
        tick();
        testBed.component.articleModel = testBed.fake('Article');
        testBed.component['categoriesManager'].selectedCategories = [1, 2, 3];
        testBed.component['tagsManager'].selectedTags = ['foo', 'bar'];
        testBed.getChildComponent(TextEditorComponent).setContents('contents');
        let observer; let article = testBed.fake('Article');
        spyOn(testBed.get(HelpCenterService), 'updateArticle').and.returnValue(new Observable(obs => observer = obs));

        testBed.component.saveOrUpdateArticle();

        //calls server
        expect(testBed.get(HelpCenterService).updateArticle).toHaveBeenCalledWith(jasmine.objectContaining({
            id: testBed.component.articleModel.id,
            body: 'contents',
            categories: [1, 2, 3],
            tags: ['foo', 'bar'],
        }));

        //handles success
        observer.next({data: article});
        expect(testBed.component.updating).toEqual(false);
        expect(testBed.component.articleModel.id).toEqual(article.id);
    }));

    it('creates article', () => {
        spyOn(testBed.get(HelpCenterService), 'updateArticle').and.returnValue(new BehaviorSubject({}));
        spyOn(testBed.get(HelpCenterService), 'createArticle').and.returnValue(new BehaviorSubject({data: {id: 1}}));

        testBed.component.saveOrUpdateArticle();

        expect(testBed.get(HelpCenterService).createArticle).toHaveBeenCalledTimes(1);
        expect(testBed.get(HelpCenterService).updateArticle).not.toHaveBeenCalled();
    });

    it('shows errors when article creating or updating fails', () => {
        spyOn(testBed.get(HelpCenterService), 'createArticle').and.returnValue(Observable.throw({messages: {body: 'foo'}}));
        spyOn(testBed.get(ToastService), 'show');

        testBed.component.saveOrUpdateArticle();

        expect(testBed.get(ToastService).show).toHaveBeenCalledWith('foo');
    });

    it('opens article preview modal', () => {
        testBed.component.articleModel = testBed.fake('Article');
        spyOn(testBed.get(ModalService), 'show');
        testBed.component.openPreviewModal();
        expect(testBed.get(ModalService).show)
            .toHaveBeenCalledWith(ArticleModalComponent, {article: jasmine.objectContaining({id: testBed.component.articleModel.id})});
    });

    it('opens article settings modal', () => {
        spyOn(testBed.get(ModalService), 'show').and.returnValue({
            onDone: new BehaviorSubject({slug: 'foo-bar'})
        });

        testBed.find('.article-settings-action').click();

        //opens modal
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(ArticleSettingsModalComponent, {article: testBed.component.articleModel});

        //merges returned data to article model
        expect(testBed.component.articleModel.slug).toEqual('foo-bar');
    });

    it('renders article title and body inputs', () => {
        testBed.fixture.detectChanges();

        //renders title input
        testBed.typeIntoEl('.article-title-input', 'foo');
        expect(testBed.component.articleModel.title).toEqual('foo');

        //renders text editor (body input)
        let editor = testBed.getChildComponent(TextEditorComponent);
        expect(editor).toBeTruthy();
        expect(editor.minHeight).toEqual('auto');
        expect(editor.showAdvancedControls).toEqual(true);
    });

    it('renders left panel', fakeAsync(() => {
        testBed.fixture.detectChanges();

        //opens article preview
        spyOn(testBed.component, 'openPreviewModal');
        testBed.find('.preview-article-button').click();
        expect(testBed.component.openPreviewModal).toHaveBeenCalledTimes(1);

        tick();

        //renders and sets article status
        expect(testBed.component.articleModel.draft).toBeFalsy();
        testBed.chooseSelectValue('.article-status-input', '1');
        expect(testBed.component.articleModel.draft).toEqual('1' as any);

        //renders create article submit button
        testBed.component.articleModel.id = null;
        testBed.fixture.detectChanges();
        expect(testBed.find('.create-article-submit')).toBeTruthy();
        expect(testBed.find('.update-article-submit')).toBeFalsy();

        //renders updates article submit button
        testBed.component.articleModel.id = 1;
        testBed.fixture.detectChanges();
        expect(testBed.find('.create-article-submit')).toBeFalsy();
        expect(testBed.find('.update-article-submit')).toBeTruthy();

        //renders tag manager
        expect(testBed.getChildComponent(TagsManagerComponent)).toBeTruthy();
    }));
});
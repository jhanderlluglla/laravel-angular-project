import {ArticlesListComponent} from "./articles-list.component";
import {KarmaTest} from "../../../../../testing/karma-test";
import {PaginationControlsComponent} from "../../../shared/pagination/pagination-controls/pagination-controls.component";
import {NoResultsMessageComponent} from "../../../shared/no-results-message/no-results-message.component";
import {ArticlesListFiltersComponent} from "./articles-list-filters/articles-list-filters.component";
import {UrlAwarePaginator} from "../../../shared/pagination/url-aware-paginator.service";
import {tick, fakeAsync} from "@angular/core/testing";
import {BehaviorSubject} from "rxjs";
import {Router} from "@angular/router";
import {ModalService} from "../../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../../shared/modal/confirm-modal/confirm-modal.component";
import {CategoriesManagerComponent} from "../categories-manager/categories-manager.component";
import {TagsManagerComponent} from "../tags-manager/tags-manager.component";
import {HelpCenterService} from "../../shared/help-center.service";
import {ArticlesOrderSelectComponent} from "../../shared/articles-order-select/articles-order-select.component";
import {LoadingIndicatorComponent} from "../../../shared/loading-indicator/loading-indicator.component";
import {CategoriesService} from "../../shared/categories.service";
import {SettingsService} from "../../../shared/settings.service";

describe('ArticlesList', () => {
    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    ArticlesListComponent, PaginationControlsComponent, NoResultsMessageComponent, ArticlesListFiltersComponent,
                    ArticlesOrderSelectComponent, TagsManagerComponent, CategoriesManagerComponent, LoadingIndicatorComponent
                ],
                providers: [HelpCenterService, CategoriesService],
            },
            component: ArticlesListComponent,
        });

        testBed.logInAsAdmin();
    });

    it('initiates component', fakeAsync(() => {
        spyOn(testBed.get(UrlAwarePaginator), 'paginate').and.returnValue(new BehaviorSubject({}));
        spyOn(testBed.component, 'reloadArticles');
        spyOn(testBed.component, 'getQueryParams').and.returnValue('params');
        testBed.get(SettingsService).set('articles.default_order', 'foo');
        testBed.fixture.detectChanges();

        //renders and binds to articles order component
        expect(testBed.getChildComponent(ArticlesOrderSelectComponent)).toBeTruthy();
        expect(testBed.component.articlesOrder.selectedValue).toEqual('foo');

        //binds to search query input
        testBed.component.searchQuery.setValue('foo bar');
        tick(401);
        expect(testBed.component.reloadArticles).toHaveBeenCalledTimes(1);
    }));

    it('reloads articles', () => {
        spyOn(testBed.component.paginator, 'paginate').and.returnValue(new BehaviorSubject({}));
        spyOn(testBed.component, 'getQueryParams').and.returnValue('params');

        testBed.component.reloadArticles();

        //calls backend with merged filter objects and search query
        expect(testBed.component.paginator.paginate).toHaveBeenCalledWith(jasmine.any(String), 'params');
    });

    it('gets query parameters', () => {
        testBed.component.articlesOrder.selectedValue = 'order';
        testBed.component.searchQuery.setValue('search query');
        spyOn(testBed.component.articlesListFilters, 'getFilters').and.returnValue({foo: 'bar', baz: 'qux'});

        let params = testBed.component.getQueryParams();

        expect(testBed.component.articlesListFilters.getFilters).toHaveBeenCalledTimes(1);
        expect(params['foo']).toEqual('bar');
        expect(params['baz']).toEqual('qux');
        expect(params['orderBy']).toEqual('order');
        expect(params['query']).toEqual('search query');
    });

    it('destroys paginator', () => {
        spyOn(testBed.get(UrlAwarePaginator), 'destroy');
        testBed.component.ngOnDestroy();
        expect(testBed.get(UrlAwarePaginator).destroy).toHaveBeenCalledTimes(1);
    });

    it('renders action bar', fakeAsync(() => {
        spyOn(testBed.component, 'reloadArticles');
        testBed.component.selectedLayout = null;
        testBed.fixture.detectChanges();

        //renders navigation links
        expect(testBed.find('.home-nav-item')['href']).toContain('help-center');
        expect(testBed.find('.articles-nav-item')['href']).toContain('manage/articles');
        expect(testBed.find('.categories-nav-item')['href']).toContain('manage/categories');

        //renders search bar
        testBed.typeIntoEl('.articles-search-input', 'foo bar');
        tick(401);
        expect(testBed.component.searchQuery.value).toEqual('foo bar');
        expect(testBed.component.reloadArticles).toHaveBeenCalledTimes(1);

        //renders grid layout button
        testBed.find('.grid-layout-button').click();
        testBed.fixture.detectChanges();
        expect(testBed.component.selectedLayout).toEqual('grid');
        expect(testBed.find('.grid-layout-button').classList.contains('active')).toEqual(true);
        expect(testBed.find('.list-layout-button').classList.contains('active')).toEqual(false);

        //renders list layout button
        testBed.find('.list-layout-button').click();
        testBed.fixture.detectChanges();
        expect(testBed.component.selectedLayout).toEqual('list');
        expect(testBed.find('.grid-layout-button').classList.contains('active')).toEqual(false);
        expect(testBed.find('.list-layout-button').classList.contains('active')).toEqual(true);

        //renders article ordering select
        testBed.getChildComponent(ArticlesOrderSelectComponent).onChange.emit();
        expect(testBed.component.reloadArticles).toHaveBeenCalledTimes(2);

        //renders new article button
        expect(testBed.find('.new-article-button')['href']).toContain('new');
    }));

    it('renders articles list', () => {
        spyOn(testBed.component, 'reloadArticles');
        spyOn(testBed.get(Router), 'navigate');

        //renders articles filters component
        testBed.getChildComponent(ArticlesListFiltersComponent).onChange.emit();
        expect(testBed.component.reloadArticles).toHaveBeenCalledTimes(1);

        //adds selected layout class
        testBed.component.selectedLayout = 'grid';
        testBed.fixture.detectChanges();
        expect(testBed.find('.articles-list').classList.contains('grid')).toEqual(true);
        expect(testBed.find('.articles-list').classList.contains('list')).toEqual(false);

        testBed.component.selectedLayout = 'list';
        testBed.fixture.detectChanges();
        expect(testBed.find('.articles-list').classList.contains('list')).toEqual(true);
        expect(testBed.find('.articles-list').classList.contains('grid')).toEqual(false);

        //renders articles
        testBed.get(UrlAwarePaginator).data = [
            {id: 1, title: 'foo', body: 'bar', categories: [{name: 'foo-child', parent: {name: 'foo-parent'}}]},
            {id: 2, categories: [{name: 'bar-parent'}], tags: [{name: 'foo-tag'}, {name: 'bar-tag'}]},
            {id: 3, categories: []},
        ];
        testBed.fixture.detectChanges();
        expect(testBed.findAll('.articles-list-item').length).toEqual(3);

        //open update article page
        testBed.find('.articles-list-item').click();
        expect(testBed.get(Router).navigate).toHaveBeenCalledWith(['/help-center/manage/', 'articles', 1, 'edit']);

        //renders article child and parent category
        expect(testBed.find('.articles-list-item').querySelector('.article-categories .category').textContent).toEqual('foo-child');
        expect(testBed.find('.articles-list-item').querySelector('.article-categories .parent-category').textContent).toContain('foo-parent');

        //renders only article parent category if no child
        expect(testBed.findAll('.articles-list-item')[1].querySelector('.article-categories .category').textContent).toEqual('bar-parent');
        expect(testBed.findAll('.articles-list-item')[1].querySelector('.article-categories .parent-category')).toBeFalsy();

        //does not render categories if article has none
        expect(testBed.findAll('.articles-list-item')[2].querySelector('.article-categories')).toBeFalsy();

        //renders article title
        expect(testBed.find('.articles-list-item .article-title').textContent).toEqual('foo');

        //renders article body
        expect(testBed.find('.articles-list-item .article-body').textContent).toEqual('bar');

        //renders article tags
        let tags = testBed.findAll('.articles-list-item')[1].querySelectorAll('.article-tags .tag-label');
        expect(tags.length).toEqual(2);
        expect(tags[0].textContent).toEqual('foo-tag');

        //hides "no-results" message if there are results
        expect(testBed.getChildComponent(NoResultsMessageComponent)).toBeFalsy();

        //renders "no-results" message
        testBed.get(UrlAwarePaginator).data = [];
        testBed.fixture.detectChanges();
        expect(testBed.getChildComponent(NoResultsMessageComponent)).toBeTruthy();

        //renders pagination controls
        expect(testBed.getChildComponent(PaginationControlsComponent)).toBeTruthy();
        expect(testBed.getChildComponent(PaginationControlsComponent).paginator).toEqual(testBed.component.paginator);
    });

    it('deletes articles', () => {
        testBed.get(UrlAwarePaginator).data = [{id: 1, categories: []}];
        testBed.fixture.detectChanges();
        spyOn(testBed.component.paginator, 'refresh');
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: new BehaviorSubject({})});
        spyOn(testBed.get(HelpCenterService), 'deleteArticles').and.returnValue(new BehaviorSubject({}));

        testBed.find('.delete-article-button').click();

        //asks user to confirm
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(ConfirmModalComponent, jasmine.any(Object));

        //deletes article
        expect(testBed.get(HelpCenterService).deleteArticles).toHaveBeenCalledWith([1]);

        //refreshes articles list
        expect(testBed.component.paginator.refresh).toHaveBeenCalled();
    })
});
import {KarmaTest} from "../../../../../testing/karma-test";
import {fakeAsync, tick} from "@angular/core/testing";
import {Observer, Observable} from "rxjs";
import {SuggestedArticlesDropdownComponent} from "./suggested-articles-dropdown.component";
import {HelpCenterService} from "../../shared/help-center.service";
import {HcUrls} from "../../shared/hc-urls.service";

describe('SuggestedArticlesDropdown', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [SuggestedArticlesDropdownComponent],
                providers: [HelpCenterService, HcUrls],
            },
            component: SuggestedArticlesDropdownComponent,
        });
    });

    it('binds to search query control', fakeAsync(() => {
        spyOn(testBed.component, 'searchArticles');

        testBed.fixture.detectChanges();
        testBed.component.searchQuery.setValue('search query');
        tick(401);

        expect(testBed.component.searchArticles).toHaveBeenCalledWith('search query');
    }));

    it('searches for articles', () => {
        let observer: Observer<any>;
        let observable = Observable.create(o => observer = o);
        spyOn(testBed.get(HelpCenterService), 'findArticles').and.returnValue(observable);
        testBed.fixture.detectChanges();

        testBed.component.searchArticles('search query');

        //sets "searching" to true
        expect(testBed.component.searching).toEqual(true);

        //complete backend call
        observer.next({data: 'response'});

        //calls backend to find articles
        expect(testBed.get(HelpCenterService).findArticles).toHaveBeenCalledWith('search query');

        //sets returned articles on component
        expect(testBed.component.articles).toEqual('response');

        //sets "searching" to false
        expect(testBed.component.searching).toEqual(false);
    });

    it('renders suggestions container', () => {
        testBed.fixture.detectChanges();

        //removes "has results" class if there are no search results
        expect(testBed.component.articles).toEqual([]);
        expect(testBed.find('.suggestions-container').classList.contains('has-results')).toEqual(false);

        //removes "searching" class if there are no search results
        expect(testBed.component.searching).toEqual(false);
        expect(testBed.find('.suggestions-container').classList.contains('searching')).toEqual(false);

        //adds has results class if there are search results
        testBed.component.articles = [{highlight: {}, item: {categories: []}}];
        testBed.fixture.detectChanges();
        expect(testBed.find('.suggestions-container').classList.contains('has-results')).toEqual(true);

        //adds "searching" class if search is in progress
        testBed.component.searching = true;
        testBed.fixture.detectChanges();
        expect(testBed.find('.suggestions-container').classList.contains('searching')).toEqual(true);
    });

    it('searches via input element', fakeAsync(() => {
        testBed.fixture.detectChanges();
        spyOn(testBed.component, 'searchArticles');

        testBed.typeIntoEl('.search-input', 'search query');
        tick(401);

        expect(testBed.component.searchArticles).toHaveBeenCalledWith('search query');
    }));

    it('renders tickets results panel', () => {
        testBed.component.articles = [
            {id: 1, title: 'foo', body: 'bar body', categories: [{name: 'child', parent: {id: 2, name: 'parent'}}]},
            {id: 3, categories: []}
        ];
        testBed.fixture.detectChanges();

        let articles = testBed.findAll('.results-list > .result');

        //renders both articles
        expect(articles.length).toEqual(2);

        //renders article link correctly
        expect(articles[0]['href']).toContain('help-center/articles/1/foo');

        //renders article title
        expect(articles[0].querySelector('.title').textContent).toEqual(testBed.component.articles[0].title);

        //renders article body
        expect(articles[0].querySelector('.body').textContent).toEqual(testBed.component.articles[0].body);

        //hides meta if article has no categories
        expect(articles[1].querySelector('.meta')).toBeFalsy();

        //renders first article category
        expect(articles[0].querySelector('.category').textContent.trim()).toContain('parent');

        //renders first article child
        expect(articles[0].querySelector('.child-category').textContent.trim()).toEqual('child');
    });

    it('renders see all link', () => {
        testBed.component.searchQuery.setValue('foo');
        testBed.fixture.detectChanges();
        expect(testBed.find('.see-all')['href']).toContain('/search/foo');
    });
});
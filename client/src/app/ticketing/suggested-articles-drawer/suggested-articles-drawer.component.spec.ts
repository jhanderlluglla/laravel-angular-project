import {KarmaTest} from "../../../../testing/karma-test";
import {SuggestedArticlesDrawerComponent} from "./suggested-articles-drawer.component";
import {tick, fakeAsync} from "@angular/core/testing";
import {Observer, Observable} from "rxjs";
import {ModalService} from "../../shared/modal/modal.service";
import {Router} from "@angular/router";
import {HelpCenterService} from "../../help-center/shared/help-center.service";
import {HcUrls} from "../../help-center/shared/hc-urls.service";
import {ArticleModalComponent} from "../../help-center/shared/article-modal/article-modal.component";

describe('SuggestedArticlesDrawer', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [
                    SuggestedArticlesDrawerComponent
                ],
                providers: [HelpCenterService, HcUrls],
            },
            component: SuggestedArticlesDrawerComponent
        });
    });

    it('binds to search query control', fakeAsync(() => {
        spyOn(testBed.component, 'searchArticles');
        let emittedValue;
        testBed.component.inputValue.subscribe(value => emittedValue = value);

        testBed.fixture.detectChanges();
        testBed.component.searchQuery.setValue('search query');
        tick(401);

        //searches for articles
        expect(testBed.component.searchArticles).toHaveBeenCalledWith('search query');

        //emits input field value
        expect(emittedValue).toEqual('search query');
    }));

    it('searches for articles', () => {
        let observer: Observer<any>;
        let observable = Observable.create(o => observer = o);
        spyOn(testBed.get(HelpCenterService), 'findArticles').and.returnValue(observable);

        testBed.component.searchArticles('search query');

        //sets "searching" to true
        expect(testBed.component.searching).toEqual(true);

        //complete backend call
        observer.next({data: [{name: 'foo'}]});

        //calls backend to find articles
        expect(testBed.get(HelpCenterService).findArticles).toHaveBeenCalledWith('search query', jasmine.objectContaining({limit: 4}));

        //sets returned articles on component
        expect(testBed.component.articles).toEqual([{name: 'foo'}]);

        //sets "searching" to false
        expect(testBed.component.searching).toEqual(false);
    });

    it('opens article in modal', () => {
        spyOn(testBed.get(ModalService), 'show');
        testBed.component.openArticle({name: 'foo'});
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(ArticleModalComponent, {article: {name: 'foo'}});
    });

    it('navigates to article route', () => {
        spyOn(testBed.get(Router), 'navigate');
        spyOn(testBed.get(HcUrls), 'getArticleLink').and.returnValue('link');

        testBed.component.openInNewPage = true;
        testBed.component.openArticle({name: 'foo'});

        expect(testBed.get(HcUrls).getArticleLink).toHaveBeenCalledTimes(1);
        expect(testBed.get(Router).navigate).toHaveBeenCalledWith('link');
    });

    it('renders suggestions container', () => {
        testBed.fixture.detectChanges();

        //removes "has results" class if there are no search results
        expect(testBed.component.articles).toEqual([]);
        expect(testBed.find('.suggestions-container').classList.contains('has-results')).toEqual(false);

        //removes "searching" class if there are no search results
        expect(testBed.component.searching).toEqual(false);
        expect(testBed.find('.search-icon').classList.contains('searching')).toEqual(false);

        //adds has results class if there are search results
        testBed.component.articles = [{highlight: {}, item: {folders: []}}];
        testBed.fixture.detectChanges();
        expect(testBed.find('.suggestions-container').classList.contains('has-results')).toEqual(true);

        //adds "searching" class if search is in progress
        testBed.component.searching = true;
        testBed.fixture.detectChanges();
        expect(testBed.find('.search-icon').classList.contains('searching')).toEqual(true);
    });

    it('renders and binds search input', fakeAsync(() => {let emittedValue;
        testBed.component.inputValue.subscribe(value => emittedValue = value);
        testBed.component.placeholder = 'placeholder';
        testBed.fixture.detectChanges();
        spyOn(testBed.component, 'searchArticles');

        //formControl is bound properly
        testBed.typeIntoEl('.search-input', 'search query');
        tick(401);
        expect(testBed.component.searchArticles).toHaveBeenCalledWith('search query');

        //emits input field value
        expect(emittedValue).toEqual('search query');

        //renders placeholder
        expect(testBed.find('.search-input').getAttribute('placeholder')).toEqual('placeholder');
    }));

    it('renders tickets results panel', () => {
        testBed.component.articles = [{id: 1, title: 'foo'}, {id: 3}];
        testBed.fixture.detectChanges();

        let articles = testBed.findAll('.results > .result');

        //renders both articles
        expect(articles.length).toEqual(2);

        //opens article
        spyOn(testBed.component, 'openArticle');
        testBed.component.openInNewPage = true;
        articles[0].click();
        expect(testBed.component.openArticle).toHaveBeenCalledWith(testBed.component.articles[0]);

        //renders article title
        expect(articles[0].querySelector('.title').textContent.trim()).toEqual(testBed.component.articles[0].title);
    });
});
import {KarmaTest} from "../../../../../../testing/karma-test";
import {ArticleSettingsModalComponent} from "./article-settings-modal.component";
import {fakeAsync, tick} from "@angular/core/testing";

describe('ArticleSettingsModal', () => {

    let testBed: KarmaTest<ArticleSettingsModalComponent>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [ArticleSettingsModalComponent],
            },
            component: ArticleSettingsModalComponent,
        });
    });

    it('works', fakeAsync(() => {
        let eventFired;
        let article = testBed.fake('Article');
        testBed.component.onDone.subscribe(data => eventFired = data);
        testBed.fixture.detectChanges();
        tick();

        testBed.component.show({article});

        //hydrates model
        expect(testBed.component.model.slug).toEqual(article.slug);
        expect(testBed.component.model.description).toEqual(article.description);
        expect(testBed.component.model.position).toEqual(article.position);

        //binds to model properly
        testBed.typeIntoEl('#article-slug', 'slug string');
        expect(testBed.component.model.slug).toEqual('slug string');
        testBed.typeIntoEl('#article-description', 'description');
        expect(testBed.component.model.description).toEqual('description');
        testBed.typeIntoEl('#article-position', '55');
        expect(testBed.component.model.position).toEqual(55);

        //emits article settings with "onDone" event
        //and slugifies article slug string
        testBed.component.confirm();
        tick(301);
        expect(eventFired).toEqual({description: 'description', slug: 'slug-string', position: 55});
    }));
});
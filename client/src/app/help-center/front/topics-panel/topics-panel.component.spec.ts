import {KarmaTest} from "../../../../../testing/karma-test";
import {TopicsPanelComponent} from "./topics-panel.component";
import {HcUrls} from "../../shared/hc-urls.service";
import {HelpCenterService} from "../../shared/help-center.service";

describe('TopicsPanelComponent', () => {
    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [TopicsPanelComponent],
                providers: [HelpCenterService, HcUrls],
            },
            component: TopicsPanelComponent
        });
    });

    it('sets topics to render on init', () => {
        spyOn(testBed.component, 'prepareTopics');
        testBed.fixture.detectChanges();
        expect(testBed.component.prepareTopics).toHaveBeenCalledTimes(1);
    });

    it('prepares topics', () => {
        //does not error if not category
        testBed.component.prepareTopics();
        expect(testBed.component.topics).toEqual([]);

        //sets parent category children as topics, if specified category has parent
        testBed.component.category = {parent: {children: [{name: 'foo'}]}};
        testBed.component.prepareTopics();
        expect(testBed.component.topics).toEqual([{name: 'foo'}]);

        //sets category children if it does not have parent
        testBed.component.category = {children: [{name: 'foo'}]};
        testBed.component.prepareTopics();
        expect(testBed.component.topics).toEqual([{name: 'foo'}]);
    });

    it('gets category title', () => {
        //does not error if not category
        expect(testBed.component.getTitle()).toBeFalsy();

        //gets parent category title
        testBed.component.category = {name: 'foo', parent: {name: 'bar'}};
        expect(testBed.component.getTitle()).toEqual('bar');

        //gets category title if no parent
        testBed.component.category = {name: 'foo'};
        expect(testBed.component.getTitle()).toEqual('foo');
    });

    it('renders categories list', () => {
        testBed.component.category = {id: 1, children: [{id: 1, name: 'foo'}, {id: 2, name: 'bar'}]};
        testBed.fixture.detectChanges();

        let categories = testBed.findAll('.category');

        //renders both categories
        expect(categories.length).toEqual(2);

        //adds "active" class to current category
        expect(categories[0].classList.contains('active')).toEqual(true);
        expect(categories[1].classList.contains('active')).toEqual(false);

        //renders category link
        expect(categories[0]['href']).toContain('1/foo');

        //renders category name
        expect(categories[0].querySelector('.category-name').textContent).toEqual('foo');
    });
});
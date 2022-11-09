import {KarmaTest} from "../../../../../testing/karma-test";
import {BreadCrumbsComponent} from "./breadcrumbs.component";
import {HcUrls} from "../../shared/hc-urls.service";

describe('BreadcrumbsComponent', () => {
    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [BreadCrumbsComponent],
                providers: [HcUrls],
            },
            component: BreadCrumbsComponent
        });
    });

    it('generates breadcrumbs for correct resource type', () => {
        spyOn(testBed.component, 'generateArticleBreadCrumb');
        spyOn(testBed.component, 'generateCategoryBreadCrumb');
        testBed.component.resource = {};

        //generates breadcrumb for article
        testBed.component.resourceType = 'article';
        testBed.component.ngOnChanges();
        expect(testBed.component.generateArticleBreadCrumb).toHaveBeenCalledTimes(1);
        expect(testBed.component.generateCategoryBreadCrumb).not.toHaveBeenCalled();

        //generates breadcrumb for category
        testBed.component.resourceType = 'category';
        testBed.component.ngOnChanges();
        expect(testBed.component.generateCategoryBreadCrumb).toHaveBeenCalledTimes(1);
        expect(testBed.component.generateArticleBreadCrumb).toHaveBeenCalledTimes(1);

        //it does not throw error if there's no resource
        testBed.component.resource = null;
        testBed.component.resourceType = null;
        testBed.component.ngOnChanges();
        expect(testBed.component.generateArticleBreadCrumb).toHaveBeenCalledTimes(1);
        expect(testBed.component.generateCategoryBreadCrumb).toHaveBeenCalledTimes(1);
    });

    it('generates article breadcrumb', () => {
        testBed.component.resourceType = 'article';
        testBed.component.resource = {id: 1, title: 'foo-bar', categories: [{name: 'child', id: 2, parent: {id: 3, name: 'parent'}}, {name: 'second'}]};

        testBed.component.ngOnChanges();

        expect(testBed.component.items.length).toEqual(4);

        expect(testBed.component.items[0]['name']).toEqual('Help Center');
        expect(testBed.component.items[0]['link']).toContain('help-center');

        expect(testBed.component.items[1]['name']).toEqual('parent');
        expect(testBed.component.items[1]['link'].join('/')).toContain('3/parent');

        expect(testBed.component.items[2]['name']).toEqual('child');
        expect(testBed.component.items[2]['link'].join('/')).toContain('2/child');

        expect(testBed.component.items[3]['name']).toEqual('Article');
        expect(testBed.component.items[3]['link'].join('/')).toContain('1/foo-bar');
    });

    it('generates article breadcrumb with no parent category', () => {
        testBed.component.resourceType = 'article';
        testBed.component.resource = {categories: [{name: 'child', id: 1}, {name: 'second'}]};

        testBed.component.ngOnChanges();

        expect(testBed.component.items.length).toEqual(3);
        expect(testBed.component.items[0]['name']).toEqual('Help Center');
        expect(testBed.component.items[1]['name']).toEqual('child');
        expect(testBed.component.items[2]['name']).toEqual('Article');
    });

    it('bails if article has no categories', () => {
        testBed.component.resourceType = 'article';
        testBed.component.resource = {title: 'foo-bar'};

        testBed.component.ngOnChanges();

        expect(testBed.component.items.length).toEqual(1);
        expect(testBed.component.items[0]['name']).toEqual('Help Center');
    });

    it('generates category breadcrumb', () => {
        testBed.component.resourceType = 'category';
        testBed.component.resource = {id: 1, name: 'child', parent: {id: 2, name: 'parent'}};

        testBed.component.ngOnChanges();

        expect(testBed.component.items.length).toEqual(3);

        expect(testBed.component.items[0]['name']).toEqual('Help Center');
        expect(testBed.component.items[0]['link']).toContain('help-center');

        expect(testBed.component.items[1]['name']).toEqual('parent');
        expect(testBed.component.items[1]['link'].join('/')).toContain('2/parent');

        expect(testBed.component.items[2]['name']).toEqual('child');
        expect(testBed.component.items[2]['link'].join('/')).toContain('1/child');
    });

    it('generates category with no parent breadcrumb', () => {
        testBed.component.resourceType = 'category';
        testBed.component.resource = {id: 1, name: 'child'};

        testBed.component.ngOnChanges();

        expect(testBed.component.items.length).toEqual(2);

        expect(testBed.component.items[0]['name']).toEqual('Help Center');
        expect(testBed.component.items[1]['name']).toEqual('child');
    });

    it('renders breadcrumb', () => {
        testBed.component.resourceType = 'category';
        testBed.component.resource = {id: 1, name: 'child', parent: {id: 2, name: 'parent'}};
        testBed.component.ngOnChanges();
        testBed.fixture.detectChanges();

        let items = testBed.findAll('.item');

        //renders all breadcrumb items
        expect(items.length).toEqual(3);

        //renders breadcrumb link
        expect(items[0]['href']).toContain('help-center');

        //adds "current" class to last breadcrumb item only
        expect(items[2].classList.contains('active')).toEqual(true);
        expect(items[1].classList.contains('active')).toEqual(false);
        expect(items[0].classList.contains('active')).toEqual(false);

        //renders separator icon for all but first breadcrumb item
        expect(items[0].querySelector('.separator')).toBeFalsy();
        expect(items[1].querySelector('.separator')).toBeTruthy();
        expect(items[2].querySelector('.separator')).toBeTruthy();

        //renders breadcrumb item name
        expect(items[0].querySelector('.item-name').textContent).toEqual('Help Center');
        expect(items[2].querySelector('.item-name').textContent).toEqual('child');
    });
});
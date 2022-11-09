import {KarmaTest} from "../../../../../../testing/karma-test";
import {ArticlesListFiltersComponent} from "./articles-list-filters.component";
import {CategoriesManagerComponent} from "../../categories-manager/categories-manager.component";
import {TagsManagerComponent} from "../../tags-manager/tags-manager.component";
import {HelpCenterService} from "../../../shared/help-center.service";
import {CategoriesService} from "../../../shared/categories.service";
import {fakeAsync, tick} from "@angular/core/testing";

describe('ArticlesListFilters', () => {
    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [ArticlesListFiltersComponent, TagsManagerComponent, CategoriesManagerComponent],
                providers: [HelpCenterService, CategoriesService],
            },
            component: ArticlesListFiltersComponent,
        });
    });

    it('inits the component', fakeAsync(() => {
        let eventFired; testBed.component.onChange.subscribe(() => eventFired = true);
        spyOn(testBed.getChildComponent(CategoriesManagerComponent), 'refresh').and.returnValue(new Promise(resolve => resolve()));
        testBed.fixture.detectChanges();

        //refreshes categories
        expect(testBed.getChildComponent(CategoriesManagerComponent).refresh).toHaveBeenCalled();

        //emits change event
        tick();
        expect(eventFired).toBeTruthy();
    }));

    it('applies specified filter', () => {
        testBed.component.filters.tags = null;
        testBed.component.applyFilter('tags', [1,2]);
        expect(testBed.component.filters.tags).toEqual([1,2]);
        expect(testBed.component.getFilters()).toEqual(jasmine.objectContaining({tags: [1,2]}));

        testBed.component.applyFilter('tags', [3]);
        expect(testBed.component.filters.tags).toEqual([3]);
        expect(testBed.component.getFilters()).toEqual(jasmine.objectContaining({tags: [3]}));
    });

    it('checks if specified filter is active', () => {
        testBed.component.filters.categories = 'foo';

        //returns "true" if specified value matches filter value exactly
        expect(testBed.component.filterIsActive('categories', 'foo')).toEqual(true);

        //returns "false" if specified value does not match filter value exactly
        expect(testBed.component.filterIsActive('categories', 'bar')).toEqual(false);

        //returns "true" if no value is specified and filter value is truthy
        expect(testBed.component.filterIsActive('categories')).toBeTruthy();

        //returns "false" if no value is specified and filter value is falsy
        testBed.component.filters.categories = null;
        expect(testBed.component.filterIsActive('categories')).toBeFalsy();
    });

    //VIEW

    it('filters articles by status', () => {
        //buttons should not be active by default
        expect(testBed.find('.draft-filter-button').classList.contains('active')).toEqual(false);

        spyOn(testBed.component, 'applyFilter').and.callThrough();

        //applies draft filter
        testBed.find('.draft-filter-button').click();
        testBed.fixture.detectChanges();
        expect(testBed.find('.draft-filter-button').classList.contains('active')).toEqual(true);
        expect(testBed.component.applyFilter).toHaveBeenCalledWith('draft', 1);

        //applies no draft filter
        testBed.find('.not-draft-filter-button').click();
        testBed.fixture.detectChanges();
        expect(testBed.find('.not-draft-filter-button').classList.contains('active')).toEqual(true);
        expect(testBed.find('.draft-filter-button').classList.contains('active')).toEqual(false);
        expect(testBed.component.applyFilter).toHaveBeenCalledWith('draft', 1);
    });

    it('filters articles by tags', () => {
        spyOn(testBed.component, 'applyFilter');
        testBed.getChildComponent(TagsManagerComponent).onChange.emit('value');
        expect(testBed.component.applyFilter).toHaveBeenCalledWith('tags', 'value');
    });

    it('filters articles by category', () => {
        spyOn(testBed.component, 'applyFilter');
        testBed.getChildComponent(CategoriesManagerComponent).onChange.emit('value');
        expect(testBed.component.applyFilter).toHaveBeenCalledWith('categories', 'value');
    });
});
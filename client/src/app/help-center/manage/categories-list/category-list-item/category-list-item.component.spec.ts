import {KarmaTest} from "../../../../../../testing/karma-test";
import {ModalService} from "../../../../shared/modal/modal.service";
import {BehaviorSubject, Observer, Observable} from "rxjs";
import {ConfirmModalComponent} from "../../../../shared/modal/confirm-modal/confirm-modal.component";
import {CategoryListItemComponent} from "./category-list-item.component";
import {CategoryModalComponent} from "../../category-modal/category-modal.component";
import {CategoriesService} from "../../../shared/categories.service";

describe('CategoriesListItem', () => {

    let testBed: KarmaTest<any>;

    beforeEach(() => {
        testBed = new KarmaTest({
            module: {
                declarations: [CategoryListItemComponent],
                providers: [CategoriesService, CategoriesService],
            },
            component: CategoryListItemComponent,
        });
    });

    it('opens modal for creating child category', () => {
        let eventFired = false;
        testBed.component.onChange.subscribe(() => eventFired = true);
        testBed.component.category = testBed.fake('Category');
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: new BehaviorSubject({})});

        testBed.component.openCreateChildCategoryModal();

        //opens child category modal
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(CategoryModalComponent, {parentId: testBed.component.category.id});

        //fires "onChange" event
        expect(eventFired).toEqual(true);
    });

    it('opens modal for updating specified category', () => {
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: new BehaviorSubject({})});
        testBed.component.openUpdateCategoryModal('category');
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(CategoryModalComponent, {category: 'category'});
    });

    it('confirms and deletes specified category', () => {
        let observer: Observer<any>; let eventFired = false;
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: Observable.create(o => observer = o)});
        spyOn(testBed.get(CategoriesService), 'deleteCategory').and.returnValue(new BehaviorSubject({}));

        testBed.component.maybeDeleteCategory(1);

        //shows confirmation modal
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(ConfirmModalComponent, jasmine.any(Object));

        //does not delete category if user does not confirm
        expect(testBed.get(CategoriesService).deleteCategory).not.toHaveBeenCalled();

        //deletes category if user confirms
        testBed.component.onChange.subscribe(() => eventFired = true);
        observer.next(null);
        expect(testBed.get(CategoriesService).deleteCategory).toHaveBeenCalledWith(1);
        expect(eventFired).toEqual(true);
    });

    it('confirms and detaches specified category', () => {
        let observer: Observer<any>; let eventFired = false;
        spyOn(testBed.get(ModalService), 'show').and.returnValue({onDone: Observable.create(o => observer = o)});
        spyOn(testBed.get(CategoriesService), 'detachCategory').and.returnValue(new BehaviorSubject({}));

        testBed.component.maybeDetachCategory(1);

        //shows confirmation modal
        expect(testBed.get(ModalService).show).toHaveBeenCalledWith(ConfirmModalComponent, jasmine.any(Object));

        //does not detach category if user does not confirm
        expect(testBed.get(CategoriesService).detachCategory).not.toHaveBeenCalled();

        //detaches category if user confirms
        testBed.component.onChange.subscribe(() => eventFired = true);
        observer.next(null);
        expect(testBed.get(CategoriesService).detachCategory).toHaveBeenCalledWith(1);
        expect(eventFired).toEqual(true);
    });

    it('renders category name', () => {
        testBed.component.category = {name: 'foo bar'};
        testBed.fixture.detectChanges();
        expect(testBed.find('.category-name').textContent).toEqual('foo bar');
    });

    it('shows "no articles" count', () => {
        testBed.component.category = {articles_count: 0};
        testBed.detectChangesHack();
        expect(testBed.find('.no-articles')).toBeTruthy();
        expect(testBed.find('.has-articles')).toBeFalsy();
    });

    it('shows singular "has articles" count', () => {
        testBed.component.category = {articles_count: 1};
        testBed.detectChangesHack();
        expect(testBed.find('.no-articles')).toBeFalsy();
        expect(testBed.find('.has-articles .singular')).toBeTruthy();
        expect(testBed.find('.has-articles .plural')).toBeFalsy();
    });

    it('shows plural "has articles" count', () => {
        testBed.component.category = {articles_count: 2};
        testBed.detectChangesHack();
        expect(testBed.find('.no-articles')).toBeFalsy();
        expect(testBed.find('.has-articles .singular')).toBeFalsy();
        expect(testBed.find('.has-articles .plural')).toBeTruthy();
    });

    it('renders and binds category actions', () => {
        testBed.component.category = {id: 1};
        testBed.fixture.detectChanges();

        //opens update category modal
        spyOn(testBed.component, 'openUpdateCategoryModal');
        testBed.find('.update-category-button').click();
        expect(testBed.component.openUpdateCategoryModal).toHaveBeenCalledWith(testBed.component.category);

        //opens new child category modal
        spyOn(testBed.component, 'openCreateChildCategoryModal');
        testBed.find('.new-child-category-button').click();
        expect(testBed.component.openCreateChildCategoryModal).toHaveBeenCalledTimes(1);

        //hides new child category button if category is a child
        testBed.component.category = {id: 1, parent_id: 2};
        testBed.fixture.detectChanges();
        expect(testBed.find('.new-child-category-button')).toBeFalsy();

        //opens delete category modal
        spyOn(testBed.component, 'maybeDeleteCategory');
        testBed.find('.delete-category-button').click();
        expect(testBed.component.maybeDeleteCategory).toHaveBeenCalledTimes(1);

        //opens detach category modal
        spyOn(testBed.component, 'maybeDetachCategory');
        testBed.find('.detach-category-button').click();
        expect(testBed.component.maybeDetachCategory).toHaveBeenCalledTimes(1);

        //hides detach category button if category is not a child
        testBed.component.category = {id: 1};
        testBed.fixture.detectChanges();
        expect(testBed.find('.detach-category-button')).toBeFalsy();
    });
});
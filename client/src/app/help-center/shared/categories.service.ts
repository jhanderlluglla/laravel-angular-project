import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {Category} from "../../shared/models/Category";
import {HttpCacheClient} from "../../shared/http-cache-client";
import {LocalStorage} from "../../shared/local-storage.service";

@Injectable()
export class CategoriesService {

    /**
     * Base uri for categories API.
     */
    private baseUri = 'help-center/categories';

    /**
     * Categories Service Constructor.
     */
    constructor(protected http: HttpCacheClient, protected storage: LocalStorage) {}

    /**
     * Reorder categories based on their position in give ids array.
     */
    public reorderCategories(ids: number[]) {
        return this.http.post(this.baseUri+'/reorder', {ids});
    }

    /**
     * Create a new help center category or update existing one.
     */
    public createOrUpdateCategory(payload): Observable<Category> {
        if (payload.id) {
            return this.http.put(this.baseUri+'/'+payload.id, payload);
        } else {
            return this.http.post(this.baseUri, payload);
        }
    }

    /**
     * Fetch all help center categories that current user has access to.
     */
    public getCategories(): Observable<Category[]> {
        return this.http.getWithCache(this.baseUri);
    }

    /**
     * Fetch category matching given id.
     */
    public getCategory(categoryId: number, folderId: number = null, articleId: any = null) {
        let queryParams: any = {};
        if (folderId) queryParams.folder = folderId;
        if (articleId) queryParams.article = articleId;

        return this.http.get(this.baseUri+'/'+categoryId, queryParams);
    }

    /**
     * Delete specified help center category.
     */
    public deleteCategory(id: number) {
        this.storage.remove('selectedCategories');
        return this.http.delete(this.baseUri+'/'+id);
    }

    /**
     * Detach specified category from its parent.
     */
    public detachCategory(id: number) {
        return this.http.post(this.baseUri+'/'+id+'/detach-parent');
    }
}
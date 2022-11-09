import {Injectable} from '@angular/core';
import {HttpCacheClient} from "./http-cache-client";

@Injectable()
export class TagService {

    /**
     * Base uri for tags api.
     */
    private baseUri = 'tags';

    /**
     * TagsService Constructor.
     */
    constructor(private http: HttpCacheClient) {}

    /**
     * Fetch all existing tags from the server.
     */
    public getTags(params = {}) {
        return this.http.getWithCache(this.baseUri, params);
    }

    /**
     * Create a new tag.
     */
    public createNew(data) {
        return this.http.post(this.baseUri, data);
    }

    /**
     * Update existing tag.
     */
    public update(id: number, data: any) {
        return this.http.put(this.baseUri+'/'+id, data);
    }

    /**
     * Delete multiple tags.
     */
    public deleteMultiple(ids: number[]) {
        return this.http.delete(this.baseUri+'/delete-multiple', {ids});
    }

    /**
     * Search for tags matching given query.
     */
    public search(query: string) {
        let params = {query, skip_status_tags: 1, per_page: 10};

        return this.http.get(this.baseUri, params);
    }
}
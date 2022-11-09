import {Injectable} from '@angular/core';
import {HttpClient} from "../../shared/http-client";
import {Observable} from "rxjs/Observable";
import {User} from "../../shared/models/User";

@Injectable()
export class UserService {

    constructor(private httpClient: HttpClient) {}

    /**
     * Fetch specified user from server.
     */
    public getUser(id: number): Observable<User> {
        return this.httpClient.get('users/'+id);
    }

    /**
     * Fetch users without pagination.
     */
    public getUsers(params = null) {
        return this.httpClient.get('users', params).map(response => response.data);
    }

    /**
     * Create a new user.
     */
    public createNew(payload: Object) {
        return this.httpClient.post('users', payload);
    }

    /**
     * Update existing user.
     */
    public update(id: number, payload: Object): Observable<User> {
        return this.httpClient.put('users/'+id, payload);
    }

    /**
     * Change specified user password.
     */
    public changePassword(id: number, payload: Object): Observable<User> {
        return this.httpClient.post('users/'+id+'/password/change', payload);
    }

    /**
     * Attach specified groups to user.
     */
    public attachGroups(id: number, payload = {}): Observable<any> {
        return this.httpClient.post('users/'+id+'/groups/attach', payload);
    }

    /**
     * Detach specified groups from user.
     */
    public detachGroups(id: number, payload = {}): Observable<any> {
        return this.httpClient.post('users/'+id+'/groups/detach', payload);
    }

    /**
     * Add specified permissions to user.
     */
    public addPermissions(id: number, payload = {}): Observable<{data: User}> {
        return this.httpClient.post('users/'+id+'/permissions/add', payload);
    }

    /**
     * Remove specified permissions from user.
     */
    public removePermissions(id: number, payload = {}): Observable<{data: User}> {
        return this.httpClient.post('users/'+id+'/permissions/remove', payload);
    }

    /**
     * Sync specified user tags.
     */
    public syncTags(id: number, payload: Object): Observable<Object> {
        return this.httpClient.post('users/'+id+'/tags/sync', payload)
    };

    /**
     * Upload and attach avatar to specified user.
     */
    public uploadAvatar(id: number, files: FileList): Observable<User> {
        let payload = new FormData();
        payload.append('avatar', files.item(0));
        return this.httpClient.post('users/'+id+'/avatar', payload);
    }

    /**
     * Delete specified user's avatar.
     */
    public deleteAvatar(id: number): Observable<User> {
        return this.httpClient.delete('users/'+id+'/avatar');
    }

    /**
     * Update details about user.
     */
    public updateDetails(id: number, payload: Object): Observable<User> {
        return this.httpClient.put('users/'+id+'/details', payload);
    };

    /**
     * Add secondary email to specified user.
     */
    public addEmail(id: number, payload: Object): Observable<User> {
        return this.httpClient.post('users/'+id+'/emails/attach', payload);
    }

    /**
     * Remove secondary email from specified user.
     */
    public removeEmail(id: number, payload: Object): Observable<User> {
        return this.httpClient.post('users/'+id+'/emails/detach', payload);
    }

    /**
     * Delete multiple users.
     */
    public deleteMultiple(ids: number[]) {
        return this.httpClient.delete('users/delete-multiple', {ids});
    }
}
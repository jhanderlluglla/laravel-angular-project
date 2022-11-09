import {Injectable} from '@angular/core';
import {User} from "../shared/models/User";
import {Group} from "../shared/models/Group";

@Injectable()
export class CurrentUser {

    /**
     * Current user model.
     */
    private current: User;

    /**
     * Group that should be assigned to guests.
     */
    private guestsGroup: Group;

    /**
     * Merged explicit and inherited from
     * groups permissions for current user.
     */
    private cachedPermissions: Object;

    /**
     * Uri user was attempting to open before
     * redirect to login page, if any.
     */
    public redirectUri?: string;

    /**
     * Get property of currently logged in user model.
     */
    public get(prop: string): any {
        return this.current && this.current[prop];
    }

    /**
     * Get model of currently logged in user.
     */
    public getModel(): User {
        return Object.assign({}, this.current);
    }

    /**
     * Set property of currently logged in user object.
     */
    public set(key: string, value: any): void {
        this.current[key] =  value;
    }

    /**
     * Set a new current user.
     */
    public assignCurrent(model?: User) {
        this.clear();

        if (model) {
            this.current = model;
        }
    }

    /**
     * Check if current user has all specified permissions.
     */
    public hasPermissions(permissions: string[]): boolean {
        return permissions.filter(permission => {
            return ! this.hasPermission(permission);
        }).length === 0;
    }

    /**
     * Check if user has given permission.
     */
    public hasPermission(permission: string): boolean {
        let permissions = this.getAllPermissions();
        return permissions['superAdmin'] || permissions[permission];
    }

    /**
     * Check if current user is logged in.
     */
    public isLoggedIn(): boolean {
        return this.get('id') > 0;
    }

    /**
     * Clear current user information.
     */
    public clear() {
        this.current = new User({groups: [this.guestsGroup]});
        this.cachedPermissions = null;
    }

    /**
     * Init CurrentUser service.
     */
    public init(params: {user?: User, guestsGroup: Group}) {
        this.guestsGroup = params.guestsGroup;
        this.assignCurrent(params.user);
    }

    /**
     * find Group
     */
    public hasGroups(groupName: string) {
        return this.current.groups.find(group => group.name == groupName );
    }

    /**
     * Get flattened array of permissions from all groups user belongs to.
     */
    private getAllPermissions(): Object {
        if (this.cachedPermissions) {
            return this.cachedPermissions;
        }

        let groups = this.get('groups') || [],
            permissions = {};

        groups.forEach((group: Group) => {
            if (group) Object.assign(permissions, group.permissions);
        });

        this.cachedPermissions = Object.assign(permissions, this.get('permissions') || {});

        return this.cachedPermissions;
    }
}
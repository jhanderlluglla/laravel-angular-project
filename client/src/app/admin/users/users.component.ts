import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {UserService} from "./user.service";
import {ModalService} from "../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../shared/modal/confirm-modal/confirm-modal.component";
import {CrupdateUserModalComponent} from "./crupdate-user-modal/crupdate-user-modal.component";
import {DataTable} from "../../shared/data-table";
import {Group} from "../../shared/models/Group";
import {User} from "../../shared/models/User";
import {CurrentUser} from "../../auth/current-user";

@Component({
    selector: 'users',
    templateUrl: './users.component.html',
    providers: [UrlAwarePaginator],
    encapsulation: ViewEncapsulation.None,
})
export class UsersComponent extends DataTable implements OnInit {

    /**
     * UsersComponent Constructor.
     */
    constructor(
        public paginator: UrlAwarePaginator,
        private userService: UserService,
        private modal: ModalService,
        public currentUser: CurrentUser,
    ) {
        super();
    }

    ngOnInit() {
        this.paginator.paginate('users').subscribe(response => {
            this.items = response.data;
        });
    }

    /**
     * Delete currently selected users.
     */
    public deleteSelectedUsers() {
        this.userService.deleteMultiple(this.selectedItems).subscribe(() => {
            this.paginator.refresh();
            this.selectedItems = [];
        })
    }

    /**
     * Called when new user is created or existing one is updated.
     */
    public onUserChange() {
        this.paginator.refresh();
    }

    /**
     * Compile a string of groups user belongs to names.
     */
    public makeGroupsList(groups: Group[]): string {
        return groups.map(group => group.name).join(', ');
    }

    /**
     * Compile a list of users permissions.
     */
    public makePermissionsList(permissions: any[]): string {
        let list = [];

        for(let permission in permissions) {
            if (permissions[permission]) {
                list.push(permission);
            }
        }

        return list.join(', ');
    }

    /**
     * Ask user to confirm deletion of selected tags
     * and delete selected tags if user confirms.
     */
    public maybeDeleteSelectedUsers() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Users',
            body:  'Are you sure you want to delete selected users?',
            ok:    'Delete'
        }).onDone.subscribe(() => this.deleteSelectedUsers());
    }

    /**
     * Show modal for editing user if user is specified
     * or for creating a new user otherwise.
     */
    public showCrupdateUserModal(user?: User) {
        this.modal.show(CrupdateUserModalComponent, {user}).onDone.subscribe(data => this.onUserChange());
    }
}

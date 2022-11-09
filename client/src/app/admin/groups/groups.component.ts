import {Component, OnInit, ViewEncapsulation} from "@angular/core";
import {GroupService} from "./group.service";
import {ToastService} from "../../shared/toast/toast.service";
import {ModalService} from "../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../shared/modal/confirm-modal/confirm-modal.component";
import {CrupdateGroupModalComponent} from "./crupdate-group-modal/crupdate-group-modal.component";
import {AssignUsersToGroupModalComponent} from "./assign-users-to-group-modal/assign-users-to-group-modal.component";
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {DataTable} from "../../shared/data-table";
import {Group} from "../../shared/models/Group";
import {CurrentUser} from "../../auth/current-user";
import {MailboxTagsService} from "../../ticketing/mailbox-tags.service";
import {BackendEvents} from "../../shared/backend-events";

@Component({
    selector: 'groups',
    templateUrl: './groups.component.html',
    styleUrls: ['./groups.component.scss'],
    providers: [UrlAwarePaginator],
    encapsulation: ViewEncapsulation.None,
})
export class GroupsComponent extends DataTable implements OnInit {

    /**
     * List of all available groups models.
     */
    public groups: Group[];

    /**
     * Currently selected group.
     */
    public selectedGroup: Group = new Group();

    /**
     * GroupsComponent Constructor.
     */
    constructor(
        private groupService: GroupService,
        private toast: ToastService,
        private modal: ModalService,
        public paginator: UrlAwarePaginator,
        public currentUser: CurrentUser,
        public mailBoxTags: MailboxTagsService
    ) {
        super();
    }

    ngOnInit() {
        // this.backendEvents.groupAssigned.subscribe((message) => {
        //     console.log(message);
        // });
        this.fetchGroups();
        this.mailBoxTags.refresh();
    }

    /**
     * Set given group as selected.
     */
    public selectGroup(group: Group) {
        if (this.selectedGroup !== group) {
            this.selectedGroup = group;
            this.paginateGroupUsers(group);
            this.deselectAllItems();
        }
    }

    /**
     * Fetch all existing groups.
     */
    public fetchGroups() {
        this.groupService.getGroups().subscribe(response => {
            this.groups = response.data;

            if (this.groups.length) {

                //if no group is currently selected, select first
                if ( ! this.selectedGroup.id) {
                    this.selectGroup(this.groups[0]);

                //if group is selected, try to re-select it with the one returned from server
                } else {
                    for (let i = 0; i < this.groups.length; i++) {
                        if (this.groups[i].id == this.selectedGroup.id) {
                            this.selectedGroup = this.groups[i];
                        }
                    }
                }
            }
        })
    }

    /**
     * Fetch users belonging to give group.
     */
    public paginateGroupUsers(group: Group) {
        this.paginator.paginate('users', {group_id: group.id}).subscribe(response => {
            this.items = response.data;
        });
    }

    /**
     * Delete currently selected group.
     */
    public deleteGroup(group) {
        this.groupService.delete(group.id).subscribe(() => {
            this.selectedGroup = null;
            this.onGroupChange();
        });
    }

    /**
     * Called when group is updated or new one is created.
     */
    public onGroupChange() {
        this.fetchGroups();
    }

    /**
     * Remove users from selected group.
     */
    public removeUsersFromSelectedGroup() {
        this.groupService.removeUsers(this.selectedGroup.id, this.selectedItems.slice()).subscribe(() => {
            this.paginateGroupUsers(this.selectedGroup);
            this.deselectAllItems();
            this.toast.show('Users removed from group.');
        })
    }

    /**
     * Show modal for assigning new users to currently selected group.
     */
    public showAssignUsersModal() {
        this.modal.show(AssignUsersToGroupModalComponent, {group: this.selectedGroup}).onDone.subscribe(() => {
            this.paginateGroupUsers(this.selectedGroup);
        })
    }

    /**
     * Show modal for editing user if user is specified
     * or for creating a new user otherwise.
     */
    public showCrupdateGroupModal(group?: Group) {
        let categories = this.mailBoxTags.getCategoryTags().filter(tag => String(tag.id) != 'no_assigned').map(tag => {
            if (group) {
                if (group.categories.find(cat => tag.id == cat.id)) 
                    return Object.assign({}, tag, {status: true});
            }
            return Object.assign({}, tag, {status: false});
        });
        
        this.modal.show(CrupdateGroupModalComponent, {group, categories}).onDone.subscribe(data => this.onGroupChange());
    }

    /**
     * Ask user to confirm deletion of selected group
     * and delete selected group if user confirms.
     */
    public maybeDeleteGroup(group: Group) {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete Group',
            body:  'Are you sure you want to delete this group?',
            ok:    'Delete'
        }).onDone.subscribe(() => this.deleteGroup(group));
    }

    /**
     * Ask user to confirm detachment of selected users from
     * currently selected group, and detach them if user confirms.
     */
    public maybeDetachUsers(group: Group) {
        this.modal.show(ConfirmModalComponent, {
            title: 'Remove Users from Group',
            body:  'Are you sure you want to remove selected users from this group?',
            ok:    'Remove'
        }).onDone.subscribe(() => this.removeUsersFromSelectedGroup());
    }
}

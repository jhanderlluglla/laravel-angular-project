import {Component, OnInit, Injector, ViewEncapsulation} from '@angular/core';
import {EscalationRulesService} from "./escalation-rules.service";
import {CrupdateEscalationRuleModalComponent} from "./crupdate-escalation-rule-modal/crupdate-escalation-rule-modal.component";
import {ModalService} from "../../shared/modal/modal.service";
import {ConfirmModalComponent} from "../../shared/modal/confirm-modal/confirm-modal.component";
import {UrlAwarePaginator} from "../../shared/pagination/url-aware-paginator.service";
import {DataTable} from "../../shared/data-table";
import {EscalationRule} from "../../shared/models/EscalationRule";
import {Stage} from "../../shared/models/Stage";
import {Supervisor} from "../../shared/models/Supervisor";
import {Priority} from "../../shared/models/Priority";
import {Tag} from "../../shared/models/Tag";
import {ActivatedRoute} from "@angular/router";


import {MailboxTagsService} from "../../ticketing/mailbox-tags.service";

@Component({
    selector: 'escalation-rules',
    templateUrl: './escalation-rules.component.html',
    providers: [EscalationRulesService, UrlAwarePaginator],
    encapsulation: ViewEncapsulation.None,
})

export class EscalationRulesComponent extends DataTable  {

    private stages: Stage[];
    private supervisors: Supervisor[];
    private priorities: Priority[];
    private tags: Tag[];
    /**
     * EscalationRulesComponent Constructor.
     */
    constructor(
        private escalationRuleService: EscalationRulesService,
        private route: ActivatedRoute,
        private modal: ModalService,
        private mailBoxTags: MailboxTagsService,
        public paginator: UrlAwarePaginator,
        private injector: Injector
    ) {
        super();
    }

    ngOnInit() {
        this.paginator.paginate('escalation-rules?with_counts=true').subscribe(response => {
            this.stages = response['stages'];
            this.supervisors = response['supervisors'];
            this.priorities = response['priorities'];
            this.tags = response['tags'];
            this.tags.push(new Tag({
                id: '-1',
                name: 'unassigned',
                display_name: 'Unassigned'
            }));
            this.items = response['data'];
        });
    }

    /**
     * Called when escalation-rule is updated or new one is created.
     */
    public onEscalationRuleChange() {
        this.paginator.refresh();
    }


    /**
     * Show modal for editing escalation-rule if escalation-rule is specified
     * or for creating a new escalation-rule otherwise.
     */
    public showCrupdateEscalationRuleModal(escalationRule?: EscalationRule) {
        let stages = this.stages;
        let priorities = this.priorities;
        let tags = this.tags;
        let supervisors = this.supervisors;
        if (escalationRule) {
            supervisors = supervisors.map(supervisor => escalationRule.supervisors.find(sp => sp.id == supervisor.id) ? Object.assign({}, supervisor, {status: true}) : supervisor);
        }
        this.modal.show(CrupdateEscalationRuleModalComponent, {
            escalationRule,
            supervisors,
            stages,
            tags,
            priorities,
        }).onDone.subscribe(() => this.onEscalationRuleChange())
    }

    public maybeDeleteSelectedEscalationRules() {
        this.modal.show(ConfirmModalComponent, {
            title: 'Delete EscalationRules',
            body:  'Are you sure you want to delete selected escalation-rules?',
            ok:    'Delete'
        }).onDone.subscribe(() => this.deleteSelectedEscalationRules());
    }

    public deleteSelectedEscalationRules() {
        this.escalationRuleService.delete(this.selectedItems.slice()).subscribe(() => {
            this.deselectAllItems();
            this.onEscalationRuleChange();
        });
    }

    public change(escalation_rule: EscalationRule) {
        escalation_rule = Object.assign({}, escalation_rule, {is_started: 1 - escalation_rule.is_started});
        this.escalationRuleService.update(Object.assign({}, escalation_rule)).subscribe(response => {
            this.onEscalationRuleChange();
        });
    }
}

import {Component, Output, EventEmitter, ElementRef, Renderer2} from '@angular/core';
import {BaseModalClass} from "./../../../shared/modal/base-modal";
import {ToastService} from "../../../shared/toast/toast.service";
import {EscalationRulesService} from "../escalation-rules.service";
import {EscalationRule} from "../../../shared/models/EscalationRule";

import {Tag} from "../../../shared/models/Tag";
import {Supervisor} from "../../../shared/models/Supervisor";
import {Priority} from "../../../shared/models/Priority";
import {Stage} from "../../../shared/models/Stage";


@Component({
    selector: 'crupdate-escalation-rule-modal',
    templateUrl: './crupdate-escalation-rule-modal.component.html',
    providers: [EscalationRulesService],
})
export class CrupdateEscalationRuleModalComponent extends BaseModalClass {

    /**
     * EscalationRule model.
     */
    public model = new EscalationRule();

    public supervisors: Supervisor[];
    public tags: Supervisor[];
    public priorities: Priority[];
    public stages: Stage[];

    /**
     * If we are updating existing escalation-rule or creating a new one.
     */
    public updating: boolean = false;

    constructor(
        protected elementRef: ElementRef, 
        protected renderer: Renderer2, 
        private toast: ToastService, 
        private escalationRulesService: EscalationRulesService
    ) {
        super(elementRef, renderer);
        this.resetState();
    }

    public close() {
        this.resetState();
        super.close();
    }

    public show(params: {
        escalationRule?: EscalationRule,
        supervisors: Supervisor[],
        stages: Stage[],
        tags: Tag[],
        priorities: Priority[]
    } = {
        supervisors: [],
        stages: [],
        tags: [],
        priorities: []
    }) {
        this.resetState();
        this.hydrateModel(params);
        if (params.escalationRule) {
            this.updating = true;
        } else {
            this.updating = false;
        }

        super.show(params);
    }

    public confirm() {
        let request;
        let supervisor_ids = this.supervisors.map(supervisor => supervisor.id);
        if (this.updating) {
            request = this.escalationRulesService.update(Object.assign({}, this.model, {
                supervisor_ids: supervisor_ids,
            }));
        } else {
            request = this.escalationRulesService.create(Object.assign({}, this.model, {
                supervisor_ids: supervisor_ids,
            }));
        }

        request.subscribe(response => {
            super.done(response.data);
            this.toast.show('EscalationRule '+(this.updating ? 'Updated' : 'Created'));
            this.close();
        }, this.handleErrors.bind(this));
    }

    /**
     * Reset all modal state to default.
     */
    private resetState() {
        this.errors = {};
    }

    /**
     * Populate escalation-rule model with given data.
     */
    private hydrateModel(params) {
        if (params.escalationRule) {
            Object.assign(this.model, params.escalationRule);
        }

        this.stages = params.stages;
        this.supervisors = params.supervisors;
        this.tags = params.tags;
        this.priorities = params.priorities;
    }
}
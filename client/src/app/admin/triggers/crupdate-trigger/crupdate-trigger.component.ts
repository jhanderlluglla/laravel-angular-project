import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Location} from "@angular/common";
import {TriggersService} from "../triggers.service";
import {Condition} from "../../../shared/models/Condition";
import {Action} from "../../../shared/models/Action";
import {ActivatedRoute} from "@angular/router";
import {Trigger} from "../../../shared/models/Trigger";
import {ToastService} from "../../../shared/toast/toast.service";
import {utils} from "../../../shared/utils";

@Component({
    selector: 'crupdate-trigger',
    templateUrl: './crupdate-trigger.component.html',
    styleUrls: ['./crupdate-trigger.component.scss'],
    providers: [TriggersService],
    encapsulation: ViewEncapsulation.None,
})
export class CrupdateTriggerComponent implements OnInit {

    /**
     * True if we are currently editing trigger and not creating new one.
     */
    public editing = false;

    /**
     * Trigger model template form is bound to.
     */
    public triggerModel = {conditions: [], actions: []};

    /**
     * Validation errors for trigger.
     */
    public errors = {};

    /**
     * List of available conditions for triggers.
     */
    public allConditions: Condition[] = [];

    /**
     * List of all available actions for triggers.
     */
    public allActions: Action[] = [];

    /**
     * Cache for action/condition select value options.
     */
    public valueOptions = {};

    /**
     * CrupdateTriggerComponent Constructor.
     */
    constructor(
        protected location: Location,
        protected trigger: TriggersService,
        private route: ActivatedRoute,
        private toast: ToastService,
    ) {}

    ngOnInit() {
        this.trigger.getConditions().subscribe(conditions => this.allConditions = conditions);
        this.trigger.getActions().subscribe(actions => this.allActions = actions);
        this.hydrateModelWithPlaceholders();

        this.route.params.subscribe(params => {
            if (params['id']) {
                this.editing = true;
                this.hydrateModel();
            }
        });
    }

    /**
     * Create new trigger or update existing one.
     */
    public createOrUpdateTrigger() {
        let action = this.editing ? 'update' : 'create';

        this.trigger[action](this.getPayload()).subscribe(() => {
            this.errors = {};
            this.toast.show(`${utils.ucFirst(action)}d a Trigger`);
            this.goBack();
        }, errors => this.errors = errors.messages);
    }

    /**
     * Add a new condition to specified conditions type array.
     */
    public addCondition(type: string) {
        this.triggerModel.conditions.push({condition_id: 0, matchType: type});
    }

    /**
     * Add a new action to actions array.
     */
    public addAction() {
        this.triggerModel.actions.push({action_id: 0, value: {}});
    }

    /**
     * Remove specified action from actions array.
     */
    public removeAction(action: Object) {
        //if there is only one action, then simply reset it to default state
        if (this.triggerModel.actions.length === 1) {
            this.triggerModel.actions[0] = {action_id: 0, value: {}};

        //if there is more then one action then remove specified one
        } else {
            let index = this.triggerModel.actions.findIndex((currentAction: Object) => {
                return currentAction === action;
            });

            this.triggerModel.actions.splice(index, 1);
        }
    }

    /**
     * Cancel trigger creation and go back.
     */
    public goBack() {
        this.triggerModel = {conditions: [], actions: []};
        this.location.back();
    }

    /**
     * Fired when action is selected/changed.
     */
    public onActionSelect(actionId: number|string, selectedAction: Object) {
        selectedAction['actionModel'] = this.getActionById(actionId);

        let inputs = selectedAction['actionModel']['input_config']['inputs'];

        //clear input model of previous values
        selectedAction['value'] = {};

        //if there are not inputs for this action, bail
        if ( ! inputs || ! inputs[0]) return;

        //create an object property for each input
        inputs.forEach(input => {
            selectedAction['value'][input['name']] = null;
        });

        //if input is a select, we'll need to do some extra work
        if (inputs[0]['select_options']) {
            this.handleSelectOptions(selectedAction);
        }
    }

    /**
     * Find and return an action matching specified id.
     */
    private getActionById(id: number|string) {
        return this.allActions.find(action => action.id == id);
    }

    /**
     * Get trigger model payload for backend.
     */
    protected getPayload(): Object {
        return {
            id: this.triggerModel['id'],
            name: this.triggerModel['name'],
            description: this.triggerModel['description'],
            actions: this.triggerModel.actions.slice().filter(action => action.action_id !== 0),
            conditions: this.triggerModel.conditions.slice().filter(condition => condition.condition_id !== 0),
        };
    }

    /**
     * Hydrate component model using trigger
     * matching id in url params.
     */
    private hydrateModel() {
        this.route.data.subscribe(data => {
            this.mapBackendTrigger(data['trigger']);
        });
    }

    /**
     * Map backend trigger model object to one usable by this component.
     */
    private mapBackendTrigger(trigger: Trigger) {
        this.triggerModel['id'] = trigger.id;
        this.triggerModel['name'] = trigger.name;
        this.triggerModel['description'] = trigger.description;

        this.triggerModel.conditions = [];
        this.triggerModel.actions = [];

        trigger.conditions.forEach(condition => {
            this.triggerModel.conditions.push({
                conditionModel: condition,
                condition_id: condition.id,
                operator_id: condition['pivot']['operator_id'],
                operatorModel: condition['selected_operator'],
                matchType: condition['pivot']['match_type'],
                value: condition['pivot']['condition_value']
            });
        });

        trigger.actions.forEach(action => {
            this.triggerModel.actions.push({
                actionModel: action,
                action_id: action.id,
                value: JSON.parse(action['pivot']['action_value'])
            });
        });

        this.hydrateModelWithPlaceholders();
    }

    /**
     * Populate trigger model with placeholder conditions
     * and actions if there are no real ones yet.
     */
    protected hydrateModelWithPlaceholders() {

        //add one placeholder condition for each match type if there are none yet
        ['all', 'any'].forEach(type => {
            if ( ! this.triggerModel.conditions.filter(condition => condition.matchType === type).length) {
                this.addCondition(type);
            }
        });

        //add one placeholder for action if there are none yet
        if ( ! this.triggerModel.actions.length) {
            this.addAction();
        }
    }

    /**
     * Fetch select options for specified action/condition
     * (if not already cached) and set default model value.
     */
    protected handleSelectOptions(action: Object) {

        let input = action['actionModel']['input_config']['inputs'][0],
            optionsName = input['select_options'],
            inputName   = input['name'];

        //if we've already fetched options for this value,
        //set default one on specified action model and bail
        if (this.valueOptions[optionsName]) {
            action['value'][inputName] = this.valueOptions[optionsName][0].value;
            return;
        }

        //fetch and cache select value options by specified name
        this.trigger.getValueOptions(optionsName).subscribe(response => {
            this.valueOptions[optionsName] = response['data'];
            action['value'][inputName] = this.valueOptions[optionsName][0].value;
        });
    }
}

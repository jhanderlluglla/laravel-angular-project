import {Component, Input, ViewEncapsulation} from '@angular/core';
import {Condition} from "../../../shared/models/Condition";

@Component({
    selector: 'conditions',
    templateUrl: './conditions.component.html',
    styleUrls: ['./conditions.component.scss'],
    encapsulation: ViewEncapsulation.None,
})

export class ConditionsComponent {

    /**
     * Model this condition should be attached to.
     */
    @Input() public model: Object[];

    /**
     * Match type of conditions for this instance. 'Any' or 'all'.
     */
    @Input() public matchType: string;

    /**
     * List of available conditions for triggers.
     */
    @Input() public allConditions: Condition[] = [];

    /**
     * Backend side errors.
     */
    @Input() public errors = {};

    /**
     * Remove specified condition form conditions model array.
     */
    public removeCondition(condition: {condition: Condition | number}) {
        let conditions = this.model.filter(condition => condition['matchType'] === this.matchType);

        let index = this.model.findIndex((conditionModel: {condition: Condition | number}) => {
            return conditionModel === condition;
        });

        //if there is only one condition, then simply reset it to default state
        if (conditions.length === 1) {
            this.model[index] = {condition_id: 0, matchType: this.matchType};

        //if there are more then one condition then remove specified one
        } else {
            this.model.splice(index, 1);
        }
    }

    /**
     * Fired when new condition is selected.
     */
    public onConditionSelect(selectedCondition: Object) {

        //find condition model with matching id
        let conditionModel = this.allConditions.find(condition => condition.id == selectedCondition['condition_id']);

        //attach condition model to condition that was just selected
        selectedCondition['conditionModel'] = conditionModel;

        //attach id of first operator attached to selected condition model
        selectedCondition['operator_id'] = conditionModel.operators[0].id;

        //attach first operator model attached to selected condition model
        selectedCondition['operatorModel'] = conditionModel.operators[0];

        //clear previous values attached to selected condition
        selectedCondition['value'] = '';
    }
}

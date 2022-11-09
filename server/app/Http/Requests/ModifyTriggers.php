<?php namespace App\Http\Requests;

class ModifyTriggers extends BaseFormRequest
{
    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'conditions.required' => 'Trigger must have at least one condition.',
            'conditions.*.value.required' => 'Condition value field can\'t be empty.',
            'actions.*.value.required' => 'Action value field can\'t be empty.',
        ];
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'required|unique:triggers|min:1|max:250',
            'conditions' => 'required|array',
            'conditions.*.condition_id' => 'required|integer',
            'conditions.*.matchType' => 'required|in:any,all',
            'actions' => 'required|array',
            'actions.*.value' => 'present|array',
            'actions.*.value.*' => 'required|min:1',
            'actions.*.action_id' => 'required|integer',
        ];
    }
}

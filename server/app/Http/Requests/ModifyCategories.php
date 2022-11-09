<?php namespace App\Http\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class ModifyCategories extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'name' => 'required|string|min:2|max:250',
            'parent_id' => 'integer|nullable',
            'description' => 'min:2|nullable'
        ];
    }
}

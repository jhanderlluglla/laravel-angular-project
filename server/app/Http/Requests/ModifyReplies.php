<?php namespace App\Http\Requests;

class ModifyReplies extends BaseFormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        if ($this->route('type') === 'drafts') {
            return $messages = [
                'body'      => 'string|min:1',
                'status'    => 'array',
                'uploads'   => 'required_without:body|array|max:5',
                'uploads.*' => 'required_without:body|string|min:10'
            ];
        }

        return $messages = [
            'body'      => 'required|string|min:1',
            'uploads'   => 'array|max:5',
            'uploads.*' => 'string|min:10'
        ];
    }
}

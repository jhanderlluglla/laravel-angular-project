<?php namespace App\Services\Mail\Transformers;

class NullMailTransformer implements MailTransformer
{
    /**
     * Transform email data into format usable by the app.
     *
     * @param array $emailData
     * @return array
     */
    public function transform($emailData)
    {
        return $emailData;
    }

}

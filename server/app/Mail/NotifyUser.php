<?php namespace App\Mail;

use App;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use App\Services\Mail\MailTemplates;
use Illuminate\Queue\SerializesModels;

class NotifyUser extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Data for constructing notification email.
     *
     * @var array
     */
    public $data;

    /**
     * Notification email body.
     *
     * @var string
     */
    public $body;

    /**
     * Create a new message instance.
     *
     * @param array $data
     */
    public function __construct($data)
    {
        $this->data = $data;
        $this->body = $data['body'];
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $template = App::make(MailTemplates::class)->getByAction('generic', [
            'email_subject' => $this->data['subject']
        ]);

        return $this->to($this->data['user']['email'])
            ->subject($template['subject'])
            ->view($template['html_view'])
            ->text($template['plain_view']);
    }
}

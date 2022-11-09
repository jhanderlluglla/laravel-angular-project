<?php namespace App\Mail;

use App;
use App\EscalationRule;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use App\Services\Mail\MailTemplates;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class EscalationRuleNotification extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Ticket model instance.
     *
     * @var Ticket
     */
    public $escalation;

    /**
     * @var string
     */
    public $siteName;

    /**
     * Create a new message instance.
     *
     * @param Ticket $ticket
     */
    public function __construct(EscalationRule $escalation)
    {
        $this->escalation = $escaltion;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $template = App::make(MailTemplates::class)->getByAction('escalation_rule_notification');
        $emails = [];
        foreach ($this->escalation->supervisors as $key => $supervisor) {
            $emails[] = $supervisor['email'];
        }

        return $this->to('jacek.fbkaca@gmail.com')
            ->subject($template['subject'])
            ->view($template['html_view'])
            ->text($template['plain_view']);;
    }
}

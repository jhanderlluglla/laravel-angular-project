<?php

use Illuminate\Database\Seeder;
use App\Services\Mail\MailTemplates;

class MailTemplatesSeeder extends Seeder
{
    /**
     * @var MailTemplates
     */
    private $mailTemplates;

    /**
     * List of subjects for mail templates.
     * @var array
     */
    private $subjects = [
        'ticket_reply' => 'RE: {{TICKET_SUBJECT}}',
        'generic'      => '{{EMAIL_SUBJECT}}',
        'ticket_created_notification' => 'Request received: {{TICKET_SUBJECT}}',
        'ticket_rejected_notification' => 'Request rejected.',
    ];

    /**
     * MailTemplatesTableSeeder constructor.
     *
     * @param MailTemplates $mailTemplates
     */
    public function __construct(MailTemplates $mailTemplates)
    {
        $this->mailTemplates = $mailTemplates;
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->mailTemplates->getDefault()->each(function($config) {
            $shouldSkipModel = false;

            $name = basename($config['file_name'], '.blade.php');

            //skip "base" template
            if ($name === 'base') return;

            //user friendly template name
            $config['display_name'] = str_replace('-', ' ', title_case($name));

            //"plain" version template
             if (str_contains($config['file_name'], 'plain')) {
                 $shouldSkipModel = true;
             }

            //regular template
             else {
                //for what action template will be used
                $config['action'] = str_replace('-', '_', $name);

                //set template subject
                $config['subject'] = $this->subjects[$config['action']];
            }

            $this->mailTemplates->create($config, $shouldSkipModel);
        });
    }
}

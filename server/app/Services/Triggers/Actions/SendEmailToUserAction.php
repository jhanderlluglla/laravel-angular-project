<?php namespace App\Services\Triggers\Actions;

use App\Ticket;
use App\Action;
use App\Mail\NotifyUser;
use Illuminate\Mail\Mailer;
use App\Services\Auth\UserRepository;

class SendEmailToUserAction implements TriggerActionInterface {

    /**
     * Mailer service instance.
     *
     * @var Mailer
     */
    private $mailer;

    /**
     * UserRepository instance.
     *
     * @var UserRepository
     */
    private $userRepository;

    /**
     * AddNoteToTicketAction constructor.
     *
     * @param Mailer $mailer
     * @param UserRepository $userRepository
     */
    public function __construct(Mailer $mailer, UserRepository $userRepository)
    {
        $this->mailer = $mailer;
        $this->userRepository = $userRepository;
    }

    /**
     * Perform specified action on ticket.
     *
     * @param Ticket $ticket
     * @param Action $action
     * @return Ticket
     */
    public function perform(Ticket $ticket, Action $action)
    {
        $data = json_decode($action['pivot']['action_value'], true);

        $user = $this->userRepository->findOrFail($data['agent_id']);
        $data['user'] = $user;

        $this->mailer->queue(new NotifyUser($data));

        return $ticket;
    }
}
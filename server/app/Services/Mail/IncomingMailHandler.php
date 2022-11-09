<?php namespace App\Services\Mail;

use App;
use App\Reply;
use App\Services\Files\FileStorage;
use App\Services\Ticketing\TicketReplyCreator;
Use App\Ticket;
use App\Events\TicketCreated;
use App\Services\Auth\UserRepository;
use App\Services\Ticketing\ReplyRepository;
use App\Services\Settings;
use App\Services\Files\Uploads;
use App\Services\Ticketing\TicketRepository;
use App\Services\Files\EmailStore;
use App\Mail\TicketRejectedNotification;
use Mail;

class IncomingMailHandler
{
    /**
     * ReplyRepository instance.
     *
     * @var ReplyRepository
     */
    private $replyRepository;

    /**
     * EmailStore service instance.
     *
     * @var EmailStore
     */
    private $emailStore;

    /**
     * TicketRepository instance.
     *
     * @var TicketRepository
     */
    private $ticketRepository;

    /**
     * @var Settings
     */
    private $settings;

    /**
     * @var UserRepository
     */
    private $userRepository;

    /**
     * @var ParsedEmail
     */
    private $parsedEmail;

    /**
     * @var Uploads
     */
    private $uploads;
    /**
     * @var TicketReplyCreator
     */
    private $ticketReplyCreator;

    /**
     * @var TicketReferenceHash
     */
    private $referenceHash;

    /**
     * @var FileStorage
     */
    private $fileStorage;

    /**
     * IncomingMailHandler constructor.
     *
     * @param ReplyRepository $replyRepository
     * @param TicketRepository $ticketRepository
     * @param TicketReplyCreator $ticketReplyCreator
     * @param Uploads $uploads
     * @param EmailStore $emailStore
     * @param Settings $settings
     * @param UserRepository $userRepository
     * @param ParsedEmail $parsedEmail
     * @param TicketReferenceHash $referenceHash
     * @param FileStorage $fileStorage
     */
    public function __construct(
        ReplyRepository $replyRepository,
        TicketRepository $ticketRepository,
        TicketReplyCreator $ticketReplyCreator,
        Uploads $uploads,
        EmailStore $emailStore,
        Settings $settings,
        UserRepository $userRepository,
        ParsedEmail $parsedEmail,
        TicketReferenceHash $referenceHash,
        FileStorage $fileStorage
    )
    {
        $this->uploads = $uploads;
        $this->settings = $settings;
        $this->emailStore = $emailStore;
        $this->fileStorage = $fileStorage;
        $this->parsedEmail = $parsedEmail;
        $this->referenceHash = $referenceHash;
        $this->userRepository = $userRepository;
        $this->replyRepository = $replyRepository;
        $this->ticketRepository = $ticketRepository;
        $this->ticketReplyCreator = $ticketReplyCreator;
    }

    /**
     * Parse specified email into new ticket or reply for existing ticket.
     *
     * @param array $data
     * @return void
     */
    public function parseEmailIntoTicketOrReply($data)
    {
        $this->parsedEmail->setEmailData($data);
        $ticket = $this->getTicketEmailIsInReplyTo();

        //create new ticket from email
        if ( ! $ticket && $this->settings->get('tickets.create_from_emails')) {
            $newTicket = $this->createTicketFromEmail();
            $reply = $newTicket->replies->first();
        }

        //create reply for existing ticket from email
        if ($ticket && $this->settings->get('replies.create_from_emails')) {
            $reply = $this->createReplyFromEmail($ticket);
        }

        if ( ! $ticket) {
            $this->maybeSendTicketRejectedNotification();
        }

        $this->storeOriginalEmail(isset($reply) ? $reply : null);
    }

    /**
     * Find ticket that email is in reply to.
     *
     * @return Ticket
     */
    private function getTicketEmailIsInReplyTo()
    {
        $uuid = null; $reply = null;

        if ($this->parsedEmail->hasHeader('In-Reply-To')) {
            $uuid = $this->referenceHash->extractFromMessageId($this->parsedEmail->getHeader('In-Reply-To'));
            if ($uuid) $reply = $this->replyRepository->findByUuid($uuid);
        }

        if ( ! $reply && $this->parsedEmail->hasBody('plain')) {
            $uuid = $this->referenceHash->extractFromString($this->parsedEmail->getBody('plain'));
            if ($uuid) $reply = $this->replyRepository->findByUuid($uuid);
        }

        if ( ! $reply && $this->parsedEmail->hasBody('html')) {
            $uuid = str_replace('<wbr>', '', $this->referenceHash->extractFromString($this->parsedEmail->getBody('html')));
            if ($uuid) $reply = $this->replyRepository->findByUuid($uuid);
        }

        return $reply ? $reply->ticket : null;
    }

    /**
     * Create new ticket from email.
     *
     * @return Ticket
     */
    private function createTicketFromEmail()
    {
        $email = $this->parsedEmail->getSenderEmail();
        $user = $this->userRepository->firstOrCreate(['email' => $email]);

        $cidMap = $this->generateCidMap();

        $ticket = $this->ticketRepository->create([
            'body'    => $this->parsedEmail->getNormalizedBody($cidMap),
            'subject' => $this->parsedEmail->getSubject(),
            'user_id' => $user->id,
            'uploads' => $this->createUploads($user->id),
            'is_customer' => true
        ]);

        event(new TicketCreated($ticket));

        return $ticket;
    }

    /**
     * Create a reply for existing ticket from email.
     *
     * @param Ticket $ticket
     * @return Reply
     */
    private function createReplyFromEmail($ticket)
    {
        $cidMap = $this->generateCidMap();

        return $this->ticketReplyCreator->create($ticket, [
            'body'    => $this->parsedEmail->getNormalizedBody($cidMap),
            'user_id' => $ticket->user_id,
            'uploads' => $this->createUploads($ticket->user_id),
        ], 'replies');
    }

    /**
     * Store inline images and generate CID map for them.
     *
     * @return array
     */
    private function generateCidMap()
    {
        $inlineAttachments = $this->parsedEmail->getAttachments('inline');

        return $inlineAttachments->mapWithKeys(function($attachment) {
            $url = $this->fileStorage->putStatic($attachment, 'ticket');
            return [$attachment['cid'] => url($url)];
        })->toArray();
    }

    /**
     * Create uploads from email attachments.
     *
     * @param integer $userId
     * @return array
     */
    private function createUploads($userId)
    {
        $attachments = $this->parsedEmail->getAttachments('regular');

        $attachments = $attachments->map(function($attachment) use($userId) {
            $attachment['user_id'] = $userId;
            return $attachment;
        })->toArray();

        return $this->uploads->store($attachments)->pluck('file_name')->toArray();
    }

    /**
     * Store original email on disk.
     *
     * @param Reply $reply
     */
    private function storeOriginalEmail(Reply $reply = null)
    {
        if ( ! $this->settings->get('mail.store_unmatched_emails'));
        $this->emailStore->storeEmail($this->parsedEmail, $reply);
    }

    /**
     * Send rejected notification to sender if
     * ticket creation via email channel is disabled.
     */
    private function maybeSendTicketRejectedNotification()
    {
        if ( ! $this->settings->get('tickets.create_from_emails') && $this->settings->get('tickets.send_ticket_rejected_notification')) {
            Mail::send(new TicketRejectedNotification($this->parsedEmail->getSenderEmail()));
        }
    }
}

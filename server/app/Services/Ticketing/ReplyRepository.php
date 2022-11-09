<?php namespace App\Services\Ticketing;

use Auth;
use App\Reply;
use App\Ticket;
use App\Upload;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ReplyRepository {

    /**
     * Reply model.
     *
     * @var Reply
     */
    private $reply;

    /**
     * Upload model.
     *
     * @var Upload
     */
    private $upload;

    /**
     * ReplyRepository constructor.
     *
     * @param Reply $reply
     * @param Upload $upload
     */
    public function __construct(Reply $reply, Upload $upload)
    {
        $this->reply  = $reply;
        $this->upload = $upload;
    }

    /**
     * Find reply by specified id.
     *
     * @param int $id
     *
     * @return Reply
     */
    public function findOrFail($id)
    {
        return $this->reply->findOrFail($id);
    }

    /**
     * Find reply matching specified UUID.
     *
     * @param string $uuid
     *
     * @return Reply
     */
    public function findByUuid($uuid)
    {
        return $this->reply->where('uuid', $uuid)->first();
    }

    /**
     * Paginate all replies of specified ticket.
     *
     * @param array $params
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate($params)
    {
        $query = $this->getRepliesIndexQuery($params['ticket_id']);

        $paginated = $query->paginate(isset($params['per_page']) ? $params['per_page'] : 10);

        return $paginated;
    }

    /**
     * Fetch replies for specified ticket.
     *
     * @param int $ticketId
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getRepliesForTicket($ticketId, $limit = 10)
    {
        return $this->getRepliesIndexQuery($ticketId)->limit($limit)->get();
    }

    /**
     * Delete specified reply and detach uploads from it.
     *
     * @param Reply $reply
     */
    public function delete(Reply $reply)
    {
        $ids = $reply->uploads()->pluck('uploads.id')->toArray();

        $this->detachUploads($reply, $ids);

        $reply->delete();
    }

    /**
     * Detach specified uploads from reply.
     *
     * @param Reply $reply
     * @param $uploads
     *
     * @return int
     */
    public function detachUploads(Reply $reply, $uploads)
    {
        return $reply->uploads()->detach($uploads);
    }

    /**
     * Update specified reply or note.
     *
     * @param array $data
     * @param int|Reply $reply
     *
     * @return Reply
     */
    public function update($data, $reply)
    {
        if ( ! is_a($reply, Reply::class)) {
            $reply = $this->reply->findOrFail($reply);
        }

        if (isset($data['body'])) {
            $reply->body = $data['body'];
        }

        if (isset($data['uploads'])) {
            $reply->uploads()->sync($this->upload->whereIn('file_name', $data['uploads'])->pluck('id'));
        }

        $reply->save();

        return $reply->load('uploads', 'user');
    }

    /**
     * Create a new reply of any type.
     *
     * @param array  $data
     * @param Ticket $ticket
     * @param string $type
     *
     * @return Reply
     */
    public function create($data, Ticket $ticket, $type = 'replies')
    {
        $reply = $this->reply->create([
            'body'      => isset($data['body']) ? $data['body'] : '',
            'user_id'   => isset($data['user_id']) ? $data['user_id'] : Auth::user()->id,
            'ticket_id' => $ticket->id,
            'type'      => $type,
            'uuid'      => str_random(30),
        ]);

        if ( ! empty($data['uploads'])) {
            $reply->uploads()->attach($this->upload->whereIn('file_name', $data['uploads'])->pluck('id'));
        }

        return $reply;
    }

    /**
     * Get Eloquent query for loading replies for given ticket.
     *
     * @param int $ticketId
     * @return Builder
     */
    private function getRepliesIndexQuery($ticketId)
    {
        $query = $this->reply->with('user', 'uploads')->where('ticket_id', $ticketId)->whereIn('type', ['replies', 'drafts', 'notes']);;

        return $query->orderBy('created_at', 'desc');
    }
}
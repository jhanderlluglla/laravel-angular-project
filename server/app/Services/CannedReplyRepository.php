<?php namespace App\Services;

use DB;
use App\Upload;
use App\CannedReply;
use Illuminate\Support\Arr;

class CannedReplyRepository {

    /**
     * CannedReply model.
     *
     * @var CannedReply
     */
    private $cannedReply;

    /**
     * Upload model.
     *
     * @var Upload
     */
    private $upload;

    /**
     * CannedReplyRepository constructor.
     *
     * @param CannedReply $cannedReply
     * @param Upload $upload
     */
    public function __construct(CannedReply $cannedReply, Upload $upload)
    {
        $this->upload = $upload;
        $this->cannedReply = $cannedReply;
    }

    /**
     * Find canned reply by specified id.
     *
     * @param int $id
     * @return CannedReply
     */
    public function findOrFail($id)
    {
        return $this->cannedReply->findOrfail($id);
    }

    /**
     * Paginate existing canned replies.
     *
     * @param array $params
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginateCannedReplies($params)
    {
        $orderBy    = Arr::get($params, 'order_by', 'created_at');
        $orderDir   = Arr::get($params, 'order_dir', 'desc');
        $perPage    = Arr::get($params, 'per_page', 13);
        $searchTerm = Arr::get($params, 'query');
        $userId     = Arr::get($params, 'user_id');
        $relations  = Arr::get($params, 'relations');

        $relations = array_filter(array_merge(explode(',', $relations), ['uploads']));
        $query = $this->cannedReply->with($relations);

        if ($userId) {
            $query->where('user_id', $userId);
        }

        if ($searchTerm) {
            $query->where('name', 'like', $searchTerm.'%');
        }

        return $query->orderBy($orderBy, $orderDir)->paginate($perPage);
    }

    /**
     * Create a new canned reply.
     *
     * @param int   $userId
     * @param array $params
     *
     * @return CannedReply
     */
    public function create($userId, $params)
    {
        $cannedReply = $this->cannedReply->create([
            'body'    => $params['body'],
            'name'    => $params['name'],
            'user_id' => $userId
        ]);

        $this->syncUploads($cannedReply, Arr::get($params, 'uploads'));

        return $cannedReply->load('uploads');
    }

    /**
     * Update existing canned reply.
     *
     * @param CannedReply $cannedReply
     * @param array $params
     *
     * @return CannedReply
     */
    public function update(CannedReply $cannedReply, $params)
    {
        $cannedReply->fill(Arr::except($params, 'uploads'))->save();

        $this->syncUploads($cannedReply, Arr::get($params, 'uploads'));

        return $cannedReply->load('uploads');
    }

    /**
     * Delete specified canned replies.
     *
     * @param array $ids
     * @return bool
     */
    public function delete($ids)
    {
        //detach uploads from canned replies
        DB::table('uploadables')->where('uploadable_type', CannedReply::class)->whereIn('uploadable_id', $ids)->delete();

        return $this->cannedReply->whereIn('id', $ids)->delete();
    }

    /**
     * Sync canned reply uploads with specified ones.
     *
     * @param CannedReply $cannedReply
     * @param array $uploads
     */
    private function syncUploads(CannedReply $cannedReply, $uploads)
    {
        if ( ! $uploads) return;

        $ids = $this->upload->whereIn('file_name', $uploads)->pluck('id');
        $cannedReply->uploads()->sync($ids);
    }
}
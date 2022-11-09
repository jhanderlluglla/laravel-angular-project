<?php

namespace App\Jobs;

use App\User;
use App\SearchTerm;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class StoreSearchTerm implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Search term.
     *
     * @var string
     */
    private $term;

    /**
     * @var null
     */
    private $user;

    /**
     * Minimum length search term should be in order to be stored.
     *
     * @var int
     */
    private $minTermLength = 4;

    /**
     * Create a new job instance.
     *
     * @param string $term
     * @param User|null $user
     */
    public function __construct($term, $user = null)
    {
        $this->term = $term;
        $this->user = $user;
    }

    /**
     * Store specified search term to the database.
     *
     * @param SearchTerm $searchTerm
     * @return mixed
     */
    public function handle(SearchTerm $searchTerm)
    {
        if (strlen($this->term) < $this->minTermLength) return;

        $existing = $searchTerm->where('term', $this->term)->first();

        if ($existing) {
            return $existing->increment('count');
        }

        $searchTerm->create(['term' => $this->term, 'count' => 1, 'user_id' => $this->getUserId()]);
    }

    /**
     * Get id of user who searched for this term.
     *
     * @return int|null
     */
    private function getUserId()
    {
        return $this->user ? $this->user->id : null;
    }
}

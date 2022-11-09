<?php namespace App\Services\Triggers\ValueOptions;

use Auth;
use Illuminate\Support\Collection;
use App\Services\Auth\UserRepository;

class AgentIdValueOptions implements ValueOptionsInterface  {

    /**
     * UserRepository Instance.
     *
     * @var UserRepository
     */
    private $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Get select options for agents:id value
     *
     * @return Collection
     */
    public function getOptions()
    {
        //get all current agents
        $users = collect($this->userRepository->paginateUsers([
            'group_name' => 'agents',
            'per_page'   => 25,
        ])->items());

        //we need only agent display name and id
        $users = $users->map(function($user) {
            return ['name' => $user->display_name, 'value' => $user->id];
        });

        //add currently logged in user to options array
        $users->prepend(['name' => '(current user)', 'value' => Auth::user()->id]);

        return $users;
    }
}
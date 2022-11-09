<?php namespace App\Http\Controllers;

use Auth;
use Mail;
use App\User;
use App\Tag;
use App\Group;
use App\Services\Settings;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Collection;
use App\Events\GroupAssigned;


class GroupsController extends Controller
{
    /**
     * User model.
     *
     * @var User
     */
    private $user;

    /**
     * Group model.
     *
     * @var Group
     */
    private $group;

    /**
     * Tag model.
     *
     * @var Tag
     */
    private $tag;

    /**
     * Settings service.
     *
     * @var Settings
     */
    private $settings;

    /**
     * Laravel request instance.
     *
     * @var Request
     */
    private $request;

    /**
     * GroupsController constructor.
     *
     * @param Request $request
     * @param Group $group
     * @param User $user
     */
    public function __construct(Request $request, Group $group, User $user, Tag $tag, Settings $settings)
    {
        $this->group   = $group;
        $this->user    = $user;
        $this->request = $request;
        $this->tag = $tag;
        $this->settings = $settings;
    }

    /**
     * Paginate all existing groups.
     *
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function index()
    {
        $this->authorize('index', Group::class);

        $data = $this->group->with('categories')->paginate(13);

        return $data;
    }

    /**
     * Create a new group.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store()
    {
        $this->authorize('store', Group::class);

        $this->validate($this->request, [
            'name'        => 'required|unique:groups|min:2|max:255',
            'default'     => 'boolean',
            'guests'      => 'boolean',
            'permissions' => 'array',
            'color'       => 'string|min:3|max:7',  
        ]);

        $group = $this->group->forceCreate([
            'name'        => $this->request->get('name'),
            'permissions' => $this->request->get('permissions'),
            'default'     => $this->request->get('default', 0),
            'color'       => $this->request->get('color', '#000')
        ]);

        $this->addCategories($group, $this->request->get('categories'));

        return $this->success(['data' => $group], 201);
    }

    /**
     * Update existing group.
     *f
     * @param integer $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update($id)
    {
        $this->authorize('update', Group::class);

        $this->validate($this->request, [
            'name'        => "min:2|max:255|unique:groups,name,$id",
            'default'     => 'boolean',
            'guests'      => 'boolean',
            'permissions' => 'array'
        ]);

        $group = $this->group->findOrFail($id);



        // send email to user when group is assigned with new categories
        if ($this->settings->get('tickets.assigned_notification_email')) {

            $original_cats = $group->categories->pluck('id')->toArray();

            $updated_cats = [];
            foreach ($this->request->get('categories') as $key => $cat) {
                $updated_cats[] = $cat['id'];
            }
            $new_cats = array_diff($updated_cats, $original_cats);

            if (count($new_cats) > 0) {
                $users = $this->user->whereHas('groups', function($q) use ($id){
                    $q->where('group_id', '=', $id);
                })->get();
                foreach ($users as $key => $user) {
                    Mail::raw("New Categories is assigned to your group by ". Auth::user()->first_name . " ". Auth::user()->last_name, function ($message) use($user){
                        $message->to($user->email, $user->name);
                    });
                }
            }
        }

        $group->fill($this->request->all())->save();

        $this->addCategories($group, $this->request->get('categories'));

        return $this->success(['data' => $group]);
    }

    /**
     * Delete group matching given id.
     *
     * @param integer $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $this->authorize('destroy', Group::class);

        $group = $this->group->findOrFail($id);

        $group->users()->detach();
        $group->delete();

        return $this->success([], 204);
    }

    /**
     * Add given users to group.
     *
     * @param integer $groupId
     * @return \Illuminate\Http\JsonResponse
     */
    public function addUsers($groupId)
    {
        $this->authorize('update', Group::class);

        $this->validate($this->request, [
            'emails'   => 'required|array|min:1|max:25',
            'emails.*' => 'required|email|max:255'
        ], [
            'emails.*.email'   => 'Email address must be valid.',
            'emails.*.required' => 'Email address is required.',
        ]);

        $group = $this->group->findOrFail($groupId);

        $users = $this->user->with('groups')->whereIn('email', $this->request->get('emails'))->get(['email', 'id']);

        if ($users->isEmpty()) {
            return $this->error(null, 422);
        }

        //filter out users that are already attached to this group
        $users = $users->filter(function($user) use($groupId) {
            return ! $user->groups->contains('id', (int) $groupId);
        });

        $group->users()->attach($users->pluck('id')->toArray());

        return $this->success(['data' => $users]);
    }

    /**
     * Remove given users from group.
     *
     * @param integer $groupId
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeUsers($groupId)
    {
        $this->authorize('update', Group::class);

        $this->validate($this->request, [
            'ids'   => 'required|array|min:1',
            'ids.*' => 'required|integer'
        ]);

        $group = $this->group->findOrFail($groupId);

        $group->users()->detach($this->request->get('ids'));

        return $this->success(['data' => $this->request->get('ids')]);
    }

    /**
     * Remove categories from group.
     *
     * @param integer $groupId
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeCategories($groupId)
    {
        $this->authorize('update', Group::class);

        $this->validate($this->request, [
            'ids'   => 'required|array|min:1',
            'ids.*' => 'required|integer'
        ]);

        $group = $this->group->findOrFail($groupId);

        $query = DB::table('taggables')->whereIn('tag_id', $this->request->get('ids'));

        $query->where('taggable_id', $groupId)->where('taggable_type', 'App/Group');

        $query->delete();

    }

    /**
     * Remove categories from group.
     *
     * @param integer $groupId
     * @return \Illuminate\Http\JsonResponse
     */
    public function addCategories($group, $categories)
    {

        $this->authorize('update', Group::class);
        $group->categories()->detach();
        $cat_ids = [];
        foreach ($categories as $key => $cat) {
            $cat_ids[] = $cat['id'];
        }
        $group->categories()->attach($cat_ids);
    }
}

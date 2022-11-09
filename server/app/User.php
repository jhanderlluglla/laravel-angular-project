<?php namespace App;

use Illuminate\Database\Eloquent\Builder;
use Laravel\Scout\Searchable;
use App\Traits\FormatsPermissions;
use Illuminate\Notifications\Notifiable;
use App\Notifications\ResetPassword;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;

/**
 * App\User
 *
 * @property integer $id
 * @property string $email
 * @property string $avatar
 * @property string $password
 * @property string $remember_token
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 * @property string $permissions
 * @property string $first_name
 * @property string $last_name
 * @property \Carbon\Carbon $deleted_at
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\SocialProfile[] $social_profiles
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Group[] $groups
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Ticket[] $tickets
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Upload[] $uploads
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Reply[] $replies
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\CannedReply[] $cannedReplies
 * @property-read mixed $display_name
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection|\Illuminate\Notifications\DatabaseNotification[] $notifications
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection|\Illuminate\Notifications\DatabaseNotification[] $unreadNotifications
 * @method static \Illuminate\Database\Query\Builder|\App\User whereId($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User whereName($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User whereEmail($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User whereAvatar($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User wherePassword($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User whereRememberToken($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User whereCreatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User whereUpdatedAt($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User wherePermissions($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User whereFirstName($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User whereLastName($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User whereDeletedAt($value)
 * @mixin \Eloquent
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\PurchaseCode[] $envato_purchase_codes
 * @property-read \Illuminate\Notifications\DatabaseNotificationCollection|\Illuminate\Notifications\DatabaseNotification[] $readNotifications
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\PurchaseCode[] $purchase_codes
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Tag[] $tags
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Email[] $secondary_emails
 * @property string $language
 * @property string $country
 * @property string $timezone
 * @property-read \App\UserDetails $details
 * @method static \Illuminate\Database\Query\Builder|\App\User whereCountry($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User whereLanguage($value)
 * @method static \Illuminate\Database\Query\Builder|\App\User whereTimezone($value)
 */
class User extends Authenticatable
{
    use SoftDeletes, Notifiable, FormatsPermissions, Searchable;

    /**
     * Get the indexable data array for the model.
     *
     * @return array
     */
    public function toSearchableArray()
    {
        return [
            'id'         => $this->id,
            'first_name' => $this->first_name,
            'last_name'  => $this->last_name,
            'email'      => $this->email,
        ];
    }

    /**
     * The attributes that are not mass assignable.
     *
     * @var array
     */
    protected $guarded = ['id', 'password', 'permissions'];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = ['password', 'remember_token'];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = ['id' => 'integer'];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['display_name', 'has_password'];

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = ['deleted_at'];

    /**
     * Social profiles this users account is connected to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function social_profiles()
    {
        return $this->hasMany('App\SocialProfile');
    }

    /**
     * Groups this user belongs to.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function groups()
    {
        return $this->belongsToMany('App\Group', 'user_group');
    }

    /**
     * Tickets created by this user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function tickets()
    {
        return $this->hasMany('App\Ticket')->orderBy('created_at', 'desc');
    }

    /**
     * User profile.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function details()
    {
        return $this->hasOne(UserDetails::class);
    }

    /**
     * Secondary email address belonging to user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function secondary_emails()
    {
        return $this->hasMany(Email::class);
    }

    /**
     * Envato purchase codes attached to this user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function purchase_codes()
    {
        return $this->hasMany('App\PurchaseCode')->orderBy('created_at', 'desc');
    }

    /**
     * Files this user has uploaded.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function uploads()
    {
        return $this->hasMany('App\Upload');
    }

    /**
     * Replies submitted by this user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function replies()
    {
        return $this->hasMany('App\Reply');
    }

    /**
     * Canned replies created by this user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function cannedReplies()
    {
        return $this->hasMany('App\CannedReply');
    }

    /**
     * Tags that are attached to the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\MorphToMany
     */
    public function tags()
    {
        return $this->morphToMany('App\Tag', 'taggable');
    }

    /**
     * Get user avatar.
     *
     * @param string $value
     * @return string
     */
    public function getAvatarAttribute($value)
    {
        if ($value) return $value;

        return "/assets/images/apr.png";
    }

    /**
     * Compile user display name from available attributes.
     *
     * @return string
     */
    public function getDisplayNameAttribute()
    {
        if ($this->first_name && $this->last_name) {
            return $this->first_name.' '.$this->last_name;
        } else if ($this->first_name) {
            return $this->first_name;
        } else if ($this->last_name) {
            return $this->last_name;
        } else {
            return explode('@', $this->email)[0];
        }
    }

    /**
     * Check if user has a password set.
     *
     * @return bool
     */
    public function getHasPasswordAttribute()
    {
        return isset($this->attributes['password']) && $this->attributes['password'];
    }

    /**
     * Search users using basic mysql LIKE query.
     *
     * @param string $query
     * @return Builder
     */
    public function basicSearch($query)
    {
        return $this->where('email', 'LIKE', "$query%")
            ->orWhere('first_name', 'LIKE', "$query%")
            ->orWhere('last_name', 'LIKE', "$query%");
    }

    /**
     * Create new envato purchase code from
     * specified details and attach it to user.
     *
     * @param array $purchases
     */
    public function updatePurchases($purchases) {
        foreach ($purchases as $purchaseDetails) {
            $this->purchase_codes()->updateOrCreate(['code' => $purchaseDetails['code']], [
                'item_name' => $purchaseDetails['item']['name'],
                'item_id'   => $purchaseDetails['item']['id'],
                'code'      => $purchaseDetails['code'],
                'supported_until' => array_get($purchaseDetails, 'supported_until'),
                'url'       => array_get($purchaseDetails, 'item.url'),
                'image'     => array_get($purchaseDetails, 'item.previews.icon_preview.icon_url'),
            ]);
        }
    }

    /**
     * Check if user is a super admin.
     *
     * @return boolean
     */
    public function isSuperAdmin()
    {
        return $this->hasPermission('superAdmin');
    }

    /**
     * Check if user is an agent.
     *
     * @return bool
     */
    public function isAgent()
    {
        return $this->isSuperAdmin() || $this->belongsToMany('App\Group', 'user_group')->join('taggable', 'taggable_id', '=', 'group_id')->join('tags', 'tags.id', '=', 'tag_id')->where('tags.type', '=', 'category');
    }

    /**
     * Check if user has a specified permission.
     *
     * @param string $permission
     * @return bool
     */
    public function hasPermission($permission)
    {
        $permissions = $this->permissions;

        foreach($this->groups as $group) {
            $permissions = array_merge($group->permissions, $permissions);
        }

        if (array_key_exists('superAdmin', $permissions) && $permissions['superAdmin']) return true;

        return array_key_exists($permission, $permissions) && $permissions[$permission];
    }

    /**
     * Send the password reset notification.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new ResetPassword($token));
    }
}

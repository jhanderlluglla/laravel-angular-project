<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class UserModelTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_returns_user_permissions()
    {
        $user  = factory(App\User::class)->create(['permissions' => '{"create":1, "update":0}']);
        $group = factory(App\Group::class)->create(['permissions' => '{"create":0, "update":1, "delete":1}']);
        $user->groups()->attach($group->id);

        //it decodes permissions json into array
        $this->assertEquals(1, $user->permissions['create']);
        $this->assertEquals(0, $user->permissions['update']);

        //explicit permissions override group permissions
        $this->assertEquals(1, $user->permissions['create']);
        $this->assertTrue($user->hasPermission('create'));
        $this->assertEquals(0, $user->permissions['update']);
        $this->assertFalse($user->hasPermission('update'));

        //it inherits permissions from group, if those permissions
        //are not defined explicitly on the user
        $this->assertArrayNotHasKey('delete', $user->permissions);
        $this->assertTrue($user->hasPermission('delete'));
    }

    public function test_it_checks_if_user_is_superAdmin()
    {
        $user = new App\User();

        //not super admin
        $user->permissions = [];
        $this->assertFalse($user->isSuperAdmin());

        //is super admin
        $user->permissions = ['superAdmin' => 1];
        $this->assertTrue($user->isSuperAdmin());
    }

    public function test_it_gives_admin_all_permissions()
    {
        $user = new App\User();
        $user->permissions = ['superAdmin' => 1];
        $this->assertTrue($user->hasPermission('foo bar'));
    }

    public function test_it_checks_if_user_is_agent()
    {
        $user = new App\User();

        //returns false if user is not agent
        $this->assertFalse($user->isAgent());

        //returns true if user is super admin
        $user->permissions = ['superAdmin' => 1];
        $this->assertTrue($user->isAgent());

        //returns true if user belongs to agents group
        $user->permissions = [];
        $user->setRelation('groups', collect([new App\Group(['name' => 'agents'])]));
        $this->assertTrue($user->isAgent());
    }

    public function test_it_returns_user_avatar()
    {
        $user = new App\User();

        //returns gravatar if user has no avatar uploaded
        $user->avatar = null;
        $this->assertContains('gravatar', $user->avatar);
        $this->assertContains(md5(trim(strtolower($user->email))), $user->avatar);

        //returns user avatar if user uploaded one
        $user->avatar = 'foo';
        $this->assertEquals($user->avatar, url('storage/foo'));
    }

    public function test_it_returns_user_display_name()
    {
        $user = new App\User();

        //returns first and last name if available
        $user->first_name = 'foo';
        $user->last_name = 'bar';
        $this->assertEquals($user->display_name, 'foo bar');

        //returns first name only
        $user->first_name = 'foo';
        $user->last_name = null;
        $this->assertEquals($user->display_name, 'foo');

        //returns last name only
        $user->first_name = null;
        $user->last_name = 'bar';
        $this->assertEquals($user->display_name, 'bar');

        //returns first part of email
        $user->first_name = null;
        $user->last_name = null;
        $user->email = 'foo@bar.com';
        $this->assertEquals($user->display_name, 'foo');
    }

    public function it_updates_envato_purchase_codes()
    {
        $user = factory(App\User::class)->create();

        $user->updatePurchaseCodes([
            'item' => ['name' => 'foo', 'id'   => 'bar'],
            'code' => 'code',
        ]);

        $this->assertCount(2, $user->purchase_codes);
        $this->assertEquals('foo', $user->purchase_codes[0]['item_name']);
        $this->assertEquals('bar', $user->purchase_codes[0]['item_id']);
        $this->assertEquals('code', $user->purchase_codes[0]['code']);
    }
}

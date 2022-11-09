<?php

use App\User;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class UsersDeleteMultipleTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_deletes_multiple_users()
    {
        $users = factory(App\User::class, 2)->create();

        $response = $this->asAdmin()->call('DELETE', "secure/users/delete-multiple", ['ids' => [$users[0]->id, $users[1]->id]]);
        $response->assertStatus(204);

        //deletes users
        $this->assertCount(0, User::whereIn('id', [$users[0]->id, $users[1]->id])->get());

        //soft deletes users
        $this->assertCount(2, User::withTrashed()->whereIn('id', [$users[0]->id, $users[1]->id])->get());
    }

    public function test_validates_user_input()
    {
        $response = $this->asAdmin()->json('DELETE', "secure/users/delete-multiple");
        $response->assertStatus(422);
        $response = $response->json();

        $this->assertEquals('error', $response['status']);
        $this->assertArrayHasKey('messages', $response);
        $this->assertNotEmpty($response['messages']);
        $this->assertArrayHasKey('ids', $response['messages']);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't delete users
        $response = $this->call('DELETE', "secure/users/delete-multiple", ['ids' => [$user->id]]);
        $response->assertStatus(403);

        //regular users can't delete users
        $response = $this->actingAs($user)->call('DELETE', "secure/users/delete-multiple", ['ids' => [$user->id]]);
        $response->assertStatus(403);

        //user with permissions can delete users
        $user->permissions = '{"users.delete":1}';
        $response = $this->actingAs($user)->call('DELETE', "secure/users/delete-multiple", ['ids' => [$user->id]]);
        $response->assertStatus(204);
    }
}

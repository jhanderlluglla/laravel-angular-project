<?php

use Illuminate\Foundation\Testing\DatabaseTransactions;

class UpdateUserDetailsTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_updates_user_details()
    {
        $user = $this->getRegularUser();

        $response = $this->asAdmin()->call('PUT', "/secure/users/{$user->id}/details", ['details' => 'foo details', 'notes' => 'foo notes']);
        $response->assertStatus(200);

        //updated details
        $this->assertEquals('foo details', $user->details->details);
        $this->assertEquals('foo notes', $user->details->notes);
    }

    public function test_it_checks_permissions()
    {
        $user = $this->getRegularUser();

        //guests can't update details
        $response = $this->call('PUT', '/secure/users/1/details');
        $response->assertStatus(403);

        //regular users can't update details
        $this->actingAs($user)->call('PUT', '/secure/users/1/details');
        $response->assertStatus(403);

        //user with permission can update details
        $user->permissions = '{"users.update":1}';
        $response = $this->actingAs($user)->call('PUT', '/secure/users/1/details');
        $response->assertStatus(200);
    }
}

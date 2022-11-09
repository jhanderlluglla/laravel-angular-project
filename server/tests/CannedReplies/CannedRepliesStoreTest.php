<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class CannedRepliesStoreTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_creates_new_canned_reply()
    {
        $user = $this->getAdminUser();
        $uploads = factory(App\Upload::class, 2)->create(['user_id' => $user->id]);

        $payload = [
            'name'    => 'foo',
            'body'    => 'bar',
            'uploads' => [$uploads[0]->file_name, $uploads[1]->file_name, 'foo'],
        ];

        $response = $this->actingAs($user)->call('POST', 'secure/canned-replies', $payload);
        $response->assertStatus(201);
        $data = $response->json()['data'];

        //created canned reply
        $this->assertDatabaseHas('canned_replies', ['name' => 'foo']);
        $this->assertEquals($data['name'], 'foo');
        $this->assertEquals($data['body'], 'bar');

        //only attached uploads that exist
        $this->assertCount(2, $data['uploads']);
        $this->assertContains($data['uploads'][0]['id'], $uploads->pluck('id')->toArray());
        $this->assertContains($data['uploads'][1]['id'], $uploads->pluck('id')->toArray());
    }

    public function it_validates_user_input()
    {
        $response = $this->asAdmin()->json('POST', 'secure/canned-replies', ['uploads' => 55]);
        $response->assertStatus(422);
        $data = $response->json();

        $this->assertArrayHasKey('name', $data['messages']);
        $this->assertArrayHasKey('body', $data['messages']);
        $this->assertArrayHasKey('uploads', $data['messages']);
    }

    public function test_it_checks_permissions()
    {
        //guests can't create canned replies
        $response = $this->call('POST', 'secure/canned-replies');
        $response->assertStatus(403);
    }
}

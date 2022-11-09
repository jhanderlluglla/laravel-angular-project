<?php

use App\User;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class SocialAuthControllerTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_connects_social_account_to_logged_in_user()
    {
        $mock = Mockery::mock('Laravel\Socialite\Contracts\Factory');
        $mock->shouldReceive('with')->once()->with('facebook')->andReturnSelf();
        $mock->shouldReceive('redirect')->once()->andReturnSelf();
        App::instance('Laravel\Socialite\Contracts\Factory', $mock);

        $response = $this->asRegularUser()->call('GET', "secure/auth/social/facebook/connect");
        $response->assertStatus(200);
    }

    public function test_it_disconnects_social_account_from_logged_in_user()
    {
        $user = $this->getRegularUser();
        $user->social_profiles()->create([
            'service_name'    => 'facebook',
            'user_service_id' => 123,
            'user_id'         => $user->id,
            'username'        => 'foo',
        ]);

        $response = $this->actingAs($user)->call('POST', "secure/auth/social/facebook/disconnect");
        $response->assertStatus(200);

        $this->assertCount(0, $user->load('social_profiles')->social_profiles);
    }

    public function test_404_is_thrown_when_logging_in_with_invalid_provider()
    {
        $response = $this->call('GET', "secure/auth/social/test/login");
        $response->assertStatus(404);
    }

    public function test_it_works_when_logging_in_with_valid_provider()
    {
        $mock = Mockery::mock('Laravel\Socialite\Contracts\Factory');
        $mock->shouldReceive('with')->once()->with('facebook')->andReturnSelf();
        $mock->shouldReceive('redirect')->once()->andReturnSelf();
        App::instance('Laravel\Socialite\Contracts\Factory', $mock);

        $response = $this->call('GET', "secure/auth/social/facebook/login");
        $response->assertStatus(200);
    }

    public function test_it_returns_oauth_error_page_when_user_profile_fetching_fails_with_error()
    {
        $mock = Mockery::mock('Laravel\Socialite\Contracts\Factory');
        $mock->shouldReceive('with')->once()->with('facebook')->andReturnSelf();
        $mock->shouldReceive('user')->once()->andThrow(new Exception());
        App::instance('Laravel\Socialite\Contracts\Factory', $mock);

        $response = $this->call('GET', "secure/auth/social/facebook/callback");
        $response->assertStatus(500);
        $this->assertRegexp('/ERROR/', $response->getContent());
    }

    public function test_it_logs_user_in_if_social_profile_is_returned_and_user_is_created_for_that_profile_already()
    {
        $profile = $this->getSocialProfile();

        $user = factory(App\User::class)->create();
        $user->social_profiles()->create(['service_name' => 'facebook', 'user_service_id' => $profile->id, 'username' => 'foo']);

        $this->mockSocialite($profile);

        $response = $this->call('GET', "secure/auth/social/facebook/callback");
        $response->assertStatus(200);

        $this->assertEquals($user->id, Auth::user()->id);
        $this->assertRegexp('/SUCCESS/', $response->getContent());
        $this->assertRegexp("/$user->email/", $response->getContent());
    }

    public function test_it_requests_email_via_extra_credentials_if_it_was_not_returned_with_social_profile()
    {
        $profile = $this->getSocialProfile(true);
        $this->mockSocialite($profile);

        $response = $this->call('GET', "secure/auth/social/facebook/callback");
        $response->assertStatus(200);

        //check if user profile was saved in session
        $this->assertTrue(Session::has('social_profile'));
        $this->assertEquals(Session::get('social_profile')['service'], 'facebook');
        $this->assertEquals(Session::get('social_profile')['profile'], $profile);

        //check if proper response was returned
        $this->assertRegexp('/REQUEST_EXTRA_CREDENTIALS/', $response->getContent());
        $this->assertRegexp('/["email"]/', $response->getContent());
    }

    public function test_it_requests_password_via_extra_credentials_if_user_with_email_returned_by_social_service_already_exists()
    {
        $profile = $this->getSocialProfile();
        factory(App\User::class)->create(['email' => $profile->email]);
        $this->mockSocialite($profile);

        $response = $this->call('GET', "secure/auth/social/facebook/callback");
        $response->assertStatus(200);

        //check if proper response was returned
        $this->assertRegexp('/REQUEST_EXTRA_CREDENTIALS/', $response->getContent());
        $this->assertRegexp('/["password"]/', $response->getContent());
    }

    public function test_social_callback_creates_new_user_and_logs_him_in_if_valid_profile_returned_and_user_is_not_yet_created_and_social_service_returned_unique_id()
    {
        factory(App\Group::class)->create(['default' => 1]);

        $profile = $this->getSocialProfile();
        $this->mockSocialite($profile);

        $response = $this->call('GET', "secure/auth/social/facebook/callback");
        $response->assertStatus(200);
        $this->assertRegexp('/SUCCESS/', $response->getContent());
        $this->assertRegexp("/$profile->email/", $response->getContent());

        //test if users was created successfully and attached to correct social profile
        $user = User::where('email', $profile->email)->with('social_profiles', 'groups')->first();
        $this->assertEquals($user->avatar, $profile->avatar);
        $this->assertContains($profile->id, $user->social_profiles()->get()->pluck('user_service_id'));
        $this->assertTrue($user->groups->first()->default === 1);
    }

    public function test_it_creates_new_user_and_logs_him_in_if_valid_social_profile_is_returned_and_user_is_not_yet_created_and_social_service_did_not_return_unique_id_only_email()
    {
        factory(App\Group::class)->create(['default' => 1]);

        $profile = $this->getSocialProfile();
        $this->mockSocialite($profile);

        //test if users was created successfully and attached to correct social profile, when social profile has no unique id, only email
        $profile->id = null;
        $profile->email = Faker\Factory::create()->email;

        $response = $this->call('GET', "secure/auth/social/facebook/callback");
        $response->assertStatus(200);

        //test if users was created successfully and attached to correct social profile
        $user = User::where('email', $profile->email)->with('social_profiles', 'groups')->first();

        $this->assertContains($profile->email, $user->social_profiles()->get()->pluck('user_service_id'));
        $this->assertTrue($user->groups->first()->default === 1);
    }

    public function test_it_creates_a_new_user_when_all_extra_credentials_supplied_are_valid()
    {
        Session::flush();

        $email = Faker\Factory::create()->email;
        $profile = $this->getSocialProfile(true);
        factory(App\Group::class)->create(['default' => 1]);

        Session::put('social_profile', ['service' => 'twitter', 'profile' => $profile, 'requested_extra_credentials' => ['email']]);

        $response = $this->call('POST', "secure/auth/social/extra-credentials", ['email' => $email]);

        $response->assertStatus(200);

        //test if user was created successfully and attached to correct social profile
        $user = User::where('email', $email)->with('social_profiles', 'groups')->first();
        $this->assertContains($profile->id, $user->social_profiles()->get()->pluck('user_service_id'));
        $this->assertTrue($user->groups->first()->default === 1);
        $this->assertEquals($response->json()['data']['id'], $user->id);
    }

    public function test_it_creates_a_new_user_and_assigns_envato_purchase_codes_automatically_to_user_when_signing_in_with_envato()
    {
        $profile = $this->getSocialProfile();
        $profile->purchases = [
            ['item' => ['id' => 12345, 'name' => 'foo bar'], 'code' => 'foo'],
            ['item' => ['id' => 12345, 'name' => 'foo bar'], 'code' => 'bar'],
        ];
        $this->mockSocialite($profile, 'envato');

        $response = $this->call('GET', "secure/auth/social/envato/callback");
        $response->assertStatus(200);

        //test if users was created successfully and attached to correct social profile
        $user = User::where('email', $profile->email)->with('social_profiles', 'groups')->first();
        $this->assertContains($profile->id, $user->social_profiles()->get()->pluck('user_service_id'));

        //test user was created successfully and no extra credentials were requested
        $this->assertRegexp('/SUCCESS/', $response->getContent());
        $this->assertRegexp("/$profile->email/", $response->getContent());

        //test envato purchase codes were attached to newly created user
        $this->assertCount(2, $user->purchase_codes);
        $this->assertEquals('foo', $user->purchase_codes[0]->code);
        $this->assertEquals('bar', $user->purchase_codes[1]->code);
    }

    public function test_it_returns_error_when_trying_to_connect_accounts_if_specified_password_is_invalid()
    {
        Session::flush();

        $user = factory(App\User::class)->create();

        $profile = $this->getSocialProfile(true);
        Session::put('social_profile', ['service' => 'facebook', 'profile' => $profile, 'requested_extra_credentials' => ['email', 'password']]);
        $this->mockHasher(false);

        $response = $this->call('POST', "secure/auth/social/extra-credentials", ['password' => $user->password, 'email' => $user->email]);

        $response->assertStatus(422);
        $this->assertArrayHasKey('password', $response->json()['messages']);

    }

    public function test_it_returns_error_when_submitting_extra_credentials_and_there_is_no_persisted_data_in_session()
    {
        Session::flush();

        $response = $this->call('POST', "secure/auth/social/extra-credentials");

        $response->assertStatus(422);
    }

    public function test_it_connects_existing_account_with_social_profile_if_specified_credentials_are_valid()
    {
        Session::flush();

        $user = factory(App\User::class)->create(['password' => bcrypt('foo bar')]);
        $profile = $this->getSocialProfile(true);
        $this->mockHasher(true);

        Session::put('social_profile', ['service' => 'twitter', 'profile' => $profile, 'requested_extra_credentials' => ['email', 'password']]);

        $response = $this->call('POST', "secure/auth/social/extra-credentials", ['password' => 'foo bar', 'email' => $user->email]);
        $response->assertStatus(200);

        $this->assertContains($profile->id, $user->social_profiles()->get()->pluck('user_service_id'));
    }

    private function getSocialProfile($skipEmail = false)
    {
        $profile = new stdClass();
        $profile->id = '45645';
        $profile->avatar = 'http://avatar.png';
        $profile->name = Faker\Factory::create()->name;

        if ( ! $skipEmail) {
            $profile->email = Faker\Factory::create()->email;
        }

        return $profile;
    }

    private function mockSocialite($profile = null, $service = 'facebook')
    {
        $mock = Mockery::mock(Laravel\Socialite\Contracts\Factory::class);
        $mock->shouldReceive('with')->once()->with($service)->andReturnSelf();
        $mock->shouldReceive('user')->once()->andReturn($profile);
        App::instance('Laravel\Socialite\Contracts\Factory', $mock);
    }

    private function mockEnvatoApiClient($expectedCode)
    {
        $mock = Mockery::mock(App\Services\Envato\EnvatoApiClient::class);
        $mock->shouldReceive('getPurchaseByCode')->once()->with($expectedCode)->andReturn([
            'item' => ['id' => 12345, 'name' => 'foo bar'],
            'code' => $expectedCode
        ]);
        App::instance(App\Services\Envato\EnvatoApiClient::class, $mock);
    }

    private function mockHasher($response)
    {
        Hash::shouldReceive('check')->andReturn($response);
    }
}

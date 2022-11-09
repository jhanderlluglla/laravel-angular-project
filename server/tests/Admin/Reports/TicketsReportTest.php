<?php

use App\Tag;
use App\Reply;
use App\User;
use App\Group;
use App\Ticket;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketsReportTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_generates_report_for_tickets()
    {
        $createdAt = Carbon::create(2015, 1, 1, 0, 0, 0);
        $user = $this->seedTickets();

        $reportGenerator = App::make('App\Services\Reports\TicketsReport');
        $reportGenerator->setChunkSize(1);
        App::instance('App\Services\Reports\TicketsReport', $reportGenerator);

        $params = [
            'from_year'  => $createdAt->year,
            'from_month' => $createdAt->month,
            'from_day'   => $createdAt->day,
            'to_year'    => $createdAt->year,
            'to_month'   => $createdAt->addMonth()->month,
            'to_day'     => $createdAt->day,
        ];

        $response = $this->asAdmin()->call('GET', 'secure/reports/tickets/range', $params);
        $response->assertStatus(200);
        $response = $response->json();

        $this->assertEquals(5, $response['data']['newTickets']);
        $this->assertEquals(3, $response['data']['solvedTickets']);
        $this->assertEquals(2, $response['data']['openTickets']);

        //first response time
        $this->assertEquals(17.6, $response['data']['firstResponseTimes']['average'], '', 0.1);
        $this->assertEquals(1, $response['data']['firstResponseTimes']['breakdown']['0-8']['count']);
        $this->assertEquals(33.29, $response['data']['firstResponseTimes']['breakdown']['0-8']['percentage'], '', 0.1);
        $this->assertEquals(1, $response['data']['firstResponseTimes']['breakdown']['8-24']['count']);
        $this->assertEquals(33.29, $response['data']['firstResponseTimes']['breakdown']['8-24']['percentage'], '', 0.1);

        $this->assertEquals(7, $response['data']['avgResponseTime'], '', 0.9);

        //daily ticket counts
        $this->assertCount(2, $response['data']['dailyCounts']);
        $this->assertEquals(4, $response['data']['dailyCounts']['1.1']);
        $this->assertEquals(1, $response['data']['dailyCounts']['1.4']);

        //hourly ticket counts
        $this->assertEquals(4, $response['data']['hourlyCounts']['max']);
        $this->assertEquals(4, $response['data']['hourlyCounts']['data'][3]['counts']['0-2']);
        $this->assertEquals(1, $response['data']['hourlyCounts']['data'][6]['counts']['2-4']);

        //tags
        $this->assertArrayHasKey('test1', $response['data']['tags']);
        $this->assertEquals(2, $response['data']['tags']['test1']['count']);
        $this->assertEquals(40, $response['data']['tags']['test1']['percentage']);

        $this->assertArrayHasKey('test2', $response['data']['tags']);
        $this->assertEquals(1, $response['data']['tags']['test2']['count']);
        $this->assertEquals(20, $response['data']['tags']['test2']['percentage']);

        //agents
        $this->assertCount(2, $response['data']['agents']);
        $this->assertEquals($response['data']['agents'][0]['email'], $user->email);
        $this->assertEquals($response['data']['agents'][0]['id'], $user->id);
        $this->assertEquals(3, $response['data']['agents'][0]['replies']);
        $this->assertEquals(3, $response['data']['agents'][0]['ticketsSolved']);
        $this->assertEquals(4.2, $response['data']['agents'][0]['avgResponseTime'], '', 0.1);

        $this->assertEquals($response['data']['agents'][1]['email'], 'agent2@agent.com');
        $this->assertEquals(1, $response['data']['agents'][1]['replies']);
        $this->assertEquals(1, $response['data']['agents'][1]['ticketsSolved']);
        $this->assertEquals(16, $response['data']['agents'][1]['avgResponseTime'], '', 0.1);
    }

    private function seedTickets()
    {
        $createdAt = Carbon::create(2015, 1, 1, 0, 0, 0);

        $closedAt = $createdAt->copy()->addDays(1);
        $createdAtLate = $createdAt->copy()->addMonths(2);
        $closedAtLate = $createdAt->copy()->addMonths(5);

        $openTag = Tag::firstOrCreate(['name' => 'open', 'type' => 'status']);
        $test1Tag = factory(Tag::class)->create(['name' => 'test1', 'type' => 'custom']);
        $test2Tag = factory(Tag::class)->create(['name' => 'test2', 'type' => 'custom']);

        $user1 = $this->getRegularUser();
        $user2 = factory(User::class)->create(['email' => 'agent2@agent.com']);

        $agentGroup = Group::firstOrCreate(['name' => 'agents']);
        $user1->groups()->attach($agentGroup->id);
        $user2->groups()->attach($agentGroup->id);

        Ticket::insert([
            ['subject' => 'test1', 'user_id' => 5, 'created_at' => $createdAt, 'closed_at' => $closedAt, 'closed_by' => $user1->id],
            ['subject' => 'test2', 'user_id' => 5, 'created_at' => $createdAt, 'closed_at' => $closedAt, 'closed_by' => $user1->id],
            ['subject' => 'test3', 'user_id' => 5, 'created_at' => $createdAt, 'closed_at' => $closedAt, 'closed_by' => $user1->id],
            ['subject' => 'test3', 'user_id' => 5, 'created_at' => $createdAt, 'closed_at' => $closedAtLate, 'closed_by' => $user2->id],
            ['subject' => 'test3', 'user_id' => 5, 'created_at' => $createdAt->copy()->addDays(3)->addHours(3), 'closed_at' => null, 'closed_by' => null],
            ['subject' => 'test4', 'user_id' => 5, 'created_at' => $createdAtLate, 'closed_at' => null, 'closed_by' => null],
            ['subject' => 'test5', 'user_id' => 5, 'created_at' => $createdAtLate, 'closed_at' => null, 'closed_by' => $user2->id],
            ['subject' => 'test6', 'user_id' => 5, 'created_at' => $createdAtLate, 'closed_at' => null, 'closed_by' => $user1->id]
        ]);

        $tickets = Ticket::whereIn('subject', ['test1', 'test2', 'test3'])->get();

        Reply::insert([
            ['user_id' => 5, 'ticket_id' => $tickets->first()->id, 'created_at' => $createdAt->copy()->addHours(1), 'body' => 'foo', 'uuid' => str_random()],
            ['user_id' => $user1->id, 'ticket_id' => $tickets->first()->id, 'created_at' => $createdAt->copy()->addHours(8), 'body' => 'foo', 'uuid' => str_random()],
            ['user_id' => 5, 'ticket_id' => $tickets->first()->id, 'created_at' => $createdAt->copy()->addHours(2), 'body' => 'foo', 'uuid' => str_random()],
            ['user_id' => $user1->id, 'ticket_id' => $tickets->first()->id, 'created_at' => $createdAt->copy()->addHours(12), 'body' => 'foo', 'uuid' => str_random()],
            ['user_id' => 5, 'ticket_id' => $tickets->get(1)->id, 'created_at' => $createdAt->copy()->addHours(12), 'body' => 'foo', 'uuid' => str_random()],
            ['user_id' => $user1->id, 'ticket_id' => $tickets->get(1)->id, 'created_at' => $createdAt->copy()->addHours(15), 'body' => 'foo', 'uuid' => str_random()],
            ['user_id' => 5, 'ticket_id' => $tickets->get(2)->id, 'created_at' => $createdAt->copy()->addHours(14), 'body' => 'foo', 'uuid' => str_random()],
            ['user_id' => $user2->id, 'ticket_id' => $tickets->get(2)->id, 'created_at' => $createdAt->copy()->addHours(30), 'body' => 'foo', 'uuid' => str_random()],
        ]);

        $tickets->get(0)->tags()->attach($openTag->id);
        $tickets->get(0)->tags()->attach($test1Tag->id);
        $tickets->get(1)->tags()->attach($openTag->id);
        $tickets->get(1)->tags()->attach($test1Tag->id);
        $tickets->get(1)->tags()->attach($test2Tag->id);

        return $user1;
    }
}

<?php
use Carbon\Carbon;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class TicketModelTest extends TestCase
{
    use DatabaseTransactions;

    public function test_it_orders_replies_relationship_by_created_at_date()
    {
        $ticket  = factory(App\Ticket::class)->create();

        DB::table('replies')->insert([
            ['body' => 'first', 'ticket_id' => $ticket->id, 'user_id' => 1, 'created_at' => Carbon::now(), 'uuid' => str_random()],
            ['body' => 'second', 'ticket_id' => $ticket->id, 'user_id' => 1, 'created_at' => Carbon::now()->addDays(1), 'uuid' => str_random()],
            ['body' => 'third', 'ticket_id' => $ticket->id, 'user_id' => 1, 'created_at' => Carbon::now()->addDays(2), 'uuid' => str_random()]
        ]);

        $this->assertCount(3, $ticket->replies);

        $replies = $ticket->replies->toArray();

        $this->assertEquals('third', $replies[0]['body']);
        $this->assertEquals('second', $replies[1]['body']);
        $this->assertEquals('first', $replies[2]['body']);
    }
}

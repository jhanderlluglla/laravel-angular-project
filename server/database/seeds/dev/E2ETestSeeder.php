<?php

use App\Tag;
use App\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class E2ETestSeeder extends Seeder
{
    private $faker;

    /**
     * E2ETestSeeder constructor.
     */
    public function __construct()
    {
        $this->faker = \Faker\Factory::create();
    }

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        //settings
        App\Setting::firstOrNew(['name' => 'toast.default_timeout'])->fill(['value' => 300])->save();
        App\Setting::firstOrNew(['name' => 'replies.after_reply_action'])->fill(['value' => null])->save();

        //tickets category tags
        $tags = [
            factory(App\Tag::class)->create(['type' => 'category', 'name' => 'foo '.$this->faker->words(5, true)]),
            factory(App\Tag::class)->create(['type' => 'category', 'name' => 'foo '.$this->faker->words(2, true)]),
        ];

        //customer tickets
        $userId = User::where('email', 'admin@tester.com')->first()->id;

        //create some tickets and users with "foo" in the name
        factory(App\Ticket::class, 2)->create(['subject' => $this->faker->words(4, true).' foo', 'user_id' => $userId])->each(function($ticket) use($userId) {
            $reply = factory(App\Reply::class)->make(['user_id' => $userId]);
            $ticket->replies()->save($reply);
            $tag = Tag::where('name', 'open')->first();
            $ticket->tags()->attach($tag->id);
        });
        factory(App\User::class)->create(['email' => 'foo_'.$this->faker->email]);
        factory(App\User::class)->create(['email' => 'foo_'.$this->faker->email]);

        //20 regular tickets
        $tickets = factory(App\Ticket::class, 20)->create(['user_id' => $userId])->each(function($ticket, $index) use($userId) {
            $reply = factory(App\Reply::class)->make(['user_id' => $userId]);
            $ticket->replies()->save($reply);
            $tag = Tag::where('name', ($index < 17 ? 'open' : 'closed'))->first();
            $ticket->tags()->attach($tag->id);
        });

        //put some tickets into category
        $tickets[13]->tags()->attach($tags[0]->id);
        $tickets[14]->tags()->attach($tags[0]->id);

        //ticket with many replies
        $ticket = factory(App\Ticket::class)->create(['user_id' => $userId, 'id' => 999, 'updated_at' => Carbon::now()->addDays(-1)]);
        factory(App\Reply::class, 15)->create(['user_id' => $userId, 'ticket_id' => $ticket->id]);
        $openTag = Tag::where('name', 'open')->first();
        $ticket->tags()->attach($openTag->id);
        $ticket->tags()->attach(factory(App\Tag::class, 2)->create());

        //canned replies
        factory(App\CannedReply::class)->create(['user_id' => $userId, 'name' => 'foo '.$this->faker->sentence()]);
        factory(App\CannedReply::class)->create(['user_id' => $userId, 'name' => $this->faker->sentence()]);
        factory(App\CannedReply::class)->create(['user_id' => $userId, 'name' => $this->faker->sentence()]);

        //parent categories
        $parent1 = factory(App\Category::class)->create(['name' => $tags[0]->name]);
        $parent2 = factory(App\Category::class)->create(['name' => $tags[1]->name]);

        //child
        $child1 = factory(App\Category::class, 3)->create(['parent_id' => $parent1['id']]);
        $child2 = factory(App\Category::class, 3)->create(['parent_id' => $parent2['id']]);

        //articles
        $child1->merge($child2)->merge(collect([$parent1, $parent2]))->each(function($category) {
            $article = $category->articles()->save(factory(App\Article::class)->make(['title' => $this->faker->words(4, true) . ' foo']));
            $category->articles()->save(factory(App\Article::class)->make(['title' => $this->faker->words(4, true) . ' foo']));
            $article->tags()->save(factory(App\Tag::class)->make());
            $category->articles()->save(factory(App\Article::class)->make());
            $category->articles()->save(factory(App\Article::class)->make());
            $category->articles()->save(factory(App\Article::class)->make(['draft' => 1]));
        });
    }
}

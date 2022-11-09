<?php

use App\Group;
use Illuminate\Database\Seeder;

class GroupsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Group::create([
            'name'        => 'guests',
            'permissions' => json_encode($this->getGuestPermissions()),
            'guests' => 1,
        ]);

        Group::create([
            'name'        => 'customers',
            'permissions' => json_encode($this->getCustomerPermissions()),
            'default'     => 1,
        ]);

        Group::create([
            'name'        => 'agents',
            'permissions' => json_encode(
                array_merge($this->getCustomerPermissions(), $this->getAgentPermissions())
            )
        ]);
    }

    /**
     * Get default permissions for customers group.
     *
     * @return array
     */
    private function getCustomerPermissions()
    {
        return [
            'categories.view' => 1,
            'articles.view'   => 1,
            'tags.view'       => 1,
            'tickets.create'  => 1,
            'uploads.create'  => 1,
            'pages.view'      => 1,
        ];
    }

    /**
     * Get default permissions for guests group.
     *
     * @return array
     */
    private function getGuestPermissions()
    {
        return [
            'categories.view' => 1,
            'articles.view'   => 1,
            'tags.view'       => 1,
            'pages.view'      => 1,
        ];
    }

    /**
     * Get default permissions for agents group.
     *
     * @return array
     */
    private function getAgentPermissions()
    {
        return [
            'tickets.view'          => 1,
            'tickets.update'        => 1,
            'tickets.delete'        => 1,
            'replies.view'          => 1,
            'replies.create'        => 1,
            'replies.update'        => 1,
            'replies.delete'        => 1,
            'users.view'            => 1,
            'access.admin'          => 1,
            'canned_replies.view'   => 1,
            'canned_replies.create' => 1,
            'actions.view'          => 1,
            'conditions.view'       => 1,
            'triggers.view'         => 1,
            'triggers.create'       => 1,
        ];
    }
}

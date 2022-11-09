<?php namespace App\Http\Controllers;

use App\Services\Ticketing\HelpScoutImporter;

class TicketingActionsController extends Controller
{
    /**
     * @var HelpScoutImporter
     */
    private $helpScoutImporter;

    /**
     * TicketingActionsController constructor.
     *
     * @param HelpScoutImporter $helpScoutImporter
     */
    public function __construct(HelpScoutImporter $helpScoutImporter)
    {
        $this->middleware('auth.admin');
        $this->helpScoutImporter = $helpScoutImporter;
    }

    /**
     * Import all HelpScout conversations as tickets via their API.
     */
    public function importHelpScoutConversations()
    {
        $this->helpScoutImporter->importConversations();
    }
}

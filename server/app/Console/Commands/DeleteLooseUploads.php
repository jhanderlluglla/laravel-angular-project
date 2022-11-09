<?php namespace App\Console\Commands;

use DB;
use App\Upload;
use Illuminate\Console\Command;

class DeleteLooseUploads extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'uploads:delete_loose';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete uploads that are not attached to any uploadables';

    /**
     * Create a new command instance.
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @param Upload $upload
     */
    public function handle(Upload $upload)
    {
        //get ids of uploads that are not attached to anything
        $ids = $upload->doesntHave('replies')->doesntHave('canned_replies')->pluck('id');

        //detach tags from these uploads
        DB::table('taggables')->whereIn('taggable_id', $ids)->where('taggable_type', Upload::class)->delete();

        //delete these uploads
        $upload->whereIn('id', $ids)->delete();
    }
}

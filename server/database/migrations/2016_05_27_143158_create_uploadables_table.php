<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUploadablesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('uploadables', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('upload_id');
            $table->integer('uploadable_id');
            $table->string('uploadable_type');

            $table->unique(['upload_id', 'uploadable_id', 'uploadable_type']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::drop('uploadables');
    }
}

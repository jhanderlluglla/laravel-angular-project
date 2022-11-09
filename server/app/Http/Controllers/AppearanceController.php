<?php namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\Appearance\AppearanceSaver;
use App\Services\Appearance\AppearanceValues;

class AppearanceController extends Controller {

    /**
     * @var Request
     */
    private $request;

    /**
     * @var AppearanceValues
     */
    private $values;

    /**
     * @var AppearanceSaver
     */
    private $saver;

    /**
     * AppearanceController constructor.
     *
     * @param Request $request
     * @param AppearanceValues $values
     * @param AppearanceSaver $saver
     */
    public function __construct(Request $request, AppearanceValues $values, AppearanceSaver $saver)
	{
        $this->saver = $saver;
        $this->values = $values;
        $this->request = $request;
    }

    /**
     * Save user modifications to site appearance.
     */
    public function save()
    {
        $this->authorize('update', 'AppearancePolicy');

        $this->saver->save($this->request->all());
	}

    /**
     * Get user defined and default values for appearance editor.
     *
     * @return array
     */
    public function getValues()
    {
        $this->authorize('update', 'AppearancePolicy');

        return $this->values->get();
    }
}

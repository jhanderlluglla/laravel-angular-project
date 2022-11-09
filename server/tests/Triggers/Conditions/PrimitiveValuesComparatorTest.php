<?php

use App\Services\Triggers\Conditions\PrimitiveValuesComparator;

class PrimitiveValuesComparatorTest extends TestCase
{
    public function test_it_compares_primitive_values_based_on_specified_operator()
    {
        $comparator = App::make(PrimitiveValuesComparator::class);

        foreach($this->getAllOperators() as $operator) {
            foreach(static::$values[$operator] as $valueBag) {
                $this->assertTrue(
                    $comparator->compare($valueBag['haystack'], $valueBag['pass_needle'], $operator),
                    "should pass: {$valueBag['haystack']} $operator {$valueBag['pass_needle']}"
                );
                $this->assertFalse(
                    $comparator->compare($valueBag['haystack'], $valueBag['fail_needle'], $operator),
                    "should fail: {$valueBag['haystack']} $operator {$valueBag['fail_needle']}"
                );
            }
        }
    }

    private function getAllOperators()
    {
        $seeder = App::make(TriggersTableSeeder::class);

        $primitive = array_filter($seeder->operators, function($operator) {
            return $operator['type'] === 'primitive';
        });

        return array_map(function($operator) {
            return $operator['name'];
        }, $primitive);
    }

    private static $values = [
        'contains' => [
            [
                'haystack'    => 'foo bar baz',
                'pass_needle' => 'bar',
                'fail_needle' => 'qux',
            ],
        ],
        'not_contains' => [
            [
                'haystack'    => 'foo bar baz',
                'pass_needle' => 'qux',
                'fail_needle' => 'bar',
            ],
        ],
        'starts_with' => [
            [
                'haystack'    => 'foo bar baz',
                'pass_needle' => 'foo',
                'fail_needle' => 'bar',
            ],
        ],
        'ends_with' => [
            [
                'haystack'    => 'foo bar baz',
                'pass_needle' => 'baz',
                'fail_needle' => 'bar',
            ],
        ],
        'matches_regex' => [
            [
                'haystack'    => 'foo bar baz',
                'pass_needle' => '.?+bar.?+',
                'fail_needle' => 'qux',
            ],
        ],
        'more' => [
            [
                'haystack'    => 2,
                'pass_needle' => 1,
                'fail_needle' => 3,
            ],
            [
                'haystack'    => 1,
                'pass_needle' => null,
                'fail_needle' => 3,
            ],
        ],
        'less' => [
            [
                'haystack'    => 1,
                'pass_needle' => 2,
                'fail_needle' => 1,
            ],
            [
                'haystack'    => null,
                'pass_needle' => 1,
                'fail_needle' => false,
            ],
        ],
        'equals' => [
            [
                'haystack'    => 1,
                'pass_needle' => 1,
                'fail_needle' => 2,
            ],
            [
                'haystack'    => null,
                'pass_needle' => null,
                'fail_needle' => false,
            ],
            [
                'haystack'    => 'foo',
                'pass_needle' => 'foo',
                'fail_needle' => 'bar',
            ],
            [
                'haystack'    => 1.1,
                'pass_needle' => 1.1,
                'fail_needle' => 1.2,
            ],
        ],
        'not_equals' => [
            [
                'haystack'    => 1,
                'pass_needle' => 2,
                'fail_needle' => 1,
            ],
            [
                'haystack'    => true,
                'pass_needle' => 'foo',
                'fail_needle' => true,
            ],
        ],

        //same as equals and not_equals
        'is'  => [],
        'not' => [],
    ];
}

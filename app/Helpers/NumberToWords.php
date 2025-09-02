<?php

namespace App\Helpers;

class NumberToWords
{
    private static $units = [
        0 => '',
        1 => 'un',
        2 => 'deux',
        3 => 'trois',
        4 => 'quatre',
        5 => 'cinq',
        6 => 'six',
        7 => 'sept',
        8 => 'huit',
        9 => 'neuf',
        10 => 'dix',
        11 => 'onze',
        12 => 'douze',
        13 => 'treize',
        14 => 'quatorze',
        15 => 'quinze',
        16 => 'seize',
        17 => 'dix-sept',
        18 => 'dix-huit',
        19 => 'dix-neuf'
    ];

    private static $tens = [
        2 => 'vingt',
        3 => 'trente',
        4 => 'quarante',
        5 => 'cinquante',
        6 => 'soixante',
        7 => 'soixante',
        8 => 'quatre-vingt',
        9 => 'quatre-vingt'
    ];

    private static $hundreds = [
        1 => 'cent',
        2 => 'deux cents',
        3 => 'trois cents',
        4 => 'quatre cents',
        5 => 'cinq cents',
        6 => 'six cents',
        7 => 'sept cents',
        8 => 'huit cents',
        9 => 'neuf cents'
    ];

    public static function french($number)
    {
        if ($number == 0) {
            return 'zéro';
        }

        if ($number < 0) {
            return 'moins ' . self::french(abs($number));
        }

        $number = number_format($number, 2, '.', '');
        $parts = explode('.', $number);
        $integer = (int)$parts[0];
        $decimal = isset($parts[1]) ? (int)$parts[1] : 0;

        $result = self::convertInteger($integer);

        if ($decimal > 0) {
            $result .= ' et ' . self::convertInteger($decimal) . ' centimes';
        }

        return $result;
    }

    private static function convertInteger($number)
    {
        if ($number == 0) {
            return '';
        }

        if ($number < 20) {
            return self::$units[$number];
        }

        if ($number < 100) {
            $tens = (int)($number / 10);
            $units = $number % 10;

            if ($tens == 7 || $tens == 9) {
                // Soixante-dix, soixante-onze, etc. ou quatre-vingt-dix, quatre-vingt-onze, etc.
                $base = $tens == 7 ? 60 : 80;
                $remainder = $number - $base;
                if ($remainder == 0) {
                    return $tens == 7 ? 'soixante-dix' : 'quatre-vingt-dix';
                }
                return ($tens == 7 ? 'soixante-' : 'quatre-vingt-') . self::convertInteger($remainder);
            }

            $result = self::$tens[$tens];
            if ($units == 0) {
                return $result;
            }

            if ($tens == 8 && $units == 1) {
                return 'quatre-vingt-un';
            }

            if ($units == 1 && $tens != 8) {
                $result .= ' et un';
            } else {
                $result .= '-' . self::$units[$units];
            }

            return $result;
        }

        if ($number < 1000) {
            $hundreds = (int)($number / 100);
            $remainder = $number % 100;

            if ($hundreds == 0) {
                return self::convertInteger($remainder);
            }

            if ($hundreds == 1) {
                $result = 'cent';
            } else {
                $result = self::$hundreds[$hundreds];
            }

            if ($remainder > 0) {
                $result .= ' ' . self::convertInteger($remainder);
            }

            return $result;
        }

        if ($number < 1000000) {
            $thousands = (int)($number / 1000);
            $remainder = $number % 1000;

            if ($thousands == 1) {
                $result = 'mille';
            } else {
                $result = self::convertInteger($thousands) . ' mille';
            }

            if ($remainder > 0) {
                if ($remainder < 100 && $thousands > 1) {
                    $result .= ' ';
                } else {
                    $result .= ' ';
                }
                $result .= self::convertInteger($remainder);
            }

            return $result;
        }

        if ($number < 1000000000) {
            $millions = (int)($number / 1000000);
            $remainder = $number % 1000000;

            if ($millions == 1) {
                $result = 'un million';
            } else {
                $result = self::convertInteger($millions) . ' millions';
            }

            if ($remainder > 0) {
                $result .= ' ' . self::convertInteger($remainder);
            }

            return $result;
        }

        if ($number < 1000000000000) {
            $billions = (int)($number / 1000000000);
            $remainder = $number % 1000000000;

            if ($billions == 1) {
                $result = 'un milliard';
            } else {
                $result = self::convertInteger($billions) . ' milliards';
            }

            if ($remainder > 0) {
                $result .= ' ' . self::convertInteger($remainder);
            }

            return $result;
        }

        return 'nombre trop grand';
    }
}

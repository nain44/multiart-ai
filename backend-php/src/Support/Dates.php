<?php

namespace App\Support;

use DateTime;
use DateTimeZone;

class Dates
{
    public static function iso(?string $value): ?string
    {
        if (!$value) {
            return null;
        }
        return (new DateTime($value, new DateTimeZone('UTC')))->format('Y-m-d\TH:i:s.v\Z');
    }

    public static function todayUtc(): string
    {
        return (new DateTime('now', new DateTimeZone('UTC')))->format('Y-m-d');
    }

    public static function nowUtc(): string
    {
        return (new DateTime('now', new DateTimeZone('UTC')))->format('Y-m-d H:i:s.v');
    }
}

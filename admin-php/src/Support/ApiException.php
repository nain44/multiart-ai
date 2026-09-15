<?php

namespace App\Support;

class ApiException extends \RuntimeException
{
    public int $status;

    public function __construct(string $message, int $status = 500)
    {
        parent::__construct($message);
        $this->status = $status;
    }
}

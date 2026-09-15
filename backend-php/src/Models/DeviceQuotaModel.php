<?php

namespace App\Models;

use App\Database;
use App\Support\Dates;
use App\Support\Id;

class DeviceQuotaModel
{
    /** Finds today's quota row for a device, creating it (count=0) if absent. */
    public static function findOrCreateToday(string $deviceId): array
    {
        $today = Dates::todayUtc();
        $db = Database::connection();

        $stmt = $db->prepare('SELECT * FROM device_quotas WHERE device_id = ? AND `date` = ? LIMIT 1');
        $stmt->execute([$deviceId, $today]);
        $row = $stmt->fetch();
        if ($row) {
            return $row;
        }

        $id = Id::generate();
        try {
            $insert = $db->prepare(
                'INSERT INTO device_quotas (id, device_id, `date`, count) VALUES (?, ?, ?, 0)'
            );
            $insert->execute([$id, $deviceId, $today]);
        } catch (\PDOException $e) {
            // Unique constraint race: another request just created today's row.
            if ($e->getCode() !== '23000') {
                throw $e;
            }
        }

        $stmt->execute([$deviceId, $today]);
        return $stmt->fetch();
    }

    public static function increment(string $id): void
    {
        Database::connection()
            ->prepare('UPDATE device_quotas SET count = count + 1 WHERE id = ?')
            ->execute([$id]);
    }
}

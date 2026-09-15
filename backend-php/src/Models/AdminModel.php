<?php

namespace App\Models;

use App\Database;
use App\Support\Dates;
use App\Support\Id;
use PDO;

class AdminModel
{
    public static function count(): int
    {
        return (int) Database::connection()->query('SELECT COUNT(*) FROM admins')->fetchColumn();
    }

    public static function findByEmail(string $email): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM admins WHERE email = ? LIMIT 1');
        $stmt->execute([strtolower($email)]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function findById(string $id): ?array
    {
        $stmt = Database::connection()->prepare('SELECT * FROM admins WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public static function create(string $email, string $plainPassword, string $name = 'Admin', string $role = 'super'): array
    {
        $id = Id::generate();
        $hash = password_hash($plainPassword, PASSWORD_BCRYPT, ['cost' => 12]);

        $stmt = Database::connection()->prepare(
            'INSERT INTO admins (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
        );
        $stmt->execute([$id, $name, strtolower($email), $hash, $role]);

        return self::findById($id);
    }

    public static function comparePassword(array $admin, string $plainPassword): bool
    {
        return password_verify($plainPassword, $admin['password_hash']);
    }

    public static function toJson(array $admin, bool $includeHash = false): array
    {
        $out = [
            '_id' => $admin['id'],
            'name' => $admin['name'],
            'email' => $admin['email'],
            'role' => $admin['role'],
            'createdAt' => Dates::iso($admin['created_at']),
            'updatedAt' => Dates::iso($admin['updated_at']),
        ];
        if ($includeHash) {
            $out['passwordHash'] = $admin['password_hash'];
        }
        return $out;
    }
}

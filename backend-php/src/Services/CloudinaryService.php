<?php

namespace App\Services;

use RuntimeException;

/**
 * Minimal Cloudinary client (signed upload + destroy) using cURL, so the
 * project doesn't need the full cloudinary/cloudinary_php SDK.
 * Port of backend/src/services/cloudinary.js.
 */
class CloudinaryService
{
    private string $cloudName;
    private string $apiKey;
    private string $apiSecret;

    public function __construct()
    {
        $this->cloudName = $_ENV['CLOUDINARY_CLOUD_NAME'] ?? '';
        $this->apiKey = $_ENV['CLOUDINARY_API_KEY'] ?? '';
        $this->apiSecret = $_ENV['CLOUDINARY_API_SECRET'] ?? '';
    }

    /**
     * Uploads a local file (path to bytes already on disk, e.g. a PHP upload tmp
     * file or a downloaded AI-generated image) to Cloudinary.
     *
     * @return array{secure_url: string, public_id: string}
     */
    public function uploadFile(string $filePath, string $originalName): array
    {
        $timestamp = time();
        $folder = 'MultiArt AI/wallpapers';
        $baseName = preg_replace('/\.[^.]+$/', '', $originalName);
        $publicId = "{$folder}/{$timestamp}-{$baseName}";
        $transformation = 'q_auto,f_jpg';

        $params = [
            'folder' => $folder,
            'public_id' => $publicId,
            'timestamp' => (string) $timestamp,
            'transformation' => $transformation,
        ];

        $signature = $this->sign($params);

        $postFields = array_merge($params, [
            'api_key' => $this->apiKey,
            'signature' => $signature,
            'file' => new \CURLFile($filePath),
        ]);

        return $this->postMultipart('image/upload', $postFields);
    }

    public function destroy(?string $publicId): void
    {
        if (!$publicId) {
            return;
        }

        $timestamp = time();
        $params = [
            'public_id' => $publicId,
            'timestamp' => (string) $timestamp,
        ];
        $signature = $this->sign($params);

        $this->postMultipart('image/destroy', array_merge($params, [
            'api_key' => $this->apiKey,
            'signature' => $signature,
        ]));
    }

    /** Transforms a Cloudinary image URL into a thumbnail URL (zero extra storage). */
    public static function thumbnailUrl(string $originalUrl, int $width = 400, int $height = 700): string
    {
        return str_replace(
            '/upload/',
            "/upload/w_{$width},h_{$height},c_fill,q_auto,f_jpg/",
            $originalUrl
        );
    }

    /** Cloudinary signature: sha1 of sorted "key=value&..." params + api_secret. */
    private function sign(array $params): string
    {
        ksort($params);
        $pairs = [];
        foreach ($params as $key => $value) {
            $pairs[] = "{$key}={$value}";
        }
        $toSign = implode('&', $pairs) . $this->apiSecret;
        return sha1($toSign);
    }

    private function postMultipart(string $endpoint, array $postFields): array
    {
        $url = "https://api.cloudinary.com/v1_1/{$this->cloudName}/{$endpoint}";

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $postFields,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 60,
        ]);

        $response = curl_exec($ch);
        if ($response === false) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new RuntimeException("Cloudinary request failed: {$error}");
        }
        curl_close($ch);

        $decoded = json_decode($response, true);
        if (!is_array($decoded)) {
            throw new RuntimeException('Cloudinary returned an invalid response');
        }
        if (isset($decoded['error'])) {
            throw new RuntimeException('Cloudinary error: ' . ($decoded['error']['message'] ?? 'unknown error'));
        }

        return $decoded;
    }
}

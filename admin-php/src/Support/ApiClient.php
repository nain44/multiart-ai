<?php

namespace App\Support;

/**
 * Thin server-side HTTP client to backend-php's /api/* routes. The admin
 * panel is a backend-for-frontend: browsers only ever talk to this PHP app,
 * which relays authenticated requests to the actual API.
 */
class ApiClient
{
    private string $baseUrl;
    private ?string $token;

    public function __construct(?string $token = null)
    {
        $this->baseUrl = rtrim($_ENV['BACKEND_API_URL'] ?? 'http://localhost:5000', '/');
        $this->token = $token;
    }

    public function get(string $path, array $query = []): array
    {
        $url = $this->baseUrl . $path . ($query ? '?' . http_build_query($query) : '');
        return $this->request('GET', $url);
    }

    public function post(string $path, array $json = []): array
    {
        return $this->request('POST', $this->baseUrl . $path, $json);
    }

    public function put(string $path, array $json = []): array
    {
        return $this->request('PUT', $this->baseUrl . $path, $json);
    }

    public function delete(string $path): array
    {
        return $this->request('DELETE', $this->baseUrl . $path);
    }

    /** Multipart POST (file upload). $fields values starting with '@' are file paths. */
    public function postMultipart(string $path, array $fields): array
    {
        $ch = curl_init($this->baseUrl . $path);
        $headers = [];
        if ($this->token) {
            $headers[] = "Authorization: Bearer {$this->token}";
        }
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $fields,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 120,
        ]);
        return $this->finish($ch);
    }

    private function request(string $method, string $url, ?array $json = null): array
    {
        $ch = curl_init($url);
        $headers = [];
        if ($this->token) {
            $headers[] = "Authorization: Bearer {$this->token}";
        }

        $options = [
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_HTTPHEADER => $headers,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
        ];

        if ($json !== null) {
            $headers[] = 'Content-Type: application/json';
            $options[CURLOPT_HTTPHEADER] = $headers;
            $options[CURLOPT_POSTFIELDS] = json_encode($json);
        }

        curl_setopt_array($ch, $options);
        return $this->finish($ch);
    }

    private function finish($ch): array
    {
        $body = curl_exec($ch);
        if ($body === false) {
            $error = curl_error($ch);
            curl_close($ch);
            throw new ApiException("Could not reach backend: {$error}", 502);
        }
        $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        $decoded = json_decode($body, true);

        if ($status >= 400) {
            $message = is_array($decoded) ? ($decoded['message'] ?? 'Request failed') : 'Request failed';
            throw new ApiException($message, $status);
        }

        return is_array($decoded) ? $decoded : [];
    }
}

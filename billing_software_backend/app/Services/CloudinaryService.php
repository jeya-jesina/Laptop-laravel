<?php

namespace App\Services;

use Cloudinary\Cloudinary;
use Illuminate\Support\Facades\Log;

class CloudinaryService
{
    protected Cloudinary $cloudinary;
    protected bool $configured = false;

    public function __construct()
    {
        $cloudUrl = (string) config('cloudinary.cloud_url');
        if ($cloudUrl !== '' && $cloudUrl !== 'cloudinary://:@') {
            try {
                $this->cloudinary = new Cloudinary($cloudUrl);
                $this->configured = true;
            } catch (\Throwable $e) {
                Log::warning('Cloudinary configuration error: ' . $e->getMessage());
                $this->configured = false;
            }
        }
    }

    public function isConfigured(): bool
    {
        return $this->configured;
    }

    /**
     * Upload a file to Cloudinary and return the secure URL + public id.
     *
     * @param string $filePath Absolute path to the file.
     * @param string $resourceType auto|image|video
     * @param string $folder
     * @return array{url: ?string, public_id: ?string, success: bool, message?: string}
     */
    public function upload(string $filePath, string $resourceType = 'auto', string $folder = 'products'): array
    {
        if (!$this->configured) {
            return [
                'success' => false,
                'url' => null,
                'public_id' => null,
                'message' => 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_KEY and CLOUDINARY_SECRET in .env',
            ];
        }

        if (!file_exists($filePath)) {
            return [
                'success' => false,
                'url' => null,
                'public_id' => null,
                'message' => 'Uploaded file could not be read.',
            ];
        }

        try {
            $options = [
                'folder' => $folder,
                'resource_type' => in_array($resourceType, ['image', 'video', 'raw'], true) ? $resourceType : 'auto',
                'overwrite' => true,
            ];

            $result = $this->cloudinary->uploadApi()->upload($filePath, $options);

            return [
                'success' => true,
                'url' => $result['secure_url'] ?? $result['url'] ?? null,
                'public_id' => $result['public_id'] ?? null,
                'message' => 'Uploaded successfully.',
            ];
        } catch (\Throwable $e) {
            Log::error('Cloudinary upload failed: ' . $e->getMessage());
            return [
                'success' => false,
                'url' => null,
                'public_id' => null,
                'message' => 'Cloudinary upload failed: ' . $e->getMessage(),
            ];
        }
    }
}

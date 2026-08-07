<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CloudinaryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MediaController extends Controller
{
    protected CloudinaryService $cloudinary;

    public function __construct(CloudinaryService $cloudinary)
    {
        $this->cloudinary = $cloudinary;
    }

    /**
     * POST /api/media/upload
     * Accepts multipart file ("file") and optional "type" (image|video|auto) + "folder".
     * Uploads to Cloudinary and returns the secure URL.
     */
    public function upload(Request $request)
    {
        $type = trim($request->input('type', 'image'));
        $folder = trim($request->input('folder', 'products'));
        $folder = preg_replace('/[^a-zA-Z0-9_-]/', '', $folder) ?: 'products';

        $rules = ['file' => 'required'];
        $messages = [];

        if ($type === 'video') {
            $rules['file'] = 'required|file|mimetypes:video/mp4,video/webm,video/quicktime,video/x-matroska,video/mpeg,video/avi|max:51200';
            $messages['file.mimetypes'] = 'Only video files are allowed (mp4, webm, mov, mkv, avi).';
            $messages['file.max'] = 'Video must not exceed 50MB.';
        } elseif ($type === 'image') {
            $rules['file'] = 'required|file|mimetypes:image/jpeg,image/png,image/webp,image/gif,image/bmp|max:5120';
            $messages['file.mimetypes'] = 'Only image files are allowed (jpg, png, webp, gif, bmp).';
            $messages['file.max'] = 'Image must not exceed 5MB.';
        }

        $validator = Validator::make($request->all(), $rules, $messages);
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $file = $request->file('file');
        $resourceType = $type === 'video' ? 'video' : 'image';

        $result = $this->cloudinary->upload($file->getRealPath(), $resourceType, $folder);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['message'] ?? 'Upload failed.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Uploaded successfully.',
            'data' => [
                'url' => $result['url'],
                'secure_url' => $result['url'],
                'public_id' => $result['public_id'],
                'type' => $resourceType,
            ],
        ]);
    }
}

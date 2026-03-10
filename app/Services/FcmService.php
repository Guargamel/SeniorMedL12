<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * FcmService — sends push notifications via Firebase Cloud Messaging HTTP v1 API.
 *
 * SETUP:
 *   1. Go to Firebase Console → Project Settings → Service Accounts
 *   2. Click "Generate new private key" — download the JSON file
 *   3. Save it as:  storage/app/firebase-service-account.json
 *   4. Add to .env:
 *        FIREBASE_PROJECT_ID=your-project-id
 *        FIREBASE_CREDENTIALS=storage/app/firebase-service-account.json
 */
class FcmService
{
    private string $projectId;
    private string $credentialsPath;

    public function __construct()
    {
        $this->projectId       = config('services.firebase.project_id', '');
        $this->credentialsPath = base_path(config('services.firebase.credentials', 'storage/app/firebase-service-account.json'));
    }

    /**
     * Send a push notification to a single device token.
     */
    public function sendToDevice(
        string $fcmToken,
        string $title,
        string $body,
        array  $data = []
    ): bool {
        try {
            $accessToken = $this->getAccessToken();

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'Content-Type'  => 'application/json',
            ])->post(
                "https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send",
                [
                    'message' => [
                        'token'        => $fcmToken,
                        'notification' => ['title' => $title, 'body' => $body],
                        'data'         => array_map('strval', array_merge($data, [
                            'title'        => $title,
                            'body'         => $body,
                            'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                        ])),
                        'android' => [
                            'priority'     => 'high',
                            'notification' => [
                                'channel_id'              => 'seniormed_requests',
                                'default_sound'           => true,
                                'default_vibrate_timings' => true,
                            ],
                        ],
                        'apns' => [
                            'payload' => [
                                'aps' => [
                                    'alert' => ['title' => $title, 'body' => $body],
                                    'sound' => 'default',
                                    'badge' => 1,
                                ],
                            ],
                        ],
                    ],
                ]
            );

            if ($response->successful()) {
                return true;
            }

            Log::warning('[FCM] Send failed', [
                'status'   => $response->status(),
                'response' => $response->json(),
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('[FCM] Exception: ' . $e->getMessage());
            return false;
        }
    }

    private function getAccessToken(): string
    {
        if (!file_exists($this->credentialsPath)) {
            throw new \RuntimeException(
                "Firebase service account not found at: {$this->credentialsPath}. " .
                "Download from Firebase Console > Project Settings > Service Accounts."
            );
        }

        $credentials  = json_decode(file_get_contents($this->credentialsPath), true);
        $now          = time();
        $header       = rtrim(strtr(base64_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT'])), '+/', '-_'), '=');
        $payload      = rtrim(strtr(base64_encode(json_encode([
            'iss'   => $credentials['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.messaging',
            'aud'   => 'https://oauth2.googleapis.com/token',
            'iat'   => $now,
            'exp'   => $now + 3600,
        ])), '+/', '-_'), '=');

        $signingInput = "$header.$payload";
        openssl_sign($signingInput, $signature, $credentials['private_key'], OPENSSL_ALGO_SHA256);
        $sig = rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
        $jwt = "$signingInput.$sig";

        $resp = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion'  => $jwt,
        ]);

        if (!$resp->successful()) {
            throw new \RuntimeException('Failed to get FCM access token: ' . $resp->body());
        }

        return $resp->json('access_token');
    }
}

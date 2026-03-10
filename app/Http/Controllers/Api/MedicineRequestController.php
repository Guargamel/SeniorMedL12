<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicineRequest;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Services\FcmService;

class MedicineRequestController extends Controller
{
    /**
     * Display a listing of medicine requests
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            if ($user->hasRole('senior-citizen')) {
                $requests = MedicineRequest::with(['medicine', 'reviewer'])
                    ->where('user_id', $user->id)
                    ->orderByDesc('created_at')
                    ->get();
            } else {
                $requests = MedicineRequest::with(['medicine', 'user.seniorProfile', 'reviewer'])
                    ->orderByDesc('created_at')
                    ->get();
            }

            // ✅ return consistent shape for Flutter
            return response()->json([
                'data' => $requests
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch medicine requests: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch requests',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new medicine request (Senior Citizens only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicine_id'        => ['required', 'integer', 'exists:medicines,id'],
            'quantity'           => ['required', 'integer', 'min:1'],
            'reason'             => ['nullable', 'string'],
            'prescription_path'  => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ], [
            'prescription_path.required' => 'A prescription image is required. Please upload a clear photo of your prescription.',
        ]);

        $path = $request->file('prescription_path')->store('prescriptions', 'public');

        $req = MedicineRequest::create([
            'user_id' => auth()->id(),
            'medicine_id' => $validated['medicine_id'],
            'quantity' => $validated['quantity'],
            'reason' => $validated['reason'] ?? null,
            'prescription_path' => $path,
            'status' => 'pending',
        ]);

        $req->load('medicine', 'reviewer');

        return response()->json([
            'data' => $req
        ], 201);
    }

    /**
     * Display a specific medicine request
     */
    public function show($id)
    {
        try {
            $user = Auth::user();

            $mr = MedicineRequest::with(['medicine', 'user.seniorProfile', 'reviewer'])
                ->findOrFail($id);

            if ($user->hasRole('senior-citizen') && $mr->user_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            return response()->json(['data' => $mr]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch medicine request: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to fetch request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Review a medicine request (Staff/Super-Admin only)
     */
    public function review(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:approved,declined',
                // ✅ your DB column is notes
                'notes' => 'nullable|string|max:2000',
                // ✅ accept old key too (optional)
                'review_notes' => 'nullable|string|max:2000',
            ]);

            $mr = MedicineRequest::findOrFail($id);

            if ($mr->status !== 'pending') {
                return response()->json([
                    'message' => 'This request has already been reviewed'
                ], 400);
            }

            $reason = $validated['notes']
                ?? $validated['review_notes']
                ?? null;

            $mr->update([
                'status' => $validated['status'],
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
                'notes' => $reason, // ✅ store admin reason here
            ]);

            $mr->load('medicine', 'user', 'reviewer'); // user loaded so fcm_token available for push

            try {
                $this->notifySeniorCitizen($mr);
            } catch (\Exception $e) {
                Log::error('Failed to send notification: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Request ' . $validated['status'] . ' successfully',
                'data' => $mr
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to review request: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to review request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a medicine request (only pending requests by the requester)
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $mr = MedicineRequest::findOrFail($id);

            $isAdminOrStaff = $user->hasAnyRole(['super-admin', 'staff']);

            // Seniors can only delete their own pending requests
            if (!$isAdminOrStaff) {
                if ($mr->user_id !== $user->id) {
                    return response()->json(['message' => 'Unauthorized'], 403);
                }
                if ($mr->status !== 'pending') {
                    return response()->json(['message' => 'Cannot delete reviewed requests'], 400);
                }
            }

            // Always clean up prescription image from storage
            if ($mr->prescription_path && Storage::disk('public')->exists($mr->prescription_path)) {
                Storage::disk('public')->delete($mr->prescription_path);
            }

            $mr->delete();

            return response()->json(['message' => 'Request deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete request: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function pendingCount()
    {
        try {
            $count = MedicineRequest::where('status', 'pending')->count();
            return response()->json(['count' => $count]);
        } catch (\Exception $e) {
            Log::error('Failed to get pending count: ' . $e->getMessage());
            return response()->json(['count' => 0]);
        }
    }

    private function notifySeniorCitizen(MedicineRequest $mr)
    {
        if ($mr->status === 'approved') {
            $title   = '✅ Request Approved – Claim Your Medicine';
            $message = 'Your request for ' . $mr->medicine->generic_name . ' has been APPROVED. '
                . 'Please proceed to the Barangay Health Center. '
                . 'Operating hours: Monday to Saturday, 8:00 AM – 5:00 PM. '
                . 'Bring a valid ID. Thank you!';
        } else {
            $title   = '❌ Request Declined';
            $reason  = $mr->notes ? ' Reason: ' . $mr->notes : '';
            $message = 'Your request for ' . $mr->medicine->generic_name . ' has been declined.' . $reason;
        }

        // 1. Save in-app notification (for the Notifications tab)
        Notification::create([
            'user_id'          => $mr->user_id,
            // Required by Laravel's built-in notifications table structure
            'notifiable_type'  => User::class,
            'notifiable_id'    => $mr->user_id,
            'type'             => 'request_' . $mr->status,
            'title'            => $title,
            'message'          => $message,
            'data'             => json_encode([
                'request_id'      => $mr->id,
                'medicine_name'   => $mr->medicine->generic_name,
                'status'          => $mr->status,
                'notes'           => $mr->notes,
                'pickup_schedule' => $mr->status === 'approved'
                    ? 'Monday – Saturday, 8:00 AM to 5:00 PM'
                    : null,
            ]),
            'read_at'          => null,
        ]);

        // 2. Send FCM push notification to the senior's device
        //    This fires even when the app is fully closed (true background push).
        $fcmToken = $mr->user->fcm_token ?? null;
        if ($fcmToken) {
            try {
                $fcm = new FcmService();
                $fcm->sendToDevice(
                    fcmToken: $fcmToken,
                    title:    $title,
                    body:     $message,
                    data:     [
                        'request_id'    => (string) $mr->id,
                        'medicine_name' => $mr->medicine->generic_name,
                        'status'        => $mr->status,
                    ]
                );
            } catch (\Exception $e) {
                // Non-fatal: in-app notification was already saved above
                Log::warning('[FCM] Push delivery failed for user ' . $mr->user_id . ': ' . $e->getMessage());
            }
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicineRequest;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class MedicineRequestController extends Controller
{
    /**
     * Display a listing of medicine requests
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            // If senior citizen, show only their requests
            if ($user->hasRole('senior-citizen')) {
                $requests = MedicineRequest::with(['medicine', 'reviewer'])
                    ->where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                // Staff and super-admin see all requests
                $requests = MedicineRequest::with(['medicine', 'user.seniorProfile', 'reviewer'])
                    ->orderBy('created_at', 'desc')
                    ->get();
            }

            return response()->json($requests);
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
            'medicine_id'   => ['required', 'integer', 'exists:medicines,id'],
            'quantity'      => ['required', 'integer', 'min:1'],
            'reason'        => ['nullable', 'string'],
            'prescription_path'  => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'], // 4MB
        ]);

        $path = null;
        if ($request->hasFile('prescription_path')) {
            // stores under storage/app/public/prescriptions/...
            $path = $request->file('prescription_path')->store('prescriptions', 'public');
        }

        $req = MedicineRequest::create([
            'user_id' => auth()->id(),
            'medicine_id' => $validated['medicine_id'],
            'quantity' => $validated['quantity'],
            'reason' => $validated['reason'] ?? null,
            'prescription_path' => $path,
            'status' => 'pending',
        ]);

        // optional: include a URL right away
        $req->prescription_url = $req->prescription_path
            ? asset('storage/' . $req->prescription_path)
            : null;

        return response()->json($req, 201);
    }

    /**
     * Display a specific medicine request
     */
    public function show($id)
    {
        try {
            $user = Auth::user();

            $request = MedicineRequest::with(['medicine', 'user.seniorProfile', 'reviewer'])->findOrFail($id);

            // Senior citizens can only view their own requests
            if ($user->hasRole('senior-citizen') && $request->user_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            return response()->json($request);
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
                'review_notes' => 'nullable|string|max:500'
            ]);

            $medicineRequest = MedicineRequest::findOrFail($id);

            // Check if already reviewed
            if ($medicineRequest->status !== 'pending') {
                return response()->json([
                    'message' => 'This request has already been reviewed'
                ], 400);
            }

            // Update the request
            $medicineRequest->update([
                'status' => $validated['status'],
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
                'review_notes' => $validated['review_notes'] ?? null
            ]);

            // Load relationships
            $medicineRequest->load('medicine', 'user', 'reviewer');

            // Notify the senior citizen about the decision
            try {
                $this->notifySeniorCitizen($medicineRequest);
            } catch (\Exception $e) {
                Log::error('Failed to send notification: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Request ' . $validated['status'] . ' successfully',
                'request' => $medicineRequest
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
            $request = MedicineRequest::findOrFail($id);

            // Only allow deletion of own pending requests
            if ($request->user_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            if ($request->status !== 'pending') {
                return response()->json(['message' => 'Cannot delete reviewed requests'], 400);
            }

            $request->delete();

            return response()->json(['message' => 'Request deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Failed to delete request: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pending requests count
     */
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

    /**
     * Notify staff and super-admins about new request
     */
    private function notifyStaffAndAdmins($medicineRequest)
    {
        // Get staff and super-admins using proper Spatie query
        $staffAndAdmins = User::whereHas('roles', function ($query) {
            $query->whereIn('name', ['staff', 'super-admin']);
        })->get();

        foreach ($staffAndAdmins as $staff) {
            Notification::create([
                'user_id' => $staff->id,
                'type' => 'medicine_request',
                'title' => 'New Medicine Request',
                'message' => $medicineRequest->user->name . ' requested ' .
                    $medicineRequest->quantity . ' units of ' .
                    $medicineRequest->medicine->generic_name,
                'data' => json_encode([
                    'request_id' => $medicineRequest->id,
                    'medicine_name' => $medicineRequest->medicine->generic_name,
                    'quantity' => $medicineRequest->quantity
                ]),
                'read_at' => null
            ]);
        }
    }

    /**
     * Notify senior citizen about request decision
     */
    private function notifySeniorCitizen($medicineRequest)
    {
        Notification::create([
            'user_id' => $medicineRequest->user_id,
            'type' => 'request_' . $medicineRequest->status,
            'title' => 'Request ' . ucfirst($medicineRequest->status),
            'message' => 'Your request for ' . $medicineRequest->medicine->generic_name .
                ' has been ' . $medicineRequest->status,
            'data' => json_encode([
                'request_id' => $medicineRequest->id,
                'medicine_name' => $medicineRequest->medicine->generic_name,
                'status' => $medicineRequest->status,
                'review_notes' => $medicineRequest->review_notes
            ]),
            'read_at' => null
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicineRequest;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MedicineRequestController extends Controller
{
    /**
     * Display a listing of medicine requests
     */
    public function index(Request $request)
    {
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
    }

    /**
     * Store a new medicine request (Senior Citizens only)
     */
    // In app/Http/Controllers/Api/MedicineRequestController.php

    public function store(Request $request)
    {
        try {
            $user = Auth::user();

            // If user is not authenticated, return an error
            if (!$user) {
                return response()->json(['error' => 'User not authenticated'], 401);
            }

            // Validate the incoming data
            $validated = $request->validate([
                'medicine_id' => 'required|exists:medicines,id',
                'quantity' => 'required|integer|min:1',
                'reason' => 'nullable|string|max:500'
            ]);

            // Create the request in the database
            $medicineRequest = MedicineRequest::create([
                'user_id' => $user->id, // Assuming 'user_id' is the requester of the medicine
                'medicine_id' => $validated['medicine_id'],
                'quantity' => $validated['quantity'],
                'reason' => $validated['reason'] ?? null,
                'status' => 'pending' // Default status
            ]);

            // Load the relationships
            $medicineRequest->load('medicine', 'user');

            // Now notify staff and admin about this request
            $this->notifyStaffAndAdmins($medicineRequest);

            return response()->json([
                'message' => 'Medicine request submitted successfully',
                'request' => $medicineRequest
            ], 201);
        } catch (\Exception $e) {
            // Handle any errors
            return response()->json(['error' => 'An unexpected error occurred'], 500);
        }
    }
    public function notifyStaffAndAdmins($medicineRequest)
    {
        $staffAndAdmins = User::role(['staff', 'super-admin'])->get();

        foreach ($staffAndAdmins as $staff) {
            Notification::create([
                'user_id' => $staff->id,
                'type' => 'medicine_request',
                'title' => 'New Medicine Request',
                'message' => $medicineRequest->user->name . ' requested ' . $medicineRequest->quantity . ' units of ' . $medicineRequest->medicine->generic_name,
                'data' => json_encode([
                    'request_id' => $medicineRequest->id,
                    'medicine_name' => $medicineRequest->medicine->generic_name,
                    'quantity' => $medicineRequest->quantity
                ]),
                'read_at' => null,
                'notifiable_type' => 'MedicineRequest',
                'notifiable_id' => $medicineRequest->id,
            ]);
        }
    }



    /**
     * Display a specific medicine request
     */
    public function show($id)
    {
        $user = Auth::user();

        $request = MedicineRequest::with(['medicine', 'user.seniorProfile', 'reviewer'])->findOrFail($id);

        // Senior citizens can only view their own requests
        if ($user->hasRole('senior-citizen') && $request->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($request);
    }

    /**
     * Review a medicine request (Staff/Super-Admin only)
     */
    public function review(Request $request, $id)
    {
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
        $this->notifySeniorCitizen($medicineRequest);

        return response()->json([
            'message' => 'Request ' . $validated['status'] . ' successfully',
            'request' => $medicineRequest
        ]);
    }

    /**
     * Delete a medicine request (only pending requests by the requester)
     */
    public function destroy($id)
    {
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
    }

    /**
     * Get pending requests count
     */
    public function pendingCount()
    {
        $count = MedicineRequest::where('status', 'pending')->count();
        return response()->json(['count' => $count]);
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

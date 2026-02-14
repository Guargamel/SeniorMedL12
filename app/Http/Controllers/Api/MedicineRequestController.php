<?php

use Illuminate\Routing\Controller;

class MedicineRequestController extends Controller
{
    // Method for storing the new medicine request
    public function store(Request $request)
    {
        $validated = $request->validate([
            'medicine_id' => 'required|exists:medicines,id',
            'quantity' => 'required|integer|min:1',
            'reason' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();

        // Create the new medicine request
        $medicineRequest = MedicineRequest::create([
            'user_id' => $user->id,
            'medicine_id' => $validated['medicine_id'],
            'quantity' => $validated['quantity'],
            'reason' => $validated['reason'] ?? null,
            'status' => 'pending',
        ]);

        // Load relationships
        $medicineRequest->load('medicine', 'user');

        // Notify staff and admins about the new medicine request
        $this->notifyStaffAndAdmins($medicineRequest);

        return response()->json([
            'message' => 'Medicine request submitted successfully',
            'request' => $medicineRequest
        ], 201);
    }

    // This method will be responsible for notifying the staff and admins about the new medicine request
    private function notifyStaffAndAdmins($medicineRequest)
    {
        // Retrieve the staff and admin users
        $staffAndAdmins = User::role(['staff', 'super-admin'])->get();

        // Loop through each staff/admin to send notifications
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
                'read_at' => null,
                'notifiable_type' => 'App\Models\MedicineRequest', // The model being notified
                'notifiable_id' => $medicineRequest->id, // The ID of the requested medicine
            ]);
        }
    }
}

<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    /**
     * Get all notifications for current user
     */
    public function index(Request $request): JsonResponse
    {
        $query = Notification::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at');

        // Filter by read/unread
        if ($request->has('unread') && $request->boolean('unread')) {
            $query->unread();
        }

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        $notifications = $query->paginate(20);

        return response()->json($notifications);
    }

    /**
     * Get unread count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = Notification::query()
            ->where('user_id', $request->user()->id)
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($id): JsonResponse
    {
        $notification = Notification::findOrFail($id);
        
        // Ensure user owns this notification
        if ($notification->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read',
            'notification' => $notification
        ]);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::query()
            ->where('user_id', $request->user()->id)
            ->unread()
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Delete notification
     */
    public function destroy($id): JsonResponse
    {
        $notification = Notification::findOrFail($id);
        
        // Ensure user owns this notification
        if ($notification->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }

    /**
     * Create system notification (for admins)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'type' => ['required', 'string', 'in:info,warning,danger,success,expiry,low_stock,distribution'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'data' => ['nullable', 'array'],
            'priority' => ['nullable', 'in:low,normal,high'],
        ]);

        // If no user_id, send to all users
        if (!isset($validated['user_id'])) {
            $users = \App\Models\User::all();
            $notifications = [];
            
            foreach ($users as $user) {
                $notifications[] = Notification::create([
                    'user_id' => $user->id,
                    'type' => $validated['type'],
                    'title' => $validated['title'],
                    'message' => $validated['message'],
                    'data' => $validated['data'] ?? null,
                    'priority' => $validated['priority'] ?? 'normal',
                ]);
            }

            return response()->json([
                'message' => 'Broadcast notification sent',
                'count' => count($notifications)
            ], 201);
        }

        $notification = Notification::create($validated);

        return response()->json([
            'message' => 'Notification created',
            'notification' => $notification
        ], 201);
    }
}

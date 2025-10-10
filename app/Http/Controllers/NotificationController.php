<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use App\Models\AppNotification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['notifications' => []]);
        }

        // Get Laravel standard notifications
        $laravelNotifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                    'updated_at' => $notification->updated_at,
                ];
            });

        // Get custom App notifications
        $appNotifications = AppNotification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($notification) {
                return [
                    'id' => 'app_' . $notification->id, // Prefix to avoid conflicts
                    'type' => $notification->type,
                    'data' => [
                        'type' => $notification->type,
                        'title' => $notification->title,
                        'message' => $notification->message,
                        ...$notification->data
                    ],
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                    'updated_at' => $notification->updated_at,
                ];
            });

        // Merge and sort by creation date
        $allNotifications = $laravelNotifications->concat($appNotifications)
            ->sortByDesc('created_at')
            ->values();

        return response()->json(['data' => $allNotifications]);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['count' => 0]);
        }

        // Count Laravel standard notifications
        $laravelCount = $user->unreadNotifications()->count();

        // Count custom App notifications
        $appCount = AppNotification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json(['count' => $laravelCount + $appCount]);
    }

    public function markRead(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false], 401);
        }

        // Handle App notifications (prefixed with 'app_')
        if (str_starts_with($id, 'app_')) {
            $appId = substr($id, 4); // Remove 'app_' prefix
            $notification = AppNotification::where('user_id', $user->id)
                ->where('id', $appId)
                ->first();

            if ($notification) {
                $notification->update(['read_at' => now()]);
                return response()->json(['success' => true]);
            }
        } else {
            // Handle Laravel standard notifications
            $notification = $user->notifications()->find($id);

            if ($notification) {
                $notification->markAsRead();
                return response()->json(['success' => true]);
            }
        }

        return response()->json(['success' => false], 404);
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false], 401);
        }

        // Mark Laravel standard notifications as read
        $user->unreadNotifications()->update(['read_at' => now()]);

        // Mark App notifications as read
        AppNotification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function checkDueDates(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false], 401);
        }

        try {
            // Trigger due date check for the authenticated user
            $overdueNotifications = \App\Services\NotificationService::checkDueDates($user->id);
            $upcomingNotifications = \App\Services\NotificationService::checkUpcomingDueDates($user->id);

            $totalNotifications = count($overdueNotifications) + count($upcomingNotifications);

            return response()->json([
                'success' => true,
                'overdue_count' => count($overdueNotifications),
                'upcoming_count' => count($upcomingNotifications),
                'total_count' => $totalNotifications
            ]);
        } catch (\Exception $e) {
            \Log::error("Error checking due dates via API: " . $e->getMessage());
            return response()->json(['success' => false, 'error' => 'Failed to check due dates'], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false], 401);
        }

        // Handle App notifications (prefixed with 'app_')
        if (str_starts_with($id, 'app_')) {
            $appId = substr($id, 4); // Remove 'app_' prefix
            $notification = AppNotification::where('user_id', $user->id)
                ->where('id', $appId)
                ->first();

            if ($notification) {
                $notification->delete();
                return response()->json(['success' => true]);
            }
        } else {
            // Handle Laravel standard notifications
            $notification = $user->notifications()->find($id);

            if ($notification) {
                $notification->delete();
                return response()->json(['success' => true]);
            }
        }

        return response()->json(['success' => false], 404);
    }
}



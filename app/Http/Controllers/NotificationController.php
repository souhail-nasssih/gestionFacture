<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['notifications' => []]);
        }

        $notifications = $user->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    public function unreadCount(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['count' => 0]);
        }

        $count = $user->unreadNotifications()->count();
        return response()->json(['count' => $count]);
    }

    public function markRead(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false], 401);
        }

        $notification = $user->notifications()->find($id);

        if ($notification) {
            $notification->markAsRead();
            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false], 404);
    }

    public function markAllRead(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false], 401);
        }

        $user->unreadNotifications()->update(['read_at' => now()]);
        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false], 401);
        }

        $notification = $user->notifications()->find($id);

        if ($notification) {
            $notification->delete();
            return response()->json(['success' => true]);
        }

        return response()->json(['success' => false], 404);
    }
}



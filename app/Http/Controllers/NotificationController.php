<?php

namespace App\Http\Controllers;

use App\Models\AppNotification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = AppNotification::query()
            ->when($request->boolean('only_unread'), fn($q)=> $q->whereNull('read_at'))
            ->orderBy('created_at', 'desc');

        if ($request->user()) {
            $query->where(function($q) use ($request) {
                $q->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            });
        }

        return response()->json($query->paginate(20));
    }

    public function unreadCount(Request $request)
    {
        $query = AppNotification::query()->whereNull('read_at');
        if ($request->user()) {
            $query->where(function($q) use ($request) {
                $q->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            });
        }
        return response()->json(['count' => $query->count()]);
    }

    public function markRead(AppNotification $notification)
    {
        $notification->update(['read_at' => now()]);
        return response()->json(['success' => true]);
    }

    public function markAllRead(Request $request)
    {
        $query = AppNotification::query()->whereNull('read_at');
        if ($request->user()) {
            $query->where(function($q) use ($request) {
                $q->whereNull('user_id')->orWhere('user_id', $request->user()->id);
            });
        }
        $query->update(['read_at' => now()]);
        return response()->json(['success' => true]);
    }
}



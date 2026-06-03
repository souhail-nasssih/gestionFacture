<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notifications
    ) {}

    public function index(Request $request): JsonResponse
    {
        $items = $this->notifications->listForUser($request->user());

        return response()->json([
            'notifications' => $items->map(fn ($n) => $this->format($n)),
            'unread_count' => $this->notifications->unreadCount($request->user()),
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'count' => $this->notifications->unreadCount($request->user()),
        ]);
    }

    public function markRead(Request $request, int $id): JsonResponse
    {
        $ok = $this->notifications->markAsRead($request->user(), $id);

        return response()->json([
            'success' => $ok,
            'unread_count' => $this->notifications->unreadCount($request->user()),
        ]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $updated = $this->notifications->markAllAsRead($request->user());

        return response()->json([
            'updated' => $updated,
            'unread_count' => 0,
        ]);
    }

    public function checkDueDates(Request $request): JsonResponse
    {
        $created = $this->notifications->checkDueDates();

        return response()->json([
            'created' => $created,
            'unread_count' => $this->notifications->unreadCount($request->user()),
            'notifications' => $this->notifications->listForUser($request->user())
                ->map(fn ($n) => $this->format($n)),
        ]);
    }

    protected function format($notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'title' => $notification->title,
            'message' => $notification->message,
            'data' => $notification->data,
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at->toIso8601String(),
        ];
    }
}

<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\NotificationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Check for expired due dates after successful login
        $this->checkDueDatesOnLogin();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Check for expired due dates and send notifications after login
     */
    private function checkDueDatesOnLogin(): void
    {
        try {
            $user = Auth::user();
            if ($user) {
                // Check for overdue invoices and send notifications
                $overdueNotifications = NotificationService::checkDueDates($user->id);

                // Check for upcoming due dates (optional - you can remove this if not needed)
                $upcomingNotifications = NotificationService::checkUpcomingDueDates($user->id);

                // Log the check (optional)
                \Log::info("Due date check on login for user {$user->id}: " .
                    count($overdueNotifications) . " overdue, " .
                    count($upcomingNotifications) . " upcoming notifications");
            }
        } catch (\Exception $e) {
            // Log error but don't break the login process
            \Log::error("Error checking due dates on login: " . $e->getMessage());
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}

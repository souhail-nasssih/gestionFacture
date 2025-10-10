<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        event(new Registered($user));

        Auth::login($user);

        // Check for expired due dates after successful registration
        $this->checkDueDatesOnLogin();

        return redirect(route('dashboard', absolute: false));
    }

    /**
     * Check for expired due dates and send notifications after login/registration
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
                \Log::info("Due date check on registration for user {$user->id}: " .
                    count($overdueNotifications) . " overdue, " .
                    count($upcomingNotifications) . " upcoming notifications");
            }
        } catch (\Exception $e) {
            // Log error but don't break the registration process
            \Log::error("Error checking due dates on registration: " . $e->getMessage());
        }
    }
}

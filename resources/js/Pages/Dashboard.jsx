import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout >
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card 1 */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Revenue</h3>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                            +12.5%
                        </span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">$45,231</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">vs. $40,230 last month</p>
                </div>

                {/* Card 2 */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Users</h3>
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            +8.2%
                        </span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">1,234</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">vs. 1,140 last month</p>
                </div>

                {/* Card 3 */}
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tasks Completed</h3>
                        <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                            +24.1%
                        </span>
                    </div>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">342</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">vs. 276 last month</p>
                </div>
            </div>

            <div className="mt-8">
                <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Activity</h3>
                    <div className="mt-4 space-y-4">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="flex items-start border-b border-gray-200 pb-4 last:border-0 dark:border-gray-700">
                                <div className="flex-shrink-0">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Activity {item}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

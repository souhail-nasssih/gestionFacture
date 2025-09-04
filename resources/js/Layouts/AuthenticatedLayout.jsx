import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import { Link, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    Users,
    FileText,
    ChevronLeft,
    Menu,
    ChevronDown,
    Package,
    Truck,
    ReceiptText,
    ClipboardList,
    Settings,
    ClipboardCheck,
    CalendarClock,
} from "lucide-react";
import ThemeToggle from "@/Components/ThemeToggle";

export default function AuthenticatedLayout({ header, children }) {
    const { url } = usePage();
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const navigation = [
        { name: "Dashboard", href: route("dashboard"), icon: LayoutDashboard },
        { name: "Produits", href: route("produits.index"), icon: Package },
        { name: "Fournisseurs", href: route("fournisseurs.index"), icon: Truck },
        { name: "Clients", href: route("clients.index"), icon: Users },
        { name: "Factures Fournisseurs", href: route("facture-fournisseurs.index"), icon: FileText },
        { name: "Factures Clients", href: route("facture-clients.index"), icon: ReceiptText },
        { name: "BL Fournisseurs", href: route("bl-fournisseurs.index"), icon: ClipboardList },
        { name: "BL Clients", href: route("bl-clients.index"), icon: ClipboardCheck },
        { name: "Échéancier", href: "/echeancier", icon: CalendarClock },
        { name: "Settings", href: "#", icon: Settings },
    ];

    const isActive = (href) => {
        const currentUrl = url.split("?")[0].replace(/\/+$/, "");
        const hrefPath = href.startsWith("http")
            ? new URL(href).pathname.replace(/\/+$/, "")
            : href.replace(/\/+$/, "");
        if (hrefPath === route("dashboard").replace(/\/+$/, "")) {
            return currentUrl === "/" || currentUrl === hrefPath;
        }
        return (
            currentUrl === hrefPath ||
            (currentUrl.startsWith(hrefPath) && hrefPath !== "/")
        );
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Mobile sidebar backdrop */}
            {isMobile && (
                <div
                    className={`fixed inset-0 z-20 bg-black/50 transition-opacity duration-300 ${
                        sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
                    sidebarOpen ? "w-64" : "w-20"
                }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <Link
                        href="/"
                        className="flex items-center space-x-2 overflow-hidden transition-all duration-300"
                    >
                        <ApplicationLogo className="block h-8 w-auto shrink-0 fill-current text-indigo-600 dark:text-indigo-400" />
                        <span
                            className={`text-xl font-bold whitespace-nowrap ${
                                sidebarOpen ? "opacity-100" : "opacity-0"
                            } text-gray-900 dark:text-white`}
                        >
                            YourApp
                        </span>
                    </Link>
                </div>

                <nav className="mt-6 flex-1">
                    <div className="space-y-1 px-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg mx-2 transition-colors duration-200 ${
                                        active
                                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 shadow-sm"
                                            : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 dark:text-gray-300 dark:hover:bg-gray-700"
                                    }`}
                                >
                                    <Icon
                                        className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                                            active
                                                ? "text-indigo-600 dark:text-indigo-300"
                                                : "text-gray-500 group-hover:text-indigo-600 dark:text-gray-400 dark:group-hover:text-indigo-400"
                                        }`}
                                    />
                                    <span
                                        className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                                            sidebarOpen ? "opacity-100" : "opacity-0"
                                        }`}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="h-9 w-9 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <span className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                                    {user.name.split(" ").map((n) => n[0]).join("")}
                                </span>
                            </div>
                            <div
                                className={`ml-3 overflow-hidden transition-all duration-300 ${
                                    sidebarOpen ? "opacity-100" : "opacity-0"
                                }`}
                            >
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        {!sidebarOpen && <ThemeToggle />}
                    </div>
                </div>
            </div>

            {/* Main content area - Corrections principales ici */}
            <div className={`flex-1 flex flex-col min-w-0 ${
                sidebarOpen ? "lg:ml-64" : "lg:ml-20"
            }`}>
                {/* Top navigation */}
                <nav className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 w-full">
                    <div className="px-4 sm:px-6 lg:px-8 w-full">
                        <div className="flex h-16 items-center justify-between w-full">
                            <div className="flex items-center">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-gray-400 dark:hover:bg-gray-700"
                                    aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                                >
                                    {sidebarOpen ? (
                                        <ChevronLeft className="h-6 w-6" />
                                    ) : (
                                        <Menu className="h-6 w-6" />
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center ml-auto">
                                <ThemeToggle className="mr-4" />
                                <div className="relative">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                type="button"
                                                className="flex items-center max-w-xs rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-800"
                                                aria-label="User menu"
                                            >
                                                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-300">
                                                        {user.name.split(" ").map((n) => n[0]).join("")}
                                                    </span>
                                                </div>
                                                <span className="ml-3 hidden md:inline-block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    {user.name}
                                                </span>
                                                <ChevronDown className="ml-1 hidden h-5 w-5 text-gray-500 md:block dark:text-gray-400" />
                                            </button>
                                        </Dropdown.Trigger>

                                        <Dropdown.Content className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700">
                                            <Dropdown.Link
                                                href={route("profile.edit")}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                                            >
                                                Profile
                                            </Dropdown.Link>
                                            <Dropdown.Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-600"
                                            >
                                                Log Out
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto w-full">
                    {header && (
                        <header className="bg-white shadow-sm dark:bg-gray-800 w-full">
                            <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                    {header}
                                </h1>
                            </div>
                        </header>
                    )}

                    <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-900">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

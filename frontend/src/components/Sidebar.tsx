"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
    const pathname = usePathname();

    const menuItems = [
        { name: "Dashboard", href: "/" },
        { name: "Assets", href: "/assets" },
        { name: "Help Desk", href: "/helpdesk" },
        { name: "Users", href: "/users" },
        { name: "Settings", href: "/settings" },
    ];

    return (
        <div className="flex flex-col h-full w-64 bg-secondary text-white border-r border-gray-700">
            <nav className="flex-1 px-4 py-8 space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${pathname === item.href
                            ? "bg-primary text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;

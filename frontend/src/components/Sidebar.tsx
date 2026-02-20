"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Layers,
    LifeBuoy,
    Users,
    Settings2,
    MapPin,
    Tag as TagIcon,
    ChevronDown,
    ChevronRight
} from "lucide-react";

const Sidebar = () => {
    const pathname = usePathname();
    const [isConfigOpen, setIsConfigOpen] = useState(pathname.startsWith("/settings"));

    const menuItems = [
        { name: "Dashboard", href: "/", icon: LayoutDashboard },
        { name: "Assets", href: "/assets", icon: Layers },
        { name: "Help Desk", href: "/helpdesk", icon: LifeBuoy },
        { name: "Users", href: "/users", icon: Users },
    ];

    const configItems = [
        { name: "Asset Config", href: "/settings/asset-config", icon: Settings2 },
        { name: "Locations", href: "/settings/locations", icon: MapPin },
        { name: "Tags", href: "/settings/tags", icon: TagIcon },
    ];

    return (
        <div className="flex flex-col h-full w-64 bg-brand-black text-white border-r border-gray-800 font-inter">
            <div className="p-6 mb-4">
                <h1 className="text-xl font-black tracking-tighter text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
                        <Layers size={20} className="text-white" />
                    </div>
                    IT MANAGEMENT
                </h1>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${isActive
                                ? "bg-brand-orange text-white shadow-lg shadow-brand-orange/20"
                                : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                                }`}
                        >
                            <Icon size={20} />
                            {item.name}
                        </Link>
                    );
                })}

                {/* Configuration Group */}
                <div className="pt-4">
                    <button
                        onClick={() => setIsConfigOpen(!isConfigOpen)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${pathname.startsWith("/settings")
                            ? "text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Settings2 size={20} />
                            <span>Configuration</span>
                        </div>
                        {isConfigOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>

                    {isConfigOpen && (
                        <div className="mt-1 ml-4 space-y-1 border-l border-gray-700 pl-4">
                            {configItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-4 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 ${isActive
                                            ? "text-brand-orange"
                                            : "text-gray-400 hover:text-gray-200"
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;

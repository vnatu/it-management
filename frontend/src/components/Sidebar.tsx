import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
    LayoutDashboard,
    Package,
    Ticket,
    Users,
    Settings,
    ChevronDown,
    ChevronRight
} from "lucide-react";

const Sidebar = () => {
    const { pathname } = useLocation();
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({ "Configuration": true });

    const toggleMenu = (name: string) => {
        setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const menuItems = [
        { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/" },
        { name: "Assets", icon: <Package size={20} />, href: "/assets" },
        { name: "Help Desk", icon: <Ticket size={20} />, href: "/helpdesk" },
        { name: "Users", icon: <Users size={20} />, href: "/users" },
        {
            name: "Configuration",
            icon: <Settings size={20} />,
            children: [
                { name: "Asset Config", href: "/settings/asset-category" },
                { name: "Locations", href: "/settings/locations" },
                { name: "Tags", href: "/settings/tags" },
            ]
        },
    ];

    return (
        <div className="flex flex-col h-full w-64 bg-secondary text-white border-r border-gray-700 font-sans">
            <div className="p-6">
                <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="bg-primary p-1 rounded-lg">IT</span> Asset<span className="text-primary">.</span>
                </h2>
            </div>
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                    <div key={item.name}>
                        {item.children ? (
                            <div>
                                <button
                                    onClick={() => toggleMenu(item.name)}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all 
                                        ${Object.values(item.children).some(child => pathname === child.href) ? "text-white bg-gray-800/50" : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </div>
                                    {openMenus[item.name] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                                {openMenus[item.name] && (
                                    <div className="ml-4 mt-1 space-y-1 pl-4 border-l border-gray-700">
                                        {item.children.map(child => (
                                            <Link
                                                key={child.name}
                                                to={child.href}
                                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${pathname === child.href
                                                    ? "bg-primary text-white shadow-lg shadow-orange-900/20"
                                                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                                                    }`}
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to={item.href!}
                                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${pathname === item.href
                                    ? "bg-primary text-white shadow-lg shadow-orange-900/20"
                                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                                    }`}
                            >
                                {item.icon}
                                {item.name}
                            </Link>
                        )}
                    </div>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-700">
                <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center font-bold text-xs">VN</div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">Vinay Natu</p>
                        <p className="text-xs text-gray-500 truncate">Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

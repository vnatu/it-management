"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalAssets: 0,
        allocatedAssets: 0,
        openTickets: 0,
        pendingApprovals: 0,
    });

    useEffect(() => {
        // Placeholder for fetching real stats
        setStats({
            totalAssets: 124,
            allocatedAssets: 98,
            openTickets: 12,
            pendingApprovals: 5,
        });
    }, []);

    const cards = [
        { title: "Total Assets", value: stats.totalAssets, color: "bg-blue-500" },
        { title: "Allocated", value: stats.allocatedAssets, color: "bg-green-500" },
        { title: "Open Tickets", value: stats.openTickets, color: "bg-orange-500" },
        { title: "Pending Approvals", value: stats.pendingApprovals, color: "bg-red-500" },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {cards.map((card) => (
                    <div key={card.title} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-transform hover:scale-105">
                        <span className="text-gray-500 text-sm font-medium mb-2">{card.title}</span>
                        <span className="text-4xl font-bold text-gray-800">{card.value}</span>
                        <div className={`h-1 w-12 mt-4 rounded-full ${card.color}`}></div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Asset Activities</h2>
                    <div className="space-y-4">
                        <p className="text-gray-500 text-sm italic">Coming soon: Asset history feed...</p>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Low Inventory Alerts</h2>
                    <div className="space-y-4">
                        <p className="text-gray-500 text-sm italic">Coming soon: Inventory alerts...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

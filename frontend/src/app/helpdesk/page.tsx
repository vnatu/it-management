"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Ticket {
    id: number;
    ticketNo: string;
    subject: string;
    status: string;
    priority: string;
    category: {
        name: string;
    };
    requester: {
        fullName: string;
    };
    createdAt: string;
}

export default function HelpDeskPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8080/api/tickets")
            .then((res) => res.json())
            .then((data) => {
                setTickets(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching tickets:", err);
                setLoading(false);
            });
    }, []);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "CRITICAL": return "bg-red-100 text-red-700 border-red-200";
            case "HIGH": return "bg-orange-100 text-orange-700 border-orange-200";
            case "MEDIUM": return "bg-blue-100 text-blue-700 border-blue-200";
            default: return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING": return "bg-yellow-100 text-yellow-700";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-700";
            case "DONE": return "bg-green-100 text-green-700";
            case "DENIED": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Help Desk</h1>
                <Link
                    href="/helpdesk/new"
                    className="bg-primary hover:bg-orange-600 text-white px-6 py-2 rounded-lg shadow-sm transition-all transform hover:scale-105 active:scale-95"
                >
                    + Create Ticket
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Ticket #</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Subject</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Requester</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Priority</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading tickets...</td></tr>
                        ) : tickets.length === 0 ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No tickets found. Raise a new one!</td></tr>
                        ) : (
                            tickets.map((ticket) => (
                                <tr key={ticket.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        <Link href={`/helpdesk/${ticket.id}`} className="hover:text-primary transition-colors">
                                            {ticket.ticketNo}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{ticket.subject}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{ticket.requester.fullName}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                                        {new Date(ticket.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

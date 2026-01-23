"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Comment {
    id: number;
    comment: string;
    user: {
        fullName: string;
    };
    createdAt: string;
}

interface Ticket {
    id: number;
    ticketNo: string;
    subject: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    category: { name: string };
    requester: { fullName: string; email: string };
    asset?: { id: number; assetCustomId: string; brand: string; modelNo: string };
}

export default function TicketDetailsPage() {
    const { id } = useParams();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ticketRes, commentRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/tickets/${id}`),
                    fetch(`http://localhost:8080/api/tickets/${id}/comments`)
                ]);
                setTicket(await ticketRes.json());
                setComments(await commentRes.json());
            } catch (err) {
                console.error("Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const res = await fetch(`http://localhost:8080/api/tickets/${id}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                comment: newComment,
                user: { id: 1 }, // Fallback to admin/first user for now
            }),
        });

        if (res.ok) {
            const savedComment = await res.json();
            setComments([...comments, savedComment]);
            setNewComment("");
        }
    };

    if (loading) return <div className="p-8 font-medium text-gray-500">Loading ticket details...</div>;
    if (!ticket) return <div className="p-8">Ticket not found.</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/helpdesk" className="text-gray-500 hover:text-gray-700">← Tickets</Link>
                    <h1 className="text-3xl font-bold text-gray-800">{ticket.ticketNo}: {ticket.subject}</h1>
                </div>
                <div className="flex space-x-3">
                    <select
                        className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-primary"
                        value={ticket.status}
                        onChange={() => { }} // TODO: Status update
                    >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Description</h2>
                        <div className="prose max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {ticket.description}
                        </div>
                        {ticket.asset && (
                            <div className="mt-8 pt-8 border-t border-gray-50 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-gray-400 uppercase">Related Asset</p>
                                    <p className="font-medium text-gray-800">{ticket.asset.assetCustomId} - {ticket.asset.brand} {ticket.asset.modelNo}</p>
                                </div>
                                <Link href={`/assets/${ticket.asset.id}`} className="text-primary text-sm font-semibold hover:underline">
                                    View Asset →
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Conversation</h2>
                        <div className="space-y-6 mb-8">
                            {comments.map((c) => (
                                <div key={c.id} className="flex space-x-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <span className="text-primary font-bold">{c.user.fullName[0]}</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-bold text-gray-800">{c.user.fullName}</p>
                                            <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                                            {c.comment}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {comments.length === 0 && <p className="text-center text-gray-400 italic py-4">No comments yet. Start the discussion!</p>}
                        </div>

                        <form onSubmit={handleAddComment}>
                            <textarea
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all resize-none"
                                rows={3}
                                placeholder="Write a reply..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <div className="mt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-orange-200/50 hover:bg-orange-600 transition-colors"
                                >
                                    Send Reply
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-800 mb-4 border-b border-gray-50 pb-2">Ticket Info</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requester</p>
                                <p className="text-sm font-medium text-gray-800">{ticket.requester.fullName}</p>
                                <p className="text-xs text-gray-400">{ticket.requester.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</p>
                                <p className="text-sm font-medium text-gray-800">{ticket.category.name}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</p>
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${ticket.priority === 'CRITICAL' ? 'bg-red-500 text-white' :
                                        ticket.priority === 'HIGH' ? 'bg-orange-500 text-white' :
                                            'bg-blue-500 text-white'
                                    }`}>
                                    {ticket.priority}
                                </span>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created On</p>
                                <p className="text-sm font-medium text-gray-800">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

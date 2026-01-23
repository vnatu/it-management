"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewTicketPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [assets, setAssets] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        subject: "",
        description: "",
        priority: "MEDIUM",
        category: { id: "" },
        requester: { id: "" },
        asset: { id: "" },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, assetRes, userRes] = await Promise.all([
                    fetch("http://localhost:8080/api/ticket-categories"),
                    fetch("http://localhost:8080/api/assets"),
                    fetch("http://localhost:8080/api/users")
                ]);
                setCategories(await catRes.json());
                setAssets(await assetRes.json());
                setUsers(await userRes.json());
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.requester.id || !formData.category.id) {
            alert("Please select a requester and category");
            return;
        }

        const payload = {
            ...formData,
            category: { id: parseInt(formData.category.id as string) },
            requester: { id: parseInt(formData.requester.id as string) },
            asset: formData.asset.id ? { id: parseInt(formData.asset.id as string) } : null
        };

        const res = await fetch("http://localhost:8080/api/tickets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            router.push("/helpdesk");
        } else {
            alert("Error creating ticket");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-3xl">
            <div className="flex items-center space-x-4 mb-8">
                <Link href="/helpdesk" className="text-gray-500 hover:text-gray-700">← Back</Link>
                <h1 className="text-3xl font-bold text-gray-800">Create Support Ticket</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requester</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={formData.requester.id}
                            onChange={(e) => setFormData({ ...formData, requester: { id: e.target.value } })}
                        >
                            <option value="">Select User</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            required
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={formData.category.id}
                            onChange={(e) => setFormData({ ...formData, category: { id: e.target.value } })}
                        >
                            <option value="">Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Related Asset (Optional)</label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            value={formData.asset.id}
                            onChange={(e) => setFormData({ ...formData, asset: { id: e.target.value } })}
                        >
                            <option value="">None</option>
                            {assets.map(a => (
                                <option key={a.id} value={a.id}>{a.assetCustomId} - {a.brand} {a.modelNo}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="E.g. Laptop screen flickering"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        required
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe the issue in detail..."
                    />
                </div>

                <div className="pt-4 flex justify-end space-x-4">
                    <Link
                        href="/helpdesk"
                        className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="px-8 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 shadow-lg shadow-orange-200/50 transition-all active:scale-95 font-semibold"
                    >
                        Submit Ticket
                    </button>
                </div>
            </form>
        </div>
    );
}

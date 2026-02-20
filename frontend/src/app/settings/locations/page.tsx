"use client";

import { useState, useEffect } from "react";
import { Plus, MapPin, Trash2, Edit2, CheckCircle2, XCircle } from "lucide-react";

interface Location {
    id: number;
    name: string;
    code: string;
    address: string;
    active: boolean;
}

export default function LocationsPage() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: "", code: "", address: "" });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/locations");
            if (res.ok) {
                const data = await res.json();
                setLocations(data);
            }
        } catch (error) {
            console.error("Error fetching locations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:8080/api/locations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...newLocation, active: true }),
            });
            if (res.ok) {
                setIsAdding(false);
                setNewLocation({ name: "", code: "", address: "" });
                fetchLocations();
            }
        } catch (error) {
            console.error("Error adding location:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure? This will only work if no assets are assigned to this location.")) return;
        try {
            const res = await fetch(`http://localhost:8080/api/locations/${id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchLocations();
            } else {
                const err = await res.text();
                alert(err || "Error deleting location. It might be in use.");
            }
        } catch (error) {
            console.error("Error deleting location:", error);
        }
    };

    const toggleActive = async (location: Location) => {
        try {
            const res = await fetch(`http://localhost:8080/api/locations/${location.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...location, active: !location.active }),
            });
            if (res.ok) {
                fetchLocations();
            }
        } catch (error) {
            console.error("Error toggling status:", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Location Management</h1>
                    <p className="text-gray-500 font-medium">Manage your office sites and physical locations</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
                    >
                        <Plus size={20} />
                        Add Location
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Location Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                                placeholder="Head Office"
                                value={newLocation.name}
                                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Short Code</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                                placeholder="HO-NY"
                                value={newLocation.code}
                                onChange={(e) => setNewLocation({ ...newLocation, code: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-gray-400 uppercase tracking-widest mb-2">Address / City</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                                placeholder="Manhattan, New York"
                                value={newLocation.address}
                                onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsAdding(false)}
                            className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-gray-900 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-black transition-all shadow-lg"
                        >
                            Save Location
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-50 bg-gray-50/50">
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Location</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Code</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Address</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {locations.map((loc) => (
                            <tr key={loc.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-6 font-bold text-gray-900 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                                        <MapPin size={16} />
                                    </div>
                                    {loc.name}
                                </td>
                                <td className="px-8 py-6 text-sm font-black text-gray-400">{loc.code}</td>
                                <td className="px-8 py-6 text-sm text-gray-500 font-medium">{loc.address}</td>
                                <td className="px-8 py-6">
                                    <button
                                        onClick={() => toggleActive(loc)}
                                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all ${loc.active
                                                ? "bg-green-50 text-green-600 hover:bg-green-100"
                                                : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                                            }`}
                                    >
                                        {loc.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                        {loc.active ? "Active" : "Inactive"}
                                    </button>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDelete(loc.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {locations.length === 0 && !loading && (
                            <tr>
                                <td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-medium">
                                    No locations configured yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

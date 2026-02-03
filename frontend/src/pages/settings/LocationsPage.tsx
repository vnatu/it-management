import { useEffect, useState } from "react";
import { Plus, Trash2, MapPin, CheckCircle, XCircle } from "lucide-react";

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
    const [error, setError] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newLocation, setNewLocation] = useState({ name: "", code: "", address: "" });

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/locations");
            const data = await res.json();
            setLocations(data.map((l: any) => ({ ...l, active: l.active ?? l.isActive })));
            setLoading(false);
        } catch (err) {
            setError("Failed to load locations");
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:8080/api/locations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newLocation),
            });
            if (res.ok) {
                setIsAdding(false);
                setNewLocation({ name: "", code: "", address: "" });
                fetchLocations();
            }
        } catch (err) {
            setError("Failed to add location");
        }
    };

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const res = await fetch(`http://localhost:8080/api/locations/${id}/status?active=${!currentStatus}`, {
                method: "PATCH",
            });
            if (res.ok) {
                fetchLocations();
            } else {
                const msg = await res.text();
                alert(msg || "Cannot deactivate location while it has active assets.");
            }
        } catch (err) {
            alert("Error updating status");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="text-orange-500" /> Location Management
                </h1>
                <button
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-md"
                >
                    <Plus size={20} /> Add Location
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-xl border border-orange-100 shadow-lg mb-8 animate-in fade-in slide-in-from-top-2">
                    <h3 className="text-lg font-bold mb-4">Add New Location</h3>
                    <form onSubmit={handleAdd} className="grid grid-cols-3 gap-4">
                        <input
                            required
                            placeholder="Location Name"
                            className="p-2 border rounded-md"
                            value={newLocation.name}
                            onChange={e => setNewLocation({ ...newLocation, name: e.target.value })}
                        />
                        <input
                            required
                            placeholder="Code"
                            className="p-2 border rounded-md"
                            value={newLocation.code}
                            onChange={e => setNewLocation({ ...newLocation, code: e.target.value })}
                        />
                        <input
                            placeholder="Address"
                            className="p-2 border rounded-md col-span-2"
                            value={newLocation.address}
                            onChange={e => setNewLocation({ ...newLocation, address: e.target.value })}
                        />
                        <div className="flex gap-2 justify-end col-span-1">
                            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-500">Cancel</button>
                            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg">Save</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Name</th>
                            <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Code</th>
                            <th className="px-6 py-4 text-xs font-black uppercase text-gray-400">Status</th>
                            <th className="px-6 py-4 text-xs font-black uppercase text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {locations.map(loc => (
                            <tr key={loc.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 font-bold">{loc.name}</td>
                                <td className="px-6 py-4 text-gray-500">{loc.code}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleStatus(loc.id, loc.active)}
                                        className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${loc.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                    >
                                        {loc.active ? <><CheckCircle size={14} /> Active</> : <><XCircle size={14} /> Inactive</>}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

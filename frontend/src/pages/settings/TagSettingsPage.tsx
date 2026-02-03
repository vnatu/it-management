import { useEffect, useState } from "react";
import { Plus, Tag as TagIcon, Trash2, Edit2, Palette, Check, X } from "lucide-react";

interface Tag {
    id: number;
    name: string;
    color: string;
    isSystem: boolean;
    isGroupTag: boolean;
}

export default function TagSettings() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({ name: "", color: "#3B82F6", isGroupTag: false });
    const [showAddForm, setShowAddForm] = useState(false);

    const fetchTags = async () => {
        try {
            const res = await fetch("http://localhost:8080/api/tags");
            const data = await res.json();
            setTags(data);
        } catch (error) {
            console.error("Error fetching tags:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingId ? `http://localhost:8080/api/tags/${editingId}` : "http://localhost:8080/api/tags";
        const method = editingId ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                fetchTags();
                setShowAddForm(false);
                setEditingId(null);
                setFormData({ name: "", color: "#3B82F6", isGroupTag: false });
            }
        } catch (error) {
            console.error("Error saving tag:", error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this tag?")) return;
        try {
            const res = await fetch(`http://localhost:8080/api/tags/${id}`, { method: "DELETE" });
            if (res.ok) fetchTags();
        } catch (error) {
            console.error("Error deleting tag:", error);
        }
    };

    const startEdit = (tag: Tag) => {
        setEditingId(tag.id);
        setFormData({ name: tag.name, color: tag.color, isGroupTag: tag.isGroupTag });
        setShowAddForm(true);
    };

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Tag Management</h1>
                    <p className="text-gray-500 mt-1">Manage labels for assets and categories</p>
                </div>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-orange-200"
                    >
                        <Plus size={20} />
                        New Tag
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        {editingId ? <Edit2 size={18} /> : <Plus size={18} />}
                        {editingId ? "Edit Tag" : "Create New Tag"}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Name</label>
                            <input
                                required
                                type="text"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="E.g. Critical"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Color</label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    className="h-10 w-10 p-0 border-none rounded-lg cursor-pointer bg-transparent"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                />
                                <input
                                    type="text"
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none"
                                    value={formData.color}
                                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                            <input
                                type="checkbox"
                                id="isGroupTag"
                                className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                checked={formData.isGroupTag}
                                onChange={e => setFormData({ ...formData, isGroupTag: e.target.checked })}
                            />
                            <label htmlFor="isGroupTag" className="text-sm font-bold text-gray-700">Display as Inventory Tab</label>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="flex-1 bg-gray-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={18} />
                                {editingId ? "Update" : "Save"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowAddForm(false); setEditingId(null); }}
                                className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50">
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Tag Info</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Color</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Type</th>
                            <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            Array(3).fill(0).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={4} className="px-8 py-6 h-16 bg-gray-50/30"></td>
                                </tr>
                            ))
                        ) : tags.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-bold">No tags found. Create one to get started!</td>
                            </tr>
                        ) : (
                            tags.map(tag => (
                                <tr key={tag.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg" style={{ backgroundColor: `${tag.color}20`, color: tag.color }}>
                                                <TagIcon size={20} />
                                            </div>
                                            <span className="font-bold text-gray-900">{tag.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 rounded-full shadow-sm border border-gray-100" style={{ backgroundColor: tag.color }}></div>
                                            <code className="text-xs font-mono text-gray-400 uppercase">{tag.color}</code>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-center gap-2">
                                            {tag.isSystem && (
                                                <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight">System</span>
                                            )}
                                            {tag.isGroupTag && (
                                                <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight border border-orange-100">Inventory Tab</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => startEdit(tag)}
                                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                                                title="Edit Tag"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            {!tag.isSystem && (
                                                <button
                                                    onClick={() => handleDelete(tag.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete Tag"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
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

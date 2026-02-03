"use client";

import { useEffect, useState } from "react";
import { X, User as UserIcon, Calendar, Tag as TagIcon, Check } from "lucide-react";
import TagPicker from "../TagPicker";

interface User {
    id: number;
    fullName: string;
    email: string;
}

interface Tag {
    id: number;
    name: string;
    color: string;
}

interface AllocationModalProps {
    asset: any;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AllocationModal({ asset, isOpen, onClose, onSuccess }: AllocationModalProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserId, setSelectedUserId] = useState<number | "">("");
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
    const [allocationDate, setAllocationDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                fetch("http://localhost:8080/api/users").then(res => res.json()),
                fetch("http://localhost:8080/api/tags").then(res => res.json())
            ]).then(([userData, tagData]) => {
                setUsers(userData);
                setTags(tagData);
                setSelectedTagIds(asset.tags?.map((t: any) => t.id) || []);
                setLoading(false);
            });
        }
    }, [isOpen, asset]);

    const handleAllocate = async () => {
        if (!selectedUserId) return;

        try {
            // Update asset with allocation details and tags
            const payload = {
                ...asset,
                status: "ALLOCATED",
                assignedTo: { id: selectedUserId },
                allocationDate: allocationDate,
                tags: selectedTagIds.map(id => ({ id }))
            };

            const res = await fetch(`http://localhost:8080/api/assets/${asset.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                onSuccess();
                onClose();
            } else {
                alert("Failed to allocate asset");
            }
        } catch (error) {
            console.error("Allocation error:", error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in transition-all">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 flex flex-col">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 leading-tight">Allocate Asset</h2>
                        <p className="text-gray-500 text-sm font-bold flex items-center gap-2 mt-1">
                            <span className="text-orange-500">#{asset.assetCustomId}</span>
                            <span className="text-gray-300">•</span>
                            {asset.brand} {asset.type?.name}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-xl transition-all text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8 flex-1 overflow-y-auto max-h-[70vh]">
                    {/* Select User */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                            <UserIcon size={12} /> Assign To User
                        </label>
                        <select
                            required
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500/20 transition-all outline-none appearance-none"
                            value={selectedUserId}
                            onChange={e => setSelectedUserId(Number(e.target.value))}
                        >
                            <option value="">Select an employee...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>{user.fullName} ({user.email})</option>
                            ))}
                        </select>
                    </div>

                    {/* Allocation Date */}
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                            <Calendar size={12} /> Allocation Date
                        </label>
                        <input
                            type="date"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                            value={allocationDate}
                            onChange={e => setAllocationDate(e.target.value)}
                        />
                    </div>

                    {/* Tags during allocation */}
                    <div className="pt-2">
                        <TagPicker
                            allTags={tags}
                            selectedTagIds={selectedTagIds}
                            onToggle={(id) => setSelectedTagIds(prev =>
                                prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
                            )}
                            label="Lifecycle Tags (Assign while allocating)"
                        />
                    </div>
                </div>

                <div className="p-8 border-t border-gray-50 bg-gray-50/50 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-white border border-gray-200 text-gray-700 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAllocate}
                        disabled={!selectedUserId}
                        className={`flex-1 flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl transition-all shadow-xl ${selectedUserId ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        <Check size={16} /> Complete Allocation
                    </button>
                </div>
            </div>
        </div>
    );
}

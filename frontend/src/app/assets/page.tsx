"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    Plus,
    X,
    Search,
    MoreVertical,
    Layers,
    ChevronUp,
    ChevronDown,
    MapPin,
    Upload,
    Download,
    History,
    CheckCircle,
    AlertCircle,
    Loader2,
    Clock,
} from "lucide-react";
import TagPicker from "@/components/TagPicker";

const API = "http://localhost:8080/api";

const CSV_HEADERS = [
    "asset_custom_id",
    "type",
    "brand",
    "model_no",
    "serial_no",
    "sku",
    "color",
    "price",
    "status",
    "tags",
    "location_code",
    "assigned_to_email",
    "purchase_date",
    "warranty_start",
    "warranty_end",
    "vendor_info",
    "description",
];

// First cell starts with # so the backend skips this row during processing
const CSV_GUIDELINES = [
    "#INSTRUCTIONS — do not edit or delete this row",
    "Required. Must match an existing asset type name (e.g. Laptop)",
    "Required. Brand name (e.g. Apple)",
    "Required. Model number or name (e.g. MacBook Pro 14)",
    "Optional. Manufacturer serial number",
    "Optional. SKU / part number",
    "Optional. Color of the asset",
    "Optional. Numeric value in INR, no commas (e.g. 150000)",
    "Required. One of: AVAILABLE | ALLOCATED | UNDER_REPAIR | DEFECTIVE | TRANSIT | DECOMMISSIONED",
    "Optional. Pipe-separated tag names (e.g. MacOS|Engineering). Tags must already exist.",
    "Optional. Location code as configured in settings (e.g. BLR-01)",
    "Optional. Email of the user to assign this asset to. User must already exist.",
    "Optional. Format: YYYY-MM-DD (e.g. 2024-01-15)",
    "Optional. Format: YYYY-MM-DD",
    "Optional. Format: YYYY-MM-DD",
    "Optional. Vendor or supplier name",
    "Optional. Any additional notes about the asset",
];

const CSV_SAMPLE_ROW = [
    "ASSET-001",
    "Laptop",
    "Apple",
    "MacBook Pro 14",
    "C02XG1YPJGH5",
    "MK183LL/A",
    "Space Gray",
    "150000",
    "AVAILABLE",
    "MacOS|Engineering",
    "BLR-01",
    "john.doe@acme.com",
    "2024-01-15",
    "2024-01-15",
    "2027-01-14",
    "Apple India Pvt Ltd",
    "Primary dev machine",
];

const TERMINAL_STATUSES = ["COMPLETED", "COMPLETED_WITH_ERRORS", "FAILED"];

interface Tag {
    id: number;
    name: string;
    color: string;
    isSystem: boolean;
    isGroupTag: boolean;
}

interface Location {
    id: number;
    name: string;
    code: string;
}

interface Asset {
    id: number;
    assetCustomId: string;
    brand: string;
    modelNo: string;
    serialNo: string;
    status: string;
    price: number;
    location: Location | null;
    purchaseDate: string;
    warrantyEnd: string;
    type: { name: string };
    assignedTo?: { fullName: string };
    tags: Tag[];
}

interface ImportError {
    row: string;
    message: string;
}

interface ImportJob {
    id: number;
    fileName: string;
    status: string;
    totalRows: number;
    processedRows: number;
    successCount: number;
    failureCount: number;
    errorDetails: string | null;
    createdAt: string;
    startedAt: string | null;
    completedAt: string | null;
}

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

    // Import menu
    const [showImportMenu, setShowImportMenu] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const importMenuRef = useRef<HTMLDivElement>(null);

    // Import job state
    const [importJob, setImportJob] = useState<ImportJob | null>(null);
    const [showErrors, setShowErrors] = useState(false);
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Import history panel
    const [showHistory, setShowHistory] = useState(false);
    const [importHistory, setImportHistory] = useState<ImportJob[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const fetchAssets = async () => {
        try {
            const res = await fetch(`${API}/assets`);
            if (res.ok) setAssets(await res.json());
        } catch (err) {
            console.error("Error fetching assets:", err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [assetsRes, tagsRes] = await Promise.all([
                    fetch(`${API}/assets`),
                    fetch(`${API}/tags`),
                ]);
                if (assetsRes.ok) setAssets(await assetsRes.json());
                if (tagsRes.ok) setAllTags(await tagsRes.json());
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Close import dropdown on outside click
    useEffect(() => {
        if (!showImportMenu) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (importMenuRef.current && !importMenuRef.current.contains(e.target as Node)) {
                setShowImportMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showImportMenu]);

    // Stop polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const startPolling = (jobId: number) => {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = setInterval(async () => {
            try {
                const res = await fetch(`${API}/import/jobs/${jobId}`);
                if (!res.ok) return;
                const job: ImportJob = await res.json();
                setImportJob(job);
                if (TERMINAL_STATUSES.includes(job.status)) {
                    clearInterval(pollingRef.current!);
                    pollingRef.current = null;
                    // Refresh asset list when import finishes
                    await fetchAssets();
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 3000);
    };

    const handleDownloadSampleCSV = () => {
        const rows = [CSV_HEADERS, CSV_GUIDELINES, CSV_SAMPLE_ROW];
        const csv = rows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "asset_import_template.csv";
        link.click();
        URL.revokeObjectURL(url);
        setShowImportMenu(false);
    };

    const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        setShowImportMenu(false);
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(`${API}/import/assets`, {
                method: "POST",
                body: formData,
            });
            if (!res.ok) {
                const msg = await res.text();
                alert(`Import failed: ${msg}`);
                return;
            }
            const job: ImportJob = await res.json();
            setImportJob(job);
            setShowErrors(false);
            startPolling(job.id);
        } catch (err) {
            console.error("Import upload error:", err);
            alert("Failed to start import. Please check your connection and try again.");
        }
    };

    const handleOpenHistory = async () => {
        setShowHistory(true);
        setShowImportMenu(false);
        setHistoryLoading(true);
        try {
            const res = await fetch(`${API}/import/jobs`);
            if (res.ok) setImportHistory(await res.json());
        } catch (err) {
            console.error("Error fetching import history:", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const parseErrors = (errorDetails: string | null): ImportError[] => {
        if (!errorDetails) return [];
        try {
            return JSON.parse(errorDetails);
        } catch {
            return [];
        }
    };

    const getJobStatusStyle = (status: string) => {
        switch (status) {
            case "COMPLETED": return { dot: "bg-green-500", text: "text-green-600", bg: "bg-green-50 border-green-100" };
            case "COMPLETED_WITH_ERRORS": return { dot: "bg-orange-500", text: "text-orange-600", bg: "bg-orange-50 border-orange-100" };
            case "FAILED": return { dot: "bg-red-500", text: "text-red-600", bg: "bg-red-50 border-red-100" };
            case "PROCESSING": return { dot: "bg-blue-500", text: "text-blue-600", bg: "bg-blue-50 border-blue-100" };
            default: return { dot: "bg-gray-400", text: "text-gray-500", bg: "bg-gray-50 border-gray-100" };
        }
    };

    const formatStatus = (status: string) =>
        status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    const formatDateTime = (dt: string | null) => {
        if (!dt) return "—";
        return new Date(dt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
    };

    const groupTags = allTags.filter(t => t.isGroupTag);
    const tabs = ["All", ...groupTags.map(t => t.name)];

    const filteredAssets = assets.filter(asset => {
        const matchesSearch =
            asset.assetCustomId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.modelNo?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "All" || asset.tags.some(t => t.name === activeTab);
        const matchesTags = selectedTagIds.length === 0 ||
            selectedTagIds.every(id => asset.tags.some(t => t.id === id));
        return matchesSearch && matchesTab && matchesTags;
    });

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "AVAILABLE": return "text-green-500 bg-green-50 border-green-100";
            case "ALLOCATED": return "text-blue-500 bg-blue-50 border-blue-100";
            case "UNDER_REPAIR": return "text-orange-500 bg-orange-50 border-orange-100";
            case "DEFECTIVE": return "text-red-500 bg-red-50 border-red-100";
            case "TRANSIT": return "text-purple-500 bg-purple-50 border-purple-100";
            case "DECOMMISSIONED": return "text-gray-500 bg-gray-50 border-gray-100";
            default: return "text-gray-500 bg-gray-50 border-gray-100";
        }
    };

    const formatPrice = (price: number) => {
        if (!price) return "N/A";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(price).replace("₹", "Rs. ");
    };

    const isTerminal = importJob ? TERMINAL_STATUSES.includes(importJob.status) : false;
    const progress = importJob && importJob.totalRows > 0
        ? Math.round((importJob.processedRows / importJob.totalRows) * 100)
        : 0;

    return (
        <div className="max-w-[1600px] mx-auto pb-20">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Inventory</h1>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Global Assets</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                        <Link href="/helpdesk">
                            <span className="text-orange-500 font-bold uppercase text-[10px] tracking-widest hover:underline decoration-2 underline-offset-4 cursor-pointer">
                                IT Helpdesk
                            </span>
                        </Link>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    {/* Import dropdown */}
                    <div className="relative" ref={importMenuRef}>
                        <button
                            onClick={() => setShowImportMenu(prev => !prev)}
                            className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-black px-5 py-2.5 rounded-2xl transition-all flex items-center gap-2 uppercase tracking-widest text-xs"
                        >
                            <Upload size={15} strokeWidth={3} />
                            Import
                            <ChevronDown size={13} strokeWidth={3} className={`transition-transform duration-200 ${showImportMenu ? "rotate-180" : ""}`} />
                        </button>

                        {showImportMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 z-50 overflow-hidden">
                                <button
                                    onClick={handleDownloadSampleCSV}
                                    className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <Download size={14} strokeWidth={3} className="text-gray-400" />
                                    Download Sample CSV
                                </button>
                                <div className="mx-4 border-t border-gray-50" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <Upload size={14} strokeWidth={3} className="text-gray-400" />
                                    Import Assets
                                </button>
                                <div className="mx-4 border-t border-gray-50" />
                                <button
                                    onClick={handleOpenHistory}
                                    className="w-full flex items-center gap-3 px-5 py-3.5 text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <History size={14} strokeWidth={3} className="text-gray-400" />
                                    Import History
                                </button>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileSelected}
                        />
                    </div>

                    <Link href="/assets/new">
                        <button className="bg-orange-500 hover:bg-orange-600 text-white font-black px-6 py-2.5 rounded-2xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center gap-2 uppercase tracking-widest text-xs">
                            <Plus size={18} strokeWidth={3} />
                            Add Asset
                        </button>
                    </Link>
                </div>
            </div>

            {/* Dynamic Tabs */}
            <div className="flex gap-2 mb-8 bg-gray-100/50 p-1.5 rounded-[1.5rem] w-fit border border-gray-100">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-[1rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                            ? "bg-white text-gray-900 shadow-lg"
                            : "text-gray-400 hover:text-gray-600"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Import Status Banner */}
            {importJob && (
                <div className={`mb-6 rounded-2xl border px-6 py-4 ${
                    importJob.status === "COMPLETED" ? "bg-green-50 border-green-100" :
                    importJob.status === "COMPLETED_WITH_ERRORS" ? "bg-orange-50 border-orange-100" :
                    importJob.status === "FAILED" ? "bg-red-50 border-red-100" :
                    "bg-blue-50 border-blue-100"
                }`}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                            {importJob.status === "COMPLETED" && <CheckCircle size={18} className="text-green-500 shrink-0" />}
                            {importJob.status === "COMPLETED_WITH_ERRORS" && <AlertCircle size={18} className="text-orange-500 shrink-0" />}
                            {importJob.status === "FAILED" && <AlertCircle size={18} className="text-red-500 shrink-0" />}
                            {(importJob.status === "PROCESSING" || importJob.status === "PENDING") && (
                                <Loader2 size={18} className="text-blue-500 shrink-0 animate-spin" />
                            )}
                            <div className="min-w-0">
                                <p className={`text-xs font-black uppercase tracking-widest ${
                                    importJob.status === "COMPLETED" ? "text-green-700" :
                                    importJob.status === "COMPLETED_WITH_ERRORS" ? "text-orange-700" :
                                    importJob.status === "FAILED" ? "text-red-700" :
                                    "text-blue-700"
                                }`}>
                                    {importJob.status === "PENDING" && "Queued for import…"}
                                    {importJob.status === "PROCESSING" && `Importing — ${importJob.processedRows} / ${importJob.totalRows || "?"} rows processed`}
                                    {importJob.status === "COMPLETED" && `Import complete — ${importJob.successCount} asset${importJob.successCount !== 1 ? "s" : ""} added`}
                                    {importJob.status === "COMPLETED_WITH_ERRORS" && `Import done — ${importJob.successCount} succeeded, ${importJob.failureCount} failed`}
                                    {importJob.status === "FAILED" && "Import failed — could not process the file"}
                                </p>
                                <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">{importJob.fileName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            {!isTerminal && importJob.totalRows > 0 && (
                                <div className="w-24 h-1.5 bg-white/60 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            )}
                            {importJob.failureCount > 0 && isTerminal && (
                                <button
                                    onClick={() => setShowErrors(prev => !prev)}
                                    className="text-[10px] font-black uppercase tracking-widest text-orange-600 hover:underline"
                                >
                                    {showErrors ? "Hide errors" : "View errors"}
                                </button>
                            )}
                            <button onClick={() => setImportJob(null)} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                                <X size={14} className="text-gray-400" />
                            </button>
                        </div>
                    </div>

                    {/* Error list */}
                    {showErrors && importJob.errorDetails && (
                        <div className="mt-4 max-h-48 overflow-y-auto space-y-1.5">
                            {parseErrors(importJob.errorDetails).map((err, i) => (
                                <div key={i} className="flex gap-2 text-[11px] font-medium text-red-700 bg-red-50 rounded-lg px-3 py-2">
                                    <span className="font-black shrink-0">Row {err.row}:</span>
                                    <span>{err.message}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Main Content Area */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden min-h-[600px]">
                {/* Search and Table Header */}
                <div className="p-8 space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">{activeTab} Inventory</h2>
                            <p className="text-gray-400 font-medium text-sm">Showing {filteredAssets.length} assets</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                            <div className="relative flex-1 md:flex-none">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by ID, Brand, Model..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-12 pr-6 py-3.5 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-orange-500/10 w-full md:w-80 transition-all outline-none"
                                />
                            </div>

                            <div className="w-full md:w-64">
                                <TagPicker
                                    allTags={allTags.filter(t => !t.isGroupTag)}
                                    selectedTagIds={selectedTagIds}
                                    onToggle={(id) => setSelectedTagIds(prev =>
                                        prev.includes(id) ? prev.filter(tid => tid !== id) : [...prev, id]
                                    )}
                                    label=""
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto scrollbar-hide">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead>
                            <tr className="border-y border-gray-50 bg-gray-50/30">
                                {[
                                    "Asset ID", "Type", "Brand / Model", "Price",
                                    "Status", "Tags", "Location", "Assigned To"
                                ].map((head) => (
                                    <th key={head} className="px-8 py-5">
                                        <div className="flex items-center gap-1 cursor-pointer group">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                                {head}
                                            </span>
                                            <div className="flex flex-col -space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronUp size={10} className="text-gray-300" />
                                                <ChevronDown size={10} className="text-gray-300" />
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-8 py-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array(8).fill(0).map((_, j) => (
                                            <td key={j} className="px-8 py-6 font-medium">
                                                <div className="h-4 bg-gray-100 rounded-full w-full"></div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredAssets.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-8 py-32 text-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-6 text-gray-200">
                                                <Layers size={40} />
                                            </div>
                                            <h3 className="text-xl font-black text-gray-400 italic uppercase">Empty Space</h3>
                                            <p className="text-gray-400 font-medium">No assets match your current filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAssets.map((asset) => (
                                    <tr key={asset.id} className="hover:bg-gray-50/50 transition-all duration-300 group">
                                        <td className="px-8 py-6">
                                            <span className="text-sm font-black text-gray-900 tracking-tight">{asset.assetCustomId}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                                                <span className="text-[13px] font-bold text-gray-600">{asset.type.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-[13px] font-black text-gray-900">{asset.brand}</span>
                                                <span className="text-[11px] font-bold text-gray-400">{asset.modelNo}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-[13px] font-black text-orange-500">{formatPrice(asset.price)}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${getStatusColor(asset.status)}`}>
                                                <div className={`w-1 h-1 rounded-full ${getStatusColor(asset.status).split(" ")[0].replace("text-", "bg-")}`}></div>
                                                {asset.status.replace("_", " ")}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-wrap gap-1.5">
                                                {asset.tags.filter(t => !t.isGroupTag).map(tag => (
                                                    <span
                                                        key={tag.id}
                                                        style={{ color: tag.color }}
                                                        className="text-[10px] font-black uppercase tracking-tighter"
                                                    >
                                                        #{tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-gray-500 font-bold">
                                                <MapPin size={14} className="text-gray-300" />
                                                <span className="text-[13px]">{asset.location?.code || asset.location?.name || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-black text-gray-400 uppercase">
                                                    {asset.assignedTo?.fullName?.charAt(0) || "?"}
                                                </div>
                                                <span className="text-[13px] font-bold text-gray-700">{asset.assignedTo?.fullName || "Unassigned"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 hover:bg-gray-100 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                                <MoreVertical size={18} className="text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Import History Slide-over */}
            {showHistory && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        onClick={() => setShowHistory(false)}
                    />
                    {/* Panel */}
                    <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl flex flex-col">
                        {/* Panel header */}
                        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Import History</h2>
                                <p className="text-xs text-gray-400 font-medium mt-0.5">Past bulk CSV import jobs</p>
                            </div>
                            <button
                                onClick={() => setShowHistory(false)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Panel body */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
                            {historyLoading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="animate-pulse h-24 bg-gray-50 rounded-2xl" />
                                ))
                            ) : importHistory.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                                        <Clock size={28} className="text-gray-200" />
                                    </div>
                                    <p className="text-gray-400 font-black uppercase text-sm">No imports yet</p>
                                    <p className="text-gray-300 font-medium text-xs mt-1">Import history will appear here</p>
                                </div>
                            ) : (
                                importHistory.map(job => {
                                    const style = getJobStatusStyle(job.status);
                                    const jobErrors = parseErrors(job.errorDetails);
                                    return (
                                        <div key={job.id} className={`rounded-2xl border p-5 ${style.bg}`}>
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-black text-gray-900 truncate">{job.fileName}</p>
                                                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">{formatDateTime(job.createdAt)}</p>
                                                </div>
                                                <span className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${style.bg} ${style.text}`}>
                                                    <span className={`w-1 h-1 rounded-full ${style.dot}`}></span>
                                                    {formatStatus(job.status)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-3 text-[11px] font-bold">
                                                <span className="text-gray-500">Total: <span className="text-gray-900">{job.totalRows}</span></span>
                                                <span className="text-green-600">Success: <span className="font-black">{job.successCount}</span></span>
                                                {job.failureCount > 0 && (
                                                    <span className="text-red-500">Failed: <span className="font-black">{job.failureCount}</span></span>
                                                )}
                                            </div>
                                            {jobErrors.length > 0 && (
                                                <div className="mt-3 max-h-32 overflow-y-auto space-y-1">
                                                    {jobErrors.map((err, i) => (
                                                        <div key={i} className="text-[10px] font-medium text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
                                                            <span className="font-black">Row {err.row}:</span> {err.message}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

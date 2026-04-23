"use client";

import { useState, useEffect, useRef } from "react";
import {
	Camera,
	Plus,
	Trash2,
	Download,
	X,
	Image as ImageIcon,
	Calendar,
	Tag,
	DollarSign,
	Package,
	ChevronDown,
	Filter,
	Sparkles,
} from "lucide-react";
import { supabase, type Donation } from "@/lib/supabase";

const CATEGORIES = [
	"Clothing & Shoes",
	"Household Goods",
	"Furniture",
	"Electronics",
	"Books & Media",
	"Toys & Games",
	"Other",
];
const CONDITIONS = ["Excellent", "Good", "Fair"];

const C = {
	bg: "#F6F2EA",
	surface: "#FFFFFF",
	ink: "#1A1612",
	muted: "#7C6F5E",
	subtle: "#A89C89",
	border: "#E5DDD0",
	borderStrong: "#D4C8B5",
	accent: "#8B3A1F",
	accentSoft: "#F3E4DC",
	gold: "#8C6A1F",
};

const fmtMoney = (n: number) =>
	(n || 0).toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 2,
	});

const fmtDate = (iso: string) => {
	if (!iso) return "";
	const d = new Date(iso + "T12:00:00");
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

async function compressImage(
	file: File,
	maxDim = 1400,
	quality = 0.78,
): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const result = e.target?.result;
			if (typeof result !== "string") {
				reject(new Error("Failed to read file"));
				return;
			}
			const img = new Image();
			img.onload = () => {
				let { width, height } = img;
				const scale = Math.min(1, maxDim / Math.max(width, height));
				width = Math.round(width * scale);
				height = Math.round(height * scale);
				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");
				if (ctx) ctx.drawImage(img, 0, 0, width, height);
				resolve(canvas.toDataURL("image/jpeg", quality));
			};
			img.onerror = reject;
			img.src = result;
		};
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}

function toCSV(rows: Donation[]) {
	const headers = [
		"Date",
		"Description",
		"Category",
		"Condition",
		"Quantity",
		"Value (each)",
		"Total Value",
		"Notes",
	];
	const escape = (v: any) => {
		const s = String(v ?? "");
		return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
	};
	const lines = [headers.join(",")];
	rows.forEach((r) => {
		lines.push(
			[
				r.date,
				escape(r.description),
				escape(r.category),
				escape(r.condition),
				r.quantity,
				r.value.toFixed(2),
				(r.quantity * r.value).toFixed(2),
				escape(r.notes || ""),
			].join(","),
		);
	});
	return lines.join("\n");
}

export default function DonationsTracker() {
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [yearFilter, setYearFilter] = useState("all");
	const [catFilter, setCatFilter] = useState("all");
	const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

	useEffect(() => {
		loadDonations();
	}, []);

	const loadDonations = async () => {
		const { data, error } = await supabase
			.from("donations")
			.select("*")
			.order("date", { ascending: false });
		if (error) {
			console.error("Load error:", error);
		} else {
			setDonations(data || []);
		}
		setLoading(false);
	};

	const addDonation = async (donation: Omit<Donation, "id" | "created_at">) => {
		const { data, error } = await supabase
			.from("donations")
			.insert([donation])
			.select();
		if (error) {
			console.error("Add error:", error);
		} else if (data) {
			setDonations([data[0], ...donations]);
			setShowForm(false);
		}
	};

	const removeDonation = async (id: string) => {
		const { error } = await supabase.from("donations").delete().eq("id", id);
		if (error) {
			console.error("Delete error:", error);
		} else {
			setDonations(donations.filter((d) => d.id !== id));
		}
	};

	const years = Array.from(new Set(donations.map((d) => d.date.slice(0, 4))))
		.filter(Boolean)
		.sort()
		.reverse();

	const filtered = donations.filter((d) => {
		if (yearFilter !== "all" && !d.date.startsWith(yearFilter)) return false;
		if (catFilter !== "all" && d.category !== catFilter) return false;
		return true;
	});

	const total = filtered.reduce(
		(s, d) => s + (d.quantity || 1) * (d.value || 0),
		0,
	);
	const itemCount = filtered.reduce((s, d) => s + (d.quantity || 1), 0);

	const categoryTotals = CATEGORIES.map((cat) => ({
		cat,
		total: filtered
			.filter((d) => d.category === cat)
			.reduce((s, d) => s + (d.quantity || 1) * (d.value || 0), 0),
	})).filter((c) => c.total > 0);

	const handleExport = () => {
		const csv = toCSV(filtered);
		const blob = new Blob([csv], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		const label = yearFilter !== "all" ? `-${yearFilter}` : "";
		a.download = `goodwill-donations${label}.csv`;
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div style={{ background: C.bg, color: C.ink, minHeight: "100vh" }}>
			<div className='max-w-3xl mx-auto px-5 pb-32'>
				{/* Header */}
				<header
					className='pt-10 pb-8'
					style={{ borderBottom: `1px solid ${C.border}` }}
				>
					<div
						style={{
							fontFamily: '"JetBrains Mono", monospace',
							fontSize: 11,
							letterSpacing: "0.18em",
							color: C.muted,
							textTransform: "uppercase",
						}}
					>
						Tax-Deductible Record
					</div>
					<h1
						style={{
							fontFamily: '"Fraunces", serif',
							fontWeight: 400,
							fontSize: "clamp(2rem, 6vw, 2.8rem)",
							letterSpacing: "-0.02em",
							lineHeight: 1.05,
							marginTop: 8,
						}}
					>
						Goodwill{" "}
						<em style={{ fontStyle: "italic", color: C.accent }}>Donations</em>
					</h1>
					<p
						style={{
							color: C.muted,
							marginTop: 10,
							maxWidth: "36ch",
							fontSize: 14.5,
							lineHeight: 1.5,
						}}
					>
						Photograph the item, enter your fair market value estimate, keep a
						ledger for tax season.
					</p>
				</header>

				{/* Summary */}
				<section className='grid grid-cols-3 gap-3 mt-6'>
					<StatCard label='Total claimed' value={fmtMoney(total)} highlight />
					<StatCard
						label='Donations'
						value={donations.length.toString()}
						sub={`${itemCount} item${itemCount !== 1 ? "s" : ""}`}
					/>
					<StatCard
						label='Tax year'
						value={yearFilter === "all" ? "All" : yearFilter}
						sub={
							years.length
								? `${years.length} year${years.length !== 1 ? "s" : ""} tracked`
								: "—"
						}
					/>
				</section>

				{/* Category breakdown */}
				{categoryTotals.length > 0 && (
					<section
						className='mt-6 p-5 rounded'
						style={{ background: C.surface, border: `1px solid ${C.border}` }}
					>
						<div
							style={{
								fontFamily: '"JetBrains Mono", monospace',
								fontSize: 10,
								letterSpacing: "0.18em",
								color: C.muted,
								textTransform: "uppercase",
								marginBottom: 12,
							}}
						>
							By Category
						</div>
						<div className='space-y-2.5'>
							{categoryTotals.map((c) => {
								const pct = total > 0 ? (c.total / total) * 100 : 0;
								return (
									<div key={c.cat}>
										<div
											className='flex items-baseline justify-between gap-2'
											style={{ fontSize: 13 }}
										>
											<span>{c.cat}</span>
											<span
												style={{
													fontFamily: '"JetBrains Mono", monospace',
													color: C.ink,
												}}
											>
												{fmtMoney(c.total)}
											</span>
										</div>
										<div
											className='h-px mt-1.5 relative overflow-hidden'
											style={{ background: C.border }}
										>
											<div
												style={{
													width: `${pct}%`,
													background: C.ink,
													height: 2,
													top: -0.5,
													marginTop: -1,
												}}
											/>
										</div>
									</div>
								);
							})}
						</div>
					</section>
				)}

				{/* Filters & Actions */}
				<section className='flex items-center gap-2 mt-8 flex-wrap'>
					<SelectField
						value={yearFilter}
						onChange={setYearFilter}
						options={[
							["all", "All years"],
							...years.map((y) => [y, y] as [string, string]),
						]}
						icon={<Calendar size={13} />}
					/>
					<SelectField
						value={catFilter}
						onChange={setCatFilter}
						options={[
							["all", "All categories"],
							...CATEGORIES.map((c) => [c, c] as [string, string]),
						]}
						icon={<Tag size={13} />}
					/>
					<div className='flex-1' />
					{donations.length > 0 && (
						<button
							onClick={handleExport}
							className='flex items-center gap-1.5 px-3 py-2 rounded transition-colors'
							style={{
								border: `1px solid ${C.borderStrong}`,
								background: C.surface,
								fontSize: 12.5,
								color: C.ink,
							}}
						>
							<Download size={13} />
							Export CSV
						</button>
					)}
				</section>

				{/* List */}
				<section className='mt-5'>
					{loading ? (
						<div
							className='py-20 text-center'
							style={{ color: C.muted, fontSize: 13 }}
						>
							Loading…
						</div>
					) : filtered.length === 0 ? (
						<EmptyState
							hasAny={donations.length > 0}
							onAdd={() => setShowForm(true)}
						/>
					) : (
						<div className='space-y-2.5'>
							{filtered.map((d) => (
								<DonationRow
									key={d.id}
									donation={d}
									onDelete={() => removeDonation(d.id)}
									onViewPhoto={() =>
										d.photo_url && setViewingPhoto(d.photo_url)
									}
								/>
							))}
						</div>
					)}
				</section>
			</div>

			{/* Floating add button */}
			<button
				onClick={() => setShowForm(true)}
				className='fixed bottom-6 right-6 flex items-center gap-2 px-5 py-3.5 rounded-full shadow-lg transition-transform active:scale-95'
				style={{
					background: C.ink,
					color: C.bg,
					fontFamily: '"Instrument Sans", sans-serif',
					fontSize: 14,
					fontWeight: 500,
					letterSpacing: "-0.01em",
					boxShadow: "0 8px 24px -8px rgba(26,22,18,0.35)",
				}}
			>
				<Plus size={18} strokeWidth={2.2} />
				Add donation
			</button>

			{/* Form modal */}
			{showForm && (
				<AddDonationForm
					onClose={() => setShowForm(false)}
					onSave={addDonation}
				/>
			)}

			{/* Photo viewer */}
			{viewingPhoto && (
				<div
					className='fixed inset-0 z-50 flex items-center justify-center p-6'
					style={{ background: "rgba(26,22,18,0.92)" }}
					onClick={() => setViewingPhoto(null)}
				>
					<button
						onClick={() => setViewingPhoto(null)}
						className='absolute top-5 right-5 p-2 rounded-full'
						style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
					>
						<X size={20} />
					</button>
					<img
						src={viewingPhoto}
						alt='Donation'
						style={{ maxHeight: "85vh", maxWidth: "100%", borderRadius: 4 }}
					/>
				</div>
			)}
		</div>
	);
}

function StatCard({
	label,
	value,
	sub,
	highlight,
}: {
	label: string;
	value: string;
	sub?: string;
	highlight?: boolean;
}) {
	return (
		<div
			className='p-4 rounded'
			style={{
				background: highlight ? C.ink : C.surface,
				color: highlight ? C.bg : C.ink,
				border: `1px solid ${highlight ? C.ink : C.border}`,
			}}
		>
			<div
				style={{
					fontFamily: '"JetBrains Mono", monospace',
					fontSize: 9.5,
					letterSpacing: "0.18em",
					textTransform: "uppercase",
					color: highlight ? "rgba(246,242,234,0.6)" : C.muted,
				}}
			>
				{label}
			</div>
			<div
				style={{
					fontFamily: '"Fraunces", serif',
					fontSize: "clamp(1.3rem, 4.5vw, 1.75rem)",
					fontWeight: 400,
					letterSpacing: "-0.015em",
					marginTop: 6,
					lineHeight: 1,
				}}
			>
				{value}
			</div>
			{sub && (
				<div
					style={{
						fontSize: 11,
						color: highlight ? "rgba(246,242,234,0.55)" : C.muted,
						marginTop: 4,
					}}
				>
					{sub}
				</div>
			)}
		</div>
	);
}

function SelectField({
	value,
	onChange,
	options,
	icon,
}: {
	value: string;
	onChange: (v: string) => void;
	options: [string, string][];
	icon: React.ReactNode;
}) {
	return (
		<div className='relative'>
			<div
				className='flex items-center gap-1.5 pl-3 pr-8 py-2 rounded pointer-events-none'
				style={{
					border: `1px solid ${C.border}`,
					background: C.surface,
					fontSize: 12.5,
					color: C.ink,
				}}
			>
				<span style={{ color: C.muted }}>{icon}</span>
				<span>{options.find(([k]) => k === value)?.[1] || value}</span>
				<ChevronDown
					size={12}
					style={{
						color: C.muted,
						position: "absolute",
						right: 10,
						top: "50%",
						transform: "translateY(-50%)",
					}}
				/>
			</div>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className='absolute inset-0 opacity-0 cursor-pointer'
			>
				{options.map(([k, label]) => (
					<option key={k} value={k}>
						{label}
					</option>
				))}
			</select>
		</div>
	);
}

function DonationRow({
	donation,
	onDelete,
	onViewPhoto,
}: {
	donation: Donation;
	onDelete: () => void;
	onViewPhoto: () => void;
}) {
	const [confirming, setConfirming] = useState(false);
	const subtotal = (donation.quantity || 1) * (donation.value || 0);

	return (
		<div
			className='flex items-stretch gap-3 p-3 rounded fade-in'
			style={{ background: C.surface, border: `1px solid ${C.border}` }}
		>
			<button
				onClick={donation.photo_url ? onViewPhoto : undefined}
				className='flex-shrink-0 rounded overflow-hidden flex items-center justify-center'
				style={{
					width: 72,
					height: 72,
					background: C.bg,
					border: `1px solid ${C.border}`,
					cursor: donation.photo_url ? "zoom-in" : "default",
				}}
			>
				{donation.photo_url ? (
					<img
						src={donation.photo_url}
						alt=''
						style={{ width: "100%", height: "100%", objectFit: "cover" }}
					/>
				) : (
					<ImageIcon size={20} style={{ color: C.subtle }} />
				)}
			</button>

			<div className='flex-1 min-w-0'>
				<div className='flex items-baseline justify-between gap-3'>
					<div
						style={{
							fontFamily: '"Fraunces", serif',
							fontSize: 17,
							letterSpacing: "-0.01em",
							lineHeight: 1.2,
						}}
						className='truncate'
					>
						{donation.description}
					</div>
					<div
						style={{
							fontFamily: '"JetBrains Mono", monospace',
							fontSize: 14,
							fontWeight: 500,
							whiteSpace: "nowrap",
						}}
					>
						{fmtMoney(subtotal)}
					</div>
				</div>
				<div
					className='flex items-center gap-2 mt-1 flex-wrap'
					style={{ fontSize: 11.5, color: C.muted }}
				>
					<span>{fmtDate(donation.date)}</span>
					{donation.category && (
						<>
							<span>·</span>
							<span>{donation.category}</span>
						</>
					)}
					{donation.condition && (
						<>
							<span>·</span>
							<span>{donation.condition}</span>
						</>
					)}
					{donation.quantity > 1 && (
						<>
							<span>·</span>
							<span>qty {donation.quantity}</span>
						</>
					)}
				</div>
				{donation.notes && (
					<div
						style={{
							fontSize: 12,
							color: C.muted,
							marginTop: 4,
							fontStyle: "italic",
						}}
						className='truncate'
					>
						{donation.notes}
					</div>
				)}
			</div>

			<div className='flex-shrink-0 flex items-start'>
				{confirming ? (
					<div className='flex gap-1'>
						<button
							onClick={onDelete}
							style={{
								fontSize: 11,
								padding: "4px 8px",
								borderRadius: 3,
								background: C.accent,
								color: "#fff",
							}}
						>
							Delete
						</button>
						<button
							onClick={() => setConfirming(false)}
							style={{
								fontSize: 11,
								padding: "4px 8px",
								borderRadius: 3,
								color: C.muted,
							}}
						>
							Cancel
						</button>
					</div>
				) : (
					<button
						onClick={() => setConfirming(true)}
						className='p-1.5 rounded opacity-40 hover:opacity-100 transition-opacity'
						aria-label='Delete'
					>
						<Trash2 size={14} style={{ color: C.muted }} />
					</button>
				)}
			</div>
		</div>
	);
}

function EmptyState({ hasAny, onAdd }: { hasAny: boolean; onAdd: () => void }) {
	return (
		<div
			className='py-16 px-6 rounded text-center'
			style={{ background: C.surface, border: `1px dashed ${C.borderStrong}` }}
		>
			<div
				className='mx-auto flex items-center justify-center rounded-full mb-4'
				style={{
					width: 48,
					height: 48,
					background: C.bg,
					border: `1px solid ${C.border}`,
				}}
			>
				<Package size={20} style={{ color: C.muted }} />
			</div>
			<div
				style={{
					fontFamily: '"Fraunces", serif',
					fontSize: 20,
					letterSpacing: "-0.01em",
				}}
			>
				{hasAny ? "Nothing matches that filter" : "Your ledger is empty"}
			</div>
			<p
				style={{
					fontSize: 13,
					color: C.muted,
					marginTop: 6,
					maxWidth: "32ch",
					marginLeft: "auto",
					marginRight: "auto",
				}}
			>
				{hasAny
					? "Adjust the year or category filter to see more."
					: "Snap a photo, jot your estimate, and start building your year-end record."}
			</p>
			{!hasAny && (
				<button
					onClick={onAdd}
					className='mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full'
					style={{ background: C.ink, color: C.bg, fontSize: 13 }}
				>
					<Plus size={14} /> Add your first donation
				</button>
			)}
		</div>
	);
}

function AddDonationForm({
	onClose,
	onSave,
}: {
	onClose: () => void;
	onSave: (d: Omit<Donation, "id" | "created_at">) => Promise<void>;
}) {
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	const [processing, setProcessing] = useState(false);
	const [analyzing, setAnalyzing] = useState(false);
	const [aiNote, setAiNote] = useState<{
		reasoning?: string;
		valueRange?: string;
		error?: string;
	} | null>(null);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState({
		description: "",
		date: new Date().toISOString().slice(0, 10),
		category: "Clothing & Shoes",
		condition: "Good",
		quantity: 1 as string | number,
		value: "" as string | number,
		notes: "",
	});
	const fileRef = useRef<HTMLInputElement>(null);

	const analyzePhoto = async (dataUrl: string) => {
		setAnalyzing(true);
		setAiNote(null);
		try {
			const base64 = dataUrl.split(",")[1];
			const response = await fetch("/api/analyze-photo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ image: base64 }),
			});
			const data = await response.json();
			if (data.error) {
				setAiNote({ error: "Couldn't auto-analyze. Fill in manually." });
			} else {
				setForm((f) => ({
					...f,
					description: data.description || f.description,
					category: CATEGORIES.includes(data.category)
						? data.category
						: f.category,
					condition: CONDITIONS.includes(data.condition)
						? data.condition
						: f.condition,
					value: data.suggestedValue != null ? data.suggestedValue : f.value,
				}));
				setAiNote({ reasoning: data.reasoning, valueRange: data.valueRange });
			}
		} catch (err) {
			console.error("Analysis failed:", err);
			setAiNote({ error: "Analysis failed. Fill in manually." });
		}
		setAnalyzing(false);
	};

	const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setProcessing(true);
		try {
			const data = await compressImage(file);
			setPhotoPreview(data);
			setProcessing(false);
			analyzePhoto(data);
		} catch (err) {
			console.error(err);
			setProcessing(false);
		}
	};

	const canSave =
		form.description.trim() &&
		form.value !== "" &&
		parseFloat(String(form.value)) >= 0;

	const handleSubmit = async () => {
		if (!canSave || saving) return;
		setSaving(true);
		await onSave({
			description: form.description.trim(),
			date: form.date,
			category: form.category,
			condition: form.condition,
			quantity: Math.max(1, parseInt(String(form.quantity)) || 1),
			value: parseFloat(String(form.value)) || 0,
			notes: form.notes.trim(),
			photo_url: photoPreview || undefined,
		} as Omit<Donation, "id" | "created_at">);
		onClose();
	};

	const subtotal =
		(parseInt(String(form.quantity)) || 1) *
		(parseFloat(String(form.value)) || 0);

	return (
		<div
			className='fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4'
			style={{ background: "rgba(26,22,18,0.5)" }}
			onClick={onClose}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className='w-full max-w-lg rounded-t-2xl sm:rounded-lg overflow-hidden fade-in'
				style={{
					background: C.surface,
					maxHeight: "92vh",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* Header */}
				<div
					className='flex items-center justify-between px-5 py-4'
					style={{ borderBottom: `1px solid ${C.border}` }}
				>
					<div>
						<div
							style={{
								fontFamily: '"JetBrains Mono", monospace',
								fontSize: 10,
								letterSpacing: "0.18em",
								color: C.muted,
								textTransform: "uppercase",
							}}
						>
							New Entry
						</div>
						<div
							style={{
								fontFamily: '"Fraunces", serif',
								fontSize: 22,
								letterSpacing: "-0.01em",
								marginTop: 2,
							}}
						>
							Add donation
						</div>
					</div>
					<button
						onClick={onClose}
						className='p-2 rounded'
						style={{ color: C.muted }}
					>
						<X size={20} />
					</button>
				</div>

				{/* Body */}
				<div className='overflow-y-auto px-5 py-5' style={{ flex: 1 }}>
					{/* Photo */}
					<div
						className='rounded mb-3 relative overflow-hidden'
						style={{
							aspectRatio: "4 / 3",
							background: C.bg,
							border: `1px ${photoPreview ? "solid" : "dashed"} ${C.borderStrong}`,
						}}
					>
						{photoPreview ? (
							<>
								<img
									src={photoPreview}
									alt=''
									style={{ width: "100%", height: "100%", objectFit: "cover" }}
								/>
								{analyzing && (
									<div
										className='absolute inset-0 flex items-center justify-center'
										style={{
											background: "rgba(26,22,18,0.55)",
											backdropFilter: "blur(2px)",
										}}
									>
										<div
											className='flex items-center gap-2 px-4 py-2 rounded-full'
											style={{
												background: C.surface,
												color: C.ink,
												fontSize: 12.5,
												fontWeight: 500,
											}}
										>
											<Sparkles
												size={14}
												style={{ color: C.accent }}
												className='animate-pulse'
											/>
											Analyzing item…
										</div>
									</div>
								)}
								<button
									onClick={() => {
										setPhotoPreview(null);
										setAiNote(null);
										if (fileRef.current) fileRef.current.value = "";
									}}
									className='absolute top-2 right-2 p-1.5 rounded-full'
									style={{ background: "rgba(26,22,18,0.7)", color: "#fff" }}
								>
									<X size={14} />
								</button>
							</>
						) : (
							<button
								onClick={() => fileRef.current?.click()}
								disabled={processing}
								className='w-full h-full flex flex-col items-center justify-center gap-2'
								style={{ color: C.muted }}
							>
								<div
									className='flex items-center justify-center rounded-full'
									style={{
										width: 44,
										height: 44,
										background: C.surface,
										border: `1px solid ${C.border}`,
									}}
								>
									<Camera size={20} />
								</div>
								<div style={{ fontSize: 13, fontWeight: 500, color: C.ink }}>
									{processing ? "Processing…" : "Take or upload photo"}
								</div>
								<div
									style={{
										fontSize: 11,
										display: "flex",
										alignItems: "center",
										gap: 4,
									}}
								>
									<Sparkles size={10} style={{ color: C.accent }} />
									Auto-fills details with AI
								</div>
							</button>
						)}
						<input
							ref={fileRef}
							type='file'
							accept='image/*'
							capture='environment'
							onChange={handlePhoto}
							className='hidden'
						/>
					</div>

					{/* AI note */}
					{aiNote && !analyzing && (
						<div
							className='mb-4 p-3 rounded fade-in flex items-start gap-2'
							style={{
								background: aiNote.error ? "#FDF2EC" : C.accentSoft,
								border: `1px solid ${aiNote.error ? "#E8C5B0" : "#E8D0C0"}`,
							}}
						>
							<Sparkles
								size={13}
								style={{ color: C.accent, marginTop: 2, flexShrink: 0 }}
							/>
							<div style={{ fontSize: 12, lineHeight: 1.45, color: C.ink }}>
								{aiNote.error ? (
									<span style={{ color: C.muted }}>{aiNote.error}</span>
								) : (
									<>
										<span style={{ fontWeight: 500 }}>{aiNote.reasoning}</span>
										{aiNote.valueRange && (
											<span
												style={{
													color: C.muted,
													marginLeft: 6,
													fontFamily: '"JetBrains Mono", monospace',
													fontSize: 11,
												}}
											>
												· suggested {aiNote.valueRange}
											</span>
										)}
										<div
											style={{
												color: C.muted,
												fontSize: 11,
												marginTop: 3,
												fontStyle: "italic",
											}}
										>
											Edit any field below before saving.
										</div>
									</>
								)}
							</div>
						</div>
					)}

					{/* Description */}
					<Field label='Item description' required>
						<input
							value={form.description}
							onChange={(e) =>
								setForm({ ...form, description: e.target.value })
							}
							placeholder='e.g. Wool coat, black, size M'
							style={inputStyle}
						/>
					</Field>

					{/* Value + Quantity */}
					<div className='grid grid-cols-3 gap-3 mb-4'>
						<div className='col-span-2'>
							<Field label='Your value estimate' required>
								<div className='relative'>
									<span
										style={{
											position: "absolute",
											left: 12,
											top: "50%",
											transform: "translateY(-50%)",
											color: C.muted,
											fontFamily: '"JetBrains Mono", monospace',
											fontSize: 14,
										}}
									>
										$
									</span>
									<input
										type='number'
										inputMode='decimal'
										step='0.01'
										min='0'
										value={form.value}
										onChange={(e) =>
											setForm({ ...form, value: e.target.value })
										}
										placeholder='0.00'
										style={{
											...inputStyle,
											paddingLeft: 24,
											fontFamily: '"JetBrains Mono", monospace',
										}}
									/>
								</div>
							</Field>
						</div>
						<Field label='Quantity'>
							<input
								type='number'
								inputMode='numeric'
								min='1'
								value={form.quantity}
								onChange={(e) => setForm({ ...form, quantity: e.target.value })}
								style={{
									...inputStyle,
									fontFamily: '"JetBrains Mono", monospace',
									textAlign: "center",
								}}
							/>
						</Field>
					</div>

					{Number(form.quantity) > 1 && form.value && (
						<div
							style={{
								fontFamily: '"JetBrains Mono", monospace',
								fontSize: 11,
								color: C.muted,
								marginTop: -8,
								marginBottom: 16,
								textAlign: "right",
							}}
						>
							Subtotal:{" "}
							<span style={{ color: C.ink }}>{fmtMoney(subtotal)}</span>
						</div>
					)}

					{/* Date */}
					<Field label='Date'>
						<input
							type='date'
							value={form.date}
							onChange={(e) => setForm({ ...form, date: e.target.value })}
							style={{
								...inputStyle,
								fontFamily: '"JetBrains Mono", monospace',
							}}
						/>
					</Field>

					{/* Category + Condition */}
					<div className='grid grid-cols-2 gap-3 mb-4'>
						<Field label='Category'>
							<select
								value={form.category}
								onChange={(e) => setForm({ ...form, category: e.target.value })}
								style={inputStyle}
							>
								{CATEGORIES.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>
						</Field>
						<Field label='Condition'>
							<select
								value={form.condition}
								onChange={(e) =>
									setForm({ ...form, condition: e.target.value })
								}
								style={inputStyle}
							>
								{CONDITIONS.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>
						</Field>
					</div>

					{/* Notes */}
					<Field
						label='Notes'
						hint='Optional — brand, details, Goodwill location'
					>
						<textarea
							value={form.notes}
							onChange={(e) => setForm({ ...form, notes: e.target.value })}
							rows={2}
							style={{
								...inputStyle,
								resize: "none",
								paddingTop: 10,
								paddingBottom: 10,
							}}
						/>
					</Field>
				</div>

				{/* Footer */}
				<div
					className='flex items-center gap-3 px-5 py-4'
					style={{ borderTop: `1px solid ${C.border}`, background: C.bg }}
				>
					<button
						onClick={onClose}
						className='px-4 py-2.5 rounded'
						style={{ fontSize: 13, color: C.muted }}
					>
						Cancel
					</button>
					<div className='flex-1' />
					<button
						onClick={handleSubmit}
						disabled={!canSave || saving}
						className='px-5 py-2.5 rounded transition-opacity'
						style={{
							background: C.ink,
							color: C.bg,
							fontSize: 13,
							fontWeight: 500,
							opacity: canSave && !saving ? 1 : 0.4,
							cursor: canSave && !saving ? "pointer" : "not-allowed",
						}}
					>
						{saving ? "Saving…" : "Save donation"}
					</button>
				</div>
			</div>
		</div>
	);
}

const inputStyle: React.CSSProperties = {
	width: "100%",
	padding: "10px 12px",
	background: "#FFFFFF",
	border: `1px solid ${C.border}`,
	borderRadius: 4,
	fontSize: 14,
	color: C.ink,
	outline: "none",
};

function Field({
	label,
	hint,
	required,
	children,
}: {
	label: string;
	hint?: string;
	required?: boolean;
	children: React.ReactNode;
}) {
	return (
		<div className='mb-4'>
			<div className='flex items-baseline justify-between mb-1.5'>
				<label
					style={{
						fontFamily: '"JetBrains Mono", monospace',
						fontSize: 10,
						letterSpacing: "0.14em",
						color: C.muted,
						textTransform: "uppercase",
					}}
				>
					{label}
					{required && (
						<span style={{ color: C.accent, marginLeft: 4 }}>*</span>
					)}
				</label>
				{hint && (
					<span style={{ fontSize: 11, color: C.subtle, fontStyle: "italic" }}>
						{hint}
					</span>
				)}
			</div>
			{children}
		</div>
	);
}

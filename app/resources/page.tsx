import { ExternalLink } from "lucide-react";

const C = {
	bg: "#F6F2EA",
	surface: "#FFFFFF",
	ink: "#1A1612",
	muted: "#7C6F5E",
	border: "#E5DDD0",
	accent: "#8B3A1F",
};

const LINKS = [
	{
		title: "IRS Publication 561 — Determining the Value of Donated Property",
		href: "https://www.irs.gov/pub/irs-pdf/p561.pdf",
		desc: "Official IRS guidance on fair market value for non-cash charitable contributions.",
	},
	{
		title: "IRS Publication 526 — Charitable Contributions",
		href: "https://www.irs.gov/pub/irs-pdf/p526.pdf",
		desc: "Rules on what you can deduct, recordkeeping, and limits.",
	},
	{
		title: "Form 8283",
		href: "https://www.irs.gov/pub/irs-pdf/f8283.pdf",
		desc: "Noncash Charitable Contributions — required if your total non-cash deductions exceed $500 in a year.",
	},
	{
		title: "Goodwill Donation Valuation Guide",
		href: "https://www.goodwill.org/donors/donate-stuff/",
		desc: "Suggested fair-market values for commonly donated items.",
	},
	{
		title: "Salvation Army Valuation Guide",
		href: "https://satruck.org/Home/DonationValueGuide",
		desc: "Another widely used reference for thrift-store item values.",
	},
];

export default function Resources() {
	return (
		<div style={{ background: C.bg, color: C.ink, minHeight: "100vh" }}>
			<div className='max-w-3xl mx-auto px-5 pb-32'>
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
						Reference Material
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
						Tax & Valuation{" "}
						<em style={{ fontStyle: "italic", color: C.accent }}>Resources</em>
					</h1>
					<p
						style={{
							color: C.muted,
							marginTop: 10,
							maxWidth: "44ch",
							fontSize: 14.5,
							lineHeight: 1.5,
						}}
					>
						Official IRS publications and donor valuation guides to help you set
						fair market values and prepare your return.
					</p>
				</header>

				<section className='mt-6 space-y-2.5'>
					{LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							target='_blank'
							rel='noopener noreferrer'
							className='block p-4 rounded transition-colors hover:opacity-90'
							style={{
								background: C.surface,
								border: `1px solid ${C.border}`,
							}}
						>
							<div className='flex items-start justify-between gap-3'>
								<div
									style={{
										fontFamily: '"Fraunces", serif',
										fontSize: 16,
										letterSpacing: "-0.01em",
										lineHeight: 1.25,
									}}
								>
									{link.title}
								</div>
								<ExternalLink
									size={14}
									style={{ color: C.muted, flexShrink: 0, marginTop: 4 }}
								/>
							</div>
							<div
								style={{
									fontSize: 13,
									color: C.muted,
									marginTop: 6,
									lineHeight: 1.45,
								}}
							>
								{link.desc}
							</div>
						</a>
					))}
				</section>

				<p
					style={{
						fontSize: 12,
						color: C.muted,
						fontStyle: "italic",
						marginTop: 24,
						textAlign: "center",
					}}
				>
					Informational only — not tax advice. Consult a tax professional for
					your specific situation.
				</p>
			</div>
		</div>
	);
}

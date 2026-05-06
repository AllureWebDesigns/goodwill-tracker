const C = {
	bg: "#F6F2EA",
	surface: "#FFFFFF",
	ink: "#1A1612",
	muted: "#7C6F5E",
	border: "#E5DDD0",
	accent: "#8B3A1F",
};

export default function About() {
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
						About
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
						Why this{" "}
						<em style={{ fontStyle: "italic", color: C.accent }}>exists</em>
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
						A simple ledger for the bags of clothes and household goods that
						leave your house each year — so come tax season, you have proof
						instead of guesswork.
					</p>
				</header>

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
						How it works
					</div>
					<ol
						style={{
							fontSize: 14,
							lineHeight: 1.6,
							color: C.ink,
							paddingLeft: 18,
						}}
						className='space-y-2'
					>
						<li>Snap a photo of the item before you drop it off.</li>
						<li>
							AI suggests a fair-market value based on category and condition —
							edit anything before saving.
						</li>
						<li>
							Filter by year and export a CSV when it&apos;s time to file.
						</li>
					</ol>
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
					Built as a personal tool. Not tax advice — see the Resources tab for
					official IRS guidance.
				</p>
			</div>
		</div>
	);
}

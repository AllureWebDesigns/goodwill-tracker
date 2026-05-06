"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const C = {
	bg: "#F6F2EA",
	ink: "#1A1612",
	muted: "#7C6F5E",
	border: "#E5DDD0",
	accent: "#8B3A1F",
};

const TABS = [
	{ href: "/", label: "Donations" },
	{ href: "/resources", label: "Resources" },
	{ href: "/about", label: "About" },
];

export default function Nav() {
	const pathname = usePathname();
	return (
		<nav
			aria-label='Primary'
			style={{
				background: C.bg,
				borderBottom: `1px solid ${C.border}`,
				position: "sticky",
				top: 0,
				zIndex: 30,
			}}
		>
			<div className='max-w-3xl mx-auto px-3 sm:px-5'>
				<ul
					className='flex items-center gap-1'
					style={{
						listStyle: "none",
						margin: 0,
						padding: 0,
						overflowX: "auto",
						WebkitOverflowScrolling: "touch",
					}}
				>
					{TABS.map((tab) => {
						const active =
							tab.href === "/"
								? pathname === "/"
								: pathname.startsWith(tab.href);
						return (
							<li key={tab.href} style={{ flexShrink: 0 }}>
								<Link
									href={tab.href}
									aria-current={active ? "page" : undefined}
									style={{
										display: "inline-block",
										fontFamily: '"JetBrains Mono", monospace',
										fontSize: 11,
										letterSpacing: "0.18em",
										textTransform: "uppercase",
										color: active ? C.ink : C.muted,
										padding: "16px 14px 14px",
										borderBottom: `2px solid ${active ? C.accent : "transparent"}`,
										marginBottom: -1,
										minHeight: 44,
									}}
								>
									{tab.label}
								</Link>
							</li>
						);
					})}
				</ul>
			</div>
		</nav>
	);
}

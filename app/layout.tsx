import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "./components/Nav";

export const metadata: Metadata = {
	title: "Goodwill Donations Tracker",
	description: "Track and document your charitable donations for tax season",
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='en'>
			<head>
				<link
					href='https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'
					rel='stylesheet'
				/>
			</head>
			<body>
				<a href='#main' className='skip-link'>
					Skip to main content
				</a>
				<Nav />
				<main id='main'>{children}</main>
			</body>
		</html>
	);
}

"use client";
import React, {useState} from "react";
import {User} from "next-auth";
import {signOut, useSession} from "next-auth/react";
import {Button} from "./ui/button";
import Link from "next/link";
import {LogOut, Menu, X, User as UserIcon, MessageSquare} from "lucide-react";

function Navbar() {
	const {data: session} = useSession();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const user: User = session?.user as User;

	const handleSignOut = async () => {
		await signOut({
			callbackUrl: "/sign-in",
			redirect: true,
		});
	};

	return (
		<nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo/Brand */}
					<div className="flex items-center space-x-2">
						<Link
							href="/"
							className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
						>
							<MessageSquare className="h-6 w-6 text-primary" />
							<span>Void Voice</span>
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center space-x-4">
						{session ? (
							<>
								{/* User Info */}
								<div className="flex items-center space-x-2 px-3 py-2 rounded-md bg-muted/50">
									<UserIcon className="h-4 w-4 text-muted-foreground" />
									<span className="text-sm text-foreground">
										Welcome, {user?.username || user?.name || user?.email}
									</span>
								</div>

								{/* Dashboard Link */}
								<Link href="/dashboard">
									<Button
										variant="ghost"
										className="text-foreground hover:text-primary hover:bg-accent"
									>
										Dashboard
									</Button>
								</Link>

								{/* Sign Out */}
								<Button
									onClick={handleSignOut}
									variant="outline"
									className="border-border hover:bg-destructive hover:text-destructive-foreground"
								>
									<LogOut className="h-4 w-4 mr-2" />
									Sign Out
								</Button>
							</>
						) : (
							<>
								{/* Sign In/Sign Up Links */}
								<Link href="/sign-in">
									<Button
										variant="ghost"
										className="text-foreground hover:text-primary hover:bg-accent"
									>
										Sign In
									</Button>
								</Link>
								<Link href="/sign-up">
									<Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
										Get Started
									</Button>
								</Link>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="text-foreground hover:bg-accent"
						>
							{isMobileMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<div className="md:hidden border-t border-border bg-card">
						<div className="px-2 py-4 space-y-2">
							{session ? (
								<>
									{/* User Info Mobile */}
									<div className="flex items-center space-x-2 px-3 py-2 text-sm text-foreground bg-muted/50 rounded-md">
										<UserIcon className="h-4 w-4 text-muted-foreground" />
										<span>{user?.username || user?.name || user?.email}</span>
									</div>

									{/* Dashboard Link Mobile */}
									<Link
										href="/dashboard"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<Button
											variant="ghost"
											className="w-full justify-start text-foreground hover:bg-accent"
										>
											Dashboard
										</Button>
									</Link>

									{/* Sign Out Mobile */}
									<Button
										onClick={() => {
											handleSignOut();
											setIsMobileMenuOpen(false);
										}}
										variant="outline"
										className="w-full justify-start border-border hover:bg-destructive hover:text-destructive-foreground"
									>
										<LogOut className="h-4 w-4 mr-2" />
										Sign Out
									</Button>
								</>
							) : (
								<>
									{/* Sign In Mobile */}
									<Link
										href="/sign-in"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<Button
											variant="ghost"
											className="w-full justify-start text-foreground hover:bg-accent"
										>
											Sign In
										</Button>
									</Link>

									{/* Sign Up Mobile */}
									<Link
										href="/sign-up"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										<Button className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground">
											Get Started
										</Button>
									</Link>
								</>
							)}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}

export default Navbar;

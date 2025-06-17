"use client";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import Link from "next/link";
import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {getSession, signIn} from "next-auth/react";
import {toast} from "sonner";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Loader2, LogIn} from "lucide-react"; // ✅ Removed Eye icons
import { signInSchema } from "@/schemas/signInSchema";



export default function SignInPage() {
	const [isSubmitting, setIsSubmitting] = useState(false);
	// ✅ Removed showPassword state
	const router = useRouter();

	const form = useForm<z.infer<typeof signInSchema>>({
		resolver: zodResolver(signInSchema),
		defaultValues: {
			identifier: "",
			password: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof signInSchema>) => {
		setIsSubmitting(true);
		try {
			const result = await signIn("credentials", {
				identifier: data.identifier,
				password: data.password,
				redirect: false,
			});

			if (result?.error) {
				if (result.error === "CredentialsSignin") {
					toast.error(
						"Invalid credentials. Please check your email/username and password."
					);
				} else {
					toast.error("Sign in failed. Please try again.");
				}
			} else if (result?.ok) {
				const session = await getSession();
				toast.success(
					`Welcome back, ${session?.user?.username || session?.user?.name || "User"}!`
				);
				router.replace("/dashboard");
			}
		} catch (error) {
			console.error("Sign in error:", error);
			toast.error("An unexpected error occurred. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="flex items-center justify-center min-h-screen bg-background font-sans">
			<div className="w-full max-w-md bg-card rounded-lg border border-border px-8 py-10 shadow-lg space-y-8">
				{/* Header */}
				<div className="text-center space-y-2">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
						<LogIn className="w-8 h-8 text-primary" />
					</div>
					<h1 className="text-3xl font-bold text-card-foreground tracking-tight">
						Welcome Back
					</h1>
					<p className="text-muted-foreground">Enter the void once more...</p>
				</div>

				{/* Form */}
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						<FormField
							name="identifier"
							control={form.control}
							render={({field}) => (
								<FormItem>
									<FormLabel className="text-card-foreground">
										Email or Username
									</FormLabel>
									<FormControl>
										<Input
											{...field}
											placeholder="Enter your email or username"
											className="bg-background border-input"
											autoComplete="username"
											spellCheck="false"
											autoCapitalize="off"
											autoCorrect="off"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							name="password"
							control={form.control}
							render={({field}) => (
								<FormItem>
									<FormLabel className="text-card-foreground">
										Password
									</FormLabel>
									<FormControl>
										{/* ✅ Simple password input - no custom toggle */}
										<Input
											{...field}
											type="password"
											placeholder="Enter your password"
											className="bg-background border-input"
											autoComplete="current-password"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Forgot Password Link */}
						<div className="text-right">
							<Link
								href="/forgot-password"
								className="text-sm text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
							>
								Forgot your password?
							</Link>
						</div>

						<Button
							className="w-full bg-primary hover:bg-primary/90 text-primary-foreground focus:ring-2 focus:ring-primary focus:ring-offset-2"
							disabled={isSubmitting}
							type="submit"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Signing In...
								</>
							) : (
								"Sign In"
							)}
						</Button>
					</form>
				</Form>

				{/* Divider */}
				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-border" />
					</div>
					<div className="relative flex justify-center text-xs uppercase">
						<span className="bg-card px-2 text-muted-foreground">
							New to Void Voice?
						</span>
					</div>
				</div>

				{/* Sign Up Link */}
				<div className="text-center">
					<p className="text-sm text-muted-foreground">
						Don&apos;t have an account?{" "}
						<Link
							href="/sign-up"
							className="text-primary hover:text-primary/80 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
						>
							Create one now
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

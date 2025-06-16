"use client";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {z} from "zod";
import Link from "next/link";
import {useDebounceValue} from "usehooks-ts";

import React, {useEffect, useState} from "react";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {signUpSchema} from "@/schemas/signUpSchema";
import axios, {AxiosError} from "axios";
import {ApiResponse} from "@/types/ApiResponse";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Loader2, CheckCircle, XCircle, User} from "lucide-react";

function SignUpPage() {
	const [username, setUsername] = useState("");
	const [usernameMessage, setUsernameMessage] = useState("");
	const [isCheckingUsername, setIsCheckingUsername] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [debouncedUsername] = useDebounceValue(username, 500);
	const router = useRouter();

	const form = useForm<z.infer<typeof signUpSchema>>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			username: "",
			email: "",
			password: "",
		},
	});

	useEffect(() => {
		const checkUniqueUsername = async () => {
			if (!debouncedUsername || debouncedUsername.trim() === "") {
				setUsernameMessage("");
				return;
			}

			setIsCheckingUsername(true);
			setUsernameMessage("");

			try {
				const response = await axios.get(
					`/api/check-username-unique?username=${encodeURIComponent(debouncedUsername)}`
				);
				setUsernameMessage(response.data.message);
			} catch (error) {
				const axiosError = error as AxiosError<ApiResponse>;
				setUsernameMessage(
					axiosError.response?.data.message ?? "Error checking username"
				);
			} finally {
				setIsCheckingUsername(false);
			}
		};

		checkUniqueUsername();
	}, [debouncedUsername]);

	const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
		setIsSubmitting(true);
		try {
			const response = await axios.post<ApiResponse>("/api/signup", data);
			if (response.data.success) {
				toast.success(response.data.message);
				router.replace(`/verify/${username}`);
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.log("Error:", error);
			const axiosError = error as AxiosError<ApiResponse>;
			toast.error(axiosError.response?.data.message ?? "Error signing up");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Username status indicator
	const getUsernameStatus = () => {
		if (isCheckingUsername) {
			return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
		}
		if (usernameMessage === "Username is unique and available") {
			return <CheckCircle className="h-4 w-4 text-green-600" />;
		}
		if (usernameMessage === "Username already taken") {
			return <XCircle className="h-4 w-4 text-destructive" />;
		}
		return null;
	};

	return (
		<div className="flex justify-center items-center min-h-screen bg-background">
			<div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg border shadow-lg">
				{/* Header */}
				<div className="text-center space-y-4">
					<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
						<User className="w-8 h-8 text-primary" />
					</div>
					<h1 className="text-3xl font-bold text-card-foreground">
						Join Void Voice
					</h1>
					<p className="text-muted-foreground">
						Your voice echoes… but never the source.
					</p>
				</div>

				{/* Form */}
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						<FormField
							name="username"
							control={form.control}
							render={({field}) => (
								<FormItem>
									<FormLabel className="text-card-foreground">
										Username
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												placeholder="Enter username"
												{...field}
												className="pr-10 bg-background border-input"
												onChange={(e) => {
													field.onChange(e);
													setUsername(e.target.value);
												}}
											/>
											<div className="absolute right-3 top-1/2 -translate-y-1/2">
												{getUsernameStatus()}
											</div>
										</div>
									</FormControl>
									<FormDescription
										className={`flex items-center gap-2 ${
											usernameMessage === "Username is unique and available"
												? "text-green-600"
												: usernameMessage === "Username already taken"
													? "text-destructive"
													: "text-muted-foreground"
										}`}
									>
										{isCheckingUsername
											? "Checking username..."
											: usernameMessage || "Choose a unique username"}
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							name="email"
							control={form.control}
							render={({field}) => (
								<FormItem>
									<FormLabel className="text-card-foreground">
										Email
									</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="Enter your email"
											{...field}
											className="bg-background border-input"
										/>
									</FormControl>
									<FormDescription className="text-muted-foreground">
										We&apos;ll send you a verification code
									</FormDescription>
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
										<Input
											type="password"
											placeholder="Create a strong password"
											{...field}
											className="bg-background border-input"
										/>
									</FormControl>
									<FormDescription className="text-muted-foreground">
										Must be at least 8 characters long
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
							disabled={isSubmitting}
							type="submit"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Creating Account...
								</>
							) : (
								"Create Account"
							)}
						</Button>
					</form>
				</Form>

				{/* Footer */}
				<div className="text-center">
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link
							href="/sign-in"
							className="text-primary hover:text-primary/80 font-medium transition-colors"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default SignUpPage;
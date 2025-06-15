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
import {Loader2} from "lucide-react";

function Page() {
	const [username, setUsername] = useState("");
	const [usernameMessage, setUsernameMessage] = useState("");
	const [isCheckingUsername, setIscheckingUsername] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fix: Properly destructure the debounced value
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
			// Add proper validation to prevent unnecessary API calls
			if (!debouncedUsername || debouncedUsername.trim() === "") {
				setUsernameMessage("");
				return;
			}

			setIscheckingUsername(true);
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
				setIscheckingUsername(false);
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

	return (
		<div className="flex justify-center items-center min-h-screen bg-gray-800">
			<div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
				<div className="text-center">
					<h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
						Join Void Voice
					</h1>
					<p className="mb-4">Your voice echoes… but never the source.</p>
				</div>
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
									<FormLabel>Username</FormLabel>
									<FormControl>
										<Input
											placeholder="username"
											{...field}
											onChange={(e) => {
												field.onChange(e);
												setUsername(e.target.value);
											}}
										/>
									</FormControl>
									<FormDescription
										className={
											usernameMessage === "Username is unique and available"
												? "text-green-600"
												: usernameMessage === "Username already taken"
													? "text-red-600"
													: ""
										}
									>
										{isCheckingUsername
											? "Checking username..."
											: usernameMessage}
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
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="email"
											{...field}
										/>
									</FormControl>
									<FormDescription>This is your email.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							name="password"
							control={form.control}
							render={({field}) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											type="password"
											placeholder="password"
											{...field}
										/>
									</FormControl>
									<FormDescription>This is your password.</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<Button
							className="w-full"
							disabled={isSubmitting}
							type="submit"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
									wait...
								</>
							) : (
								"Submit"
							)}
						</Button>
					</form>
				</Form>
				<div className="text-center mt-4">
					<p>
						Already have an account?{" "}
						<Link
							href="/sign-in"
							className="text-blue-600 hover:text-blue-800"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default Page;

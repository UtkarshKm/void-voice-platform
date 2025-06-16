"use client";
import {verifySchema} from "@/schemas/verifySchema";
import {ApiResponse} from "@/types/ApiResponse";
import {zodResolver} from "@hookform/resolvers/zod";
import axios, {AxiosError} from "axios";
import {useParams, useRouter} from "next/navigation";
import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {toast} from "sonner";
import {z} from "zod";
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
import {Loader2, Mail, ArrowLeft} from "lucide-react";
import Link from "next/link";

function VerifyPage() {
	const router = useRouter();
	const params = useParams<{username: string}>();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isResending, setIsResending] = useState(false);

	const form = useForm<z.infer<typeof verifySchema>>({
		resolver: zodResolver(verifySchema),
		defaultValues: {
			code: "",
		},
	});

	const onSubmit = async (data: z.infer<typeof verifySchema>) => {
		setIsSubmitting(true);
		try {
			const response = await axios.post<ApiResponse>("/api/verify-code", {
				username: params.username,
				code: data.code,
			});

			if (response.data.success) {
				toast.success(response.data.message);
				router.replace("/sign-in");
			} else {
				toast.error(response.data.message);
			}
		} catch (error) {
			console.log("Error:", error);
			const axiosError = error as AxiosError<ApiResponse>;
			toast.error(axiosError.response?.data.message ?? "Error verifying code");
		} finally {
			setIsSubmitting(false);
		}
	};

	// const handleResendCode = async () => {
	// 	setIsResending(true);
	// 	try {
	// 		const response = await axios.post<ApiResponse>("/api/resend-code", {
	// 			username: params.username,
	// 		});

	// 		if (response.data.success) {
	// 			toast.success("Verification code resent successfully");
	// 		} else {
	// 			toast.error(response.data.message);
	// 		}
	// 	} catch (error) {
	// 		const axiosError = error as AxiosError<ApiResponse>;
	// 		toast.error(axiosError.response?.data.message ?? "Error resending code");
	// 	} finally {
	// 		setIsResending(false);
	// 	}
	// };

	return (
		<div className="flex justify-center items-center min-h-screen bg-background">
			<div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg border shadow-lg">
				{/* Header */}
				<div className="text-center space-y-4">
					<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
						<Mail className="w-8 h-8 text-primary" />
					</div>
					<h1 className="text-3xl font-bold text-card-foreground">
						Verify Your Account
					</h1>
					<p className="text-muted-foreground">
						Enter the 6-digit code sent to your email for{" "}
						<span className="font-semibold text-foreground">
							{params.username}
						</span>
					</p>
				</div>

				{/* Form */}
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="space-y-6"
					>
						<FormField
							name="code"
							control={form.control}
							render={({field}) => (
								<FormItem>
									<FormLabel className="text-card-foreground">
										Verification Code
									</FormLabel>
									<FormControl>
										<Input
											placeholder="123456"
											{...field}
											className="text-center text-xl tracking-[0.5em] font-mono bg-background border-input"
											maxLength={6}
											autoComplete="one-time-code"
										/>
									</FormControl>
									<FormDescription className="text-center text-muted-foreground">
										Enter the 6-digit code from your email
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
									Verifying...
								</>
							) : (
								"Verify Account"
							)}
						</Button>
					</form>
				</Form>

				{/* Resend Section */}
				{/* <div className="space-y-4">
					<div className="text-center">
						<p className="text-sm text-muted-foreground mb-3">
							Didn&apos;t receive the code?
						</p>
						<Button
							variant="outline"
							onClick={handleResendCode}
							disabled={isResending}
							className="w-full border-border hover:bg-accent"
							type="button"
						>
							{isResending ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Sending...
								</>
							) : (
								"Resend Code"
							)}
						</Button>
					</div> */}

					{/* Back to Sign Up */}
					{/* <div className="text-center">
						<Link
							href="/sign-up"
							className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
						>
							<ArrowLeft className="mr-1 h-4 w-4" />
							Back to Sign Up
						</Link>
					</div>
				</div> */}
			</div>
		</div>
	);
}

export default VerifyPage;

"use client";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Message} from "@/model/Users";
import {toast} from "sonner";
import axios, {AxiosError} from "axios";
import {ApiResponse} from "@/types/ApiResponse";
import {Trash2, MessageSquare, Clock, AlertTriangle, X} from "lucide-react";
import {useState} from "react";

type MessageCardProps = {
	message: Message;
	onMessageDelete: (messageId: string) => void;
};

function MessageCard({message, onMessageDelete}: MessageCardProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

	const handleDeleteMessage = async () => {
		setIsDeleting(true);
		try {
			const response = await axios.delete<ApiResponse>(
				`/api/delete-message/${message._id}`
			);

			if (response.data.success) {
				toast.success("Anonymous message deleted successfully");
				onMessageDelete(message._id as string);
			} else {
				toast.error(response.data.message || "Failed to delete message");
			}
		} catch (error) {
			console.error("Error deleting message:", error);
			const axiosError = error as AxiosError<ApiResponse>;
			toast.error(
				axiosError.response?.data.message || "Error deleting message"
			);
		} finally {
			setIsDeleting(false);
			setShowDeleteConfirm(false);
		}
	};

	// Format date for display
	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date(date));
	};

	return (
		<Card className="w-full bg-card border-border shadow-sm hover:shadow-md transition-shadow">
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center space-x-2">
						<div className="p-2 rounded-full bg-primary/10">
							<MessageSquare className="h-4 w-4 text-primary" />
						</div>
						<div>
							<CardTitle className="text-lg text-card-foreground">
								Anonymous Voice
							</CardTitle>
							<CardDescription className="flex items-center space-x-1 text-muted-foreground">
								<Clock className="h-3 w-3" />
								<span>{formatDate(message.createdAt)}</span>
							</CardDescription>
						</div>
					</div>

					{/* Delete Button - Only show if not already showing confirmation */}
					{!showDeleteConfirm && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setShowDeleteConfirm(true)}
							className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
						>
							<Trash2 className="h-4 w-4" />
							<span className="sr-only">Delete message</span>
						</Button>
					)}
				</div>

				{/* Delete Confirmation Alert */}
				{showDeleteConfirm && (
					<Alert
						variant="destructive"
						className="mt-4"
					>
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle className="flex items-center justify-between">
							Delete Anonymous Message
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setShowDeleteConfirm(false)}
								className="h-6 w-6 p-0 hover:bg-destructive/20"
							>
								<X className="h-3 w-3" />
							</Button>
						</AlertTitle>
						<AlertDescription className="space-y-3">
							<p>
								Are you sure you want to delete this anonymous message? This
								action cannot be undone and the voice will be permanently
								silenced.
							</p>
							<div className="flex space-x-2">
								<Button
									size="sm"
									variant="destructive"
									onClick={handleDeleteMessage}
									disabled={isDeleting}
									className="bg-destructive hover:bg-destructive/90"
								>
									{isDeleting ? "Deleting..." : "Delete Message"}
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => setShowDeleteConfirm(false)}
									className="border-border hover:bg-accent"
								>
									Cancel
								</Button>
							</div>
						</AlertDescription>
					</Alert>
				)}
			</CardHeader>

			<CardContent className="pt-0">
				<div className="rounded-lg bg-muted/30 p-4 border-l-4 border-primary">
					<p className="text-foreground leading-relaxed whitespace-pre-wrap">
						{message.content}
					</p>
				</div>
			</CardContent>

			<CardFooter className="pt-3 border-t border-border/50">
				<div className="flex items-center justify-between w-full text-xs text-muted-foreground">
					<span className="flex items-center space-x-1">
						<span className="w-2 h-2 bg-green-500 rounded-full"></span>
						<span>Anonymous feedback received</span>
					</span>
					<span>ID: {typeof message._id === "string" ? message._id.slice(-8) : ""}</span>
				</div>
			</CardFooter>
		</Card>
	);
}

export default MessageCard;

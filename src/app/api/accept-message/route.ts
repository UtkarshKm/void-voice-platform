import UserModel from "@/model/Users";
import connectToDb from "@/lib/dbConnect";
import {getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]/options";
import {User} from "next-auth";

export async function POST(request: Request) {
	await connectToDb();
	const session = await getServerSession(authOptions);
	const user: User = session?.user as User;

	console.log("Received request to accept message.");
	console.log("User:", user);

	if (!session || !session.user) {
		return Response.json(
			{
				success: false,
				message: "Not authenticated",
			},
			{status: 401}
		);
	}

	const userId = user._id;

	// ✅ Changed from 'acceptedMessages' to 'acceptMessages'
	const {acceptMessages} = await request.json();

	console.log("Received acceptMessages:", acceptMessages); // Debug log

	// ✅ Updated variable name
	if (typeof acceptMessages !== "boolean") {
		return Response.json(
			{
				success: false,
				message: "Invalid input for acceptMessages. Must be a boolean.",
			},
			{status: 400}
		);
	}

	try {
		const updatedUser = await UserModel.findOneAndUpdate(
			{_id: userId},
			{
				// ✅ Use the correct variable
				isAcceptingMessages: acceptMessages,
			},
			{new: true}
		);

		if (!updatedUser) {
			return Response.json(
				{
					success: false,
					message: "User not found",
				},
				{status: 404}
			);
		}

		return Response.json(
			{
				success: true,
				message: "Message acceptance status updated successfully",
				isAcceptingMessages: updatedUser.isAcceptingMessages,
			},
			{status: 200}
		);
	} catch (error) {
		console.error("Error updating message acceptance status:", error);
		return Response.json(
			{
				success: false,
				message: "Error updating message acceptance status",
			},
			{status: 500}
		);
	}
}

export async function GET() {
	await connectToDb();
	const session = await getServerSession(authOptions);
	const user: User = session?.user as User;

	if (!session || !session.user) {
		return Response.json(
			{
				success: false,
				message: "Not authenticated",
			},
			{status: 401}
		);
	}

	try {
		const foundUser = await UserModel.findById(user._id);

		if (!foundUser) {
			return Response.json(
				{
					success: false,
					message: "User not found",
				},
				{status: 404}
			);
		}

		return Response.json(
			{
				success: true,
				isAcceptingMessages: foundUser.isAcceptingMessages,
			},
			{status: 200}
		);
	} catch (error) {
		console.error("Error fetching message acceptance status:", error);
		return Response.json(
			{
				success: false,
				message: "Error fetching message acceptance status",
			},
			{status: 500}
		);
	}
}

import UserModel from "@/model/Users";
import connectToDb from "@/lib/dbConnect";
import {getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]/options";
import {User} from "next-auth";
import mongoose from "mongoose";

export async function GET() {
	await connectToDb();
	const session = await getServerSession(authOptions);
	const user: User = session?.user as User;

	console.log("Received request to get messages.");
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

	const userId = new mongoose.Types.ObjectId(user._id);

	try {
		const foundUser = await UserModel.aggregate([
			{
				$match: {
					_id: userId,
				},
			},
			{$unwind: "$messages"},
			{$sort: {"messages.createdAt": -1}},
			{$group: {_id: "$_id", messages: {$push: "$messages"}}},
		]);

		if (!foundUser || foundUser.length === 0) {
			return Response.json(
				{
					success: true,
					message: "No messages found",
					messages: [], // ✅ Return empty array instead of 404
				},
				{status: 200}
			);
		}

		return Response.json(
			{
				success: true,
				message: "Messages retrieved successfully",
				messages: foundUser[0].messages, // ✅ Changed from 'data' to 'messages'
			},
			{status: 200}
		);
	} catch (error) {
		console.log("Error in get messages", error);
		return Response.json(
			{
				success: false,
				message: "Error in get messages",
				messages: [], // ✅ Include empty messages array for consistency
			},
			{status: 500}
		);
	}
}

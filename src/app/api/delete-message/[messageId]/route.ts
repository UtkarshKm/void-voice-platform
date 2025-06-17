import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/options";
import connectToDb from "@/lib/dbConnect";
import UserModel from "@/model/Users";
import {User} from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(
	request: Request,
	{params}: {params: {messageId: string}}
) {
	const messageId = params.messageId;
	await connectToDb();

	const session = await getServerSession(authOptions);
	const user: User = session?.user;

	if (!session || !user) {
		return NextResponse.json(
			{success: false, message: "Not authenticated"},
			{status: 401}
		);
	}

	try {
		const updateResult = await UserModel.updateOne(
			{_id: user._id},
			{$pull: {messages: {_id: messageId}}}
		);

		if (updateResult.modifiedCount === 0) {
			return NextResponse.json(
				{
					message: "Message not found or already deleted",
					success: false,
				},
				{status: 404}
			);
		}

		return NextResponse.json(
			{message: "Message deleted successfully", success: true},
			{status: 200}
		);
	} catch (error) {
		console.error("Error deleting message:", error);
		return NextResponse.json(
			{message: "Error deleting message", success: false},
			{status: 500}
		);
	}
}

import UserModel from "@/model/Users";
import connectToDb from "@/lib/dbConnect";
import {Message} from "@/model/Users";

export async function POST(request: Request) {
	await connectToDb();
	const {username, content} = await request.json();
	try {
		const user = await UserModel.findOne({username});
		if (!user) {
			return Response.json(
				{
					success: false,
					message: "User not found",
				},
				{status: 404}
			);
		}

		//is this user accepting messages?
		if (!user.isAcceptingMessages) {
			return Response.json(
				{
					success: false,
					message: "User is not accepting messages",
				},
				{status: 403}
			);
		}

		const newMessage = {
			content,
			createdAt: new Date(),
		};
		user.messages.push(newMessage as Message);
		await user.save();
		return Response.json(
			{
				success: true,
				message: "Message sent successfully",
			},
			{status: 200}
		);
	} catch (error) {
		console.error("Error sending message:", error);
		return Response.json(
			{
				success: false,
				message: "Error sending message",
			},
			{status: 500}
		);
	}
}

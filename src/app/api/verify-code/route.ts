import UserModel from "@/model/Users";
import connectToDb from "@/lib/dbConnect";

export async function POST(request: Request) {
	await connectToDb();
	try {
		const {username, code} = await request.json();
		const decodedUsername = decodeURIComponent(username);
		console.log("Received request to verify code.");
		console.log("Username:", decodedUsername);
		console.log("Code:", code);

		const user = await UserModel.findOne({username: decodedUsername});
		if (!user) {
			console.log("User not found.");
			return Response.json(
				{
					success: false,
					message: "User not found",
				},
				{status: 404}
			);
		}

		if (user.isVerified) {
			console.log("User is already verified.");
			return Response.json(
				{
					success: false,
					message: "User is already verified",
				},
				{status: 409}
			);
		}

		if (user.verifyCode !== code) {
			console.log("Codes do not match.");
			return Response.json(
				{
					success: false,
					message: "Codes do not match",
				},
				{status: 400}
			);
		}

		if (user.verifyCodeExpiration.getTime() < Date.now()) {
			console.log("Code has expired.");
			return Response.json(
				{
					success: false,
					message: "Code has expired. Please Sign Up again.",
				},
				{status: 400}
			);
		}
		user.isVerified = true;
		await user.save();
		return Response.json(
			{
				success: true,
				message: "Account verified successfully",
			},
			{status: 200}
		);
	} catch (error) {
		console.log("Error verifying code:", error);
		return Response.json(
			{
				success: false,
				message: "An unexpected error occurred in verifying code",
			},
			{status: 500}
		);
	}
}

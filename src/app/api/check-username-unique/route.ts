import connectToDb from "@/lib/dbConnect";
import UserModel from "@/model/Users";
import {z} from "zod";
import {usernameValidation} from "@/schemas/signUpSchema";

const UsernameQuerySchema = z.object({
	username: usernameValidation,
});

export async function GET(request: Request) {
	await connectToDb();
	try {
		console.info("Received request to check username uniqueness."); // New log
		const {searchParams} = new URL(request.url);
		const queryParams = {
			username: searchParams.get("username"),
		};

		//validate with zod
		const result = UsernameQuerySchema.safeParse(queryParams);

		console.info("Username validation result:", result); // Improved log

		if (!result.success) {
			const usernameErrors = result.error.format().username?._errors || [];
			console.warn("Username validation failed:", usernameErrors); // New log
			return Response.json(
				{
					success: false,
					message:
						usernameErrors?.length > 0
							? usernameErrors[0]
							: "Invalid username query",
				},
				{status: 400}
			);
		}

		const {username} = result.data;
		console.info(
			`Attempting to find user with username: '${username}' and isVerified: true`
		); // New log

		const existingUserVerified = await UserModel.findOne({
			username,
			isVerified: true,
		});

		if (existingUserVerified) {
			console.info(
				`Username '${username}' is already taken by a verified user.`
			); // New log
			return Response.json(
				{
					success: false,
					message: "Username already taken",
				},
				{status: 409}
			);
		}
		console.info(`Username '${username}' is unique and available.`); // New log
		return Response.json(
			{
				success: true,
				message: "Username is unique and available",
			},
			{status: 200}
		);
	} catch (error) {
		console.error("Error checking username unique:", error);
		return Response.json(
			{
				success: false,
				message: "An unexpected error occurred in checking username unique",
			},
			{status: 500}
		);
	}
}

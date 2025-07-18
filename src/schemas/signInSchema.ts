import {z} from "zod";

export const signInSchema = z.object({
	identifier: z.string().min(1, "Username or email is required"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

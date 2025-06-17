import {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import connectToDb from "@/lib/dbConnect";
import UserModel from "@/model/Users";

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			id: "credentials",
			name: "Credentials",
			credentials: {
				email: {label: "email", type: "text"},
				password: {label: "Password", type: "password"},
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			async authorize(credentials: any): Promise<any> {
				await connectToDb();
				try {
					const user = await UserModel.findOne({
						$or: [
							{email: credentials.identifier},
							{username: credentials.identifier},
						],
					});
					if (!user) {
						throw new Error("User not found");
					}
					if (!user.isVerified) {
						throw new Error("User is not verified");
					}
					const isPassCorrect = await bcrypt.compare(
						credentials.password,
						user.password
					);
					if (!isPassCorrect) {
						throw new Error("Password is incorrect");
					}
					return user;
				} catch (error: unknown) {
					console.error("Error in authorize:", error);
					throw new Error("Authentication failed", {cause: error});
				}
			},
		}),
	],
	pages: {
		signIn: "/sign-in",
	},
	callbacks: {
		async session({session, token}) {
			if (token){
				session.user._id = token._id;
				session.user.isVerified = token.isVerified;
				session.user.isAcceptingMessages = token.isAcceptingMessages;
				session.user.username = token.username;
			}
			return session;
		},
		async jwt({token, user}) {
			if (user){
				token._id = user._id?.toString();
				token.isVerified = user.isVerified;
				token.isAcceptingMessages = user.isAcceptingMessages;
				token.username = user.username;

			}
			return token;
		},
	},
	session: {
		strategy: "jwt",
	},
	secret: process.env.NEXTAUTH_SECRET,
};

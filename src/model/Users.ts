import mongoose, {Schema, Document} from "mongoose";

export interface Message extends Document {
	content: string;
	createdAt: Date;
}

const MessageSchema: Schema<Message> = new Schema({
	content: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now,
	},
});

export interface User extends Document {
	username: string;
	email: string;
	password: string;
	verifyToken: string;
	verifyTokenExpiration: Date;
	isVerified: boolean;
	isAcceptingMessages: boolean;
	messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
	username: {
		type: String,
		unique: true,
		required: [true, "Username is required"],
	},
	email: {
		type: String,
		unique: true,
		match: [
			/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi,
			"Invalid email",
		],
		required: [true, "Email is required"],
	},
	password: {
		type: String,
		required: [true, "Password is required"],
	},
	verifyToken: {
		type: String,
		required: [true, "Verify token is required"],
	},
	verifyTokenExpiration: {
		type: Date,
		required: [true, "Verify token expiration is required"],
	},
	isVerified: {
		type: Boolean,
		default: false,
	},
	isAcceptingMessages: {
		type: Boolean,
		default: true,
	},
	messages: [MessageSchema],
});

const UserModel = mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User", UserSchema);

// Reuse existing "User" model if it exists, otherwise create a new one.
// This is necessary in environments like Next.js edge or serverless/edge runtimes,
// where modules may be re-evaluated multiple times, causing model overwrite errors.

export default UserModel;
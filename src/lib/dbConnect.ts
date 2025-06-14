import mongoose from "mongoose";

type ConnectionObject = {
	isConnected?: number;
};

const connection: ConnectionObject = {};

async function connectToDb(): Promise<void> {
	if (connection.isConnected) {
		console.log("Already connected to the database");
		return;
	}

	const uri = process.env.MONGODB_URI as string;
	if (!uri) {
		console.error("MONGODB_URI environment variable is not set.");
		process.exit(1);
	}

	try {
		const db = await mongoose.connect(uri);
		connection.isConnected = db.connections[0].readyState;
		console.log("Connected to the database");
	} catch (error) {
		console.error("Error connecting to the database:", error);
		process.exit(1);
	}
}

export default connectToDb;

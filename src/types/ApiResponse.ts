import {Message} from "@/model/Users";

export interface ApiResponse {
	success: boolean;
	message: string;
	isAcceptingMessage?: boolean;
	messages?: Array<Message>;
}

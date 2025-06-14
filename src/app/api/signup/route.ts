import connectToDb from "@/lib/dbConnect";
import UserModel from "@/model/Users";
import bcrypt from "bcryptjs"; 
import { sendVerificationEmail } from "@/helpers/sendVerifyEmail";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        await connectToDb();
        
        const { username, email, password } = await request.json();

        // Validate required fields
        if (!username || !email || !password) {
            
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
            
        }

        // Check if user already exists
        const existingUser = await UserModel.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "User already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);
        
        // Generate verification code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);

        // Create new user
        const newUser = new UserModel({
            username,
            email,
            password: hashedPassword,
            verifyCode,
            verifyCodeExpiration: expiryDate,
            isVerified: false,
            messages: []
        });

        await newUser.save();

        // Send verification email
        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        
        if (!emailResponse.success) {
            return NextResponse.json(
                { success: false, message: emailResponse.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "User registered successfully. Please verify your email."
            },
            { status: 201 }
        );

    } catch (error: unknown) {
        console.error("Error registering user:", error);
        
        
        if (error instanceof Error) {
            
            return NextResponse.json(
                { success: false, message: `Registration failed: ${error.message}` },
                { status: 500 }
            );
            
            
        }
        
        return NextResponse.json(
            { success: false, message: "An unexpected error occurred" },
            { status: 500 }
        );
    }
}
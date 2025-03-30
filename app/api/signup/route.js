import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB, User } from "../../../models";

export async function POST(request) {
  try {
    console.log("Signup request received");
    const { username, email, password } = await request.json();
    console.log("Request body:", { username, email, password: "***" });

    // Validate input
    if (!username || !email || !password) {
      console.log("Missing required fields");
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Connect to database
    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected successfully");

    // Check if user already exists
    console.log("Checking for existing user...");
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      console.log("User already exists");
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    console.log("Creating new user...");
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    console.log("User created successfully");

    // Remove password from response
    const userResponse = {
      id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      status: user.status,
    };

    return NextResponse.json(
      { message: "User created successfully", user: userResponse },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { message: "Error creating user", error: error.message },
      { status: 500 }
    );
  }
} 
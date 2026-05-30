import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { z } from "zod";
import bcrypt from "bcrypt"; // <-- Import bcrypt

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsedBody = registerSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ errors: parsedBody.error.format() }, { status: 400 });
    }

    const { email, password } = parsedBody.data;

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 });
    }

    // THE UPGRADE: Hash the password with 10 "salt rounds" for security
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword, // <-- Save the hash, never the raw password
      },
    });

    return NextResponse.json({ 
      message: "User registered successfully", 
      data: { id: newUser.id, email: newUser.email } 
    }, { status: 201 });

  } catch (error) {
    console.error("Register API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
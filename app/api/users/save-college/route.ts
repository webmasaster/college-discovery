import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { z } from "zod";
import jwt from "jsonwebtoken"; // <-- Import JWT

const saveCollegeSchema = z.object({
  // Notice we removed userId! The client no longer dictates who is saving it.
  collegeId: z.string().uuid("Invalid College ID"),
});

export async function POST(request: Request) {
  try {
    // 1. SECURITY CHECK: Ensure the Authorization header is present
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    // Extract the token and verify it
    const token = authHeader.split(" ")[1];
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 403 });
    }

    // 2. Extract the true userId securely from the token
    const userId = decodedToken.userId;

    // 3. Parse the rest of the request body
    const body = await request.json();
    const parsedBody = saveCollegeSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json({ errors: parsedBody.error.format() }, { status: 400 });
    }

    const { collegeId } = parsedBody.data;

    // The rest remains the same...
    const college = await db.college.findUnique({ where: { id: collegeId } });
    if (!college) {
      return NextResponse.json({ message: "College not found" }, { status: 404 });
    }

    const alreadySaved = await db.savedCollege.findUnique({
      where: { userId_collegeId: { userId, collegeId } },
    });

    if (alreadySaved) {
      return NextResponse.json({ message: "College is already saved" }, { status: 409 });
    }

    const savedRecord = await db.savedCollege.create({
      data: { userId, collegeId },
    });

    return NextResponse.json({ message: "College saved successfully", data: savedRecord }, { status: 201 });

  } catch (error) {
    console.error("Save College API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
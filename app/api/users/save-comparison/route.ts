import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { z } from "zod";
import jwt from "jsonwebtoken";

// Validate that the user provides a name and an array of at least 2 college UUIDs
const saveComparisonSchema = z.object({
  name: z.string().min(1, "Comparison name is required"),
  collegeIds: z.array(z.string().uuid("Invalid College ID")).min(2, "Need at least 2 colleges to compare").max(4, "Max 4 colleges allowed"),
});

export async function POST(request: Request) {
  try {
    // 1. Security Check: Extract and verify the JWT
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ message: "Invalid or expired token." }, { status: 403 });
    }

    const userId = decodedToken.userId; // Extracted safely from the token

    // 2. Parse and Validate the Request Body
    const body = await request.json();
    const parsedBody = saveComparisonSchema.safeParse(body);

    if (!parsedBody.success) {
      const formattedErrors = parsedBody.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return NextResponse.json({ message: "Validation failed", errors: formattedErrors }, { status: 400 });
    }

    const { name, collegeIds } = parsedBody.data;

    // 3. Verify that all provided College IDs actually exist in the database
    const existingColleges = await db.college.findMany({
      where: { id: { in: collegeIds } },
      select: { id: true }
    });

    if (existingColleges.length !== collegeIds.length) {
      return NextResponse.json({ message: "One or more college IDs do not exist." }, { status: 404 });
    }

    // 4. Save the Comparison
    const newComparison = await db.savedComparison.create({
      data: {
        userId,
        name,
        collegeIds, 
      },
    });

    return NextResponse.json({ 
      message: "Comparison saved successfully", 
      data: newComparison 
    }, { status: 201 });

  } catch (error) {
    console.error("Save Comparison API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
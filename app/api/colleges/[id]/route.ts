import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { z } from "zod";

// Create a schema to ensure the ID is a valid UUID
const paramsSchema = z.object({
  id: z.string().uuid("Invalid College ID format"),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    
    // Validate the ID before touching the database
    const parsedParams = paramsSchema.safeParse(resolvedParams);

    if (!parsedParams.success) {
      const formattedErrors = parsedParams.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));
      return NextResponse.json({ message: "Validation failed", errors: formattedErrors }, { status: 400 });
    }

    const collegeId = parsedParams.data.id;

    const college = await db.college.findUnique({
      where: {
        id: collegeId,
      },
      include: {
        courses: true,
      },
    });

    if (!college) {
      return NextResponse.json({ message: "College not found" }, { status: 404 });
    }

    return NextResponse.json({ data: college }, { status: 200 });
  } catch (error) {
    console.error("Detail API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
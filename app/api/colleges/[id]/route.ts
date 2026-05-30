import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params object in Next.js 15+ 
    const resolvedParams = await params;
    const collegeId = resolvedParams.id;

    if (!collegeId) {
      return NextResponse.json({ message: "College ID is required" }, { status: 400 });
    }

    // Fetch the specific college and its nested relationships
    const college = await db.college.findUnique({
      where: {
        id: collegeId,
      },
      include: {
        courses: true,
        // If you add reviews or placements later, you just add them here!
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
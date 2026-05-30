import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { z } from "zod";

// 1. Zod schema to ensure we receive a comma-separated list of IDs
const compareSchema = z.object({
  ids: z.string().min(1, "Please provide college IDs to compare"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids") || undefined;

    // Validate the query
    const parsedQuery = compareSchema.safeParse({ ids: idsParam });
    if (!parsedQuery.success) {
      return NextResponse.json({ errors: parsedQuery.error.format() }, { status: 400 });
    }

    // 2. Transform the comma-separated string into a clean array of UUIDs
    const idsArray = parsedQuery.data.ids.split(",").map(id => id.trim());

    // 3. Prevent abuse: Enforce a limit of 2 to 4 colleges per comparison
    if (idsArray.length < 2 || idsArray.length > 4) {
      return NextResponse.json(
        { message: "Please provide between 2 and 4 college IDs for comparison" }, 
        { status: 400 }
      );
    }

    // 4. Fetch all requested colleges simultaneously using the Prisma `in` operator
    const colleges = await db.college.findMany({
      where: {
        id: { in: idsArray },
      },
      include: {
        courses: true,
      },
    });

    if (colleges.length !== idsArray.length) {
      return NextResponse.json({ message: "One or more provided college IDs are invalid" }, { status: 404 });
    }

    // 5. THE FLEX: The Matrix Transformation
    // We pivot the data so the frontend can easily render a row-by-row table
    const comparisonMatrix: Record<string, Record<string, any>> = {
      Name: {},
      Location: {},
      Fees: {},
      Rating: {},
      TotalCourses: {},
      TopCourse: {}
    };

    colleges.forEach(college => {
      comparisonMatrix.Name[college.id] = college.name;
      comparisonMatrix.Location[college.id] = college.location;
      comparisonMatrix.Fees[college.id] = college.fees;
      comparisonMatrix.Rating[college.id] = college.rating;
      comparisonMatrix.TotalCourses[college.id] = college.courses.length;
      
      // Calculate the most competitive course (lowest cutoff rank) for this specific college
      const topCourse = college.courses.sort((a, b) => a.cutoffRank - b.cutoffRank)[0];
      comparisonMatrix.TopCourse[college.id] = topCourse ? topCourse.title : "N/A";
    });

    return NextResponse.json({ 
      message: "Comparison matrix generated successfully",
      matrix: comparisonMatrix,
      // We also send the raw data just in case the frontend needs deep relational data
      raw_data: colleges 
    }, { status: 200 });

  } catch (error) {
    console.error("Compare API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { z } from "zod";

// 1. Zod schema to strictly validate the incoming JSON body
const predictorSchema = z.object({
  exam: z.string().min(1, "Exam name is required"),
  rank: z.number().int().positive("Rank must be a positive number"),
});

export async function POST(request: Request) {
  try {
    // 2. Parse the JSON body
    const body = await request.json();
    
    // 3. Validate the inputs
    const parsedBody = predictorSchema.safeParse(body);

    if (!parsedBody.success) {
      // UPGRADE: Flattened Zod errors for better Developer Experience
      const formattedErrors = parsedBody.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      return NextResponse.json(
        { message: "Invalid input data", errors: formattedErrors }, 
        { status: 400 }
      );
    }

    const { exam, rank } = parsedBody.data;

    // 4. The Matching Algorithm
    // Find colleges that have AT LEAST ONE course matching BOTH the exam and the rank
    const recommendedColleges = await db.college.findMany({
      where: {
        courses: {
          some: {
            // THE FIX: Match the exam string explicitly
            examAccepted: {
              equals: exam,
              mode: "insensitive" // Allows "jee main" to match "JEE Main"
            },
            cutoffRank: {
              gte: rank, 
            },
          },
        },
      },
      // Only include the specific courses they qualify for in the response
      include: {
        courses: {
          where: {
            // THE FIX: Filter the nested courses by the exam as well
            examAccepted: {
              equals: exam,
              mode: "insensitive"
            },
            cutoffRank: {
              gte: rank,
            },
          },
        },
      },
      orderBy: {
        rating: 'desc', // Show the highest-rated qualifying colleges first
      },
    });

    return NextResponse.json({ 
      message: `Found ${recommendedColleges.length} colleges matching ${exam} rank ${rank}`,
      data: recommendedColleges 
    }, { status: 200 });

  } catch (error) {
    console.error("Predictor API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
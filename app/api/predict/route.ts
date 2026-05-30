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
      return NextResponse.json(
        { message: "Invalid input data", errors: parsedBody.error.format() }, 
        { status: 400 }
      );
    }

    const { exam, rank } = parsedBody.data;

    // 4. The Matching Algorithm
    // Find colleges that have AT LEAST ONE course where the user's rank is <= the cutoff rank
    const recommendedColleges = await db.college.findMany({
      where: {
        courses: {
          some: {
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
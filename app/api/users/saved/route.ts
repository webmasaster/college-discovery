import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import jwt from "jsonwebtoken";

export async function GET(request: Request) {
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

    // 3. Fetch all saved records strictly for this authenticated user
    const savedColleges = await db.savedCollege.findMany({
      where: {
        userId: userId, // Automatically scoped to the logged-in user!
      },
      include: {
        college: {
          include: {
            courses: true, 
          }
        },
      },
    });

    // Transform data to return a clean array of colleges directly to the frontend
    const cleanCollegesList = savedColleges.map((item) => item.college);

    return NextResponse.json({ 
      userId: userId,
      totalSaved: cleanCollegesList.length,
      data: cleanCollegesList 
    }, { status: 200 });

  } catch (error) {
    console.error("Fetch Saved Colleges API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
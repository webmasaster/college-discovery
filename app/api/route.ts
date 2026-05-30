import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "online",
    project: "Track B - College Discovery Platform MVP",
    role: "Backend Engineer",
    framework: "Next.js App Router (TypeScript)",
    database: "PostgreSQL (Supabase via Prisma)",
    endpoints: {
      searchAndFilter: "GET /api/colleges?location=&minRating=&page=",
      getCollegeDetail: "GET /api/colleges/[id]",
      predictorTool: "POST /api/predict { exam, rank }",
      userRegister: "POST /api/auth/register { email, password }",
      saveCollege: "POST /api/users/save-college { userId, collegeId }",
      viewSavedColleges: "GET /api/users/saved?userId=",
      compareColleges: "GET /api/compare?ids=id1,id2"
    }
  }, { status: 200 });
}
import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { z } from "zod";

const querySchema = z.object({
  location: z.string().optional(),
  minRating: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  
  // UPGRADE 4: Replaced 'page' with 'cursor' and 'limit'
  limit: z.string().optional().default("10").transform(Number),
  cursor: z.string().optional(), // This will be the ID of the last college on the screen
  
  sortBy: z.enum(["rating", "fees"]).default("rating"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query params using Object.fromEntries for cleaner syntax
    const queryParams = Object.fromEntries(searchParams.entries());
    const parsedQuery = querySchema.safeParse(queryParams);
    
    // UPGRADE 3: Standardized, Frontend-Friendly Error Responses
    if (!parsedQuery.success) {
      const formattedErrors = parsedQuery.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }));

      return NextResponse.json({ 
        message: "Invalid query parameters", 
        errors: formattedErrors 
      }, { status: 400 });
    }

    const { 
      location: safeLocation, 
      minRating: safeMinRating, 
      limit, 
      cursor, 
      sortBy: safeSortBy, 
      sortOrder: safeSortOrder 
    } = parsedQuery.data;

    const formattedSearch = safeLocation 
      ? safeLocation.trim().split(/\s+/).join(" & ") 
      : undefined;

    const whereClause = {
      ...(formattedSearch && { location: { search: formattedSearch } }),
      ...(safeMinRating && { rating: { gte: safeMinRating } }),
    };

    // UPGRADE 4: Cursor-Based Infinite Scroll Query
    const colleges = await db.college.findMany({
      where: whereClause,
      include: { courses: true },
      take: limit, // Fetch the limit (e.g., 10)
      
      // If a cursor is provided, skip the cursor itself and start after it
      ...(cursor && {
        skip: 1, 
        cursor: { id: cursor }
      }),
      
      // IMPORTANT: When using cursors, you must have a secondary sort by a unique ID 
      // to ensure the database doesn't shuffle items with the exact same rating/fees.
      orderBy: [
        { [safeSortBy]: safeSortOrder },
        { id: 'asc' } 
      ]
    });

    // Calculate the next cursor for the frontend
    // If we received 10 items, there might be more. The next cursor is the ID of the last item.
    const nextCursor = colleges.length === limit ? colleges[limit - 1].id : null;

    return NextResponse.json({
      data: colleges,
      meta: {
        nextCursor,
        hasMore: nextCursor !== null,
        countReturned: colleges.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Fetch Colleges API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
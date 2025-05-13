import { connectToDatabase } from "../../../../lib/mongoConnection.js";
import { NextResponse } from "next/server";

// For Route Handlers, you export functions named after HTTP methods.
// The first argument is the Request object, and the second (optional)
// is an object containing `params` for dynamic routes.
export async function GET(request, { params }) {
  // Method check is implicitly handled by only defining a GET handler.
  // If you needed to support other methods, you'd export async function POST(request, { params }) etc.
  console.log("API Route Handler - Received params:", params); // <-- Add this line
  console.log("API Route Handler - Full request URL:", request.url); // <-- Add this line
  const { sportsKey } = params; // sportKey comes from the dynamic segment [sportsKey]

  if (!sportsKey) {
    return NextResponse.json(
      {
        message: "Sport key parameter is required and must be a string."
      },
      { status: 400 }
    );
  }

  try {
    const { db } = await connectToDatabase();

    // Construct collection name, same logic as in your fetchGames.js
    const collectionName = sportsKey.replace(/_/g, "") + "_games";
    const collection = db.collection(collectionName);

    // Fetch all documents from the collection.
    // You might want to add sorting, limiting, or projections here.
    // Example: .sort({ fetchedAt: -1 })
    const games = await collection.find({}).toArray();

    if (games.length === 0) {
      // You can choose to return 404 or an empty array. Empty array is often fine.
      console.log(
        `No games found in collection '${collectionName}' for sportKey: ${sportsKey}`
      );
    }

    return NextResponse.json(games, { status: 200 });
  } catch (error) {
    console.error(`Error fetching games for ${sportsKey}:`, error);
    return NextResponse.json(
      {
        message: "Failed to retrieve games from the database.",
        error: error.message
      },
      { status: 500 }
    );
  }
}

import { connectToDatabase } from "../../../../lib/mongoConnection.js";
import { NextResponse } from "next/server";

export async function GET(request, { params: paramsPromise }) {
  const params = await paramsPromise;
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

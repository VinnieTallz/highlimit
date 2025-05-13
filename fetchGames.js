const { MongoClient } = require('mongodb');

// MongoDB connection URI - replace with your actual connection string if different
// For local MongoDB: 'mongodb://localhost:27017'
// For MongoDB Atlas: 'mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority'
const mongoUri = 'mongodb://localhost:27017';
const dbName = 'sportsData'; // Choose a name for your database

async function connectToMongoDB() {
  const client = new MongoClient(mongoUri);
  await client.connect();
  console.log('Connected successfully to MongoDB');
  return client;
}

async function fetchGames(apiKey, sportsKey, db) { // Added db parameter
  try {
    console.log(`Fetching games for ${sportsKey}...`);
    const response = await fetch(
      `https://api.the-odds-api.com/v4/sports/${sportsKey}/odds/?apiKey=${apiKey}&regions=us`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
          // Add any other headers your API requires, like authorization tokens
        }
      }
    );

    if (!response.ok) {
      // If the server response is not OK (e.g., 4xx or 5xx status)
      const errorData = await response
        .json()
        .catch(() => ({ message: "Failed to fetch games and parse error" }));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const gamesData = await response.json(); // Changed variable name for consistency

    if (gamesData && gamesData.length > 0) {
      // Use a collection name derived from the sportsKey, e.g., "icehockeynhl_games"
      const collectionName = sportsKey.replace(/_/g, "") + '_games';
      const collection = db.collection(collectionName);

      // Add a timestamp and the sportKey to each game document before insertion
      const gamesToInsert = gamesData.map((game) => ({
        ...game,
        fetchedAt: new Date(),
        sportKey: sportsKey,
      }));


      const deleteResult = await collection.deleteMany({});
      const insertResult = await collection.insertMany(gamesToInsert);
      console.log(
        `${insertResult.insertedCount} games inserted into '${collectionName}' for ${sportsKey}`
      );
    } else {
      console.log(`No game data found for ${sportsKey} to insert.`);
    }

    // Optional: Keep logging to console if needed
    gamesData.forEach((game, index) => {
      console.log(
        `  ${game.sport_title} game ${index + 1}: ${game.home_team} vs. ${game.away_team}`
      );
      console.log(game.bookmakers?.[0]?.markets?.[0]?.outcomes);
    });
  } catch (err) {
    console.error(
      `Failed to fetch or store games for ${sportsKey}:`,
      err instanceof Error ? err.message : String(err)
    );
  }
}

async function main() {
  let client;
  try {
    client = await connectToMongoDB();
    const db = client.db(dbName);

    const apiKey = "bd111d5049a23c544c79b5e58573ee7f"; // Consider moving API key to environment variables
    const sportsToFetch = ["icehockey_nhl", "basketball_nba", "baseball_mlb"];
    
    // Fetch games for each sport sequentially
    for (const sportKey of sportsToFetch) {
      await fetchGames(apiKey, sportKey, db); // Pass the db object
    }

  } catch (err) {
    console.error("An error occurred in the main execution:", err);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

main();
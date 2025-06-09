"use client"

import { useEffect, useState } from "react";


export default function TodaysGames() {
    const [games, setGames] = useState<any[]>([]); 
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTodaysGames = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('/api/basketball_nba', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    
                    },
                });

                if (!response.ok) {
                    // If the server response is not OK (e.g., 4xx or 5xx status)
                    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch games and parse error' }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log(data)
                setGames(data); // Adjust based on your API response structure
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
                console.error("Failed to fetch games:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchTodaysGames();

    }, []);

    if (loading) {
        return <div>Loading today's games...</div>;
    }

    if (error) {
        return <div>Error fetching games: {error}</div>;
    }

    return (
    <div>
        Todays Games:
        {games.length > 0 ? (
            <ul>

              {games.map((game, index) => (
                    // Using game.id if available, otherwise combining team names for a key.
                    // A more robust unique ID from your data is always preferred for the key.
                    <li key={`${game.home_team}-${game.away_team}-${index}`}>
                        <strong>{game.sport_title}</strong>: {game.home_team} (Home) vs. {game.away_team} (Away)<br></br>
                        Start Time: {game.commence_time} <br /><br />
                    </li>
                ))}
            </ul>
        ) : (
            <p>No games scheduled for today.</p>
        )}
    </div>
    );
  }

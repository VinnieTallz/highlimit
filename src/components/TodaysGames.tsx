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
                const response = await fetch('/api/getGames', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any other headers your API requires, like authorization tokens
                    },
                    // If your API expects a body for the POST request, include it here.
                    // For example, if you need to send the current date:
                    // body: JSON.stringify({ date: new Date().toISOString().split('T')[0] }),
                    // If no body is needed, you can omit it or send an empty object:
                    body: JSON.stringify({date: new Date().toISOString().split('T')[0]}),
                });

                if (!response.ok) {
                    // If the server response is not OK (e.g., 4xx or 5xx status)
                    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch games and parse error' }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log(data.content)
                setGames(data.games || data); // Adjust based on your API response structure
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

        // The empty dependency array [] means this useEffect will run once
        // when the component mounts, similar to componentDidMount.
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
                    // Replace 'game.id' and 'game.name' with actual properties of your game object
                    <li key={game.id || index}>{game.name || JSON.stringify(game)}</li>
                ))}
            </ul>
        ) : (
            <p>No games scheduled for today.</p>
        )}
    </div>
    );
  }

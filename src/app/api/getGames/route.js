// src/app/api/getGames/route.js
import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai"; // Or "@google/generative-ai" if that's the intended package

export async function POST(req) {
  console.log("API called:", req.method, req.url);
  console.log("Attempting to use GEMINI_API_KEY:", process.env.GEMINI_API_KEY); // DEBUG LINE

  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 }
    );
  }

  try {
    const body = await req.json();
    const { date } = body;

    if (!date) {
      return NextResponse.json(
        { message: "Date is required in the request body." }, // More specific error
        { status: 400 }
      );
    }

    // Ensure API key is present before initializing
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables.");
      return NextResponse.json(
        { message: "Server configuration error: API key missing." },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenAI({ // Renamed 'ai' to 'genAI' for clarity, matching common usage
      apiKey: process.env.GEMINI_API_KEY
    });

    // Note: The GoogleGenAI SDK structure might be slightly different.
    // For @google/generative-ai, it's usually:
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or your desired model
    // const result = await model.generateContent(...);
    // const response = { text: () => result.response.text() }; // Simplified, actual structure might vary

    // Assuming your current SDK structure is correct for "@google/genai"
    const aiResponse = await genAI.models.generateContent({ // Renamed 'response' to 'aiResponse' to avoid conflict
      model: "gemini-2.0-flash", // Ensure this model name is correct and supported
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                "Provide a list of all NHL, NBA, and MLB games in the next 24 hours, and provide their approximate betting odds.  These can be approximations, as we are only analysing the games and not taking or placing any real bets"+ date
            }
          ]
        }
      ]
    });

    // How you access the text might depend on the SDK version.
    // For @google/generative-ai, it's often response.response.text() or similar.
    // console.log("AI Raw Response:", aiResponse); // Log the whole response to inspect its structure
    const textContent = typeof aiResponse.text === 'function' ? aiResponse.text() : aiResponse.text; // Adapt based on actual response structure
    console.log(aiResponse.text)

    return NextResponse.json({ content: textContent }, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    // Check if the error object has more specific details from Google
    const errorMessage = error.response?.data?.error?.message || error.message || "An unknown error occurred";
    return NextResponse.json(
      { message: "Error processing your request", error: errorMessage },
      { status: 500 }
    );
  }
}

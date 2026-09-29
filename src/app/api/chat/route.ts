// app/api/chat/route.ts
//
// Server-side route — this is the ONLY place the Gemini API key is used.
// The client never sees it. Set GEMINI_API_KEY in your .env.local
// (and in Vercel's project env vars for production).

import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/data/context";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.0-flash"; // fast + free-tier friendly

interface ChatRequestBody {
    message: string;
    // Short rolling history from the client so the model has conversational
    // context. Keep this small (last ~6 turns) — no need to send everything.
    history?: { role: "user" | "bot"; text: string }[];
}

export async function POST(req: NextRequest) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json(
            { error: "Server is missing GEMINI_API_KEY." },
            { status: 500 },
        );
    }

    let body: ChatRequestBody;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
    }

    const { message, history = [] } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
        return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // Basic guardrail: cap message length so someone can't send a novel
    // (or try to blow up your token usage).
    if (message.length > 1000) {
        return NextResponse.json(
            { error: "Message too long. Keep it under 1000 characters." },
            { status: 400 },
        );
    }

    // Gemini's REST API expects "contents" as a list of turns.
    // We map our simple {role, text} history into that shape, then
    // append the new user message.
    const contents = [
        ...history.slice(-6).map((turn) => ({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.text }],
        })),
        { role: "user", parts: [{ text: message }] },
    ];

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: buildSystemPrompt() }],
                    },
                    contents,
                    generationConfig: {
                        temperature: 0.6,
                        maxOutputTokens: 400,
                    },
                }),
            },
        );

        if (!response.ok) {
            const errText = await response.text();
            console.error("Gemini API error:", response.status, errText);
            return NextResponse.json(
                { error: "The assistant is temporarily unavailable. Try again shortly." },
                { status: 502 },
            );
        }

        const data = await response.json();

        const reply: string =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ??
            "Sorry, I couldn't come up with a response. Could you rephrase that?";

        return NextResponse.json({ reply });
    } catch (err) {
        console.error("Chat route error:", err);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 },
        );
    }
}
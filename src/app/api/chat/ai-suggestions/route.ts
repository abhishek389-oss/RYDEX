import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
    try {
        const { lastMessage, role } = await req.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                suggestions: ["I am on my way", "Okay, noted", "Reached the location"],
            });
        }

        const prompt = `You are an AI reply suggestion system for a ride-booking chat.
Generate exactly 3 short, helpful quick replies for a ${role}.
Last message received: "${lastMessage || "Hello"}"
Return ONLY valid JSON in this exact structure without markdown or backticks:
{"suggestions": ["reply 1", "reply 2", "reply 3"]}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

        const response = await axios.post(url, {
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
        });

        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const cleanJson = rawText
            ? JSON.parse(rawText.replace(/```json/g, "").replace(/```/g, "").trim())
            : null;

        return NextResponse.json(
            {
                suggestions: cleanJson?.suggestions || [
                    "I am on my way",
                    "Okay, noted",
                    "Reached the location",
                ],
            },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json({
            suggestions: [
                "I am on my way",
                "Traffic ahead, slightly delayed",
                "Reached the location",
            ],
        });
    }
}
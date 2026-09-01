import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods":
        "POST, OPTIONS",
};

serve(async (req) => {

    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: corsHeaders
        });
    }

    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({
                success: false,
                error: "POST method required."
            }),
            {
                status: 405,
                headers: {
                    ...corsHeaders,
                    "Content-Type":
                        "application/json"
                }
            }
        );
    }

    try {

        const body = await req.json();

        const platform =
            String(body.platform || "").trim();

        const tactic =
            String(body.tactic || "").trim();

        if (!platform || !tactic) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error:
                        "Platform and tactic are required."
                }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }


        /* =========================
           GEMINI API KEY
        ========================= */

        const apiKey =
            Deno.env.get("GEMINI_API_KEY");

        if (!apiKey) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error:
                        "GEMINI_API_KEY is not configured."
                }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }


        /* =========================
           PROMPT
        ========================= */

        const prompt = `
You generate content for a university
cybersecurity awareness project.

Create ONE fictional phishing-awareness
scenario.

Platform:
${platform}

Psychological tactic:
${tactic}

The message should demonstrate realistic
phishing warning signs such as:

- urgency
- fear
- suspicious notifications
- account restriction warnings
- unexpected messages
- pressure to act quickly
- fake rewards when appropriate

The scenario must NOT:

- request passwords
- request OTPs
- request authentication codes
- request payment information
- collect credentials
- contain malware
- contain executable code
- provide instructions for stealing information
- create a real login page

Return ONLY valid JSON:

{
    "headline": "string",
    "message": "string",
    "cta": "string",
    "tactic": "string",
    "warning_signs": [
        "string",
        "string",
        "string"
    ]
}
`;


        /* =========================
           GEMINI REQUEST
        ========================= */

       const model =
    "gemini-3.6-flash";


        const geminiUrl =
            "https://generativelanguage.googleapis.com/v1beta/models/"
            + model
            + ":generateContent?key="
            + encodeURIComponent(apiKey);


        const response =
            await fetch(
                geminiUrl,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        contents: [
                            {
                                parts: [
                                    {
                                        text: prompt
                                    }
                                ]
                            }
                        ],

                        generationConfig: {
                            responseMimeType:
                                "application/json"
                        }

                    })
                }
            );


        /* =========================
           GEMINI ERROR
        ========================= */

        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "GEMINI_STATUS:",
                response.status
            );

            console.error(
                "GEMINI_RESPONSE:",
                errorText
            );

            return new Response(
                JSON.stringify({
                    success: false,
                    gemini_status:
                        response.status,
                    gemini_error:
                        errorText
                }),
                {
                    status: 502,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }


        /* =========================
           GEMINI RESPONSE
        ========================= */

        const result =
            await response.json();


        const outputText =
            result
                ?.candidates?.[0]
                ?.content?.parts?.[0]
                ?.text || "";


        if (!outputText) {

            console.error(
                "GEMINI_FULL_RESPONSE:",
                JSON.stringify(result)
            );

            return new Response(
                JSON.stringify({
                    success: false,
                    error:
                        "Gemini returned no content."
                }),
                {
                    status: 502,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }


        /* =========================
           PARSE JSON
        ========================= */

        let content;

        try {

            content =
                JSON.parse(
                    outputText
                );

        } catch (error) {

            console.error(
                "GEMINI_JSON_PARSE_ERROR:",
                error
            );

            console.error(
                "GEMINI_RAW_OUTPUT:",
                outputText
            );

            return new Response(
                JSON.stringify({
                    success: false,
                    error:
                        "Gemini returned invalid JSON.",
                    raw_output:
                        outputText
                }),
                {
                    status: 502,
                    headers: {
                        ...corsHeaders,
                        "Content-Type":
                            "application/json"
                    }
                }
            );
        }


        /* =========================
           SUCCESS
        ========================= */

        return new Response(
            JSON.stringify({
                success: true,
                content
            }),
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Content-Type":
                        "application/json"
                }
            }
        );


    } catch (error) {

        console.error(
            "GENERATION_ERROR:",
            error
        );

        return new Response(
            JSON.stringify({
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Generation failed."
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type":
                        "application/json"
                }
            }
        );
    }

});
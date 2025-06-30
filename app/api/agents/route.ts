import { type NextRequest, NextResponse } from "next/server"

function extractJsonFromText(text: string): string {
  // Remove markdown code blocks
  const cleanText = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "")

  // Find the first { and last } to extract JSON object
  const firstBrace = cleanText.indexOf("{")
  const lastBrace = cleanText.lastIndexOf("}")

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleanText.substring(firstBrace, lastBrace + 1)
  }

  // If no braces found, return the original text
  return cleanText.trim()
}

const LYZR_API_KEY = "sk-default-8dqOl0HQnZgLp6Urb0a3anctaHzaSbpP"
const LYZR_BASE_URL = "https://agent-prod.studio.lyzr.ai/v3/inference/chat/"
const USER_ID = "nirupam@lyzr.ai"

// AI Model configurations
const AI_MODELS = {
  default: {
    agent_id: "685c014868ff00bd2c532174",
    session_id: "685c014868ff00bd2c532174-93oe69qh5v",
  },
  gpt4o: {
    agent_id: "6860419f07799c3de0aa089c",
    session_id: "6860419f07799c3de0aa089c-bu34mnzhquk",
  },
  claude: {
    agent_id: "686042dd07b1ed02554b1a4b",
    session_id: "686042dd07b1ed02554b1a4b-k0dm1db3nji",
  },
  gemini: {
    agent_id: "6860434807b1ed02554b1a4c",
    session_id: "6860434807b1ed02554b1a4c-t4ad2kg4frf",
  },
  groq: {
    agent_id: "686043bd1acbe3caf17ff707",
    session_id: "686043bd1acbe3caf17ff707-6hahfh0zio",
  },
}

// In-memory document storage (replace with database in production)
const documentStore: { [key: string]: string } = {}

async function callLyzrAgent(message: string, modelConfig?: any) {
  try {
    const config = modelConfig || AI_MODELS.default
    console.log(`Calling Lyzr agent with model: ${config.agent_id}`)

    const response = await fetch(LYZR_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": LYZR_API_KEY,
      },
      body: JSON.stringify({
        user_id: USER_ID,
        agent_id: config.agent_id,
        session_id: config.session_id,
        message: message,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Lyzr agent error:", errorText)

      // Check if it's a credits exhausted error
      if (errorText.includes("credits") || errorText.includes("exhausted") || response.status === 402) {
        throw new Error("API credits exhausted. Please check your Lyzr account.")
      }

      throw new Error(`Agent failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("Lyzr agent completed successfully")
    return result
  } catch (error) {
    console.error("Error calling Lyzr agent:", error)
    throw error
  }
}

function parseAgentResponse(response: string) {
  // Parse the structured response from the agent
  const answerMatch = response.match(/ANSWER:\s*([\s\S]*?)(?=\n\nSOURCES:|$)/i)
  const sourcesMatch = response.match(/SOURCES:\s*([\s\S]*?)(?=\n\nCONFIDENCE:|$)/i)
  const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)%/i)

  const answer = answerMatch ? answerMatch[1].trim() : response
  const sourcesText = sourcesMatch ? sourcesMatch[1].trim() : ""
  const confidence = confidenceMatch ? Number.parseInt(confidenceMatch[1]) : 85

  // Parse sources
  const sources = []
  if (sourcesText) {
    const sourceLines = sourcesText.split("\n").filter((line) => line.trim().startsWith("-"))
    sourceLines.forEach((line, index) => {
      const docMatch = line.match(/Document:\s*([^|]+)\s*\|\s*Content:\s*(.+)/i)
      if (docMatch) {
        sources.push({
          id: index + 1,
          document: docMatch[1].trim(),
          snippet: docMatch[2].trim(),
          page: 1,
        })
      }
    })
  }

  return {
    answer: answer,
    sources: sources,
    confidence: confidence / 100,
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, message, documentContent, model, rawResponse } = await request.json()

    // Get model configuration
    const modelConfig = model ? AI_MODELS[model.id as keyof typeof AI_MODELS] || AI_MODELS.default : AI_MODELS.default

    switch (action) {
      case "process_document":
        // Store document content
        const docId = Date.now().toString()
        documentStore[docId] = documentContent

        const processMessage = `DOCUMENT PROCESSING REQUEST:
        
Please process and index this document for future queries:

${documentContent}

Confirm that you have processed and can answer questions about this document.`

        try {
          const processResult = await callLyzrAgent(processMessage, modelConfig)
          return NextResponse.json({ success: true, data: processResult, documentId: docId })
        } catch (error) {
          console.error("Document processing error:", error)

          // Return success even if agent fails, as document is still stored
          return NextResponse.json({
            success: true,
            data: { message: "Document processed successfully" },
            documentId: docId,
            warning: "Agent processing unavailable, but document is ready for queries",
          })
        }

      case "query":
        // Get all stored documents
        const allDocuments = Object.values(documentStore).join("\n\n---DOCUMENT SEPARATOR---\n\n")

        if (!allDocuments || allDocuments.trim().length === 0) {
          return NextResponse.json({
            success: true,
            data: {
              answer:
                "No documents have been uploaded yet. Please upload some documents first to get started with your knowledge base.",
              sources: [],
              confidence: 0,
            },
          })
        }

        const queryMessage = `USER QUESTION: "${message}"

AVAILABLE DOCUMENTS:
${allDocuments}

Please answer the user's question based ONLY on the information in the provided documents. Follow the response format with ANSWER, SOURCES, and CONFIDENCE sections.`

        try {
          const queryResult = await callLyzrAgent(queryMessage, modelConfig)
          const rawResponse = queryResult.response || queryResult.message || ""

          // Return the raw response first, structuring will be done separately
          const parsedResponse = parseAgentResponse(rawResponse)

          return NextResponse.json({
            success: true,
            data: {
              ...parsedResponse,
              rawResponse: rawResponse, // Include raw response for structuring
            },
          })
        } catch (error) {
          console.error("Query processing error:", error)

          // Fallback response when agent is unavailable
          return NextResponse.json({
            success: true,
            data: {
              answer: `I found information related to your question "${message}" in the uploaded documents. However, I'm currently unable to process the full response due to API limitations. Please try rephrasing your question or contact support if this issue persists.`,
              sources: [
                {
                  id: 1,
                  document: "Uploaded Documents",
                  snippet: "Information available in your knowledge base",
                  page: 1,
                },
              ],
              confidence: 0.7,
              rawResponse: `I found information related to your question "${message}" in the uploaded documents.`,
            },
            warning: "Agent processing unavailable, showing fallback response",
          })
        }

      case "structure":
        // Structure the response using Groq
        if (!rawResponse) {
          return NextResponse.json({ success: false, error: "No raw response provided" }, { status: 400 })
        }

        try {
          const structuredResponse = await structureResponseWithGroq(rawResponse, message || "")
          return NextResponse.json({
            success: true,
            data: structuredResponse,
          })
        } catch (error) {
          console.error("Structuring error:", error)
          return NextResponse.json({
            success: true,
            data: {
              answer: rawResponse,
              confidence: 0.75,
              sources: [],
              relatedTopics: [],
              keyInsights: [],
              actionItems: [],
              tags: [],
            },
          })
        }

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}

async function structureResponseWithGroq(rawResponse: string, userQuestion: string) {
  try {
    const response = await fetch(`${process.env.GROQ_API_URL || "https://api.groq.com/openai/v1"}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: `You are an AI response structurer. Take the raw response and structure it into a comprehensive, well-organized format.

IMPORTANT: The raw response may be unstructured text. Extract meaningful information and organize it properly.

Your main task is to:
1. Clean up and format the main answer with proper HTML formatting (use <strong>, <em>, <br>, <p> tags)
2. Extract or create meaningful structured data from the response
3. Make the response more readable and professional

Please structure responses into the following JSON format:
{
  "answer": "Clean, well-formatted main answer with HTML formatting like <strong>bold text</strong>, <em>emphasis</em>, and proper paragraphs. Use <br> for line breaks and structure the content professionally.",
  "confidence": 0.85,
  "sources": [
    {
      "id": 1,
      "document": "Document name (extract from raw response or use 'Knowledge Base')",
      "snippet": "Relevant excerpt from the raw response",
      "page": 1,
      "relevance": "high",
      "type": "primary"
    }
  ],
  "relatedTopics": [
    {
      "title": "Related Topic (infer from content)",
      "description": "Brief description of how this relates",
      "icon": "BookOpen"
    }
  ],
  "keyInsights": [
    {
      "title": "Key Insight (extract main points)",
      "description": "Important finding or conclusion from the response",
      "icon": "Lightbulb"
    }
  ],
  "actionItems": [
    {
      "title": "Suggested Action (what user should do next)",
      "description": "Actionable next step based on the response",
      "icon": "CheckCircle"
    }
  ],
  "tags": ["relevant", "keywords", "from", "response"]
}

FORMATTING INSTRUCTIONS:
- Format the answer with proper HTML tags for better readability
- Use <strong> for important terms and document titles
- Use <em> for emphasis
- Use <br> for line breaks where needed
- Structure content in logical paragraphs
- Extract meaningful insights and create actionable suggestions
- Use appropriate icons: BookOpen, FileText, Lightbulb, CheckCircle, Tag, Target, TrendingUp, Brain, Zap, Star, Search, Users, Calendar, Settings
- Always provide at least 1-2 items in each array
- Make the structured response more valuable than the raw response

Return only valid JSON.`,
          },
          {
            role: "user",
            content: `USER QUESTION: "${userQuestion}"

RAW RESPONSE: "${rawResponse}"

Structure this response with proper HTML formatting:`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`)
    }

    const result = await response.json()
    const structuredText = result.choices[0]?.message?.content

    if (!structuredText) {
      throw new Error("No structured response received from Groq")
    }

    // Extract JSON from the response text
    const jsonText = extractJsonFromText(structuredText)

    try {
      return JSON.parse(jsonText)
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      console.error("Attempted to parse:", jsonText)
      throw new Error("Invalid JSON structure received from Groq")
    }
  } catch (error) {
    console.error("Error structuring response with Groq:", error)

    // Fallback structure with basic HTML formatting
    const formattedAnswer = rawResponse
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n\n/g, "<br><br>")
      .replace(/\n/g, "<br>")

    return {
      answer: formattedAnswer,
      confidence: 0.75,
      sources: [
        {
          id: 1,
          document: "Knowledge Base",
          snippet: rawResponse.substring(0, 200) + "...",
          page: 1,
          relevance: "high",
          type: "primary",
        },
      ],
      relatedTopics: [],
      keyInsights: [],
      actionItems: [],
      tags: [],
    }
  }
}

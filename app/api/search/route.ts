import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { query, documents } = await request.json()

    // Simple search implementation - in a real app, this would use vector search
    const results = documents.filter(
      (doc: any) =>
        doc.name.toLowerCase().includes(query.toLowerCase()) ||
        (doc.content && doc.content.toLowerCase().includes(query.toLowerCase())),
    )

    return NextResponse.json({
      success: true,
      results: results.map((doc: any) => ({
        id: doc.id,
        name: doc.name,
        snippet: doc.content ? doc.content.substring(0, 200) + "..." : "No content preview available",
        relevanceScore: Math.random() * 0.5 + 0.5, // Mock relevance score
      })),
    })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

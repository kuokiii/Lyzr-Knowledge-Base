import { supabase } from "@/lib/supabase"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ documents: [] })
    }

    return NextResponse.json({ documents })
  } catch (error) {
    console.error("Documents GET error:", error)
    return NextResponse.json({ documents: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, documentId } = await request.json()

    switch (action) {
      case "delete":
        const { error: deleteError } = await supabase.from("documents").delete().eq("id", documentId)

        if (deleteError) {
          console.error("Delete document error:", deleteError)
          return NextResponse.json({ success: false, error: "Failed to delete document" }, { status: 500 })
        }

        // Log activity
        await supabase.from("activity_items").insert({
          type: "delete",
          title: "Document deleted",
          description: "Document was removed from library",
          icon: "Trash2",
        })

        return NextResponse.json({ success: true })

      case "get":
        const { data: document, error: getError } = await supabase
          .from("documents")
          .select("*")
          .eq("id", documentId)
          .single()

        if (getError) {
          console.error("Get document error:", getError)
          return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, document })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Documents API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const document = await request.json()

    const { data: updatedDocument, error } = await supabase.from("documents").upsert(document).select().single()

    if (error) {
      console.error("Documents PUT error:", error)
      return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
    }

    return NextResponse.json({ success: true, document: updatedDocument })
  } catch (error) {
    console.error("Documents PUT error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

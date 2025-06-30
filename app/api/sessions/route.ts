import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: sessions, error } = await supabase
      .from("sessions")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ sessions: [] })
    }

    const formattedSessions = sessions.map((s) => ({
      id: s.id,
      name: s.name,
      // prefer last_activity when it exists, otherwise use created_at
      lastActivity: s.last_activity ?? s.created_at,
      messageCount: s.message_count ?? 0,
      documentsCount: s.documents_count ?? 0,
      messages: [],
      documents: [],
    }))

    return NextResponse.json({ sessions: formattedSessions })
  } catch (error) {
    console.error("Sessions GET error:", error)
    return NextResponse.json({ sessions: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, sessionId, sessionName, message, documents } = await request.json()

    switch (action) {
      case "create":
        const { data: newSession, error: createError } = await supabase
          .from("sessions")
          .insert({
            name: sessionName || `Knowledge Session ${Date.now()}`,
            message_count: 0,
            documents_count: 0,
          })
          .select()
          .single()

        if (createError) {
          console.error("Create session error:", createError)
          return NextResponse.json({ success: false, error: "Failed to create session" }, { status: 500 })
        }

        // Log activity
        await supabase.from("activity_items").insert({
          type: "session",
          title: "New session created",
          description: newSession.name,
          icon: "Plus",
        })

        return NextResponse.json({
          success: true,
          session: {
            id: newSession.id,
            name: newSession.name,
            lastActivity: newSession.last_activity,
            messageCount: newSession.message_count,
            documentsCount: newSession.documents_count,
            messages: [],
            documents: [],
          },
        })

      case "update":
        // First get current session data
        const { data: currentSession } = await supabase
          .from("sessions")
          .select("message_count")
          .eq("id", sessionId)
          .single()

        const updateData: any = {
          updated_at: new Date().toISOString(),
        }

        if (message) {
          updateData.message_count = (currentSession?.message_count || 0) + 1
        }

        if (documents) {
          updateData.documents_count = documents.length
        }

        const { data: updatedSession, error: updateError } = await supabase
          .from("sessions")
          .update(updateData)
          .eq("id", sessionId)
          .select()
          .single()

        if (updateError) {
          console.error("Update session error:", updateError)
          return NextResponse.json({ success: false, error: "Session not found" }, { status: 404 })
        }

        return NextResponse.json({ success: true, session: updatedSession })

      case "delete":
        const { error: deleteError } = await supabase.from("sessions").delete().eq("id", sessionId)

        if (deleteError) {
          console.error("Delete session error:", deleteError)
          return NextResponse.json({ success: false, error: "Failed to delete session" }, { status: 500 })
        }

        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Sessions API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

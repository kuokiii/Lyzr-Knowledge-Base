import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: activities, error } = await supabase
      .from("activity_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ activities: [] })
    }

    // Format activities to match expected structure
    const formattedActivities = activities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      timestamp: new Date(activity.created_at).toLocaleString(),
      icon: activity.icon,
    }))

    return NextResponse.json({ activities: formattedActivities })
  } catch (error) {
    console.error("Activity GET error:", error)
    return NextResponse.json({ activities: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const activityData = await request.json()

    const { data: activity, error } = await supabase
      .from("activity_items")
      .insert({
        type: activityData.type,
        title: activityData.title,
        description: activityData.description,
        icon: activityData.icon || "Upload", // Provide default icon
      })
      .select()
      .single()

    if (error) {
      console.error("Activity POST error:", error)
      return NextResponse.json({ success: false, error: "Failed to log activity" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      activity: {
        id: activity.id,
        type: activity.type,
        title: activity.title,
        description: activity.description,
        timestamp: new Date(activity.created_at).toLocaleString(),
        icon: activity.icon,
      },
    })
  } catch (error) {
    console.error("Activity API error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

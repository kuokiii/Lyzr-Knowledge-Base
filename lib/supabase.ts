import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Document {
  id: string
  name: string
  size: string
  type: string
  content: string
  uploaded_at: string
  confidence?: number
  tags?: string[]
  status: "processing" | "ready" | "error"
  text_length?: number
  pages?: number
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  name: string
  last_activity: string
  message_count: number
  documents_count: number
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  session_id: string
  type: "user" | "assistant" | "system"
  content: string
  created_at: string
  sources?: any[]
  confidence?: number
}

export interface ActivityItem {
  id: string
  type: "upload" | "query" | "session" | "delete"
  title: string
  description: string
  icon: string
  created_at: string
}

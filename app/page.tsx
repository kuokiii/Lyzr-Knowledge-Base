"use client"
import { useState, useEffect } from "react"
import { LandingPage } from "@/components/landing-page"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { ActivityFeed } from "@/components/activity-feed"
import { SettingsPanel } from "@/components/settings-panel"
import { AuthPage } from "@/components/auth-page"
import { DocsPage } from "@/components/docs-page"
import { PerplexityChat } from "@/components/perplexity-chat"
import { EnhancedDocumentLibrary } from "@/components/enhanced-document-library"

interface Document {
  id: string
  name: string
  size: string
  uploadedAt: string
  type: string
  pages?: number
  status: "processing" | "ready" | "error"
  processedData?: any
  content?: string
  textLength?: number
  region?: string
  version?: string
  tags?: string[]
  confidence?: number
}

interface Message {
  id: string
  type: "user" | "assistant" | "system"
  content: string
  timestamp: string
  sources?: any[]
  confidence?: number
  isSearching?: boolean
  searchSteps?: string[]
  model?: string
}

interface Session {
  id: string
  name: string
  lastActivity: string
  messageCount: number
  documentsCount: number
  messages?: Message[]
  documents?: Document[]
}

interface ActivityItem {
  id: string
  type: "upload" | "query" | "session" | "delete"
  title: string
  description: string
  timestamp: string
  icon: any
}

export default function KnowledgeBase() {
  const [currentView, setCurrentView] = useState<
    "landing" | "chat" | "documents" | "analytics" | "activity" | "settings" | "auth" | "help" | "docs"
  >("landing")
  const [documents, setDocuments] = useState<Document[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [activeSidebarItem, setActiveSidebarItem] = useState("sessions")
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showSearch, setShowSearch] = useState(false)

  // Load initial data
  useEffect(() => {
    loadSessions()
    loadRecentActivity()
    loadDocuments()
  }, [])

  // Clear documents from chat when app loads but keep them in library
  useEffect(() => {
    // Only clear documents in chat view, not in document library
    if (currentView === "chat") {
      setDocuments([])
    }
  }, [])

  // Persist documents across sessions
  useEffect(() => {
    if (activeSession) {
      const session = sessions.find((s) => s.id === activeSession)
      if (session) {
        // Update session with current documents count
        const updatedSessions = sessions.map((s) =>
          s.id === activeSession ? { ...s, documentsCount: documents.length } : s,
        )
        setSessions(updatedSessions)
      }
    }
  }, [documents, activeSession])

  const loadSessions = async () => {
    try {
      const response = await fetch("/api/sessions")
      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error("Failed to load sessions:", error)
    }
  }

  const loadRecentActivity = async () => {
    try {
      const response = await fetch("/api/activity")
      const data = await response.json()
      setRecentActivity(data.activities || [])
    } catch (error) {
      console.error("Failed to load activity:", error)
      // Fallback to empty array
      setRecentActivity([])
    }
  }

  const loadDocuments = async () => {
    try {
      const response = await fetch("/api/documents")
      const data = await response.json()
      // Only set documents for document library view, not chat view
      if (currentView === "documents") {
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error("Failed to load documents:", error)
    }
  }

  const addActivityItem = async (item: Omit<ActivityItem, "id">) => {
    try {
      const response = await fetch("/api/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      })

      if (response.ok) {
        const { activity } = await response.json()
        setRecentActivity((prev) => [activity, ...prev.slice(0, 9)])
      }
    } catch (error) {
      console.error("Failed to log activity:", error)
      // Fallback to local state
      const newItem: ActivityItem = {
        ...item,
        id: Date.now().toString(),
      }
      setRecentActivity((prev) => [newItem, ...prev.slice(0, 9)])
    }
  }

  const handleSidebarNavigation = (path: string) => {
    setActiveSidebarItem(path)
    switch (path) {
      case "sessions":
        setCurrentView("chat")
        break
      case "documents":
        setCurrentView("documents")
        // Load documents when navigating to document library
        loadDocuments()
        break
      case "analytics":
        setCurrentView("analytics")
        break
      case "activity":
        setCurrentView("activity")
        break
      case "settings":
        setCurrentView("settings")
        break
      default:
        setCurrentView("chat")
    }
  }

  const sharedProps = {
    documents,
    setDocuments,
    messages,
    setMessages,
    sessions,
    setSessions,
    activeSession,
    setActiveSession,
    activeSidebarItem,
    setActiveSidebarItem,
    recentActivity,
    setRecentActivity,
    selectedDocument,
    setSelectedDocument,
    showSearch,
    setShowSearch,
    currentView,
    setCurrentView,
    addActivityItem,
    handleSidebarNavigation,
  }

  // Render the appropriate component based on current view
  switch (currentView) {
    case "landing":
      return <LandingPage {...sharedProps} />
    case "chat":
      return <PerplexityChat {...sharedProps} />
    case "documents":
      return <EnhancedDocumentLibrary {...sharedProps} />
    case "analytics":
      return <AnalyticsDashboard {...sharedProps} />
    case "activity":
      return <ActivityFeed {...sharedProps} />
    case "settings":
      return <SettingsPanel {...sharedProps} />
    case "auth":
      return <AuthPage setCurrentView={setCurrentView} />
    case "docs":
      return <DocsPage setCurrentView={setCurrentView} />
    default:
      return <PerplexityChat {...sharedProps} />
  }
}

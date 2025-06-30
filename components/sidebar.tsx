"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import {
  MessageCircle,
  Plus,
  Database,
  BarChart3,
  History,
  ChevronRight,
  Edit,
  Trash2,
  Search,
  Eye,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

const sidebarItems = [
  { icon: BarChart3, label: "Analytics", path: "analytics" },
  { icon: History, label: "Recent Activity", path: "activity" },
  { icon: Database, label: "Document Library", path: "documents" },
]

interface SidebarProps {
  sessions: any[]
  setSessions: (sessions: any[]) => void
  activeSession: string | null
  setActiveSession: (id: string | null) => void
  activeSidebarItem: string
  handleSidebarNavigation: (path: string) => void
  addActivityItem: (item: any) => void
  messages?: any[]
  setMessages?: (messages: any[]) => void
  documents?: any[]
  setDocuments?: (docs: any[]) => void
  setCurrentView?: (view: string) => void
  setActiveSidebarItem?: (item: string) => void
}

export function Sidebar({
  sessions,
  setSessions,
  activeSession,
  setActiveSession,
  activeSidebarItem,
  handleSidebarNavigation,
  addActivityItem,
  messages = [],
  setMessages,
  documents = [],
  setDocuments,
  setCurrentView,
  setActiveSidebarItem,
}: SidebarProps) {
  const [editingSession, setEditingSession] = useState<string | null>(null)
  const [newSessionName, setNewSessionName] = useState("")
  const [sessionSearchQuery, setSessionSearchQuery] = useState("")
  const [viewingSession, setViewingSession] = useState<any>(null)
  const [showSessionDetails, setShowSessionDetails] = useState(false)

  // Real-time session filtering
  const filteredSessions = useMemo(() => {
    if (!sessionSearchQuery) return sessions
    return sessions.filter((session) => session.name.toLowerCase().includes(sessionSearchQuery.toLowerCase()))
  }, [sessions, sessionSearchQuery])

  const createNewSession = async (name?: string) => {
    const sessionName = name || `Knowledge Session ${sessions.length + 1}`

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          sessionName: sessionName,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const newSession = result.session
        setSessions([newSession, ...sessions])
        setActiveSession(newSession.id)

        // Clear current messages but keep documents for new session
        if (setMessages) setMessages([])

        // Navigate to chat view
        handleSidebarNavigation("sessions")

        addActivityItem({
          type: "session",
          title: "New session created",
          description: sessionName,
          timestamp: "Just now",
          icon: "Plus",
        })

        return
      }
    } catch (error) {
      console.error("Failed to create session:", error)
    }

    // Fallback to local session if API fails
    const newSession = {
      id: Date.now().toString(),
      name: sessionName,
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      documentsCount: 0,
      messages: [],
      documents: [],
    }

    setSessions([newSession, ...sessions])
    setActiveSession(newSession.id)

    // Clear current messages but keep documents for new session
    if (setMessages) setMessages([])

    // Navigate to chat view
    handleSidebarNavigation("sessions")

    addActivityItem({
      type: "session",
      title: "New session created",
      description: sessionName,
      timestamp: "Just now",
      icon: "Plus",
    })
  }

  const handleSessionRename = async (sessionId: string, newName: string) => {
    if (!newName.trim()) return

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          sessionId: sessionId,
          sessionName: newName.trim(),
        }),
      })

      if (response.ok) {
        setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, name: newName.trim() } : s)))
      }
    } catch (error) {
      console.error("Failed to rename session:", error)
      // Fallback to local update
      setSessions(sessions.map((s) => (s.id === sessionId ? { ...s, name: newName.trim() } : s)))
    }

    setEditingSession(null)
    setNewSessionName("")
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "delete",
          sessionId: sessionId,
        }),
      })

      if (response.ok) {
        setSessions(sessions.filter((s) => s.id !== sessionId))

        if (activeSession === sessionId) {
          setActiveSession(null)
          if (setMessages) setMessages([])
        }
      }
    } catch (error) {
      console.error("Failed to delete session:", error)
      // Fallback to local delete
      setSessions(sessions.filter((s) => s.id !== sessionId))

      if (activeSession === sessionId) {
        setActiveSession(null)
        if (setMessages) setMessages([])
      }
    }
  }

  const handleSessionClick = (session: any, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()

    // Load session data
    setActiveSession(session.id)
    if (setMessages) setMessages(session.messages || [])
    // Don't clear documents - they should persist across sessions
    if (setCurrentView) setCurrentView("chat")
    handleSidebarNavigation("sessions")
  }

  const handleViewSession = (session: any, event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setViewingSession(session)
    setShowSessionDetails(true)
  }

  const handleLogoClick = () => {
    if (setCurrentView) {
      setCurrentView("landing")
      setActiveSession(null)
      if (setActiveSidebarItem) setActiveSidebarItem("")
      if (setMessages) setMessages([])
    }
  }

  const handleSessionSearch = (query: string) => {
    setSessionSearchQuery(query)
    if (query.trim()) {
      addActivityItem({
        type: "query",
        title: "Session search",
        description: `Searched for "${query}"`,
        timestamp: "Just now",
        icon: "Search",
      })
    }
  }

  return (
    <>
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-lg">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleLogoClick}>
            <div className="relative group">
              <Image
                src="/lyzr-logo.png"
                alt="Lyzr"
                width={36}
                height={36}
                className="rounded-xl transition-transform group-hover:scale-110"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 hover:text-purple-600 transition-colors">
                Knowledge Base
              </h1>
              <p className="text-xs text-gray-500">AI-Powered Intelligence</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6">
          {/* Sessions Section - moved to top */}
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Knowledge Sessions</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => createNewSession()}
                className="h-8 w-8 p-0 hover:bg-black hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Session Search */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search sessions..."
                value={sessionSearchQuery}
                onChange={(e) => handleSessionSearch(e.target.value)}
                className="pl-9 h-8 text-sm border-gray-200 focus:border-black focus:ring-black"
              />
            </div>

            <ScrollArea className="h-64">
              <div className="space-y-2">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all duration-200 text-sm group relative",
                      activeSession === session.id
                        ? "bg-gray-100 text-gray-900 shadow-sm"
                        : "hover:bg-gray-50 text-gray-600",
                    )}
                    onClick={(e) => handleSessionClick(session, e)}
                  >
                    {/* Top row with chat icon and session name */}
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      {editingSession === session.id ? (
                        <Input
                          value={newSessionName}
                          onChange={(e) => setNewSessionName(e.target.value)}
                          onBlur={() => {
                            if (newSessionName.trim()) {
                              handleSessionRename(session.id, newSessionName)
                            } else {
                              setEditingSession(null)
                              setNewSessionName("")
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              if (newSessionName.trim()) {
                                handleSessionRename(session.id, newSessionName)
                              } else {
                                setEditingSession(null)
                                setNewSessionName("")
                              }
                            }
                          }}
                          className="h-6 text-xs border-0 p-0 focus:ring-0 flex-1"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span
                          className="font-medium group-hover:text-black transition-colors flex-1 min-w-0 truncate"
                          title={session.name}
                        >
                          {session.name.length > 18 ? `${session.name.substring(0, 18)}...` : session.name}
                        </span>
                      )}
                    </div>

                    {/* Eye button above messages/docs count */}
                    <div className="text-xs text-gray-500 ml-6 flex items-center justify-end mb-1">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-blue-100"
                          onClick={(e) => handleViewSession(session, e)}
                          title="View session details"
                        >
                          <Eye className="w-2.5 h-2.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Messages and docs count with delete button inline */}
                    <div className="text-xs text-gray-500 ml-6 flex items-center gap-2">
                      <span>
                        {session.messageCount} messages • {session.documentsCount} docs
                      </span>
                      {/* Delete button right after docs count */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteSession(session.id)
                          }}
                          title="Delete session"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Edit button below messages/docs count */}
                    <div className="text-xs text-gray-500 ml-6 flex items-center justify-end mt-1">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0 hover:bg-gray-200"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingSession(session.id)
                            setNewSessionName(session.name)
                          }}
                          title="Edit session name"
                        >
                          <Edit className="w-2.5 h-2.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-gray-500 ml-6 mt-1">
                      {new Date(session.lastActivity).toLocaleString()}
                    </div>
                  </div>
                ))}
                {filteredSessions.length === 0 && sessionSearchQuery && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No sessions found</p>
                  </div>
                )}
                {sessions.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No sessions yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <Separator className="my-6 mx-4" />

          {/* Other Navigation Items */}
          <nav className="space-y-2 px-4">
            {sidebarItems.map((item) => (
              <div
                key={item.label}
                onClick={() => handleSidebarNavigation(item.path)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200",
                  activeSidebarItem === item.path
                    ? "bg-black text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {activeSidebarItem === item.path && <ChevronRight className="w-4 h-4" />}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Session Details Modal */}
      {showSessionDetails && viewingSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Session Details</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowSessionDetails(false)} className="h-8 w-8 p-0">
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Session Name</label>
                  <p className="text-sm text-gray-900 mt-1 p-2 bg-gray-50 rounded">{viewingSession.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Messages</label>
                    <p className="text-sm text-gray-900 mt-1">{viewingSession.messageCount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Documents</label>
                    <p className="text-sm text-gray-900 mt-1">{viewingSession.documentsCount}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Last Activity</label>
                  <p className="text-sm text-gray-900 mt-1">{new Date(viewingSession.lastActivity).toLocaleString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(viewingSession.lastActivity).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={() => {
                    setShowSessionDetails(false)
                    handleSessionClick(viewingSession, { preventDefault: () => {}, stopPropagation: () => {} } as any)
                  }}
                  className="flex-1 bg-black hover:bg-gray-800 text-white"
                >
                  Open Session
                </Button>
                <Button variant="outline" onClick={() => setShowSessionDetails(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

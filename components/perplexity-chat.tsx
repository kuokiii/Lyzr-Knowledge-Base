"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { SearchDialog } from "@/components/search-dialog"
import {
  Upload,
  Send,
  FileText,
  MessageCircle,
  Search,
  Download,
  Trash2,
  Quote,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Settings,
  Zap,
  Brain,
  Sparkles,
  Cpu,
  Eye,
  X,
  BookOpen,
  Lightbulb,
  Tag,
  Target,
  TrendingUp,
  Star,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface PerplexityChatProps {
  documents: any[]
  setDocuments: (docs: any[]) => void
  messages: any[]
  setMessages: (messages: any[]) => void
  sessions: any[]
  setSessions: (sessions: any[]) => void
  activeSession: string | null
  setActiveSession: (id: string | null) => void
  activeSidebarItem: string
  setActiveSidebarItem: (item: string) => void
  showSearch: boolean
  setShowSearch: (show: boolean) => void
  addActivityItem: (item: any) => void
  handleSidebarNavigation: (path: string) => void
  setCurrentView: (view: string) => void
}

interface UploadingFile {
  id: string
  name: string
  status: "uploading" | "extracting" | "processing" | "complete" | "error"
  progress: number
  extractedText?: string
  error?: string
}

interface AIModel {
  id: string
  name: string
  description: string
  icon: any
  agentId: string
  sessionId: string
  isDefault?: boolean
}

interface StructuredResponse {
  answer: string
  confidence: number
  sources: Array<{
    id: number
    document: string
    snippet: string
    page: number
    relevance?: string
    type?: string
  }>
  relatedTopics: Array<{
    title: string
    description: string
    icon: string
  }>
  keyInsights: Array<{
    title: string
    description: string
    icon: string
  }>
  actionItems: Array<{
    title: string
    description: string
    icon: string
  }>
  tags: string[]
}

const AI_MODELS: AIModel[] = [
  {
    id: "default",
    name: "Default (Recommended)",
    description: "Best performance and accuracy",
    icon: Sparkles,
    agentId: "685c014868ff00bd2c532174",
    sessionId: "685c014868ff00bd2c532174-93oe69qh5v",
    isDefault: true,
  },
  {
    id: "gpt4o",
    name: "GPT-4o",
    description: "Advanced reasoning and analysis",
    icon: Brain,
    agentId: "6860419f07799c3de0aa089c",
    sessionId: "6860419f07799c3de0aa089c-bu34mnzhquk",
  },
  {
    id: "claude",
    name: "Claude Sonnet 4-O",
    description: "Excellent for complex tasks",
    icon: Zap,
    agentId: "686042dd07b1ed02554b1a4b",
    sessionId: "686042dd07b1ed02554b1a4b-k0dm1db3nji",
  },
  {
    id: "gemini",
    name: "Gemini Flash 2.0",
    description: "Fast and efficient processing",
    icon: Cpu,
    agentId: "6860434807b1ed02554b1a4c",
    sessionId: "6860434807b1ed02554b1a4c-t4ad2kg4frf",
  },
  {
    id: "groq",
    name: "Groq Llama 3.1 8B",
    description: "Lightning-fast responses",
    icon: Zap,
    agentId: "686043bd1acbe3caf17ff707",
    sessionId: "686043bd1acbe3caf17ff707-6hahfh0zio",
  },
]

const getIconComponent = (iconName: string) => {
  const icons: { [key: string]: any } = {
    BookOpen,
    FileText,
    Lightbulb,
    CheckCircle,
    Tag,
    Target,
    TrendingUp,
    Brain,
    Zap,
    Star,
    ArrowRight,
    Quote,
    Search,
    MessageCircle,
  }
  return icons[iconName] || BookOpen
}

export function PerplexityChat({
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
  showSearch,
  setShowSearch,
  addActivityItem,
  handleSidebarNavigation,
  setCurrentView,
}: PerplexityChatProps) {
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isStructuring, setIsStructuring] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [documentsScrollPosition, setDocumentsScrollPosition] = useState(0)
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0])
  const [showModelSelector, setShowModelSelector] = useState(false)
  const [previewDocument, setPreviewDocument] = useState<any>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const documentsScrollRef = useRef<HTMLDivElement>(null)

  const [showSourceModal, setShowSourceModal] = useState(false)
  const [showInsightModal, setShowInsightModal] = useState(false)
  const [showTopicModal, setShowTopicModal] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedModalData, setSelectedModalData] = useState<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollDocuments = (direction: "left" | "right") => {
    if (documentsScrollRef.current) {
      const scrollAmount = 200
      const newPosition =
        direction === "left"
          ? Math.max(0, documentsScrollPosition - scrollAmount)
          : documentsScrollPosition + scrollAmount

      documentsScrollRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      })
      setDocumentsScrollPosition(newPosition)
    }
  }

  const updateUploadingFile = (id: string, updates: Partial<UploadingFile>) => {
    setUploadingFiles((prev) => prev.map((file) => (file.id === id ? { ...file, ...updates } : file)))
  }

  const createOrUpdateSession = async (fileName: string) => {
    const sessionName = fileName.replace(/\.[^/.]+$/, "")

    try {
      if (activeSession) {
        // Update existing session name with the new document
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "update",
            sessionId: activeSession,
            sessionName: sessionName,
          }),
        })

        if (response.ok) {
          setSessions((prev) => prev.map((s) => (s.id === activeSession ? { ...s, name: sessionName } : s)))
          return { id: activeSession }
        }
      } else {
        // Create new session
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

          addActivityItem({
            type: "session",
            title: "New session created",
            description: sessionName,
            timestamp: "Just now",
            icon: "Plus",
          })

          return newSession
        }
      }
    } catch (error) {
      console.error("Failed to create/update session:", error)
    }

    // Fallback to local session if API fails
    if (!activeSession) {
      const fallbackSession = {
        id: Date.now().toString(),
        name: sessionName,
        lastActivity: new Date().toISOString(),
        messageCount: 0,
        documentsCount: 1,
        messages: [],
        documents: [],
      }

      setSessions([fallbackSession, ...sessions])
      setActiveSession(fallbackSession.id)
      return fallbackSession
    }

    return { id: activeSession }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const fileId = Date.now().toString() + Math.random()
      const uploadingFile: UploadingFile = {
        id: fileId,
        name: file.name,
        status: "uploading",
        progress: 0,
      }

      setUploadingFiles((prev) => [...prev, uploadingFile])

      try {
        // Create or update session with document name
        await createOrUpdateSession(file.name)

        // Step 1: Upload and extract
        updateUploadingFile(fileId, { status: "extracting", progress: 30 })

        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          const newDoc = {
            ...result.document,
            tags: [],
            confidence: Math.random() * 0.3 + 0.7,
            region: null,
            version: null,
          }

          // Step 2: Show extracted text
          updateUploadingFile(fileId, {
            status: "processing",
            progress: 70,
            extractedText: newDoc.content,
          })

          // Step 3: Complete processing
          setTimeout(() => {
            updateUploadingFile(fileId, { status: "complete", progress: 100 })

            // Add to documents after a brief delay - Real-time update
            setTimeout(() => {
              setDocuments((prev) => [...prev, newDoc])
              setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId))

              // Update session with new document count
              if (activeSession) {
                updateSessionDocumentCount(activeSession, documents.length + 1)
              }

              addActivityItem({
                type: "upload",
                title: "Document uploaded",
                description: `${file.name} was successfully processed`,
                timestamp: "Just now",
                icon: "Upload",
              })
            }, 1000)
          }, 1500)
        } else {
          updateUploadingFile(fileId, {
            status: "error",
            progress: 0,
            error: result.error,
          })
        }
      } catch (error) {
        console.error("Upload error:", error)
        updateUploadingFile(fileId, {
          status: "error",
          progress: 0,
          error: "Upload failed. Please try again.",
        })
      }
    }
  }

  const updateSessionDocumentCount = async (sessionId: string, documentCount: number) => {
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          sessionId: sessionId,
          documents: Array(documentCount).fill({}),
        }),
      })
    } catch (error) {
      console.error("Failed to update session:", error)
    }
  }

  const updateSessionMessageCount = async (sessionId: string) => {
    try {
      await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          sessionId: sessionId,
          message: "new message",
        }),
      })
    } catch (error) {
      console.error("Failed to update session:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageToSend = currentMessage
    setCurrentMessage("")
    setIsLoading(true)

    // Update session message count
    if (activeSession) {
      updateSessionMessageCount(activeSession)
    }

    addActivityItem({
      type: "query",
      title: "Question asked",
      description: messageToSend.length > 50 ? messageToSend.substring(0, 50) + "..." : messageToSend,
      timestamp: "Just now",
      icon: "MessageCircle",
    })

    const searchingMessage = {
      id: (Date.now() + 1).toString(),
      type: "assistant",
      content: `🔍 Processing your question with ${selectedModel.name}...`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isSearching: true,
    }

    setMessages((prev) => [...prev, searchingMessage])

    try {
      if (documents.length === 0) {
        setTimeout(() => {
          const noDocsMessage = {
            id: (Date.now() + 2).toString(),
            type: "assistant",
            content:
              "I couldn't find any uploaded documents to search through. Please upload some documents first to get started with your knowledge base.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }
          setMessages((prev) => prev.filter((msg) => !msg.isSearching).concat([noDocsMessage]))
          setIsLoading(false)
        }, 2000)
        return
      }

      // Step 1: Get response from agent
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "query",
          message: messageToSend,
          model: selectedModel,
        }),
      })

      const result = await response.json()

      if (result.success) {
        // Step 2: Show initial response
        const initialMessage = {
          id: (Date.now() + 3).toString(),
          type: "assistant",
          content: result.data.answer || "I found relevant information in your documents.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sources: result.data.sources || [],
          confidence: result.data.confidence || 0.85,
          model: selectedModel.name,
          isStructuring: true,
        }

        setMessages((prev) => prev.filter((msg) => !msg.isSearching).concat([initialMessage]))
        setIsStructuring(true)

        // Step 3: Structure the response with Groq
        if (result.data.rawResponse) {
          try {
            const structureResponse = await fetch("/api/agents", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "structure",
                rawResponse: result.data.rawResponse,
                message: messageToSend,
              }),
            })

            const structureResult = await structureResponse.json()

            if (structureResult.success) {
              // Step 4: Update message with structured response
              const structuredMessage = {
                ...initialMessage,
                content: structureResult.data.answer, // Use the structured answer
                structuredResponse: structureResult.data as StructuredResponse,
                isStructuring: false,
              }

              setMessages((prev) => prev.map((msg) => (msg.id === initialMessage.id ? structuredMessage : msg)))
            }
          } catch (structureError) {
            console.error("Structuring error:", structureError)
            // Remove structuring indicator if it fails
            setMessages((prev) =>
              prev.map((msg) => (msg.id === initialMessage.id ? { ...msg, isStructuring: false } : msg)),
            )
          }
        }

        setIsStructuring(false)
      } else {
        const errorMessage = {
          id: (Date.now() + 4).toString(),
          type: "assistant",
          content: "I encountered an error while processing your question. Please try again or rephrase your question.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }
        setMessages((prev) => prev.filter((msg) => !msg.isSearching).concat([errorMessage]))
      }
    } catch (error) {
      console.error("Message error:", error)
      const errorMessage = {
        id: (Date.now() + 5).toString(),
        type: "assistant",
        content: "I'm having trouble connecting to the knowledge base. Please check your connection and try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => prev.filter((msg) => !msg.isSearching).concat([errorMessage]))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    const deletedDoc = documents.find((doc) => doc.id === documentId)
    // Real-time update
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId))

    // Update session document count
    if (activeSession) {
      updateSessionDocumentCount(activeSession, documents.length - 1)
    }

    if (deletedDoc) {
      addActivityItem({
        type: "delete",
        title: "Document deleted",
        description: `${deletedDoc.name} was removed from library`,
        timestamp: "Just now",
        icon: "Trash2",
      })
    }
  }

  const handleDownloadDocument = (doc: any) => {
    try {
      const content = doc.content || "No content available"
      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)

      // Create a temporary anchor element
      const link = window.document.createElement("a")
      link.href = url
      link.download = doc.name || "document.txt"

      // Append to body, click, and remove
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)

      // Clean up the URL
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download error:", error)
    }
  }

  const handleViewDocument = (doc: any) => {
    setPreviewDocument(doc)
    setShowPreviewModal(true)
  }

  const renderStructuredResponse = (structuredResponse: StructuredResponse) => {
    return (
      <div className="space-y-6 mt-6">
        {/* Sources */}
        {structuredResponse.sources && structuredResponse.sources.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Quote className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-gray-700">Sources</span>
            </div>
            <div className="grid gap-3">
              {structuredResponse.sources.map((source, idx) => (
                <Card
                  key={idx}
                  className="border border-blue-100 bg-blue-50/50 cursor-pointer hover:bg-blue-100/50 transition-colors"
                  onClick={() => {
                    setSelectedModalData(source)
                    setShowSourceModal(true)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-900">
                            [{source.id}] {source.document}
                          </span>
                          {source.page && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                              Page {source.page}
                            </Badge>
                          )}
                          {source.relevance && (
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-xs",
                                source.relevance === "high"
                                  ? "bg-green-100 text-green-700"
                                  : source.relevance === "medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700",
                              )}
                            >
                              {source.relevance} relevance
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 italic leading-relaxed">"{source.snippet}"</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Key Insights */}
        {structuredResponse.keyInsights && structuredResponse.keyInsights.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-semibold text-gray-700">Key Insights</span>
            </div>
            <div className="grid gap-3">
              {structuredResponse.keyInsights.map((insight, idx) => {
                const IconComponent = getIconComponent(insight.icon)
                return (
                  <Card
                    key={idx}
                    className="border border-yellow-100 bg-yellow-50/50 cursor-pointer hover:bg-yellow-100/50 transition-colors"
                    onClick={() => {
                      setSelectedModalData(insight)
                      setShowInsightModal(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-4 h-4 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">{insight.title}</h4>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Related Topics */}
        {structuredResponse.relatedTopics && structuredResponse.relatedTopics.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-gray-700">Related Topics</span>
            </div>
            <div className="grid gap-3">
              {structuredResponse.relatedTopics.map((topic, idx) => {
                const IconComponent = getIconComponent(topic.icon)
                return (
                  <Card
                    key={idx}
                    className="border border-purple-100 bg-purple-50/50 cursor-pointer hover:bg-purple-100/50 transition-colors"
                    onClick={() => {
                      setSelectedModalData(topic)
                      setShowTopicModal(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">{topic.title}</h4>
                          <p className="text-sm text-gray-600">{topic.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Items */}
        {structuredResponse.actionItems && structuredResponse.actionItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-semibold text-gray-700">Suggested Actions</span>
            </div>
            <div className="grid gap-3">
              {structuredResponse.actionItems.map((action, idx) => {
                const IconComponent = getIconComponent(action.icon)
                return (
                  <Card
                    key={idx}
                    className="border border-green-100 bg-green-50/50 cursor-pointer hover:bg-green-100/50 transition-colors"
                    onClick={() => {
                      setSelectedModalData(action)
                      setShowActionModal(true)
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <IconComponent className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">{action.title}</h4>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Tags */}
        {structuredResponse.tags && structuredResponse.tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {structuredResponse.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Confidence Score */}
        {structuredResponse.confidence && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 font-medium">Confidence:</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      structuredResponse.confidence > 0.8
                        ? "bg-green-500"
                        : structuredResponse.confidence > 0.6
                          ? "bg-yellow-500"
                          : "bg-red-500",
                    )}
                    style={{ width: `${structuredResponse.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-700">
                  {Math.round(structuredResponse.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        sessions={sessions}
        setSessions={setSessions}
        activeSession={activeSession}
        setActiveSession={setActiveSession}
        activeSidebarItem={activeSidebarItem}
        handleSidebarNavigation={handleSidebarNavigation}
        addActivityItem={addActivityItem}
        messages={messages}
        setMessages={setMessages}
        documents={documents}
        setDocuments={setDocuments}
        setCurrentView={setCurrentView}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 shadow-sm flex-shrink-0">
          <div className="flex items-center justify-between">
            <div
              className="cursor-pointer"
              onClick={() => {
                setCurrentView("landing")
                setActiveSidebarItem("")
              }}
            >
              <h1 className="text-2xl font-bold text-gray-900 hover:text-purple-600 transition-colors">
                Knowledge Session
              </h1>
              <p className="text-sm text-gray-600 mt-1">Ask questions about your uploaded documents</p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 px-3 py-1">
                {documents.length} documents
              </Badge>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-56 border-gray-200"
                  onClick={() => setShowSearch(true)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Documents Bar - Fixed width to prevent shifting */}
        {(documents.length > 0 || uploadingFiles.length > 0) && (
          <div className="bg-white border-b border-gray-100 px-8 py-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => scrollDocuments("left")}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex-1 min-w-0">
                <div
                  ref={documentsScrollRef}
                  className="overflow-x-auto scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  <div className="flex gap-3 pb-2" style={{ minWidth: "max-content" }}>
                    {/* Uploading Files */}
                    {uploadingFiles.map((file) => (
                      <Card key={file.id} className="flex-shrink-0 w-80 p-4 border border-blue-200 bg-blue-50">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              {file.status === "complete" ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : file.status === "error" ? (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              ) : (
                                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-600">
                                {file.status === "uploading"
                                  ? "Uploading..."
                                  : file.status === "extracting"
                                    ? "Extracting text..."
                                    : file.status === "processing"
                                      ? "Processing with AI..."
                                      : file.status === "complete"
                                        ? "Complete!"
                                        : "Error"}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                file.status === "error" ? "bg-red-500" : "bg-blue-500",
                              )}
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>

                          {/* Error Message */}
                          {file.error && (
                            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                              <p className="text-xs text-red-600">{file.error}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}

                    {/* Existing Documents - Enhanced UI like in screenshot */}
                    {documents.map((doc) => (
                      <Card
                        key={doc.id}
                        className="flex-shrink-0 w-64 p-4 hover:shadow-md transition-shadow border border-gray-200 bg-white rounded-xl"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText className="w-5 h-5 text-gray-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant={doc.status === "ready" ? "default" : "secondary"}
                                    className={cn(
                                      "text-xs px-2 py-0",
                                      doc.status === "ready"
                                        ? "bg-green-100 text-green-700"
                                        : doc.status === "processing"
                                          ? "bg-yellow-100 text-yellow-700"
                                          : "bg-red-100 text-red-700",
                                    )}
                                  >
                                    {doc.status === "ready"
                                      ? "Ready"
                                      : doc.status === "processing"
                                        ? "Processing"
                                        : "Error"}
                                  </Badge>
                                  <span className="text-xs text-gray-500">{doc.size}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 hover:bg-gray-100 rounded-lg"
                                onClick={() => handleViewDocument(doc)}
                                title="View document"
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 hover:bg-gray-100 rounded-lg"
                                onClick={() => handleDownloadDocument(doc)}
                                title="Download document"
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                onClick={() => handleDeleteDocument(doc.id)}
                                title="Delete document"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => scrollDocuments("right")}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 flex-shrink-0 rounded-lg"
                disabled={uploadingFiles.some((f) => f.status !== "complete" && f.status !== "error")}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-lg mx-auto">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Start Your Knowledge Session</h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Upload documents and ask questions to get instant, grounded answers from your intelligent knowledge
                  base powered by Lyzr AI.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  {[
                    { icon: Upload, text: "Upload DOCX, TXT" },
                    { icon: MessageCircle, text: "Ask natural questions" },
                    { icon: Quote, text: "Get cited answers" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <item.icon className="w-6 h-6 text-gray-600 mb-2" />
                      <span className="text-sm text-gray-600 text-center">{item.text}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-3 group rounded-lg"
                >
                  <Upload className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                  Upload Your First Document
                </Button>
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 p-8">
              <div className="max-w-4xl mx-auto space-y-8">
                {messages.map((message: any) => (
                  <div key={message.id} className={cn("flex gap-4", message.type === "user" ? "justify-end" : "")}>
                    {message.type === "assistant" && (
                      <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                        <Image src="/lyzr-logo.png" alt="AI" width={20} height={20} className="invert" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-2xl",
                        message.type === "user"
                          ? "bg-black text-white rounded-2xl rounded-br-md p-6"
                          : "bg-white border border-gray-200 rounded-2xl rounded-bl-md p-6 shadow-lg",
                      )}
                    >
                      {message.isSearching ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">{message.content}</span>
                        </div>
                      ) : (
                        <div
                          className="text-sm leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                      )}

                      {/* Show structuring indicator */}
                      {message.isStructuring && (
                        <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                          <span className="text-sm text-blue-700">Structuring response with Groq AI...</span>
                        </div>
                      )}

                      {/* Show legacy sources if no structured response */}
                      {message.sources && message.sources.length > 0 && !message.structuredResponse && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <div className="flex items-center gap-2 mb-4">
                            <Quote className="w-5 h-5 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700">Sources</span>
                          </div>
                          <div className="space-y-3">
                            {message.sources.map((source: any, idx: number) => (
                              <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-3">
                                  <FileText className="w-5 h-5 text-gray-600" />
                                  <span className="text-sm font-semibold text-gray-900">
                                    [{source.id}] {source.document}
                                  </span>
                                  {source.page && (
                                    <Badge variant="secondary" className="text-xs bg-gray-200 text-gray-700">
                                      Page {source.page}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 italic leading-relaxed">"{source.snippet}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Show legacy confidence if no structured response */}
                      {message.confidence && !message.structuredResponse && (
                        <div className="mt-4 flex items-center gap-3">
                          <span className="text-sm text-gray-500 font-medium">Confidence:</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full transition-all duration-500",
                                  message.confidence > 0.8
                                    ? "bg-green-500"
                                    : message.confidence > 0.6
                                      ? "bg-yellow-500"
                                      : "bg-red-500",
                                )}
                                style={{ width: `${message.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-700">
                              {Math.round(message.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Render structured response */}
                      {message.structuredResponse && renderStructuredResponse(message.structuredResponse)}

                      {message.model && <div className="mt-2 text-xs text-gray-400">Powered by {message.model}</div>}

                      <div className="text-xs text-gray-400 mt-4">{message.timestamp}</div>
                    </div>
                    {message.type === "user" && (
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold">
                        U
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-100 p-8 bg-white flex-shrink-0">
            <div className="max-w-4xl mx-auto">
              {/* AI Model Selector */}
              <div className="mb-4">
                <div className="relative">
                  <Button
                    variant="outline"
                    onClick={() => setShowModelSelector(!showModelSelector)}
                    className="flex items-center gap-2 text-sm border-gray-200 hover:bg-gray-50"
                  >
                    <selectedModel.icon className="w-4 h-4" />
                    {selectedModel.name}
                    <Settings className="w-3 h-3 ml-1" />
                  </Button>

                  {showModelSelector && (
                    <Card className="absolute bottom-full mb-2 left-0 w-80 shadow-xl border z-10">
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Choose AI Model</h3>
                        <div className="space-y-2">
                          {AI_MODELS.map((model) => (
                            <button
                              key={model.id}
                              onClick={() => {
                                setSelectedModel(model)
                                setShowModelSelector(false)
                              }}
                              className={cn(
                                "w-full text-left p-3 rounded-lg border transition-colors",
                                selectedModel.id === model.id
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 hover:bg-gray-50",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <model.icon className="w-5 h-5 text-gray-600" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">{model.name}</span>
                                    {model.isDefault && (
                                      <Badge className="text-xs bg-green-100 text-green-700">Best</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{model.description}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    className="pr-14 h-14 text-base border-gray-200 focus:border-black focus:ring-black rounded-xl"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isLoading || isStructuring}
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isLoading || isStructuring}
                    className="absolute right-2 top-2 bg-black hover:bg-gray-800 text-white h-10 w-10 p-0 rounded-lg"
                  >
                    {isLoading || isStructuring ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Powered by Lyzr AI with {selectedModel.name} + Groq for structured responses
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {showPreviewModal && previewDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-gray-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{previewDocument.name}</h2>
                  <p className="text-sm text-gray-600">
                    {previewDocument.size} • Uploaded {previewDocument.uploadedAt}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowPreviewModal(false)} className="h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h3 className="font-medium text-gray-900 mb-3">Document Content</h3>
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {previewDocument.content || "No content available for preview."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Source Modal */}
      {showSourceModal && selectedModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Source Details</h2>
                  <p className="text-sm text-gray-600">{selectedModalData.document}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowSourceModal(false)} className="h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Document</h3>
                  <p className="text-sm text-gray-700">{selectedModalData.document}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Content Snippet</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <p className="text-sm text-gray-700 italic leading-relaxed">"{selectedModalData.snippet}"</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Page</h3>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      {selectedModalData.page}
                    </Badge>
                  </div>
                  {selectedModalData.relevance && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">Relevance</h3>
                      <Badge variant={selectedModalData.relevance === "high" ? "default" : "outline"}>
                        {selectedModalData.relevance}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Insight Modal */}
      {showInsightModal && selectedModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-6 h-6 text-yellow-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Key Insight</h2>
                  <p className="text-sm text-gray-600">{selectedModalData.title}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowInsightModal(false)} className="h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Insight</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedModalData.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedModalData.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Topic Modal */}
      {showTopicModal && selectedModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Related Topic</h2>
                  <p className="text-sm text-gray-600">{selectedModalData.title}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowTopicModal(false)} className="h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Topic</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedModalData.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedModalData.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedModalData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Suggested Action</h2>
                  <p className="text-sm text-gray-600">{selectedModalData.title}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowActionModal(false)} className="h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Action</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedModalData.title}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedModalData.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".docx,.txt,.doc"
        onChange={handleFileUpload}
        className="hidden"
      />

      <SearchDialog showSearch={showSearch} setShowSearch={setShowSearch} documents={documents} />
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ChatInterfaceProps {
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

export function ChatInterface({
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
}: ChatInterfaceProps) {
  const [currentMessage, setCurrentMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [documentsScrollPosition, setDocumentsScrollPosition] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const documentsScrollRef = useRef<HTMLDivElement>(null)

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
      content: "🔍 Processing your question with AI...",
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

      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "query",
          message: messageToSend,
        }),
      })

      const result = await response.json()

      if (result.success) {
        const assistantMessage = {
          id: (Date.now() + 3).toString(),
          type: "assistant",
          content: result.data.answer || "I found relevant information in your documents.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          sources: result.data.sources || [],
          confidence: result.data.confidence || 0.85,
        }

        setMessages((prev) => prev.filter((msg) => !msg.isSearching).concat([assistantMessage]))
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

  const handleDownloadDocument = (document: any) => {
    const blob = new Blob([document.content || "No content available"], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = document.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-8 py-6 shadow-sm">
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

        {/* Documents Bar - Enhanced UI like in screenshot */}
        {(documents.length > 0 || uploadingFiles.length > 0) && (
          <div className="bg-white border-b border-gray-100 px-8 py-4">
            <div className="flex items-center gap-4">
              <Button size="sm" variant="ghost" onClick={() => scrollDocuments("left")} className="h-8 w-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div
                ref={documentsScrollRef}
                className="flex-1 overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex gap-3 pb-2">
                  {/* Uploading Files */}
                  {uploadingFiles.map((file) => (
                    <Card
                      key={file.id}
                      className="flex-shrink-0 w-80 p-4 border border-blue-200 bg-blue-50 animate-pulse"
                    >
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
                              onClick={() => handleDownloadDocument(doc)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              onClick={() => handleDeleteDocument(doc.id)}
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

              <Button size="sm" variant="ghost" onClick={() => scrollDocuments("right")} className="h-8 w-8 p-0">
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
        <div className="flex-1 flex flex-col">
          {messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-lg">
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
                    {message.type === "system" && (
                      <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-2xl",
                        message.type === "user"
                          ? "bg-black text-white rounded-2xl rounded-br-md p-6"
                          : message.type === "system"
                            ? "bg-blue-50 border border-blue-200 rounded-2xl p-4"
                            : "bg-white border border-gray-200 rounded-2xl rounded-bl-md p-6 shadow-lg",
                      )}
                    >
                      {message.isSearching ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">{message.content}</span>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}

                      {message.sources && message.sources.length > 0 && (
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

                      {message.confidence && (
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
          <div className="border-t border-gray-100 p-8 bg-white">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Ask a question about your documents..."
                    className="pr-14 h-14 text-base border-gray-200 focus:border-black focus:ring-black rounded-xl"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={isLoading}
                  />
                  <Button
                    size="sm"
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isLoading}
                    className="absolute right-2 top-2 bg-black hover:bg-gray-800 text-white h-10 w-10 p-0 rounded-lg"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Powered by Lyzr AI. Responses are grounded in your uploaded documents.
              </p>
            </div>
          </div>
        </div>
      </div>

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

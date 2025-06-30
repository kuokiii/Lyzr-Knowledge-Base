"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { SearchDialog } from "@/components/search-dialog"
import { Upload, FileText, Filter, Download, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface DocumentLibraryProps {
  documents: any[]
  setDocuments: (docs: any[]) => void
  sessions: any[]
  setSessions: (sessions: any[]) => void
  activeSession: string | null
  setActiveSession: (id: string | null) => void
  activeSidebarItem: string
  showSearch: boolean
  setShowSearch: (show: boolean) => void
  addActivityItem: (item: any) => void
  handleSidebarNavigation: (path: string) => void
}

export function DocumentLibrary({
  documents,
  setDocuments,
  sessions,
  setSessions,
  activeSession,
  setActiveSession,
  activeSidebarItem,
  showSearch,
  setShowSearch,
  addActivityItem,
  handleSidebarNavigation,
}: DocumentLibraryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          const newDoc = result.document
          setDocuments([...documents, newDoc])

          addActivityItem({
            type: "upload",
            title: "Document uploaded",
            description: `${file.name} was successfully processed`,
            timestamp: "Just now",
            icon: "Upload",
          })
        }
      } catch (error) {
        console.error("Upload error:", error)
      }
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", documentId }),
      })

      if (response.ok) {
        const deletedDoc = documents.find((doc) => doc.id === documentId)
        setDocuments(documents.filter((doc) => doc.id !== documentId))

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
    } catch (error) {
      console.error("Failed to delete document:", error)
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
      />

      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Document Library</h1>
              <p className="text-gray-600 mt-2">Manage and organize your knowledge base documents</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option>All Types</option>
                  <option>PDF</option>
                  <option>DOCX</option>
                  <option>TXT</option>
                </select>
              </div>
              <Button onClick={() => fileInputRef.current?.click()} className="bg-black hover:bg-gray-800 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </div>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">No documents uploaded yet</h3>
              <p className="text-gray-600 mb-8">Start building your knowledge base by uploading your first document</p>
              <Button onClick={() => fileInputRef.current?.click()} className="bg-black hover:bg-gray-800 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Upload Your First Document
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-600" />
                      </div>
                      <Badge
                        variant={doc.status === "ready" ? "default" : "secondary"}
                        className={cn(
                          "text-xs",
                          doc.status === "ready"
                            ? "bg-green-100 text-green-700"
                            : doc.status === "processing"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700",
                        )}
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">{doc.name}</h3>
                    <div className="text-sm text-gray-600 space-y-1 mb-4">
                      <div>Size: {doc.size}</div>
                      <div>Uploaded: {doc.uploadedAt}</div>
                      {doc.pages && <div>Pages: {doc.pages}</div>}
                      {doc.textLength && <div>Text: {doc.textLength.toLocaleString()} chars</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleDownloadDocument(doc)}>
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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

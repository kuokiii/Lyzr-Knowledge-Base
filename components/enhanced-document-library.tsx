"use client"

import type React from "react"
import { useRef, useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/sidebar"
import { KnowledgeBaseStats } from "@/components/knowledge-base-stats"
import {
  Upload,
  FileText,
  Filter,
  Download,
  Trash2,
  Info,
  Eye,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Hash,
  Search,
  Globe,
  Tag,
  Edit,
} from "lucide-react"
import { ConfidenceIndicator } from "@/components/confidence-indicator"
import { cn } from "@/lib/utils"

interface UploadingFile {
  id: string
  name: string
  status: "uploading" | "extracting" | "processing" | "complete" | "error"
  progress: number
  extractedText?: string
  error?: string
}

interface EnhancedDocumentLibraryProps {
  documents: any[]
  setDocuments: (docs: any[]) => void
  sessions: any[]
  setSessions: (sessions: any[]) => void
  activeSession: string | null
  setActiveSession: (id: string | null) => void
  activeSidebarItem: string
  addActivityItem: (item: any) => void
  handleSidebarNavigation: (path: string) => void
  recentActivity: any[]
}

export function EnhancedDocumentLibrary({
  documents,
  setDocuments,
  sessions,
  setSessions,
  activeSession,
  setActiveSession,
  activeSidebarItem,
  addActivityItem,
  handleSidebarNavigation,
  recentActivity,
}: EnhancedDocumentLibraryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [previewDocument, setPreviewDocument] = useState<any>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showTagModal, setShowTagModal] = useState(false)
  const [showTagsViewModal, setShowTagsViewModal] = useState(false)
  const [showRegionModal, setShowRegionModal] = useState(false)
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [selectedDocumentForTags, setSelectedDocumentForTags] = useState<any>(null)
  const [selectedDocumentForRegion, setSelectedDocumentForRegion] = useState<any>(null)
  const [selectedDocumentForVersion, setSelectedDocumentForVersion] = useState<any>(null)
  const [newTag, setNewTag] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All Types")
  const [selectedRegion, setSelectedRegion] = useState("All Regions")
  const [selectedVersion, setSelectedVersion] = useState("All Versions")
  const [tempRegion, setTempRegion] = useState("")
  const [tempVersion, setTempVersion] = useState("")
  const [regionSearchQuery, setRegionSearchQuery] = useState("")
  const [versionSearchQuery, setVersionSearchQuery] = useState("")

  const [availableTags, setAvailableTags] = useState([
    "Legal",
    "HR",
    "Technical",
    "Marketing",
    "Finance",
    "Research",
    "Policy",
    "Training",
    "Compliance",
    "Strategy",
  ])

  const allRegions = ["US", "EU", "UK", "CA", "AU", "JP", "IN", "BR", "MX", "SG", "DE", "FR", "IT", "ES", "NL"]

  const allVersions = [
    "v1.0",
    "v1.1",
    "v1.2",
    "v1.3",
    "v1.4",
    "v1.5",
    "v2.0",
    "v2.1",
    "v2.2",
    "v2.3",
    "v2.4",
    "v2.5",
    "v3.0",
    "v3.1",
    "v3.2",
    "v3.3",
    "v3.4",
    "v3.5",
    "v4.0",
    "v4.1",
    "v4.2",
    "v4.3",
    "v4.4",
    "v4.5",
    "v5.0",
    "v5.1",
    "v5.2",
    "v5.3",
    "v5.4",
    "v5.5",
  ]

  // Filter regions and versions based on search
  const filteredRegions = useMemo(() => {
    return allRegions.filter((region) => region.toLowerCase().includes(regionSearchQuery.toLowerCase()))
  }, [regionSearchQuery])

  const filteredVersions = useMemo(() => {
    return allVersions.filter((version) => version.toLowerCase().includes(versionSearchQuery.toLowerCase()))
  }, [versionSearchQuery])

  // Real-time filtering
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch =
        searchQuery === "" ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.content && doc.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.tags && doc.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))

      const matchesType =
        selectedType === "All Types" ||
        (selectedType === "PDF" && doc.type.includes("pdf")) ||
        (selectedType === "DOCX" && (doc.type.includes("word") || doc.type.includes("docx"))) ||
        (selectedType === "TXT" && doc.type.includes("text"))

      const matchesRegion = selectedRegion === "All Regions" || doc.region === selectedRegion

      const matchesVersion = selectedVersion === "All Versions" || doc.version === selectedVersion

      return matchesSearch && matchesType && matchesRegion && matchesVersion
    })
  }, [documents, searchQuery, selectedType, selectedRegion, selectedVersion])

  // Get unique values for filters
  const availableTypes = ["All Types", "PDF", "DOCX", "TXT"]
  const availableRegions = ["All Regions", ...Array.from(new Set(documents.map((doc) => doc.region).filter(Boolean)))]
  const availableVersions = [
    "All Versions",
    ...Array.from(new Set(documents.map((doc) => doc.version).filter(Boolean))),
  ]

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery !== "" ||
    selectedType !== "All Types" ||
    selectedRegion !== "All Regions" ||
    selectedVersion !== "All Versions"

  const updateUploadingFile = (id: string, updates: Partial<UploadingFile>) => {
    setUploadingFiles((prev) => prev.map((file) => (file.id === id ? { ...file, ...updates } : file)))
  }

  const createNewSession = async (fileName: string) => {
    const sessionName = fileName.replace(/\.[^/.]+$/, "")
    const newSession = {
      id: Date.now().toString(),
      name: sessionName,
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      documentsCount: 1,
      messages: [],
      documents: [],
    }

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      const fileId = Date.now().toString() + Math.random()
      const uploadingFile: UploadingFile = {
        id: fileId,
        name: file.name,
        status: "uploading",
        progress: 10,
      }

      setUploadingFiles((prev) => [...prev, uploadingFile])

      try {
        if (!activeSession || documents.length === 0) {
          await createNewSession(file.name)
        }

        updateUploadingFile(fileId, { status: "uploading", progress: 25 })
        await new Promise((resolve) => setTimeout(resolve, 500))

        updateUploadingFile(fileId, { status: "extracting", progress: 50 })
        await new Promise((resolve) => setTimeout(resolve, 500))

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

          updateUploadingFile(fileId, {
            status: "processing",
            progress: 80,
            extractedText: newDoc.content,
          })

          await new Promise((resolve) => setTimeout(resolve, 1000))

          updateUploadingFile(fileId, { status: "complete", progress: 100 })

          setTimeout(() => {
            // Real-time update to documents
            setDocuments((prev) => [...prev, newDoc])
            setUploadingFiles((prev) => prev.filter((f) => f.id !== fileId))

            addActivityItem({
              type: "upload",
              title: "Document uploaded",
              description: `${file.name} was successfully processed`,
              timestamp: "Just now",
              icon: "Upload",
            })
          }, 500)
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

  const handleDeleteDocument = async (documentId: string) => {
    const deletedDoc = documents.find((doc) => doc.id === documentId)
    // Real-time update
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

  const handleDownloadDocument = (doc: any) => {
    try {
      const content = doc.content || "No content available"
      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)

      const anchor = window.document.createElement("a")
      anchor.href = url
      anchor.download = doc.name
      anchor.style.display = "none"

      window.document.body.appendChild(anchor)
      anchor.click()
      window.document.body.removeChild(anchor)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download error:", error)
      alert("Failed to download document. Please try again.")
    }
  }

  const getFileTypeIcon = (type: string) => {
    if (type.includes("pdf")) return "📄"
    if (type.includes("word") || type.includes("docx")) return "📝"
    if (type.includes("text")) return "📋"
    return "📄"
  }

  const getFileTypeDisplay = (type: string, fileName: string) => {
    const extension = fileName.split(".").pop()?.toUpperCase() || "DOC"

    if (type.includes("pdf")) return "PDF"
    if (type.includes("word") || type.includes("wordprocessingml") || type.includes("docx")) return "DOCX"
    if (type.includes("msword")) return "DOC"
    if (type.includes("text") || type.includes("plain")) return "TXT"

    return extension
  }

  const handlePreviewDocument = (document: any) => {
    setPreviewDocument(document)
    setShowPreviewModal(true)
  }

  const handleOpenTagModal = (document: any) => {
    setSelectedDocumentForTags(document)
    setShowTagModal(true)
  }

  const handleViewAllTags = (document: any) => {
    setSelectedDocumentForTags(document)
    setShowTagsViewModal(true)
  }

  const handleOpenRegionModal = (document: any) => {
    setSelectedDocumentForRegion(document)
    setTempRegion(document.region || "")
    setRegionSearchQuery("")
    setShowRegionModal(true)
  }

  const handleOpenVersionModal = (document: any) => {
    setSelectedDocumentForVersion(document)
    setTempVersion(document.version || "")
    setVersionSearchQuery("")
    setShowVersionModal(true)
  }

  const handleSaveRegion = () => {
    if (!selectedDocumentForRegion) return

    const updatedDoc = {
      ...selectedDocumentForRegion,
      region: tempRegion || null,
    }

    // Real-time update
    setDocuments(documents.map((doc) => (doc.id === selectedDocumentForRegion.id ? updatedDoc : doc)))
    setShowRegionModal(false)
    setSelectedDocumentForRegion(null)
    setTempRegion("")
    setRegionSearchQuery("")
  }

  const handleSaveVersion = () => {
    if (!selectedDocumentForVersion) return

    const updatedDoc = {
      ...selectedDocumentForVersion,
      version: tempVersion || null,
    }

    // Real-time update
    setDocuments(documents.map((doc) => (doc.id === selectedDocumentForVersion.id ? updatedDoc : doc)))
    setShowVersionModal(false)
    setSelectedDocumentForVersion(null)
    setTempVersion("")
    setVersionSearchQuery("")
  }

  const handleAddTag = (tag: string) => {
    if (!selectedDocumentForTags) return

    const updatedDoc = {
      ...selectedDocumentForTags,
      tags: [...(selectedDocumentForTags.tags || []), tag],
    }

    // Real-time update
    setDocuments(documents.map((doc) => (doc.id === selectedDocumentForTags.id ? updatedDoc : doc)))
    setSelectedDocumentForTags(updatedDoc)
  }

  const handleRemoveTag = (tag: string) => {
    if (!selectedDocumentForTags) return

    const updatedDoc = {
      ...selectedDocumentForTags,
      tags: (selectedDocumentForTags.tags || []).filter((t: string) => t !== tag),
    }

    // Real-time update
    setDocuments(documents.map((doc) => (doc.id === selectedDocumentForTags.id ? updatedDoc : doc)))
    setSelectedDocumentForTags(updatedDoc)
  }

  const handleCreateTag = () => {
    if (!newTag.trim() || availableTags.includes(newTag.trim())) return

    const tag = newTag.trim()
    setAvailableTags([...availableTags, tag])
    handleAddTag(tag)
    setNewTag("")
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      addActivityItem({
        type: "query",
        title: "Document search",
        description: `Searched for "${query}"`,
        timestamp: "Just now",
        icon: "Search",
      })
    }
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedType("All Types")
    setSelectedRegion("All Regions")
    setSelectedVersion("All Versions")
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

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Document Library</h1>
                <p className="text-gray-600 mt-2">Manage and organize your knowledge base documents</p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-black hover:bg-gray-800 text-white"
                disabled={uploadingFiles.some((f) => f.status !== "complete" && f.status !== "error")}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search documents, content, and tags..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-12 text-base border-gray-200 focus:border-black focus:ring-black"
                />
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  >
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  >
                    {availableRegions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <select
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
                  >
                    {availableVersions.map((version) => (
                      <option key={version} value={version}>
                        {version}
                      </option>
                    ))}
                  </select>
                </div>

                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-gray-600 hover:text-gray-900 bg-transparent"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>

              {filteredDocuments.length !== documents.length && (
                <div className="text-sm text-gray-600">
                  Showing {filteredDocuments.length} of {documents.length} documents
                </div>
              )}
            </div>

            {/* Uploading Files */}
            {uploadingFiles.length > 0 && (
              <div className="mb-6 space-y-4">
                {uploadingFiles.map((file) => (
                  <Card key={file.id} className="border border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {file.status === "complete" ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : file.status === "error" ? (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            <span className="text-sm font-medium text-blue-600">{file.progress}%</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {file.status === "uploading"
                              ? "Uploading file..."
                              : file.status === "extracting"
                                ? "Extracting text content..."
                                : file.status === "processing"
                                  ? "Processing with AI..."
                                  : file.status === "complete"
                                    ? "Upload complete!"
                                    : "Upload failed"}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                file.status === "error" ? "bg-red-500" : "bg-blue-500",
                              )}
                              style={{ width: `${file.progress}%` }}
                            />
                          </div>
                          {file.error && <p className="text-sm text-red-600 mt-2">{file.error}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Confidence Score Info */}
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Understanding Confidence Scores</h3>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      Confidence scores indicate how well our AI can extract and understand information from your
                      documents. Higher scores (90%+) mean better text extraction and more accurate responses.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {filteredDocuments.length === 0 && uploadingFiles.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {documents.length === 0 ? "No documents uploaded yet" : "No documents match your filters"}
                </h3>
                <p className="text-gray-600 mb-8">
                  {documents.length === 0
                    ? "Start building your knowledge base by uploading your first document"
                    : "Try adjusting your search terms or filters"}
                </p>
                {documents.length === 0 && (
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your First Document
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Table Header - Fixed spacing */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-12 gap-6 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-700">
                    <div className="col-span-3">Name</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-1">Region</div>
                    <div className="col-span-1">Version</div>
                    <div className="col-span-2">Upload Date</div>
                    <div className="col-span-1">Confidence</div>
                    <div className="col-span-2">Tags</div>
                    <div className="col-span-1">Actions</div>
                  </div>

                  {/* Table Rows - Fixed spacing */}
                  <div className="divide-y divide-gray-200">
                    {filteredDocuments.map((doc) => (
                      <div key={doc.id} className="grid grid-cols-12 gap-6 p-4 hover:bg-gray-50 transition-colors">
                        {/* Name */}
                        <div className="col-span-3 flex items-center gap-3">
                          <div className="text-2xl">{getFileTypeIcon(doc.type)}</div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-gray-900 truncate" title={doc.name}>
                              {doc.name}
                            </h3>
                            <p className="text-sm text-gray-500">{doc.size}</p>
                          </div>
                        </div>

                        {/* Type */}
                        <div className="col-span-1 flex items-center">
                          <Badge variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                            {getFileTypeDisplay(doc.type, doc.name)}
                          </Badge>
                        </div>

                        {/* Region */}
                        <div className="col-span-1 flex items-center">
                          {doc.region ? (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                {doc.region}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                                onClick={() => handleOpenRegionModal(doc)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 bg-transparent border-dashed"
                              onClick={() => handleOpenRegionModal(doc)}
                            >
                              <Plus className="w-3 h-3 font-bold" />
                            </Button>
                          )}
                        </div>

                        {/* Version */}
                        <div className="col-span-1 flex items-center">
                          {doc.version ? (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                {doc.version}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 p-0 text-gray-400 hover:text-gray-600"
                                onClick={() => handleOpenVersionModal(doc)}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 bg-transparent border-dashed"
                              onClick={() => handleOpenVersionModal(doc)}
                            >
                              <Plus className="w-3 h-3 font-bold" />
                            </Button>
                          )}
                        </div>

                        {/* Upload Date - More space */}
                        <div className="col-span-2 flex items-center">
                          <div className="text-sm text-gray-600">{doc.uploadedAt}</div>
                        </div>

                        {/* Confidence */}
                        <div className="col-span-1 flex items-center">
                          <ConfidenceIndicator confidence={doc.confidence || 0.85} size="sm" showTooltip={true} />
                        </div>

                        {/* Tags - More space */}
                        <div className="col-span-2 flex items-center">
                          <div className="flex items-center gap-2 w-full min-w-0">
                            <div className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
                              {(doc.tags || []).length === 0 ? (
                                <span className="text-xs text-gray-400">No tags</span>
                              ) : (doc.tags || []).length === 1 ? (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-purple-50 text-purple-700 border-purple-200 truncate"
                                  style={{ maxWidth: "120px" }}
                                  title={doc.tags[0]}
                                >
                                  {doc.tags[0]}
                                </Badge>
                              ) : (
                                <>
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-purple-50 text-purple-700 border-purple-200 truncate"
                                    style={{ maxWidth: "100px" }}
                                    title={doc.tags[0]}
                                  >
                                    {doc.tags[0]}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-5 px-2 text-xs bg-gray-50 text-gray-600 hover:bg-gray-100 flex-shrink-0"
                                    onClick={() => handleViewAllTags(doc)}
                                  >
                                    +{doc.tags.length - 1}
                                  </Button>
                                </>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 flex-shrink-0"
                              onClick={() => handleOpenTagModal(doc)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={() => handlePreviewDocument(doc)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={() => handleDownloadDocument(doc)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Knowledge Base Stats Sidebar */}
        <KnowledgeBaseStats documents={filteredDocuments} sessions={sessions} recentActivity={recentActivity} />
      </div>

      {/* Region Modal with Search */}
      {showRegionModal && selectedDocumentForRegion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Set Region</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowRegionModal(false)} className="h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{selectedDocumentForRegion.name}</h3>
                <p className="text-sm text-gray-600">Select the region for this document</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Regions</label>
                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search regions..."
                    value={regionSearchQuery}
                    onChange={(e) => setRegionSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => setTempRegion("")}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100",
                        tempRegion === "" ? "bg-blue-50 text-blue-700" : "",
                      )}
                    >
                      No region
                    </button>
                    {filteredRegions.map((region) => (
                      <button
                        key={region}
                        onClick={() => setTempRegion(region)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100",
                          tempRegion === region ? "bg-blue-50 text-blue-700" : "",
                        )}
                      >
                        {region}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveRegion} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowRegionModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version Modal with Search */}
      {showVersionModal && selectedDocumentForVersion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Set Version</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowVersionModal(false)} className="h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{selectedDocumentForVersion.name}</h3>
                <p className="text-sm text-gray-600">Select the version for this document</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Versions</label>
                <div className="relative mb-3">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search versions..."
                    value={versionSearchQuery}
                    onChange={(e) => setVersionSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => setTempVersion("")}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100",
                        tempVersion === "" ? "bg-green-50 text-green-700" : "",
                      )}
                    >
                      No version
                    </button>
                    {filteredVersions.map((version) => (
                      <button
                        key={version}
                        onClick={() => setTempVersion(version)}
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100",
                          tempVersion === version ? "bg-green-50 text-green-700" : "",
                        )}
                      >
                        {version}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveVersion} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                  Save
                </Button>
                <Button variant="outline" onClick={() => setShowVersionModal(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View All Tags Modal */}
      {showTagsViewModal && selectedDocumentForTags && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">All Tags</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowTagsViewModal(false)} className="h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">{selectedDocumentForTags.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedDocumentForTags.tags || []).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {(selectedDocumentForTags.tags || []).length === 0 && (
                    <p className="text-sm text-gray-500">No tags assigned to this document</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 pt-6">
                <Button
                  onClick={() => {
                    setShowTagsViewModal(false)
                    setShowTagModal(true)
                  }}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Manage Tags
                </Button>
                <Button variant="outline" onClick={() => setShowTagsViewModal(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tag Management Modal */}
      {showTagModal && selectedDocumentForTags && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Manage Tags</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowTagModal(false)} className="h-8 w-8 p-0">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{selectedDocumentForTags.name}</h3>
                <p className="text-sm text-gray-600">Add or remove tags to organize your documents</p>
              </div>

              {/* Current Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Tags</label>
                <div className="flex flex-wrap gap-2">
                  {(selectedDocumentForTags.tags || []).map((tag: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 group">
                      <Hash className="w-3 h-3 mr-1" />
                      {tag}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 ml-1 opacity-0 group-hover:opacity-100 hover:bg-purple-200"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                  {(selectedDocumentForTags.tags || []).length === 0 && (
                    <p className="text-sm text-gray-500">No tags added yet</p>
                  )}
                </div>
              </div>

              {/* Add New Tag */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add New Tag</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag name..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    onKeyPress={(e) => e.key === "Enter" && handleCreateTag()}
                  />
                  <Button
                    size="sm"
                    onClick={handleCreateTag}
                    disabled={!newTag.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Add
                  </Button>
                </div>
              </div>

              {/* Available Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Add</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags
                    .filter((tag) => !(selectedDocumentForTags.tags || []).includes(tag))
                    .map((tag) => (
                      <Button
                        key={tag}
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs hover:bg-purple-50 hover:border-purple-300 bg-transparent"
                        onClick={() => handleAddTag(tag)}
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {tag}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    {previewDocument.size} • {previewDocument.region} • {previewDocument.version} • Uploaded{" "}
                    {previewDocument.uploadedAt}
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

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".docx,.txt,.doc"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  )
}

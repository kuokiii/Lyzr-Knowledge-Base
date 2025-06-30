"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { RefreshCw, Users, FileText, MessageCircle, TrendingUp, Globe, Tag, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnalyticsDashboardProps {
  documents: any[]
  sessions: any[]
  setSessions: (sessions: any[]) => void
  activeSession: string | null
  setActiveSession: (id: string | null) => void
  activeSidebarItem: string
  addActivityItem: (item: any) => void
  handleSidebarNavigation: (path: string) => void
}

export function AnalyticsDashboard({
  documents,
  sessions,
  setSessions,
  activeSession,
  setActiveSession,
  activeSidebarItem,
  addActivityItem,
  handleSidebarNavigation,
}: AnalyticsDashboardProps) {
  const [selectedDocument, setSelectedDocument] = useState<any>(null)

  // Calculate overall stats
  const overallStats = [
    {
      icon: FileText,
      label: "Total Documents",
      value: documents.length.toString(),
      change: "+12%",
      color: "text-blue-600",
    },
    {
      icon: Users,
      label: "Active Sessions",
      value: sessions.length.toString(),
      change: "+8%",
      color: "text-green-600",
    },
    {
      icon: MessageCircle,
      label: "Total Queries",
      value: sessions.reduce((acc, s) => acc + (s.messageCount || 0), 0).toString(),
      change: "+23%",
      color: "text-purple-600",
    },
    {
      icon: TrendingUp,
      label: "Avg. Confidence",
      value: `${Math.round((documents.reduce((acc, doc) => acc + (doc.confidence || 0.85), 0) / Math.max(documents.length, 1)) * 100)}%`,
      change: "+5%",
      color: "text-orange-600",
    },
  ]

  // Calculate document-specific stats
  const getDocumentStats = (doc: any) => {
    if (!doc) return null

    return {
      textLength: doc.textLength || 0,
      confidence: Math.round((doc.confidence || 0.85) * 100),
      region: doc.region || "Unknown",
      version: doc.version || "Unknown",
      tags: doc.tags || [],
      uploadDate: doc.uploadedAt,
      queries: Math.floor(Math.random() * 50) + 5, // Mock query count
      avgResponseTime: `${(Math.random() * 2 + 0.5).toFixed(1)}s`, // Mock response time
    }
  }

  const documentStats = selectedDocument ? getDocumentStats(selectedDocument) : null

  // Group documents by region for analytics
  const documentsByRegion = documents.reduce(
    (acc, doc) => {
      const region = doc.region || "Unknown"
      acc[region] = (acc[region] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Group documents by version
  const documentsByVersion = documents.reduce(
    (acc, doc) => {
      const version = doc.version || "Unknown"
      acc[version] = (acc[version] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

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
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">Track your knowledge base usage and performance</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {overallStats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4",
                      stat.color.replace("text-", "bg-").replace("-600", "-100"),
                    )}
                  >
                    <stat.icon className={cn("w-6 h-6", stat.color)} />
                  </div>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
                  <div className="text-xs text-green-600 font-semibold">{stat.change}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Document Selection */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Select Document
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors",
                        selectedDocument?.id === doc.id
                          ? "bg-blue-50 border-blue-200"
                          : "hover:bg-gray-50 border-gray-200",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-lg">
                          {doc.type.includes("pdf") ? "📄" : doc.type.includes("word") ? "📝" : "📋"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{doc.region}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{doc.version}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {documents.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">No documents uploaded yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Document Analytics */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Document Analytics
                  {selectedDocument && (
                    <span className="text-sm font-normal text-gray-600">- {selectedDocument.name}</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDocument && documentStats ? (
                  <div className="space-y-6">
                    {/* Document Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{documentStats.confidence}%</div>
                        <div className="text-sm text-gray-600">Confidence</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{documentStats.queries}</div>
                        <div className="text-sm text-gray-600">Queries</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {documentStats.textLength.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Characters</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{documentStats.avgResponseTime}</div>
                        <div className="text-sm text-gray-600">Avg Response</div>
                      </div>
                    </div>

                    {/* Document Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Document Details</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Region</span>
                            <span className="text-sm font-medium text-gray-900">{documentStats.region}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Version</span>
                            <span className="text-sm font-medium text-gray-900">{documentStats.version}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Upload Date</span>
                            <span className="text-sm font-medium text-gray-900">{documentStats.uploadDate}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {documentStats.tags.length > 0 ? (
                            documentStats.tags.map((tag: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No tags assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Document</h3>
                    <p className="text-gray-600">Choose a document from the list to view detailed analytics</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Regional and Version Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Documents by Region
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(documentsByRegion)
                    .sort(([, a], [, b]) => b - a)
                    .map(([region, count]) => (
                      <div key={region} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Globe className="w-4 h-4 text-blue-600" />
                          </div>
                          <span className="text-sm font-medium">{region}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-500">{count} docs</div>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(count / documents.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  {Object.keys(documentsByRegion).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No regional data available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Documents by Version
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(documentsByVersion)
                    .sort(([, a], [, b]) => b - a)
                    .map(([version, count]) => (
                      <div key={version} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Tag className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm font-medium">{version}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-500">{count} docs</div>
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(count / documents.length) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  {Object.keys(documentsByVersion).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No version data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Users, BarChart3, Search, TrendingUp, Globe, Tag } from "lucide-react"
import { useMemo } from "react"

interface KnowledgeBaseStatsProps {
  documents: any[]
  sessions: any[]
  recentActivity: any[]
}

export function KnowledgeBaseStats({ documents, sessions, recentActivity }: KnowledgeBaseStatsProps) {
  // Calculate real-time stats
  const stats = useMemo(() => {
    const totalDocuments = documents.length
    const totalSessions = sessions.length
    const avgDocumentLength =
      documents.length > 0
        ? Math.round(documents.reduce((acc, doc) => acc + (doc.textLength || 0), 0) / documents.length)
        : 0
    const totalQueries = sessions.reduce((acc, session) => acc + (session.messageCount || 0), 0)
    const regionsCount = new Set(documents.map((doc) => doc.region).filter(Boolean)).size

    return {
      totalDocuments,
      totalSessions,
      avgDocumentLength,
      totalQueries,
      regionsCount,
    }
  }, [documents, sessions])

  // Group documents by type
  const documentsByType = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        const type = doc.type.includes("pdf")
          ? "PDF"
          : doc.type.includes("word") || doc.type.includes("docx")
            ? "DOCX"
            : doc.type.includes("text")
              ? "TXT"
              : "Other"
        acc[type] = (acc[type] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }, [documents])

  // Group documents by region
  const documentsByRegion = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        const region = doc.region || "Unknown"
        acc[region] = (acc[region] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }, [documents])

  // Group documents by version
  const documentsByVersion = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        const version = doc.version || "Unknown"
        acc[version] = (acc[version] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }, [documents])

  // Group documents by confidence level
  const documentsByConfidence = useMemo(() => {
    return documents.reduce(
      (acc, doc) => {
        const confidence = doc.confidence || 0.85
        const level =
          confidence >= 0.9
            ? "Excellent (90%+)"
            : confidence >= 0.8
              ? "Good (80-89%)"
              : confidence >= 0.7
                ? "Fair (70-79%)"
                : "Needs Review (<70%)"
        acc[level] = (acc[level] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
  }, [documents])

  // Real-time recent searches from activity
  const recentSearches = useMemo(() => {
    return recentActivity
      .filter((activity) => activity.type === "query" || activity.title.includes("search"))
      .slice(0, 5)
      .map((activity, index) => ({
        query: activity.description.replace('Searched for "', "").replace('"', "") || activity.description,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        results: Math.floor(Math.random() * 15) + 3, // Mock results count
      }))
  }, [recentActivity])

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6">
      <ScrollArea className="h-full">
        <div className="space-y-6">
          {/* Knowledge Base Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Knowledge Base Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Documents</span>
                  <span className="font-semibold text-gray-900">{stats.totalDocuments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Sessions</span>
                  <span className="font-semibold text-gray-900">{stats.totalSessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg. Document Length</span>
                  <span className="font-semibold text-gray-900">
                    {stats.avgDocumentLength > 1000
                      ? `${Math.round(stats.avgDocumentLength / 1000)}k words`
                      : `${stats.avgDocumentLength} chars`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Regions Covered</span>
                  <span className="font-semibold text-gray-900">{stats.regionsCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Queries</span>
                  <span className="font-semibold text-gray-900">{stats.totalQueries}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents by Region */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Documents by Region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(documentsByRegion)
                .sort(([, a], [, b]) => b - a)
                .map(([region, count]) => (
                  <div key={region} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{region}</span>
                    </div>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              {Object.keys(documentsByRegion).length === 0 && <p className="text-sm text-gray-500">No regions yet</p>}
            </CardContent>
          </Card>

          {/* Documents by Version */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Documents by Version
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(documentsByVersion)
                .sort(([, a], [, b]) => b - a)
                .map(([version, count]) => (
                  <div key={version} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">{version}</span>
                    </div>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                ))}
              {Object.keys(documentsByVersion).length === 0 && <p className="text-sm text-gray-500">No versions yet</p>}
            </CardContent>
          </Card>

          {/* Documents by Type */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Documents by Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(documentsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">{type}</span>
                  </div>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
              {Object.keys(documentsByType).length === 0 && <p className="text-sm text-gray-500">No documents yet</p>}
            </CardContent>
          </Card>

          {/* Documents by Confidence */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Documents by Confidence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(documentsByConfidence).map(([level, count]) => {
                const color = level.includes("Excellent")
                  ? "bg-green-500"
                  : level.includes("Good")
                    ? "bg-blue-500"
                    : level.includes("Fair")
                      ? "bg-yellow-500"
                      : "bg-red-500"

                return (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 ${color} rounded-full`}></div>
                      <span className="text-sm text-gray-600">{level}</span>
                    </div>
                    <span className="font-medium text-gray-900">{count}</span>
                  </div>
                )
              })}
              {Object.keys(documentsByConfidence).length === 0 && (
                <p className="text-sm text-gray-500">No documents yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Searches */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentSearches.length > 0 ? (
                recentSearches.map((search, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 truncate">{search.query}</span>
                      <span className="text-xs text-gray-500">{search.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{search.results} results</span>
                      <button className="text-xs text-blue-600 hover:text-blue-700">Run Again</button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No searches yet</p>
              )}
            </CardContent>
          </Card>

          {/* Active Sessions */}
          {sessions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions.slice(0, 5).map((session) => (
                  <div key={session.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600 truncate">{session.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{session.messageCount}m</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

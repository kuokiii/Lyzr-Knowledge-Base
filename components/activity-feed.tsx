"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sidebar } from "@/components/sidebar"
import { RefreshCw, History, Clock, Upload, MessageCircle, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ActivityFeedProps {
  recentActivity: any[]
  sessions: any[]
  setSessions: (sessions: any[]) => void
  activeSession: string | null
  setActiveSession: (id: string | null) => void
  activeSidebarItem: string
  addActivityItem: (item: any) => void
  handleSidebarNavigation: (path: string) => void
}

export function ActivityFeed({
  recentActivity,
  sessions,
  setSessions,
  activeSession,
  setActiveSession,
  activeSidebarItem,
  addActivityItem,
  handleSidebarNavigation,
}: ActivityFeedProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Upload":
        return Upload
      case "MessageCircle":
        return MessageCircle
      case "Plus":
        return Plus
      case "Trash2":
        return Trash2
      default:
        return Upload
    }
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
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recent Activity</h1>
              <p className="text-gray-600 mt-2">Track your document uploads, queries, and system usage</p>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {recentActivity.map((item) => {
              const IconComponent = getIcon(item.icon)
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          item.type === "upload"
                            ? "bg-blue-100 text-blue-600"
                            : item.type === "query"
                              ? "bg-green-100 text-green-600"
                              : item.type === "session"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-red-100 text-red-600",
                        )}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {item.timestamp}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {recentActivity.length === 0 && (
            <div className="text-center py-20">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No activity yet</h3>
              <p className="text-gray-600">Start using your knowledge base to see activity here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

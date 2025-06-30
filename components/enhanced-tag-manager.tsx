"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { X, Plus, Tag, Hash } from "lucide-react"

interface TagManagerProps {
  documentId: string
  currentTags: string[]
  availableTags: string[]
  onAddTag: (documentId: string, tag: string) => void
  onRemoveTag: (documentId: string, tag: string) => void
  onCreateTag: (tag: string) => void
}

export function TagManager({
  documentId,
  currentTags,
  availableTags,
  onAddTag,
  onRemoveTag,
  onCreateTag,
}: TagManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newTag, setNewTag] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTags = availableTags.filter(
    (tag) => !currentTags.includes(tag) && tag.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateTag = () => {
    if (newTag.trim() && !availableTags.includes(newTag.trim())) {
      onCreateTag(newTag.trim())
      onAddTag(documentId, newTag.trim())
      setNewTag("")
    }
  }

  const handleAddTag = (tag: string) => {
    onAddTag(documentId, tag)
    setSearchTerm("")
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-1 items-center">
        {currentTags.map((tag) => (
          <Badge
            key={tag}
            variant="outline"
            className="text-xs px-2 py-1 bg-purple-50 text-purple-700 border-purple-200 group hover:bg-purple-100"
          >
            <Hash className="w-3 h-3 mr-1" />
            {tag}
            <Button
              size="sm"
              variant="ghost"
              className="h-4 w-4 p-0 ml-1 opacity-0 group-hover:opacity-100 hover:bg-purple-200"
              onClick={() => onRemoveTag(documentId, tag)}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))}
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {isOpen && (
        <Card className="absolute top-8 left-0 z-10 w-64 shadow-lg border">
          <CardContent className="p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Manage Tags</span>
            </div>

            <div className="space-y-2">
              <Input
                placeholder="Search or create tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-sm"
              />

              {searchTerm && !availableTags.includes(searchTerm) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-start h-8 text-xs bg-transparent"
                  onClick={() => {
                    handleCreateTag()
                    setSearchTerm(searchTerm)
                  }}
                >
                  <Plus className="w-3 h-3 mr-2" />
                  Create "{searchTerm}"
                </Button>
              )}
            </div>

            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredTags.map((tag) => (
                <Button
                  key={tag}
                  size="sm"
                  variant="ghost"
                  className="w-full justify-start h-7 text-xs hover:bg-purple-50"
                  onClick={() => handleAddTag(tag)}
                >
                  <Hash className="w-3 h-3 mr-2" />
                  {tag}
                </Button>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              className="w-full h-7 text-xs bg-transparent"
              onClick={() => setIsOpen(false)}
            >
              Done
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

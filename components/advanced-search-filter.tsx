"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Filter, X, Calendar, TrendingUp, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdvancedSearchFilterProps {
  onSearch: (filters: SearchFilters) => void
  availableTags: string[]
  documents: any[]
}

interface SearchFilters {
  query: string
  tags: string[]
  confidenceRange: [number, number]
  dateRange: string
  fileTypes: string[]
}

export function AdvancedSearchFilter({ onSearch, availableTags, documents }: AdvancedSearchFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    tags: [],
    confidenceRange: [0, 1],
    dateRange: "all",
    fileTypes: [],
  })

  const fileTypes = ["PDF", "DOCX", "TXT", "DOC"]
  const dateRanges = [
    { value: "all", label: "All time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This week" },
    { value: "month", label: "This month" },
    { value: "quarter", label: "This quarter" },
  ]

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const handleFileTypeToggle = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      fileTypes: prev.fileTypes.includes(type) ? prev.fileTypes.filter((t) => t !== type) : [...prev.fileTypes, type],
    }))
  }

  const handleApplyFilters = () => {
    onSearch(filters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    const clearedFilters = {
      query: "",
      tags: [],
      confidenceRange: [0, 1] as [number, number],
      dateRange: "all",
      fileTypes: [],
    }
    setFilters(clearedFilters)
    onSearch(clearedFilters)
  }

  const activeFiltersCount =
    filters.tags.length +
    filters.fileTypes.length +
    (filters.dateRange !== "all" ? 1 : 0) +
    (filters.confidenceRange[0] > 0 || filters.confidenceRange[1] < 1 ? 1 : 0)

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={filters.query}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            className="pl-10 border-gray-200"
            onKeyPress={(e) => e.key === "Enter" && handleApplyFilters()}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={cn("border-gray-200 relative", activeFiltersCount > 0 && "border-blue-500 bg-blue-50")}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-blue-600 text-white text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {isOpen && (
        <Card className="absolute top-12 right-0 z-20 w-96 shadow-lg border">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Advanced Filters</h3>
              <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)} className="h-6 w-6 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Tags Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <Button
                    key={tag}
                    size="sm"
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className={cn(
                      "h-7 text-xs",
                      filters.tags.includes(tag)
                        ? "bg-purple-600 hover:bg-purple-700"
                        : "border-gray-200 hover:bg-purple-50",
                    )}
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* File Types Filter */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">File Types</span>
              <div className="flex flex-wrap gap-2">
                {fileTypes.map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={filters.fileTypes.includes(type) ? "default" : "outline"}
                    className="h-7 text-xs"
                    onClick={() => handleFileTypeToggle(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Date Range</span>
              </div>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                {dateRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Confidence Range Filter */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Confidence Range</span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.confidenceRange[0] * 100}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      confidenceRange: [Number(e.target.value) / 100, prev.confidenceRange[1]],
                    }))
                  }
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{Math.round(filters.confidenceRange[0] * 100)}%</span>
                  <span>{Math.round(filters.confidenceRange[1] * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <Button size="sm" onClick={handleApplyFilters} className="flex-1 bg-black hover:bg-gray-800 text-white">
                Apply Filters
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleClearFilters}
                className="border-gray-200 bg-transparent"
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

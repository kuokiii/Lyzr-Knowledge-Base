"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ConfidenceIndicatorProps {
  confidence: number
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

export function ConfidenceIndicator({ confidence, size = "md", showTooltip = true }: ConfidenceIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false)

  const getConfidenceData = (score: number) => {
    if (score >= 0.9) {
      return {
        label: "Excellent",
        color: "text-green-700 bg-green-100 border-green-200",
        icon: CheckCircle,
        description: "High-quality text extraction with excellent accuracy. Responses will be highly reliable.",
        barColor: "bg-green-500",
      }
    }
    if (score >= 0.8) {
      return {
        label: "Good",
        color: "text-blue-700 bg-blue-100 border-blue-200",
        icon: TrendingUp,
        description: "Good text extraction quality. Responses should be accurate with minor potential variations.",
        barColor: "bg-blue-500",
      }
    }
    if (score >= 0.7) {
      return {
        label: "Fair",
        color: "text-yellow-700 bg-yellow-100 border-yellow-200",
        icon: AlertTriangle,
        description: "Moderate text extraction quality. Some formatting issues may affect response accuracy.",
        barColor: "bg-yellow-500",
      }
    }
    return {
      label: "Needs Review",
      color: "text-red-700 bg-red-100 border-red-200",
      icon: XCircle,
      description: "Low confidence in text extraction. Document may have formatting issues or unclear text.",
      barColor: "bg-red-500",
    }
  }

  const confidenceData = getConfidenceData(confidence)
  const percentage = Math.round(confidence * 100)

  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-2",
  }

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => showTooltip && setShowDetails(!showDetails)}
      >
        <div className="flex items-center gap-2">
          <confidenceData.icon className="w-4 h-4 text-gray-500" />
          <Badge className={cn("font-medium border", confidenceData.color, sizeClasses[size])}>{percentage}%</Badge>
        </div>
        {showTooltip && <Info className="w-3 h-3 text-gray-400 hover:text-gray-600" />}
      </div>

      {showDetails && showTooltip && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-96 shadow-xl border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <confidenceData.icon className={cn("w-6 h-6", confidenceData.color.split(" ")[0])} />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {percentage}% - {confidenceData.label}
                    </div>
                    <div className="text-sm text-gray-500">Document Processing Confidence</div>
                  </div>
                </div>
                <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={cn("h-3 rounded-full transition-all duration-500", confidenceData.barColor)}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-sm text-gray-600 leading-relaxed">{confidenceData.description}</p>

              <div className="text-xs text-gray-500 space-y-2">
                <div className="font-medium">Confidence Scale:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>90%+ Excellent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>80-89% Good</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>70-79% Fair</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>&lt;70% Review</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

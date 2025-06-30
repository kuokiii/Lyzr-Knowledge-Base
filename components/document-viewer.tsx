"use client"

import { useState } from "react"

interface DocumentViewerProps {
  document: any // Replace 'any' with the actual document type
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100)

  if (!document) return null

  return (
    <div>
      <h2>Document Viewer</h2>
      <button onClick={onClose}>Close</button>
      <div>
        Zoom: {zoom}%<button onClick={() => setZoom(Math.max(10, zoom - 10))}>-</button>
        <button onClick={() => setZoom(Math.min(200, zoom + 10))}>+</button>
      </div>
      {/* Placeholder for document rendering */}
      <div style={{ width: "100%", height: "500px", border: "1px solid black" }}>
        Document Content (Placeholder - Implement rendering logic here)
      </div>
    </div>
  )
}

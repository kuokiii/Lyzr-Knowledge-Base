"use client"

import { useState, useEffect } from "react"

interface SearchDialogProps {
  showSearch: boolean
  setShowSearch: (show: boolean) => void
  documents: any[]
}

export function SearchDialog({ showSearch, setShowSearch, documents }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (query) {
      setIsSearching(true)
      // Simulate an API call or search operation
      setTimeout(() => {
        const filteredResults = documents.filter(
          (doc) =>
            doc.title.toLowerCase().includes(query.toLowerCase()) ||
            doc.content.toLowerCase().includes(query.toLowerCase()),
        )
        setResults(filteredResults)
        setIsSearching(false)
      }, 500)
    } else {
      setResults([])
    }
  }, [query, documents])

  const handleClose = () => {
    setShowSearch(false)
    setQuery("")
    setResults([])
  }

  if (!showSearch) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 pt-20">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Search</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            placeholder="Type to search..."
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {isSearching && <div className="p-4 text-center">Searching...</div>}
        {results.length > 0 && (
          <div className="p-4">
            <ul>
              {results.map((result: any) => (
                <li key={result.id} className="mb-2 p-2 border-b last:border-b-0">
                  <h3 className="font-semibold">{result.title}</h3>
                  <p className="text-gray-600">{result.content.substring(0, 100)}...</p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {query && results.length === 0 && !isSearching && <div className="p-4 text-center">No results found.</div>}
      </div>
    </div>
  )
}

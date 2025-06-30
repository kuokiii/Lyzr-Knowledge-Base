"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ArrowLeft, BookOpen, Upload, MessageCircle, Settings, Code, Zap } from "lucide-react"
import Image from "next/image"

interface DocsPageProps {
  setCurrentView: (view: string) => void
}

export function DocsPage({ setCurrentView }: DocsPageProps) {
  const sections = [
    { id: "getting-started", title: "Getting Started", icon: Zap },
    { id: "uploading", title: "Uploading Documents", icon: Upload },
    { id: "querying", title: "Asking Questions", icon: MessageCircle },
    { id: "settings", title: "Settings & Configuration", icon: Settings },
    { id: "api", title: "API Reference", icon: Code },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView("landing")}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <Image src="/lyzr-logo.png" alt="Lyzr" width={32} height={32} className="rounded-lg" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Documentation</h1>
              <p className="text-xs text-gray-600">Complete guide</p>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-2">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <section.icon className="w-4 h-4" />
                {section.title}
              </a>
            ))}
          </nav>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Lyzr Knowledge Base Documentation</h1>
            <p className="text-xl text-gray-600">Learn how to get the most out of your AI-powered knowledge base</p>
          </div>

          <div className="space-y-12">
            {/* Getting Started */}
            <section id="getting-started">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600">
                    Welcome to Lyzr Knowledge Base! This guide will help you get started with uploading documents and
                    asking questions.
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2">Quick Start</h4>
                    <ol className="list-decimal list-inside space-y-2 text-blue-800">
                      <li>Upload your first document (PDF, DOCX, or TXT)</li>
                      <li>Wait for processing to complete</li>
                      <li>Ask questions about your document</li>
                      <li>Get instant, cited answers</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Uploading Documents */}
            <section id="uploading">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    Uploading Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Supported File Types</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>PDF files (.pdf)</li>
                    <li>Microsoft Word documents (.docx, .doc)</li>
                    <li>Plain text files (.txt)</li>
                  </ul>

                  <h4 className="font-semibold text-gray-900">File Size Limits</h4>
                  <p className="text-gray-600">Maximum file size: 10MB per document</p>

                  <h4 className="font-semibold text-gray-900">Upload Process</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Click the "Upload" button or drag and drop files</li>
                    <li>Files are processed using Groq AI for text extraction</li>
                    <li>Extracted text is sent to Lyzr Knowledge Base Assistant</li>
                    <li>Documents become available for querying</li>
                  </ol>
                </CardContent>
              </Card>
            </section>

            {/* Asking Questions */}
            <section id="querying">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Asking Questions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Natural Language Queries</h4>
                  <p className="text-gray-600">Ask questions in plain English. No special syntax required.</p>

                  <h4 className="font-semibold text-gray-900">Example Questions</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-2 text-gray-700">
                      <li>• "What is the company's remote work policy?"</li>
                      <li>• "How do I submit a vacation request?"</li>
                      <li>• "What are the quarterly sales figures?"</li>
                      <li>• "Summarize the main points of this document"</li>
                    </ul>
                  </div>

                  <h4 className="font-semibold text-gray-900">Response Format</h4>
                  <p className="text-gray-600">Each response includes:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    <li>Detailed answer based on your documents</li>
                    <li>Source citations with document references</li>
                    <li>Confidence score (0-100%)</li>
                    <li>Relevant excerpts from source documents</li>
                  </ul>
                </CardContent>
              </Card>
            </section>

            {/* Settings */}
            <section id="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Settings & Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Profile Settings</h4>
                  <p className="text-gray-600">
                    Update your name, email, and other profile information in the Settings panel.
                  </p>

                  <h4 className="font-semibold text-gray-900">Session Management</h4>
                  <p className="text-gray-600">
                    Create multiple sessions to organize different topics or projects. Each session maintains its own
                    conversation history and document collection.
                  </p>

                  <h4 className="font-semibold text-gray-900">Document Management</h4>
                  <p className="text-gray-600">
                    View, download, or delete documents from the Document Library. Deleted documents will no longer be
                    available for queries.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* API Reference */}
            <section id="api">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    API Reference
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Lyzr Agent Configuration</h4>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
                      {`{
  "agent_id": "685c014868ff00bd2c532174",
  "session_id": "685c014868ff00bd2c532174-kyhj3roq0x",
  "model": "Perplexity",
  "capabilities": [
    "document_processing",
    "information_retrieval",
    "answer_generation",
    "citation_management",
    "confidence_evaluation"
  ]
}`}
                    </pre>
                  </div>

                  <h4 className="font-semibold text-gray-900">Workflow</h4>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <ol className="list-decimal list-inside space-y-2 text-blue-800">
                      <li>File Upload → Groq Text Extraction</li>
                      <li>Extracted Text → Lyzr Knowledge Base Assistant</li>
                      <li>User Query → Agent Processing</li>
                      <li>Structured Response with Citations</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to get started?</h3>
              <p className="text-gray-600 mb-4">Start building your knowledge base today</p>
              <Button onClick={() => setCurrentView("landing")} className="bg-black hover:bg-gray-800 text-white">
                <BookOpen className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

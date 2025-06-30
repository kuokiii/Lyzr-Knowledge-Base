"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import {
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Users,
  TrendingUp,
  BookOpen,
  Brain,
  Target,
  Menu,
  X,
  Globe,
  Lock,
  Cpu,
  Activity,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { useState } from "react"

const features = [
  {
    icon: Brain,
    title: "AI-Powered Intelligence",
    description: "Advanced natural language processing to understand and answer complex questions from your documents",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Source Grounding",
    description: "Every answer includes precise citations and references to ensure complete accuracy and transparency",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Lightning Performance",
    description: "Process thousands of documents instantly and get answers in milliseconds, not minutes",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Target,
    title: "High Confidence Scoring",
    description: "Advanced confidence algorithms ensure you receive only the most reliable and trustworthy information",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Bank-grade encryption and security protocols to keep your sensitive documents completely protected",
    color: "from-red-500 to-pink-500",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description: "Process documents and answer questions in over 50 languages with native-level understanding",
    color: "from-indigo-500 to-purple-500",
  },
]

const stats = [
  { icon: Users, label: "Enterprise Users", value: "50,000+", change: "+23%", color: "text-blue-600" },
  { icon: MessageCircle, label: "Documents Processed", value: "2.5M+", change: "+45%", color: "text-green-600" },
  { icon: MessageCircle, label: "Questions Answered", value: "10M+", change: "+67%", color: "text-purple-600" },
  { icon: TrendingUp, label: "Accuracy Rate", value: "98.7%", change: "+3.2%", color: "text-orange-600" },
]

interface LandingPageProps {
  setCurrentView: (view: string) => void
  setActiveSidebarItem: (item: string) => void
}

export function LandingPage({ setCurrentView, setActiveSidebarItem }: LandingPageProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleGetStarted = () => {
    setCurrentView("chat")
    setActiveSidebarItem("sessions")
  }

  const handleAuthRedirect = () => {
    setCurrentView("auth")
  }

  const handleDocsRedirect = () => {
    setCurrentView("docs")
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                setCurrentView("landing")
                setActiveSidebarItem("")
              }}
            >
              <div className="relative group">
                <Image
                  src="/lyzr-logo.png"
                  alt="Lyzr"
                  width={40}
                  height={40}
                  className="rounded-xl transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors">
                  Lyzr Knowledge Base
                </h1>
                <p className="text-sm text-gray-600 hidden sm:block">AI-Powered Document Intelligence</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <nav className="flex items-center gap-6">
                <a href="#features" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Features
                </a>
                <a href="#use-cases" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Use Cases
                </a>
                <a href="#integrations" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Integrations
                </a>
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50 bg-transparent"
                  onClick={handleDocsRedirect}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
              </nav>
              <div className="flex items-center gap-3">
                <Button className="bg-black hover:bg-gray-800 text-white" onClick={handleGetStarted}>
                  Get Started Free
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4">
              <nav className="flex flex-col gap-4">
                <a href="#features" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Features
                </a>
                <a href="#use-cases" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Use Cases
                </a>
                <a href="#integrations" className="text-gray-600 hover:text-black transition-colors font-medium">
                  Integrations
                </a>
                <Separator className="my-2" />
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 justify-start bg-transparent"
                    onClick={handleDocsRedirect}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Documentation
                  </Button>
                  <Button className="bg-black hover:bg-gray-800 text-white justify-start" onClick={handleGetStarted}>
                    Get Started Free
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <Badge className="mb-8 bg-black text-white hover:bg-gray-800 px-4 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by Lyzr AI Agents
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Knowledge Base
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Powered by AI Intelligence
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Transform your documents into intelligent conversations. Get instant, accurate answers with complete
              source transparency.
              <span className="font-semibold">Agnostic of any LLMs</span> - works with your preferred AI models.
            </p>
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg group transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-black/25"
              >
                <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-gray-900 text-white">
              <Cpu className="w-4 h-4 mr-2" />
              Advanced Features
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Choose Lyzr Knowledge Base?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Built with cutting-edge AI technology to deliver unparalleled document intelligence and user experience
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-0 shadow-lg bg-white overflow-hidden"
              >
                <CardContent className="p-8 text-center relative">
                  <div className="relative mb-6">
                    <div
                      className={cn(
                        "w-20 h-20 rounded-2xl flex items-center justify-center mx-auto bg-gradient-to-r",
                        feature.color,
                        "group-hover:scale-110 transition-transform duration-300",
                      )}
                    >
                      <feature.icon className="w-10 h-10 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-white text-black">
              <Activity className="w-4 h-4 mr-2" />
              Trusted Worldwide
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">Powering Knowledge Across Industries</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Join thousands of organizations already transforming their document workflows with Lyzr Knowledge Base
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center group hover:scale-110 transition-all duration-300 p-6 rounded-2xl hover:bg-white/10"
              >
                <div className="bg-white/20 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-white/30 transition-colors">
                  <stat.icon className={cn("w-10 h-10", stat.color)} />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-300 mb-2 font-medium">{stat.label}</div>
                <div className="text-green-400 text-sm font-bold">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section id="use-cases" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-black text-white">
              <Target className="w-4 h-4 mr-2" />
              Use Cases
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Perfect for Every Industry
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From legal research to customer support, our knowledge base adapts to your specific needs
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                title: "Legal & Compliance",
                description:
                  "Instantly search through contracts, regulations, and legal documents with precise citations and confidence scoring.",
                icon: Shield,
                color: "from-blue-500 to-cyan-500",
                examples: ["Contract analysis", "Regulatory compliance", "Legal research"],
              },
              {
                title: "Customer Support",
                description:
                  "Empower your support team with instant access to product documentation, FAQs, and troubleshooting guides.",
                icon: Users,
                color: "from-green-500 to-emerald-500",
                examples: ["Product documentation", "FAQ automation", "Troubleshooting guides"],
              },
              {
                title: "Research & Development",
                description:
                  "Accelerate research by quickly finding relevant information across technical papers, reports, and documentation.",
                icon: Brain,
                color: "from-purple-500 to-pink-500",
                examples: ["Technical research", "Patent analysis", "Literature review"],
              },
            ].map((useCase, index) => (
              <div key={index} className="text-center group relative">
                <div className="relative z-10">
                  <div className="relative mb-8">
                    <div
                      className={cn(
                        "w-24 h-24 rounded-3xl flex items-center justify-center mx-auto bg-gradient-to-r",
                        useCase.color,
                        "group-hover:scale-110 transition-all duration-300 shadow-2xl",
                      )}
                    >
                      <useCase.icon className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg mb-6">{useCase.description}</p>
                  <div className="space-y-2">
                    {useCase.examples.map((example, idx) => (
                      <div key={idx} className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                        {example}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-black text-white">
              <Cpu className="w-4 h-4 mr-2" />
              Integrations
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Works with Leading AI Models
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Seamlessly integrate with popular AI models. <span className="font-semibold">LLM agnostic</span>{" "}
              architecture supports any language model.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "OpenAI GPT", category: "AI Models", logo: "🤖" },
              { name: "Anthropic Claude", category: "AI Models", logo: "🧠" },
              { name: "Google Gemini", category: "AI Models", logo: "✨" },
              { name: "Groq", category: "AI Models", logo: "⚡" },
            ].map((integration, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-4">{integration.logo}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{integration.name}</h3>
                  <p className="text-sm text-gray-600">{integration.category}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-black via-gray-900 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-8 leading-tight">
            Ready to Transform Your
            <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Knowledge Management?
            </span>
          </h2>
          <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join thousands of organizations using our AI-powered knowledge base.{" "}
            <span className="font-semibold">LLM agnostic</span> and ready to integrate with your existing workflow.
          </p>
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-black hover:bg-gray-100 px-10 py-5 text-xl group shadow-2xl hover:shadow-white/25 transition-all duration-300"
            >
              <Sparkles className="w-6 h-6 mr-3 group-hover:animate-spin" />
              Get Started Free
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-4 gap-12">
            <div className="lg:col-span-2">
              <div
                className="flex items-center gap-3 mb-6 cursor-pointer"
                onClick={() => {
                  setCurrentView("landing")
                  setActiveSidebarItem("")
                }}
              >
                <Image src="/lyzr-logo.png" alt="Lyzr" width={40} height={40} className="rounded-xl" />
                <div>
                  <div className="text-xl font-bold text-gray-900 hover:text-purple-600 transition-colors">
                    Lyzr Knowledge Base
                  </div>
                  <div className="text-sm text-gray-600">AI-Powered Document Intelligence</div>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed mb-6 max-w-md">
                Transform your documents into intelligent conversations with advanced AI technology. Secure, accurate,
                and lightning-fast knowledge management for modern teams.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <div className="space-y-3 text-gray-600">
                <div
                  className="hover:text-black cursor-pointer transition-colors"
                  onClick={() => (window.location.href = "#features")}
                >
                  Features
                </div>
                <div
                  className="hover:text-black cursor-pointer transition-colors"
                  onClick={() => (window.location.href = "#use-cases")}
                >
                  Use Cases
                </div>
                <div
                  className="hover:text-black cursor-pointer transition-colors"
                  onClick={() => (window.location.href = "#integrations")}
                >
                  Integrations
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <div className="space-y-3 text-gray-600">
                <div className="hover:text-black cursor-pointer transition-colors" onClick={handleDocsRedirect}>
                  Documentation
                </div>
                <div className="hover:text-black cursor-pointer transition-colors" onClick={handleGetStarted}>
                  Get Started
                </div>
              </div>
            </div>
          </div>
          <Separator className="my-12" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">© 2024 Lyzr. All rights reserved.</div>
            <div className="text-sm text-gray-600">Made with ❤️ for intelligent knowledge management</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

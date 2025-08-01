"use client"

import { useState } from "react"
import {
    Search,
    Pin,
    Keyboard,
    Filter,
    Edit3,
    BookOpen,
    Code,
    Users,
    Lightbulb,
    Star,
    ArrowRight,
    Menu,
    X,
    Check,
    Zap,
    Smartphone,
    Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export function LandingPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-bold text-gray-900">NotesHub</span>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Features
                            </a>
                            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Testimonials
                            </a>
                            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                                Pricing
                            </a>
                            <Button variant="outline">Log In</Button>
                            <Button>Get Started</Button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    {isMenuOpen && (
                        <div className="md:hidden py-4 border-t">
                            <div className="flex flex-col space-y-4">
                                <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Features
                                </a>
                                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Testimonials
                                </a>
                                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                                    Pricing
                                </a>
                                <div className="flex flex-col space-y-2 pt-4 border-t">
                                    <Button variant="outline" className="w-full bg-transparent">
                                        Log In
                                    </Button>
                                    <Button className="w-full">Get Started</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">✨ Perfect for Interview Prep</Badge>
                            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Your Ultimate
                                <span className="text-blue-600"> Notes Dashboard</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Organize, search, and access your interview preparation notes with lightning speed. Built for
                                developers, by developers.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Button size="lg" className="text-lg px-8 py-3">
                                    Start Taking Notes
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                                    View Demo
                                </Button>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Free to start
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    No credit card required
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-green-500" />
                                    Works offline
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Preview */}
                        <div className="relative">
                            <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b flex items-center gap-2">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 text-center text-sm text-gray-600">NotesHub Dashboard</div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                            <Input placeholder="Search notes... (⌘K)" className="pl-10" />
                                        </div>
                                        <Button size="sm">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        <Card className="border-l-4 border-l-blue-500">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-sm">React Hooks Rules</CardTitle>
                                                    <Pin className="h-4 w-4 text-orange-500" />
                                                </div>
                                                <Badge className="w-fit text-xs bg-blue-100 text-blue-800">Technical</Badge>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <p className="text-xs text-gray-600">1. Only call hooks at the top level...</p>
                                            </CardContent>
                                        </Card>
                                        <Card className="border-l-4 border-l-green-500">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm">STAR Method</CardTitle>
                                                <Badge className="w-fit text-xs bg-green-100 text-green-800">Behavioral</Badge>
                                            </CardHeader>
                                            <CardContent className="pt-0">
                                                <p className="text-xs text-gray-600">Situation: Set the context...</p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                            {/* Floating elements */}
                            <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-lg shadow-lg">
                                <Keyboard className="h-6 w-6" />
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-green-600 text-white p-3 rounded-lg shadow-lg">
                                <Zap className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                            Everything you need to ace your interviews
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Powerful features designed to help you organize, find, and review your notes efficiently
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                    <Search className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle>Lightning Fast Search</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Find any note instantly with our powerful search. Search by title, content, or category with keyboard
                                    shortcuts.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                                    <Filter className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle>Smart Categories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Organize notes by Technical, Behavioral, Concepts, and Tips. Quick category switching with ⌘C
                                    shortcut.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                                    <Pin className="h-6 w-6 text-orange-600" />
                                </div>
                                <CardTitle>Pin Important Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Keep your most important notes at the top. Pin and unpin with a single click for quick access.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                                    <Keyboard className="h-6 w-6 text-purple-600" />
                                </div>
                                <CardTitle>Keyboard Shortcuts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Work at the speed of thought with shortcuts: ⌘K for search, ⌘N for new note, ⌘C for categories.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                                    <Edit3 className="h-6 w-6 text-red-600" />
                                </div>
                                <CardTitle>Quick Edit & Delete</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Edit notes inline or delete with confirmation. Hover actions make management effortless.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                                    <Smartphone className="h-6 w-6 text-indigo-600" />
                                </div>
                                <CardTitle>Mobile Responsive</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600">
                                    Access your notes anywhere. Fully responsive design works perfectly on desktop, tablet, and mobile.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Category Showcase */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Organized by Interview Categories</h2>
                        <p className="text-xl text-gray-600">
                            Pre-built categories to help you structure your interview preparation
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="text-center border-2 hover:border-blue-200 transition-colors">
                            <CardHeader>
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Code className="h-8 w-8 text-blue-600" />
                                </div>
                                <CardTitle className="text-blue-600">Technical</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">Algorithms, data structures, system design, and coding concepts</p>
                            </CardContent>
                        </Card>

                        <Card className="text-center border-2 hover:border-green-200 transition-colors">
                            <CardHeader>
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="h-8 w-8 text-green-600" />
                                </div>
                                <CardTitle className="text-green-600">Behavioral</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">STAR method examples, leadership stories, and soft skills</p>
                            </CardContent>
                        </Card>

                        <Card className="text-center border-2 hover:border-purple-200 transition-colors">
                            <CardHeader>
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="h-8 w-8 text-purple-600" />
                                </div>
                                <CardTitle className="text-purple-600">Concepts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">Core computer science concepts and theoretical knowledge</p>
                            </CardContent>
                        </Card>

                        <Card className="text-center border-2 hover:border-yellow-200 transition-colors">
                            <CardHeader>
                                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Lightbulb className="h-8 w-8 text-yellow-600" />
                                </div>
                                <CardTitle className="text-yellow-600">Tips & Tricks</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm">Interview strategies, questions to ask, and preparation tips</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Loved by developers worldwide</h2>
                        <p className="text-xl text-gray-600">See what our users say about their interview success</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="border-0 shadow-lg">
                            <CardContent className="pt-6">
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6">
                                    "NotesHub completely transformed my interview prep. The keyboard shortcuts saved me hours, and I
                                    landed my dream job at Google!"
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        SA
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-900">Sarah Anderson</p>
                                        <p className="text-sm text-gray-600">Software Engineer at Google</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg">
                            <CardContent className="pt-6">
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6">
                                    "The category system is brilliant. I could quickly review behavioral questions before interviews. Got
                                    offers from 3 FAANG companies!"
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        MC
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-900">Michael Chen</p>
                                        <p className="text-sm text-gray-600">Senior Developer at Meta</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg">
                            <CardContent className="pt-6">
                                <div className="flex mb-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6">
                                    "As a bootcamp grad, I needed to organize tons of notes. NotesHub's search feature helped me find
                                    exactly what I needed during prep."
                                </p>
                                <div className="flex items-center">
                                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        EJ
                                    </div>
                                    <div className="ml-4">
                                        <p className="font-semibold text-gray-900">Emily Johnson</p>
                                        <p className="text-sm text-gray-600">Full Stack Developer at Netflix</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Ready to ace your next interview?</h2>
                    <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                        Join thousands of developers who've landed their dream jobs with NotesHub
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                            Start Free Today
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3 bg-transparent"
                        >
                            View Live Demo
                        </Button>
                    </div>
                    <p className="text-blue-100 text-sm mt-4">No credit card required • Free forever plan available</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <BookOpen className="h-8 w-8 text-blue-400" />
                                <span className="ml-2 text-xl font-bold">NotesHub</span>
                            </div>
                            <p className="text-gray-400">The ultimate notes dashboard for interview preparation and beyond.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Product</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Demo
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Support</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Contact
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Status
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-4">Company</h3>
                            <ul className="space-y-2 text-gray-400">
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Blog
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition-colors">
                                        Privacy
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2024 NotesHub. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

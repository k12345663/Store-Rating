"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Store, Users, Star, Shield } from "lucide-react"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      // Redirect based on user role
      switch (session.user.role) {
        case "SYSTEM_ADMIN":
          router.push("/admin")
          break
        case "STORE_OWNER":
          router.push("/store-owner")
          break
        case "NORMAL_USER":
          router.push("/user")
          break
      }
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Store Rating System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive platform for store owners and customers to connect through ratings and reviews
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => router.push("/auth/signin")}
              className="text-lg px-8 py-3"
            >
              Sign In
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => router.push("/auth/signup")}
              className="text-lg px-8 py-3"
            >
              Sign Up
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Store className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>For Store Owners</CardTitle>
              <CardDescription>
                Manage your store profile and view customer ratings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Track your store's performance, view detailed customer feedback, and monitor average ratings.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>For Customers</CardTitle>
              <CardDescription>
                Rate stores and share your experiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Discover stores, read reviews, and share your own experiences with the community.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>For Administrators</CardTitle>
              <CardDescription>
                Manage users and stores efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Oversee the entire platform, manage users, stores, and monitor system statistics.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Sign Up</h3>
              <p className="text-sm text-gray-600">Create your account in seconds</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Explore</h3>
              <p className="text-sm text-gray-600">Browse stores and read reviews</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Rate</h3>
              <p className="text-sm text-gray-600">Share your experience with ratings</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Track</h3>
              <p className="text-sm text-gray-600">Monitor ratings and feedback</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
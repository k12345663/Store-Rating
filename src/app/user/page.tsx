"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Star, Search, LogOut, Settings } from "lucide-react"

interface Store {
  id: string
  name: string
  email: string
  address: string
  averageRating?: number
  userRating?: number
}

export default function UserDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "NORMAL_USER") {
      router.push("/")
      return
    }

    fetchStores()
  }, [session, status, router])

  const fetchStores = async () => {
    try {
      const response = await fetch("/api/user/stores")
      if (response.ok) {
        const storesData = await response.json()
        setStores(storesData)
      } else {
        setError("Failed to fetch stores")
      }
    } catch (error) {
      setError("Failed to fetch stores")
    } finally {
      setLoading(false)
    }
  }

  const handleRateStore = (store: Store) => {
    setSelectedStore(store)
    setRating(store.userRating || 0)
    setComment("")
    setShowRatingDialog(true)
  }

  const handleSubmitRating = async () => {
    if (!selectedStore || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5")
      return
    }

    try {
      const response = await fetch(`/api/user/stores/${selectedStore.id}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment })
      })

      if (response.ok) {
        setShowRatingDialog(false)
        setSelectedStore(null)
        setRating(0)
        setComment("")
        fetchStores()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to submit rating")
      }
    } catch (error) {
      setError("Failed to submit rating")
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match")
      return
    }

    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      if (response.ok) {
        setShowPasswordDialog(false)
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setError("")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to change password")
      }
    } catch (error) {
      setError("Failed to change password")
    }
  }

  const handleSignOut = () => {
    router.push("/api/auth/signout")
  }

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderStars = (rating: number, maxStars: number = 5) => {
    return (
      <div className="flex items-center">
        {[...Array(maxStars)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {rating > 0 ? rating.toFixed(1) : "No rating"}
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Store Directory</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {session?.user.name}</span>
              <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Change Password
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search stores by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stores Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <Card key={store.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{store.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  {store.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Rating</span>
                      {renderStars(store.averageRating || 0)}
                    </div>
                    {store.userRating && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Your Rating</span>
                        <Badge variant="secondary">
                          {store.userRating} star{store.userRating !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={() => handleRateStore(store)}
                    className="w-full"
                    variant={store.userRating ? "outline" : "default"}
                  >
                    {store.userRating ? "Update Rating" : "Rate Store"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No stores found matching your search.</p>
          </div>
        )}
      </main>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {selectedStore?.name}</DialogTitle>
            <DialogDescription>
              Share your experience with this store
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Rating</Label>
              <div className="flex items-center space-x-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="comment">Comment (Optional)</Label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Share your thoughts about this store..."
              />
            </div>
            <Button onClick={handleSubmitRating} className="w-full">
              Submit Rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your account password
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                placeholder="Confirm new password"
              />
            </div>
            <Button onClick={handleChangePassword} className="w-full">
              Change Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
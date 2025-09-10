import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.NORMAL_USER) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const stores = await db.store.findMany({
      include: {
        ratings: {
          select: {
            rating: true,
            userId: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    const storesWithRatings = stores.map(store => {
      const allRatings = store.ratings.map(r => r.rating)
      const averageRating = allRatings.length > 0 
        ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length 
        : null

      const userRating = store.ratings.find(r => r.userId === session.user.id)?.rating || null

      return {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating,
        userRating
      }
    })

    return NextResponse.json(storesWithRatings)
  } catch (error) {
    console.error("User stores API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
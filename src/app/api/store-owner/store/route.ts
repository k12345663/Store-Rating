import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.STORE_OWNER) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const store = await db.store.findFirst({
      where: {
        ownerId: session.user.id
      },
      include: {
        ratings: {
          select: {
            rating: true
          }
        }
      }
    })

    if (!store) {
      return NextResponse.json(null)
    }

    const ratings = store.ratings.map(r => r.rating)
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0

    const storeData = {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      averageRating,
      totalRatings: ratings.length
    }

    return NextResponse.json(storeData)
  } catch (error) {
    console.error("Store owner store API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
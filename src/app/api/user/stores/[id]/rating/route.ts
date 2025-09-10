import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== UserRole.NORMAL_USER) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { rating, comment } = await request.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      )
    }

    const storeId = params.id

    // Check if store exists
    const store = await db.store.findUnique({
      where: { id: storeId }
    })

    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      )
    }

    // Check if user already rated this store
    const existingRating = await db.rating.findUnique({
      where: {
        userId_storeId: {
          userId: session.user.id,
          storeId: storeId
        }
      }
    })

    if (existingRating) {
      // Update existing rating
      const updatedRating = await db.rating.update({
        where: {
          id: existingRating.id
        },
        data: {
          rating,
          comment: comment || null
        }
      })

      return NextResponse.json(updatedRating)
    } else {
      // Create new rating
      const newRating = await db.rating.create({
        data: {
          rating,
          comment: comment || null,
          userId: session.user.id,
          storeId: storeId
        }
      })

      return NextResponse.json(newRating, { status: 201 })
    }
  } catch (error) {
    console.error("Rating API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // For now, we'll just accept image URLs instead of file uploads
    const { imageUrl } = await req.json()

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 })
    }

    // Validate that it's an image URL (basic check)
    try {
      const url = new URL(imageUrl)
      if (!url.protocol.startsWith("http")) {
        return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    return NextResponse.json({ url: imageUrl })
  } catch (error) {
    console.error("Error processing image URL:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

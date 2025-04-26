import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import prisma from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const post = await prisma.post.findUnique({
      where: {
        id: params.id,
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 })
    }

    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        postId: params.id,
        authorId: session.user.id,
      },
    })

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id,
        },
      })

      return NextResponse.json({ bookmarked: false })
    }

    await prisma.bookmark.create({
      data: {
        postId: params.id,
        authorId: session.user.id,
      },
    })

    return NextResponse.json({ bookmarked: true })
  } catch (error) {
    console.error("Error bookmarking post:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

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

    const existingLike = await prisma.like.findFirst({
      where: {
        postId: params.id,
        authorId: session.user.id,
      },
    })

    if (existingLike) {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      })

      return NextResponse.json({ liked: false })
    }

    await prisma.like.create({
      data: {
        postId: params.id,
        authorId: session.user.id,
      },
    })

    return NextResponse.json({ liked: true })
  } catch (error) {
    console.error("Error liking post:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

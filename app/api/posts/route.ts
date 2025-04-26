import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import { generateSlug } from "@/lib/utils"

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
        likes: true,
        comments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(
      posts.map((post) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        readingTime: post.readingTime,
        likes: post.likes.length,
        comments: post.comments.length,
        coverImage: post.coverImage,
        author: {
          name: post.author.name,
          avatar: post.author.avatar,
        },
        tags: post.tags,
      }))
    )
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const { title, content, coverImage, tags, authorId } = await req.json()

    const post = await prisma.post.create({
      data: {
        title,
        content,
        coverImage,
        tags,
        authorId,
        slug: generateSlug(title),
        readingTime: Math.ceil(content.split(/\s+/).length / 200), // 200 words per minute
      },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
        likes: true,
        comments: true,
      },
    })

    return NextResponse.json({
      id: post.id,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      readingTime: post.readingTime,
      likes: post.likes.length,
      comments: post.comments.length,
      coverImage: post.coverImage,
      author: {
        name: post.author.name,
        avatar: post.author.avatar,
      },
      tags: post.tags,
    })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}

import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export const metadata = {
  title: "Your Bookmarks",
  description: "View all your bookmarked posts",
}

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/bookmarks")
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: {
      authorId: session.user.id,
    },
    include: {
      post: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Bookmarks</h1>

      {bookmarks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">You haven't bookmarked any posts yet.</div>
      ) : (
        <div className="space-y-8">
          {bookmarks.map(({ post }) => (
            <article key={post.id} className="border-b pb-8">
              <div className="flex items-center gap-2 mb-4">
                <Link href={`/profile/${post.author.id}`}>
                  <div className="flex items-center gap-2">
                    <div className="relative h-8 w-8 rounded-full overflow-hidden">
                      {post.author.avatar ? (
                        <Image
                          src={post.author.avatar || "/placeholder.svg"}
                          alt={post.author.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                          {post.author.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="font-medium">{post.author.name}</span>
                  </div>
                </Link>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>

              <Link href={`/posts/${post.slug}`}>
                <h2 className="text-2xl font-bold mb-2 hover:text-gray-700 transition-colors">{post.title}</h2>
              </Link>

              <div className="mb-4">
                {post.coverImage && (
                  <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
                    <Image src={post.coverImage || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
                  </div>
                )}
                <p className="text-gray-700 line-clamp-3">
                  {post.content.replace(/<[^>]*>/g, "").substring(0, 200)}...
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{post._count.likes} likes</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{post._count.comments} comments</span>
                </div>

                <div className="flex items-center gap-2">
                  {post.readingTime && <span className="text-sm text-gray-500">{post.readingTime} min read</span>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/?tag=${tag}`}
                    className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

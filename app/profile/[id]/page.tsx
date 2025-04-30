"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PenSquare, Bookmark, Calendar } from "lucide-react"
import prisma from "@/lib/db"

interface ProfilePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const user = await prisma.user.findUnique({
    where: {
      id: params.id,
    },
  })

  if (!user) {
    return {
      title: "User not found",
    }
  }

  return {
    title: `${user.name}'s Profile`,
    description: user.bio || `Check out ${user.name}'s posts`,
  }
}

interface User {
  id: string
  name: string
  email: string
  avatar: string | null
  bio: string | null
  createdAt: string
  _count: {
    posts: number
    followers: number
    following: number
  }
}

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  readingTime: number | null
  likes: number
  comments: number
  slug: string
  coverImage: string | null
  tags: string[]
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function Profile() {
  const params = useParams()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userResponse, postsResponse] = await Promise.all([
          fetch(`/api/users/${params.id}`),
          fetch(`/api/users/${params.id}/posts`)
        ])

        const userData = await userResponse.json()
        const postsData = await postsResponse.json()

        setUser(userData)
        setPosts(postsData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </motion.div>
    )
  }

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">User not found</h1>
          <Button asChild>
            <a href="/">Go back home</a>
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="min-h-screen py-12"
    >
      <div className="container mx-auto px-4">
        <motion.div variants={item} className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center mb-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mb-6"
            >
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.avatar || ""} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </motion.div>

            <motion.h1 variants={item} className="text-3xl font-bold mb-2">
              {user.name}
            </motion.h1>

            <motion.p variants={item} className="text-muted-foreground mb-4">
              {user.bio || "No bio yet"}
            </motion.p>

            <motion.div
              variants={item}
              className="flex items-center gap-4 text-sm text-muted-foreground mb-6"
            >
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <PenSquare className="h-4 w-4" />
                <span>{user._count.posts} posts</span>
              </div>
              <div className="flex items-center gap-1">
                <Bookmark className="h-4 w-4" />
                <span>{user._count.followers} followers</span>
              </div>
            </motion.div>

            <motion.div variants={item}>
              <Button>Follow</Button>
            </motion.div>
          </div>

          <motion.div variants={item}>
            <h2 className="text-2xl font-bold mb-6">Posts</h2>
            <div className="space-y-8">
              {posts.map((post) => (
                <motion.article
                  key={post.id}
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  className="bg-card rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="p-6">
                    {post.coverImage && (
                      <div className="relative h-64 w-full rounded-lg overflow-hidden mb-4">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                    <p className="text-muted-foreground line-clamp-3 mb-4">
                      {post.content.replace(/<[^>]*>/g, "").substring(0, 200)}...
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-4">
                        <span>{post.likes} likes</span>
                        <span>{post.comments} comments</span>
                        {post.readingTime && (
                          <span>{post.readingTime} min read</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

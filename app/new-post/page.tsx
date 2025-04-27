"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import PostEditor from "@/components/post-editor"
import { motion } from "framer-motion"

export default function NewPost() {
  const { data: session } = useSession()
  const router = useRouter()

  const handlePublish = async (data: {
    title: string
    content: string
    coverImage: string
    tags: string[]
  }) => {
    if (!session) return

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          authorId: session.user.id,
        }),
      })

      if (response.ok) {
        router.push("/")
      }
    } catch (error) {
      console.error("Error creating post:", error)
    }
  }

  if (!session) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center"
      >
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please sign in to create a post</h1>
          <Button asChild>
            <a href="/login">Sign In</a>
          </Button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen py-12"
    >
      <div className="container mx-auto px-4">
        <PostEditor onPublish={handlePublish} />
      </div>
    </motion.div>
  )
}

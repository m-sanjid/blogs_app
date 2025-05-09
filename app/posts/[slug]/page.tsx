"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Bookmark, Share2, Clock, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Post {
  id: string
  title: string
  content: string
  createdAt: string
  readingTime: number | null
  likes: number
  comments: number
  coverImage: string | null
  author: {
    name: string
    avatar: string | null
  }
  tags: string[]
}

// Sample post for fallback when API fails
const samplePost: Post = {
  id: "sample",
  title: "Sample Post: Understanding React Hooks",
  content: "<h2>Introduction to Hooks</h2><p>React Hooks are a powerful feature...</p>",
  createdAt: "2025-04-25T12:00:00Z",
  readingTime: 6,
  likes: 84,
  comments: 12,
  coverImage: null,
  author: {
    name: "Sample Author",
    avatar: null
  },
  tags: ["Programming", "React", "Web Development"]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function Post() {
  const { slug } = useParams()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const editor = useEditor({
    extensions: [StarterKit, Image, Link],
    editable: false,
  })

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!slug) {
          throw new Error("Post ID is missing")
        }
        
        const response = await fetch(`/api/posts/${slug}`)
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Validate the post data
        if (!data || !data.id || !data.title || !data.author || !data.author.name) {
          throw new Error("Invalid post data received")
        }
        
        // Ensure author.avatar is null if it doesn't exist
        if (data.author && data.author.avatar === undefined) {
          data.author.avatar = null
        }
        
        setPost(data)
        
        if (editor && data?.content) {
          editor.commands.setContent(data.content)
        }
      } catch (error) {
        console.error("Error fetching post:", error)
        setError("Failed to load post. Using sample data instead.")
        
        // Use sample post as fallback
        setPost(samplePost)
        
        if (editor && samplePost.content) {
          editor.commands.setContent(samplePost.content)
        }
      } finally {
        setLoading(false)
      }
    }

    if (editor) {
      fetchPost()
    }
  }, [slug, editor])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The post you're looking for doesn't exist.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen py-12"
    >
      <div className="container mx-auto px-4 max-w-4xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {post.coverImage && (
          <motion.div variants={itemVariants} className="mb-8">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
          <Avatar className="h-12 w-12">
            {post.author && post.author.avatar ? (
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
            ) : null}
            <AvatarFallback>
              {post.author && post.author.name ? post.author.name.charAt(0) : '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{post.author ? post.author.name : 'Unknown Author'}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
              {post.readingTime && (
                <>
                  <span>•</span>
                  <Clock className="h-4 w-4" />
                  <span>{post.readingTime} min read</span>
                </>
              )}
            </div>
          </div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-4xl font-bold mb-4">
          {post.title}
        </motion.h1>

        <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-8">
          {post.tags && post.tags.length > 0 ? (
            post.tags.map((tag) => (
              <span
                key={tag}
                className="text-sm bg-muted hover:bg-muted/80 px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="text-sm bg-muted px-3 py-1 rounded-full">Uncategorized</span>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="prose max-w-none mb-8">
          <EditorContent editor={editor} />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between border-t pt-8"
        >
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              {post.likes || 0}
            </Button>
            <Button variant="ghost" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" />
              {post.comments || 0}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="ghost" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
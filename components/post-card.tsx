"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Bookmark, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface PostCardProps {
  post: {
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
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-card rounded-lg shadow-lg overflow-hidden"
    >
      <Link href={`/posts/${post.id}`}>
        {post.coverImage && (
          <div className="relative h-48 w-full">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.avatar || ""} alt={post.author.name} />
              <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{post.author.name}</p>
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
          </div>

          <h2 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
            {post.title}
          </h2>

          <p className="text-muted-foreground line-clamp-3 mb-4">
            {post.content.replace(/<[^>]*>/g, "").substring(0, 200)}...
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                <span>{post.comments}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted hover:bg-muted/80 px-2 py-1 rounded-full transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
} 
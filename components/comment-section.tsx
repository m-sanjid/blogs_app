"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    avatar: string | null
  }
}

interface CommentSectionProps {
  postId: string
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)

  useState(() => {
    async function fetchComments() {
      try {
        const response = await fetch(`/api/posts/${postId}/comments`)

        if (!response.ok) {
          throw new Error("Failed to fetch comments")
        }

        const data = await response.json()
        setComments(data)
      } catch (error) {
        console.error("Error fetching comments:", error)
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        })
      } finally {
        setIsLoadingComments(false)
      }
    }

    fetchComments()
  }, [postId, toast])

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()

    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=${window.location.pathname}`)
      return
    }

    if (!newComment.trim()) return

    try {
      setIsLoading(true)

      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (!response.ok) {
        throw new Error("Failed to post comment")
      }

      const comment = await response.json()

      setComments((prev) => [comment, ...prev])
      setNewComment("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div id="comments">
      <h2 className="text-2xl font-bold mb-6">Comments</h2>

      <form onSubmit={handleSubmitComment} className="mb-8">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={session ? "Write a comment..." : "Sign in to comment"}
          disabled={!session || isLoading}
          className="mb-4"
          rows={4}
        />

        <Button type="submit" disabled={!session || isLoading || !newComment.trim()}>
          {isLoading ? "Posting..." : "Post Comment"}
        </Button>
      </form>

      {isLoadingComments ? (
        <div className="text-center py-8">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b pb-6">
              <div className="flex items-center gap-2 mb-2">
                <div className="relative h-8 w-8 rounded-full overflow-hidden">
                  {comment.author.avatar ? (
                    <Image
                      src={comment.author.avatar || "/placeholder.svg"}
                      alt={comment.author.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                      {comment.author.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{comment.author.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

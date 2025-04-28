"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart, Bookmark, MessageSquare, Share2, Trash2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface PostActionsProps {
  post: {
    id: string
    authorId: string
    slug: string
    _count: {
      likes: number
      comments: number
    }
  }
}

export default function PostActions({ post }: PostActionsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likesCount, setLikesCount] = useState(post._count.likes)
  const [isDeleting, setIsDeleting] = useState(false)

  const isAuthor = session?.user?.id === post.authorId

  useEffect(() => {
    async function checkInteractions() {
      if (!session?.user?.id) return

      try {
        const [likeResponse, bookmarkResponse] = await Promise.all([
          fetch(`/api/posts/${post.id}/like/check`),
          fetch(`/api/posts/${post.id}/bookmark/check`),
        ])

        if (likeResponse.ok) {
          const { liked } = await likeResponse.json()
          setIsLiked(liked)
        }

        if (bookmarkResponse.ok) {
          const { bookmarked } = await bookmarkResponse.json()
          setIsBookmarked(bookmarked)
        }
      } catch (error) {
        console.error("Error checking interactions:", error)
      }
    }

    checkInteractions()
  }, [post.id, session?.user?.id])

  async function handleLike() {
    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=/posts/${post.slug}`)
      return
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to like post")
      }

      const { liked } = await response.json()
      setIsLiked(liked)
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1))
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    }
  }

  async function handleBookmark() {
    if (!session?.user?.id) {
      router.push(`/login?callbackUrl=/posts/${post.slug}`)
      return
    }

    try {
      const response = await fetch(`/api/posts/${post.id}/bookmark`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to bookmark post")
      }

      const { bookmarked } = await response.json()
      setIsBookmarked(bookmarked)

      toast({
        title: bookmarked ? "Post bookmarked" : "Bookmark removed",
        description: bookmarked
          ? "This post has been added to your bookmarks"
          : "This post has been removed from your bookmarks",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    }
  }

  async function handleDelete() {
    if (!isAuthor) return

    try {
      setIsDeleting(true)

      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete post")
      }

      toast({
        title: "Post deleted",
        description: "Your post has been deleted successfully",
      })

      router.push("/")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Post link has been copied to clipboard",
      })
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleLike} className="flex items-center gap-1">
          <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          <span>{likesCount}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => document.getElementById("comments")?.scrollIntoView({ behavior: "smooth" })}
          className="flex items-center gap-1"
        >
          <MessageSquare className="h-5 w-5" />
          <span>{post._count.comments}</span>
        </Button>

        <Button variant="ghost" size="sm" onClick={handleBookmark} className="flex items-center gap-1">
          <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
        </Button>

        <Button variant="ghost" size="sm" onClick={handleShare} className="flex items-center gap-1">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {isAuthor && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/edit-post/${post.id}`)}>
            <Edit className="h-5 w-5 mr-1" />
            Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Trash2 className="h-5 w-5 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your post.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  )
}

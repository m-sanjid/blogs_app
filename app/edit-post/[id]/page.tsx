"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Editor from "@/components/editor"
import { useToast } from "@/hooks/use-toast"
import { Link } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  content: z.string().min(50, {
    message: "Content must be at least 50 characters.",
  }),
  tags: z.string().transform((val) =>
    val
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  ),
  coverImage: z.string().optional(),
})

interface EditPostPageProps {
  params: {
    id: string
  }
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPost, setIsLoadingPost] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false) 

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      tags: "",
      coverImage: "",
    },
  })

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/login?callbackUrl=/edit-post/" + params.id)
    return null
  }

  useEffect(() => {
    let isMounted = true

    async function fetchPost() {
      try {
        const response = await fetch(`/api/posts/${params.id}`)

        if (!response.ok) {
          throw new Error("Failed to fetch post")
        }

        const post = await response.json()

        // Check if user is the author
        if (session?.user?.id !== post.authorId) {
          toast({
            title: "Unauthorized",
            description: "You are not authorized to edit this post",
            variant: "destructive",
          })
          router.push(`/posts/${post.slug}`)
          setIsAuthorized(false) 
          return
        }

        setIsAuthorized(true)

        if (isMounted) {
          form.reset({
            title: post.title,
            content: post.content,
            tags: post.tags.join(", "),
            coverImage: post.coverImage || "",
          })
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Something went wrong",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        if (isMounted) {
          setIsLoadingPost(false)
        }
      }
    }

    setIsLoadingPost(true) 
    if (session?.user?.id) {
      fetchPost()
    } else {
      setIsLoadingPost(false)
    }

    return () => {
      isMounted = false
    }
  }, [params.id, session?.user?.id, router, toast, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)

      const response = await fetch(`/api/posts/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      toast({
        title: "Post updated!",
        description: "Your post has been updated successfully.",
      })

      router.push(`/posts/${data.slug}`)
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

  async function handleImageUrlSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const imageUrl = formData.get("imageUrl") as string

    if (!imageUrl) return

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      form.setValue("coverImage", data.url)

      toast({
        title: "Image added!",
        description: "Your cover image URL has been added successfully.",
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    }
  }

  if (isLoadingPost) {
    return <div className="max-w-4xl mx-auto text-center py-12">Loading post...</div>
  }

  if (!isAuthorized) {
    return <div className="max-w-4xl mx-auto text-center py-12">You are not authorized to edit this post.</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit post</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your post title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="coverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cover Image</FormLabel>
                <div className="space-y-4">
                  <form onSubmit={handleImageUrlSubmit} className="flex items-center gap-4">
                    <Input name="imageUrl" type="url" placeholder="Enter image URL (https://...)" className="flex-1" />
                    <Button type="submit">
                      <Link className="h-4 w-4 mr-2" />
                      Add Image
                    </Button>
                  </form>
                  {field.value && (
                    <div className="space-y-2">
                      <span className="text-sm text-gray-500">Image URL added successfully</span>
                      <div className="relative h-64 w-full rounded-lg overflow-hidden">
                        <img
                          src={field.value || "/placeholder.svg"}
                          alt="Cover"
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <Editor content={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormControl>
                  <Input placeholder="technology, programming, web" {...field} />
                </FormControl>
                <p className="text-sm text-gray-500">Separate tags with commas</p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Post"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

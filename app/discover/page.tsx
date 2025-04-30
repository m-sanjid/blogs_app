"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Clock, BookOpen } from "lucide-react"
import PostCard from "@/components/post-card"

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

const topics = [
  { name: "Technology", count: 1250 },
  { name: "Programming", count: 980 },
  { name: "Design", count: 750 },
  { name: "Productivity", count: 620 },
  { name: "Writing", count: 540 },
  { name: "Business", count: 480 },
  { name: "Science", count: 420 },
  { name: "Health", count: 380 },
]

export default function Discover() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts")
        const data = await response.json()
        setPosts(data)
      } catch (error) {
        console.error("Error fetching posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesTopic =
      !selectedTopic || post.tags.includes(selectedTopic)

    return matchesSearch && matchesTopic
  })

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Discover Stories</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore trending topics and find stories that inspire you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <div className="relative mb-8">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending Topics
                </h2>
                <div className="space-y-2">
                  {topics.map((topic) => (
                    <motion.div
                      key={topic.name}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={selectedTopic === topic.name ? "default" : "ghost"}
                        className="w-full justify-between"
                        onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
                      >
                        <span>{topic.name}</span>
                        <span className="text-muted-foreground">{topic.count}</span>
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8"
              >
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
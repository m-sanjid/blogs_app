"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, TrendingUp, Hash } from "lucide-react"
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

interface Topic {
  name: string
  count: number
  description: string
}

const topics: Topic[] = [
  {
    name: "Technology",
    count: 1250,
    description: "Explore the latest in tech, from AI to blockchain and everything in between."
  },
  {
    name: "Programming",
    count: 980,
    description: "Dive into coding tutorials, best practices, and programming languages."
  },
  {
    name: "Design",
    count: 750,
    description: "Discover UI/UX design, graphic design, and creative inspiration."
  },
  {
    name: "Productivity",
    count: 620,
    description: "Learn tips and tricks to boost your productivity and efficiency."
  },
  {
    name: "Writing",
    count: 540,
    description: "Improve your writing skills and explore different writing styles."
  },
  {
    name: "Business",
    count: 480,
    description: "Stay updated with business trends, entrepreneurship, and management."
  },
  {
    name: "Science",
    count: 420,
    description: "Explore scientific discoveries, research, and innovations."
  },
  {
    name: "Health",
    count: 380,
    description: "Learn about physical and mental health, wellness, and lifestyle."
  }
]

export default function Topics() {
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

  const filteredTopics = topics.filter(topic =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPosts = posts.filter(post =>
    !selectedTopic || post.tags.includes(selectedTopic)
  )

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Explore Topics</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover stories across different topics and find what interests you.
          </p>
        </motion.div>

        <div className="relative mb-8 max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredTopics.map((topic) => (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <Hash className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">{topic.name}</h2>
                <span className="ml-auto text-sm text-muted-foreground">
                  {topic.count} stories
                </span>
              </div>
              <p className="text-muted-foreground mb-4">{topic.description}</p>
              <Button
                variant={selectedTopic === topic.name ? "default" : "outline"}
                className="w-full"
                onClick={() => setSelectedTopic(selectedTopic === topic.name ? null : topic.name)}
              >
                {selectedTopic === topic.name ? "Viewing Posts" : "View Posts"}
              </Button>
            </motion.div>
          ))}
        </div>

        {selectedTopic && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Posts in {selectedTopic}
            </h2>
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
} 
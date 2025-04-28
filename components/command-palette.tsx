"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Dialog } from "@radix-ui/react-dialog"
import { Command } from "cmdk"
import { Search, BookOpen, User, PenSquare, Settings, LogOut, TrendingUp, Hash, Plus, Moon, Sun, Monitor, FileText } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface Post {
  id: string
  title: string
  content: string
  author: {
    name: string
  }
  createdAt: string
}

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()
  const [search, setSearch] = React.useState("")
  const [selectedCommand, setSelectedCommand] = React.useState("")
  const [posts, setPosts] = React.useState<Post[]>([])
  const [loading, setLoading] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<"commands" | "posts">("commands")

  // Keyboard shortcuts
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }

    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    document.addEventListener("keydown", escape)
    return () => {
      document.removeEventListener("keydown", down)
      document.removeEventListener("keydown", escape)
    }
  }, [])

  // Fetch posts when searching
  React.useEffect(() => {
    if (search.length > 2) {
      setLoading(true)
      fetch(`/api/posts/search?q=${search}`)
        .then((res) => res.json())
        .then((data) => {
          setPosts(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    } else {
      setPosts([])
    }
  }, [search])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  const commands = [
    {
      name: "Home",
      icon: BookOpen,
      shortcut: "⌘H",
      action: () => router.push("/"),
    },
    {
      name: "Discover",
      icon: TrendingUp,
      shortcut: "⌘D",
      action: () => router.push("/discover"),
    },
    {
      name: "Topics",
      icon: Hash,
      shortcut: "⌘T",
      action: () => router.push("/topics"),
    },
    {
      name: "New Post",
      icon: Plus,
      shortcut: "⌘N",
      action: () => router.push("/new-post"),
    },
    {
      name: "Profile",
      icon: User,
      shortcut: "⌘P",
      action: () => router.push("/profile"),
    },
    {
      name: "Settings",
      icon: Settings,
      shortcut: "⌘,",
      action: () => router.push("/settings"),
    },
    {
      name: "Light Theme",
      icon: Sun,
      shortcut: "⌘L",
      action: () => setTheme("light"),
    },
    {
      name: "Dark Theme",
      icon: Moon,
      shortcut: "⌘⇧D",
      action: () => setTheme("dark"),
    },
    {
      name: "System Theme",
      icon: Monitor,
      shortcut: "⌘⇧S",
      action: () => setTheme("system"),
    },
    {
      name: "Sign Out",
      icon: LogOut,
      shortcut: "⌘⇧Q",
      action: () => signOut(),
    },
  ]

  const filteredCommands = commands.filter((cmd) =>
    cmd.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex"
          onClick={() => setOpen(true)}
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </motion.div>
      <AnimatePresence>
        {open && (
          <Dialog open={open} onOpenChange={setOpen}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <Command className="fixed left-[50%] top-[20%] z-50 w-full max-w-2xl -translate-x-1/2 transform rounded-lg border bg-background shadow-lg">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex h-16 items-center border-b px-4"
              >
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Command.Input
                  placeholder="Search commands and posts..."
                  value={search}
                  onValueChange={setSearch}
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="flex items-center gap-2">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                  <span className="text-xs text-muted-foreground">to open</span>
                </div>
              </motion.div>
              <div className="flex border-b">
                <button
                  onClick={() => setActiveTab("commands")}
                  className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
                    activeTab === "commands"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Commands
                </button>
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`flex-1 py-2 text-center text-sm font-medium transition-colors ${
                    activeTab === "posts"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  Posts
                </button>
              </div>
              <Command.List className="max-h-[60vh] overflow-y-auto p-2">
                {activeTab === "commands" ? (
                  <>
                    <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                      No commands found.
                    </Command.Empty>
                    <Command.Group heading="Commands" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      {filteredCommands.map((cmd) => (
                        <Command.Item
                          key={cmd.name}
                          onSelect={() => runCommand(cmd.action)}
                          className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                        >
                          <div className="flex items-center">
                            <cmd.icon className="mr-2 h-4 w-4" />
                            <span>{cmd.name}</span>
                          </div>
                          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                            {cmd.shortcut}
                          </kbd>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </>
                ) : (
                  <>
                    {loading ? (
                      <div className="space-y-4 p-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="space-y-3">
                            <div className="flex items-center space-x-4">
                              <Skeleton className="h-12 w-12 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-[250px]" />
                                <Skeleton className="h-4 w-[200px]" />
                              </div>
                            </div>
                            <Skeleton className="h-[125px] w-full rounded-lg" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-[90%]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                          {search.length > 2
                            ? "No posts found."
                            : "Type at least 3 characters to search posts."}
                        </Command.Empty>
                        <Command.Group heading="Posts" className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {posts.map((post) => (
                            <Command.Item
                              key={post.id}
                              onSelect={() => router.push(`/posts/${post.id}`)}
                              className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                            >
                              <div className="flex items-center">
                                <FileText className="mr-2 h-4 w-4" />
                                <div>
                                  <div className="font-medium">{post.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    by {post.author.name}
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </div>
                            </Command.Item>
                          ))}
                        </Command.Group>
                      </>
                    )}
                  </>
                )}
              </Command.List>
            </Command>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  )
} 
import prisma from "@/lib/db"

interface PostPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PostPageProps) {
  const post = await prisma.post.findUnique({
    where: {
      slug: params.slug,
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!post) {
    return {
      title: "Post Not Found",
      description: "The post you're looking for doesn't exist.",
    }
  }

  return {
    title: post.title,
    description: post.content.substring(0, 160),
    openGraph: {
      title: post.title,
      description: post.content.substring(0, 160),
      type: "article",
      publishedTime: post.createdAt,
      authors: [post.author.name],
    },
  }
} 
import { createPost } from "@/actions/actions";
import prisma from "@/lib/db";
import Link from "next/link";

export default async function Home() {
  const posts = await prisma.post.findMany({
    include: {
      author: true,
    },
    orderBy: { createdAt: 'desc'},
    take: 10,
    skip: 0,
  });

  const total = await prisma.post.count()

  return (
    <main>
      <h1>All posts ({total})</h1>
      {posts.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          <div>{post.content}</div>
          <div>{post.author?.email}</div>
          <Link href={`/posts/${post.id}`}>View</Link>
        </article>
      ))}

      <form action={createPost}>
        <input type="text" name="title" placeholder="Title" />
        <textarea name="content" rows={5} placeholder="Content" />
        <button type="submit">Create New</button>
      </form>
    </main>
  );
}

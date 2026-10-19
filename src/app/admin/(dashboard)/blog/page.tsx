import { getAdminBlogPosts } from "./actions";
import BlogManager from "./BlogManager";

export const metadata = { title: "Blog Articles Manager | Admin Studio" };
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getAdminBlogPosts();
  return <BlogManager initialPosts={posts} />;
}

import Header from "@/components/Header";
import HomePosts from "@/components/HomePosts";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { recentPosts } from "@/lib/data/post";
import Image from "next/image";

export default async function Home() {
  const posts = await recentPosts()
  return (
    <div className="ml-15 p-4 space-y-4 flex justify-between max-w-full">
      <div className="w-2/3">
        <HomePosts posts={posts} />
      </div>
      <div className='w-1/3'>
        <Card className='rounded shadow-none'>
          <CardHeader>
            <CardTitle>
              Recent Activities
            </CardTitle>
            <CardDescription>Coming soon..</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

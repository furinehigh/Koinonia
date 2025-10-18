import HomePosts from "@/components/HomePosts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { recentPosts } from "@/lib/data/post";
import { getUserActivities } from "@/lib/data/user";
import { formatDistanceToNow } from "date-fns";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function Home() {
  const posts = await recentPosts()
  const session = await getServerSession(authOptions)
  const activities = await getUserActivities(session?.user.id)
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
            <CardContent className="p-0">
              <div className="flex flex-col gap-5 w-full text-xs">

                {activities.map((a, i) => (
                  <Link key={i} href={a.slug || '#'}>
                  <div className="border rounded p-1">
                    <div className="flex space-x-2 items-center justify-between">
                      <div>

                      <h1 className="font-semibold text-sm">{a.title}</h1>
                      </div>
                      <p>{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</p>
                    </div>
                    <div>
                      <p>{a.description}</p>

                    </div>
                  </div>
                  </Link>
                ))} 
              </div>
            </CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

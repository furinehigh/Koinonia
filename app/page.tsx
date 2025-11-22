import HomePosts from "@/components/HomePosts";
import FrameworkPanel from "@/components/framework/panel"
import { authOptions } from "@/lib/auth";
import { recentPosts } from "@/lib/data/post";
import { getUserActivities } from "@/lib/data/user";
import { formatDistanceToNow } from "date-fns";
import { getServerSession } from "next-auth";
import Link from "next/link";

export default async function Home() {
  const posts = await recentPosts()
  const session = await getServerSession(authOptions)
  let activities = []

  if (session?.user) activities = await getUserActivities(session.user.id)

  return (
    <div className="ml-19 p-6 flex gap-6 max-w-full h-full">
      
      {/* Left feed */}
      <div className="flex-1 min-w-0">
        <HomePosts posts={posts} />
      </div>
      
      {/* Right activity section */}
      <div className="w-1/3 min-w-[260px]">
        <FrameworkPanel className="p-0">
          
          <div className="border-b px-4 py-3">
            <h1 className="font-semibold tracking-tight">Recent Activity</h1>
          </div>

          <div className="p-4 flex flex-col gap-4 text-xs">
            {activities.length === 0 && (
              <p className="opacity-50 text-center py-6">No activity yet.</p>
            )}

            {activities.map((a, i) => (
              <Link key={i} href={a.slug || "#"} className="group">
                <div className="p-3 hover:bg-neutral-50 transition border rounded">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-[2px] text-[10px] bg-neutral-200 rounded">
                      {a.type}
                    </span>
                    <span className="opacity-60">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <div className="mt-2">
                    <h2 className="text-sm font-medium group-hover:underline">{a.title}</h2>
                    <p className="opacity-70 text-[11px]">{a.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </FrameworkPanel>
      </div>

    </div>
  )
}

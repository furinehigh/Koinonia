import React from 'react'
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
function CommHome() {
  return (
    <div className='flex flex-col '>
          <div className='my-5'>
              <h1 className='font-semibold'>Announcements</h1>
              <Card className='rounded shadow-none w-xs'>
                  <CardHeader>
                      <CardTitle>
                            Welcome!!
                      </CardTitle>
                      <CardDescription>
                        We are very happy to see you here on this community, start new post and keep earning koins and trust.
                      </CardDescription>
                  </CardHeader>
              </Card>
        </div>
        <div className='my-5'>
            <h1 className='font-semibold'>Posts</h1>
        </div>
    </div>
  )
}

export default CommHome
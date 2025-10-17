import CreatePost from '@/components/community/create-post'
import React from 'react'

function CPost({params} : {
  params: {slug: string}
}) {
  return (
    <CreatePost slug={params.slug} />
  )
}

export default CPost
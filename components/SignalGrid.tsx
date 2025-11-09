"use client"
import React, { useCallback, useMemo } from "react"
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
} from "reactflow"
import "reactflow/dist/style.css"
import Link from "next/link"
import { Post } from "@/types"

// --- Post Card Node ---
const CardNode = ({ data }: any) => (
  <div className="bg-white border border-gray-300 rounded-xl shadow-md px-4 py-3 w-64 cursor-grab hover:shadow-lg transition relative">
    <Handle type="target" position={Position.Top} className="!bg-transparent" />
    <Link href={`/n/${data.community?.slug}/post/${data.id}`} className="block">
      <div className="font-semibold truncate">{data.title}</div>
      <div className="text-xs text-gray-500 mt-1 truncate">
        by {data.author?.name || "Unknown"}
      </div>
      {data.imageUrl && (
        <img
          src={data.imageUrl}
          alt="thumb"
          className="rounded mt-2 w-full h-24 object-cover"
        />
      )}
    </Link>
    <div className="text-[10px] text-gray-400 mt-2">Signal: {data.votes}</div>
    <Handle type="source" position={Position.Bottom} className="!bg-transparent" />
  </div>
)

// --- Community Label Node ---
const LabelNode = ({ data }: any) => (
  <div className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-1 text-sm font-medium text-gray-700 w-28 text-center">
    {data.label}
  </div>
)

const nodeTypes = { card: CardNode, label: LabelNode }

export default function SignalGridFlow({ posts }: { posts: Post[] }) {
  // Sort posts by votes
  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => b.votes - a.votes),
    [posts]
  )

  // Group posts by community
  const communityGroups: Record<string, Post[]> = useMemo(() => {
    const groups: Record<string, Post[]> = {}
    sortedPosts.forEach((p) => {
      const key = p.community?.id || "none"
      if (!groups[key]) groups[key] = []
      groups[key].push(p)
    })
    return groups
  }, [sortedPosts])

  // Create nodes (community labels + posts)
  const initialNodes: Node[] = useMemo(() => {
    const nodes: Node[] = []
    let yOffset = 0

    Object.values(communityGroups).forEach((group) => {
      const community = group[0]?.community
      const communityLabel = 'n/' + community?.slug || "Unassigned"

      // Community label node
      nodes.push({
        id: `label-${community?.id || communityLabel}`,
        type: "label",
        data: { label: communityLabel },
        position: { x: 50, y: yOffset + 100 },
        draggable: false,
      })

      // Posts under this community
      group.forEach((p, idx) => {
        nodes.push({
          id: p.id,
          type: "card",
          data: p,
          position: { x: 300, y: yOffset + idx * 250 },
        })
      })

      // Add space before next group
      yOffset += group.length * 250 + 150
    })

    return nodes
  }, [communityGroups])

  // Create edges (within same community)
  const initialEdges: Edge[] = useMemo(() => {
    const edges: Edge[] = []

    const getEdgeColor = (votes: number) => {
      if (votes > 5) return "#10b981" // strong green
      if (votes > 2) return "#f59e0b" // yellow
      if (votes >= 0) return "#9ca3af" // neutral gray
      return "#ef4444" // fading red
    }

    Object.values(communityGroups).forEach((group) => {
      for (let i = 0; i < group.length - 1; i++) {
        edges.push({
          id: `e-${group[i].id}-${group[i + 1].id}`,
          source: group[i].id,
          target: group[i + 1].id,
          style: {
            stroke: getEdgeColor(group[i].votes),
            strokeWidth: 1.5,
            strokeDasharray: "6 3",
          },
        })
      }
    })

    return edges
  }, [communityGroups])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            style: { strokeDasharray: "4 2", stroke: "#9ca3af" },
          },
          eds
        )
      ),
    [setEdges]
  )

  return (
    <div className="w-full h-[100vh] bg-white overflow-hidden rounded my-4">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        panOnScroll
        zoomOnScroll
        defaultEdgeOptions={{
          animated: false,
          style: { stroke: "gray", strokeWidth: 1.5, strokeDasharray: "4 3" },
        }}
      >
        <Background color="#e5e7eb" gap={32} />
        <Controls />
      </ReactFlow>
    </div>
  )
}

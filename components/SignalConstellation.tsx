"use client"
import React, { useMemo, useCallback, useEffect, useRef } from "react"
import ReactFlow, {
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  Controls
} from "reactflow"
import "reactflow/dist/style.css"

const StarNode = ({ data }: any) => (
  <div
    className="relative flex flex-col items-center cursor-pointer"
    onClick={() => (window.location.href = data.href)}
  >
    <img
      src={data.img}
      className="rounded-full w-10 h-10 object-cover"
      style={{
        boxShadow: `0 0 8px #00000055, 0 0 16px #00000033`,
      }}
    />

    <div className="text-[10px] text-gray-800 mt-1 w-24 text-center line-clamp-2">
      {data.title}
    </div>

    <div className="absolute inset-0 pointer-events-none">
      {data.meteors?.map((m: any) => (
        <div
          key={m.id}
          className="absolute w-1 h-1 rounded-full bg-gray-700"
          style={{ transform: `translate(${m.x}px, ${m.y}px)` }}
        />
      ))}
    </div>

    <Handle type="target" position={Position.Top} className="!bg-transparent" />
    <Handle type="source" position={Position.Bottom} className="!bg-transparent" />
  </div>
)

const LabelNode = ({ data }: any) => (
  <div className="px-4 py-2 rounded-md bg-white border border-gray-300 shadow-md text-gray-900 text-sm font-bold">
    {data.label}
  </div>
)

const nodeTypes = { star: StarNode, label: LabelNode }

export default function SignalConstellation({ posts }: any) {
  const sorted = useMemo(() => [...posts].sort((a, b) => b.votes - a.votes), [posts])

  const groups = useMemo(() => {
    const g: Record<string, any[]> = {}
    sorted.forEach((p) => {
      const id = p.community?.id || "none"
      if (!g[id]) g[id] = []
      g[id].push(p)
    })
    return g
  }, [sorted])

  const { initialNodes, orbitMeta } = useMemo(() => {
    const nodes: Node[] = []
    const meta: any = {}
    let yShift = 0

    Object.values(groups).forEach((group: any[]) => {
      const center = group[0]?.community
      const labelId = `label-${center?.id}`

      nodes.push({
        id: labelId,
        type: "label",
        data: { label: "n/" + center?.slug },
        position: { x: 350, y: yShift },
        draggable: false,
      })

      meta[labelId] = []

      const radius = 180

      group.forEach((p, i) => {
        const angle = (i / group.length) * 2 * Math.PI
        const x = 350 + Math.cos(angle) * radius
        const y = yShift + Math.sin(angle) * radius

        const meteorCount = 3
        const meteors = Array.from({ length: meteorCount }).map((_, m) => ({
          id: `${p.id}-m${m}`,
          angle: Math.random() * Math.PI * 2,
          radius: 14 + Math.random() * 6,
        }))

        nodes.push({
          id: p.id,
          type: "star",
          data: {
            title: p.title,
            img: p.author?.image || "/default.png",
            href: `/n/${center.slug}/post/${p.id}`,
            meteors,
          },
          position: { x, y },
        })

        meta[labelId].push({
          nodeId: p.id,
          angle,
          radius,
          speed: 0.0012 + Math.random() * 0.0012,
          cx: 350,
          cy: yShift,
          meteors,
        })
      })

      yShift += 420
    })

    return { initialNodes: nodes, orbitMeta: meta }
  }, [groups])

  const initialEdges: Edge[] = useMemo(() => {
    const e: Edge[] = []
    Object.values(groups).forEach((group: any[]) => {
      for (let i = 0; i < group.length - 1; i++) {
        e.push({
          id: `e-${group[i].id}-${group[i + 1].id}`,
          source: group[i].id,
          target: group[i + 1].id,
          animated: false,
          style: { stroke: "#6b7280", strokeWidth: 1, opacity: 0.4 },
        })
      }
    })
    return e
  }, [groups])

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Edge | Connection) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: false, style: { stroke: "#6b7280" } }, eds)
      ),
    [setEdges]
  )

  const orbitRef = useRef(orbitMeta)

  useEffect(() => {
    let frame: number

    const animate = () => {
      setNodes((nds) =>
        nds.map((n) => {
          for (const centerId in orbitRef.current) {
            const items = orbitRef.current[centerId]
            const meta = items.find((i: any) => i.nodeId === n.id)
            if (!meta) continue

            meta.angle += meta.speed

            const x = meta.cx + Math.cos(meta.angle) * meta.radius
            const y = meta.cy + Math.sin(meta.angle) * meta.radius

            meta.meteors.forEach((m: any) => {
              m.angle += 0.03
              m.x = Math.cos(m.angle) * m.radius
              m.y = Math.sin(m.angle) * m.radius
            })

            return {
              ...n,
              data: { ...n.data, meteors: meta.meteors },
              position: { x, y },
            }
          }
          return n
        })
      )

      frame = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(frame)
  }, [setNodes])

  return (
    <div className="relative w-full h-[100vh] bg-white overflow-hidden">
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
      >
        <Controls />
      </ReactFlow>
    </div>
  )
}

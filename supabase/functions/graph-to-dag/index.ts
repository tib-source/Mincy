import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const payload = await req.json()
  const { record, old_record, type } = payload

  // prevent cyclical update
  if (type === 'UPDATE' && JSON.stringify(record.pipeline) === JSON.stringify(old_record?.pipeline)) {
    return new Response("Ignoring internal update", { status: 200 })
  }

  const { nodes, edges } = record.pipeline || { nodes: [], edges: [] }

  try {
    const stageNodes = nodes.filter((n: any) => n.type === 'stage')
    const childNodes = nodes.filter((n: any) => n.type !== 'stage')

    const stageById = new Map(stageNodes.map((s: any) => [s.id, s]))

    const stageChildren = new Map<string, any[]>()
    const orphanNodes: any[] = []

    for (const node of childNodes) {
      if (node.parentId && stageById.has(node.parentId)) {
        const children = stageChildren.get(node.parentId) || []
        children.push(node)
        stageChildren.set(node.parentId, children)
      } else {
        orphanNodes.push(node)
      }
    }

    const stageEdges = edges.filter((e: any) =>
      stageById.has(e.source) && stageById.has(e.target)
    )
    const sortedStages = topologicalSort(stageNodes, stageEdges)

    const stages = sortedStages.map((stage: any) => {
      const children = stageChildren.get(stage.id) || []
      const childIds = new Set(children.map((c: any) => c.id))

      const internalEdges = edges.filter((e: any) =>
        childIds.has(e.source) && childIds.has(e.target)
      )

      const sortedChildren = topologicalSort(children, internalEdges)

      const steps = sortedChildren.map((node: any) => ({
        id: node.id,
        type: node.type,
        data: node.data,
        status: "queued",
        dependsOn: internalEdges.filter((e: any) => e.target === node.id).map((e: any) => e.source),
        next: internalEdges.filter((e: any) => e.source === node.id).map((e: any) => e.target),
      }))

      return {
        id: stage.id,
        name: stage.data?.label || 'Stage',
        image: stage.data?.image || 'debian:latest',
        steps,
        dependsOn: stageEdges.filter((e: any) => e.target === stage.id).map((e: any) => e.source),
      }
    })

    for (const node of orphanNodes) {
      stages.push({
        id: node.id,
        name: node.data?.label || node.type,
        image: node.data?.image || 'debian:latest',
        steps: [{
          id: node.id,
          type: node.type,
          data: node.data,
          status: "queued",
          dependsOn: edges.filter((e: any) => e.target === node.id).map((e: any) => e.source),
          next: edges.filter((e: any) => e.source === node.id).map((e: any) => e.target),
        }],
        dependsOn: edges.filter((e: any) => e.target === node.id).map((e: any) => e.source),
      })
    }

    const jobDefinition = {
      stages,
      calculated_at: new Date().toISOString(),
      source_hash: btoa(JSON.stringify(record.pipeline)).substring(0, 8)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error } = await supabase
      .from('Workflow')
      .update({ jobs: jobDefinition })
      .eq('id', record.id)

    if (error) throw error

    return new Response(JSON.stringify({ status: "success", stages: stages.length }), {
      headers: { "Content-Type": "application/json" },
    })

  } catch (err) {
    console.error(`DAG Error: ${err.message}`)
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
})

// Helper: Kahn's Algorithm
// reference : https://www.geeksforgeeks.org/dsa/topological-sorting-indegree-based-solution/
function topologicalSort(nodes: any[], edges: any[]) {
  const sorted = []
  const inDegree = new Map()
  const nodeById = new Map(nodes.map(n => [n.id, n]))
  const childrenOf = new Map<string, any[]>()

  for (const n of nodes) {
    inDegree.set(n.id, 0)
    childrenOf.set(n.id, [])
  }
  for (const e of edges) {
    inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1)
    childrenOf.get(e.source)?.push(e)
  }

  const queue = nodes.filter(n => inDegree.get(n.id) === 0)

  while (queue.length > 0) {
    const u = queue.shift()
    sorted.push(u)

    for (const edge of childrenOf.get(u.id) || []) {
      const newDeg = inDegree.get(edge.target) - 1
      inDegree.set(edge.target, newDeg)
      if (newDeg === 0) {
        queue.push(nodeById.get(edge.target))
      }
    }
  }

  if (sorted.length !== nodes.length) {
    throw new Error("Circular dependency detected in pipeline!")
  }

  return sorted
}

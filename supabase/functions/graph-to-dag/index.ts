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
    const steps = topologicalSort(nodes, edges).map(node => ({
      id: node.id,
      type: node.type,
      data: node.data,
      executor: node.executor?.image || { image: "node:20-slim" },
      status: "queued", // TODO: make this an enum
      dependsOn: edges.filter( e => e.target == node.id).map(e => e.source),
      isControl: node.category
    }))

    const jobDefinition = {
      steps,
      calculated_at: new Date().toISOString(),
      source_hash: btoa(JSON.stringify(record.pipeline)).substring(0, 8) // Optional fingerprint
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

    return new Response(JSON.stringify({ status: "success", steps: steps.length }), {
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
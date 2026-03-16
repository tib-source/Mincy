import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const payload = await req.json()
  const { record, old_record, type } = payload

  // 1. PREVENTION: If this update was triggered by the function itself 
  // (i.e., we just updated the 'job' column), skip execution.
  if (type === 'UPDATE' && JSON.stringify(record.pipeline) === JSON.stringify(old_record?.pipeline)) {
    return new Response("Ignoring internal update", { status: 200 })
  }

  const { nodes, edges } = record.pipeline || { nodes: [], edges: [] }

  try {
    // 2. DAG Generation
    const steps = topologicalSort(nodes, edges).map(node => ({
      id: node.id,
      type: node.type,
      data: node.data,
      // Default config if not specified in node
      executor: node.executor || { image: "node:20-slim" } 
    }))

    const jobDefinition = {
      steps,
      calculated_at: new Date().toISOString(),
      source_hash: btoa(JSON.stringify(record.pipeline)).substring(0, 8) // Optional fingerprint
    }

    // 3. Write back to Supabase
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
function topologicalSort(nodes: any[], edges: any[]) {
  const sorted = []
  const inDegree = new Map()
  
  nodes.forEach(n => inDegree.set(n.id, 0))
  edges.forEach(e => inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1))

  const queue = nodes.filter(n => (inDegree.get(n.id) || 0) === 0)

  while (queue.length > 0) {
    const u = queue.shift()
    sorted.push(u)

    const children = edges.filter(e => e.source === u.id)
    for (const edge of children) {
      inDegree.set(edge.target, inDegree.get(edge.target) - 1)
      if (inDegree.get(edge.target) === 0) {
        queue.push(nodes.find(n => n.id === edge.target))
      }
    }
  }

  if (sorted.length !== nodes.length) {
    throw new Error("Circular dependency detected in pipeline!")
  }
  
  return sorted
}
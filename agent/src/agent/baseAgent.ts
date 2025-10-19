import { type Tables } from "@mincy/shared";

class Agent {
  id: string;
  name: string;
  capacity: number;
  server: string = "localhost:3001"
  pollInterval: number = 3000; 
  heartbeatId : NodeJS.Timeout | null = null;
  workdir: string;

  constructor(id: string, name: string, capacity: number, workdir: string){
    this.id = id; 
    this.name = name; 
    this.capacity = capacity; 
    this.workdir = workdir
  }


  async register(){
    const res = await fetch(`${this.server}/api/agents/register`)
    if (!res.ok){
      throw Error("Agent failed to register")
    }
    const response = await res.json()
    console.log(response)
    this.startHeartBeat();

  }


  execute(workflow: Tables<"Workflow">){
    throw Error("This is the base agent, something must've gone really bad to get here")
  }


  async heartbeat(){
    const res = await fetch(`${this.server}/api/agents/heartbeat`)
    if (!res.ok){
      console.log("Warning: failed to send heart beat")
    }
    const response = await res.json();
    console.log(response)
  }


  startHeartBeat(){
    if (this.heartbeatId) return;
    this.heartbeatId = setInterval(() =>
    this.heartbeat(), this.pollInterval)    
  }

  stop(){
    if(this.heartbeatId){
      clearInterval(this.heartbeatId)
      this.heartbeatId = null;
    }
  }
}

export default Agent;
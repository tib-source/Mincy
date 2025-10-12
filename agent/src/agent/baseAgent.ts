export interface Agent {
  id: string;
  name: string;
  capacity: number;

  // Methods
  register(): Promise<void>;
//   executeJob(job: Job): Promise<void>;
  heartbeat(): Promise<void>;
}

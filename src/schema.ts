export type ServiceAPISchema = {
  name: string;
  id: string;
  type: string;
}

export type StatAPISchema = {
  bandwidth: number;
  requests: number;
  compute_requests: number;
  compute_request_time_billed_ms: number;
}

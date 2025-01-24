export default interface Event {
  id: number
  name: string
  started_at: string
  ended_at?: string
  properties?: Record<string, unknown>
}

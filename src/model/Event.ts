export default interface Event {
  id: number
  name: string
  started_at: string
  ended_at: string | undefined
  properties?: Record<string, unknown>
}

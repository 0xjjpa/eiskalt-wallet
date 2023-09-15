import {
  RealtimeChannel,
  createClient
} from '@supabase/supabase-js'

const URL = 'https://bjqqlawbqcrppntvfkjk.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqcXFsYXdicWNycHBudHZma2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ1MzM5NTcsImV4cCI6MjAxMDEwOTk1N30.JdfgtOgpxs-H38DwHoZ2kkG0CHQeo_CCKMcrqc0ZgYk'

export class Supabase {
  private channel: RealtimeChannel

  constructor(channelId: string) {
    const client = createClient(URL, ANON_KEY);
    this.channel = client.channel(channelId);
  }

  public listen(event: string, callback: (payload: any) => void) {
    this.channel.on('broadcast', { event }, callback)
      .subscribe()
  }

  public send(event: string, payload: any) {
    this.channel.send({ type: 'broadcast', event, payload })
  }
}
import { createClient } from '@/lib/supabase/client'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  recipient_id?: string
  content: string
  message_type: string
  attachment_url?: string
  status: 'SENT' | 'DELIVERED' | 'READ'
  created_at: string
  updated_at: string
}

export interface ConversationData {
  id: string
  name?: string
  is_group: boolean
  avatar_url?: string
  created_at: string
  updated_at: string
}

export class RealtimeMessaging {
  private supabase = createClient()
  private channels: Map<string, RealtimeChannel> = new Map()

  subscribeToConversation(
    conversationId: string,
    onMessage: (message: Message) => void,
    onError?: (error: Error) => void
  ): () => void {
    const channelName = `conversation:${conversationId}`
    
    if (this.channels.has(channelName)) {
      console.warn(`Already subscribed to ${channelName}`)
      return () => this.unsubscribe(channelName)
    }

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const message = payload.new as Message
          onMessage(message)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const message = payload.new as Message
          onMessage(message)
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to ${channelName}`)
        } else if (status === 'CHANNEL_ERROR') {
          onError?.(new Error(`Failed to subscribe to ${channelName}`))
        }
      })

    this.channels.set(channelName, channel)

    return () => this.unsubscribe(channelName)
  }

  subscribeToUserPresence(
    userId: string,
    onPresenceChange: (presence: any) => void
  ): () => void {
    const channelName = `presence:${userId}`

    const channel = this.supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        onPresenceChange(state)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences)
      })
      .subscribe()

    this.channels.set(channelName, channel)

    return () => this.unsubscribe(channelName)
  }

  async broadcastTyping(conversationId: string, userId: string, isTyping: boolean) {
    const channelName = `conversation:${conversationId}`
    const channel = this.channels.get(channelName)

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId, isTyping },
      })
    }
  }

  subscribeToTyping(
    conversationId: string,
    onTypingChange: (userId: string, isTyping: boolean) => void
  ): () => void {
    const channelName = `conversation:${conversationId}:typing`

    const channel = this.supabase
      .channel(channelName)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        onTypingChange(payload.userId, payload.isTyping)
      })
      .subscribe()

    this.channels.set(channelName, channel)

    return () => this.unsubscribe(channelName)
  }

  private unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
      console.log(`Unsubscribed from ${channelName}`)
    }
  }

  unsubscribeAll() {
    this.channels.forEach((_, channelName) => {
      this.unsubscribe(channelName)
    })
  }
}

export const realtimeMessaging = new RealtimeMessaging()






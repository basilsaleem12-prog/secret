'use client'

import { useState, useEffect, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Smile
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessagingClientProps {
  userId: string
  userEmail: string
}

interface Conversation {
  id: string
  name: string
  lastMessage?: string
  timestamp?: string
  unreadCount: number
  avatar?: string
  isOnline?: boolean
}

interface Message {
  id: string
  content: string
  senderId: string
  timestamp: string
  isOwn: boolean
}

export function MessagingClient({ userId, userEmail }: MessagingClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedConversation) return
    
    const trimmedMessage = newMessage.trim()
    
    if (!trimmedMessage) return
    
    if (trimmedMessage.length > 2000) {
      alert('Message must be less than 2000 characters')
      return
    }

    const message: Message = {
      id: Date.now().toString(),
      content: trimmedMessage,
      senderId: userId,
      timestamp: new Date().toISOString(),
      isOwn: true,
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r bg-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#1E3A8A]" />
              Messages
            </h2>
            <Button size="sm" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start a new conversation to begin messaging
              </p>
              <Button className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                <Plus className="h-4 w-4 mr-2" />
                New Message
              </Button>
            </div>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation.id)}
                className={cn(
                  'w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b',
                  selectedConversation === conversation.id && 'bg-blue-50 hover:bg-blue-50'
                )}
              >
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-semibold">
                    {conversation.name.charAt(0)}
                  </div>
                  {conversation.isOnline && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm truncate">
                      {conversation.name}
                    </span>
                    {conversation.timestamp && (
                      <span className="text-xs text-gray-500">
                        {conversation.timestamp}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600 truncate">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge className="bg-[#1E3A8A] text-white text-xs px-2">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-semibold">
                  U
                </div>
                <div>
                  <h3 className="font-semibold">User Name</h3>
                  <p className="text-xs text-gray-600">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Video className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Send a message to start the conversation</p>
                  </div>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex',
                      message.isOwn ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div
                      className={cn(
                        'max-w-[70%] rounded-lg px-4 py-2',
                        message.isOwn
                          ? 'bg-[#1E3A8A] text-white'
                          : 'bg-white border'
                      )}
                    >
                      <p className="text-sm">{message.content}</p>
                      <span className={cn(
                        'text-xs mt-1 block',
                        message.isOwn ? 'text-blue-100' : 'text-gray-500'
                      )}>
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white p-4 border-t">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button type="button" size="sm" variant="ghost">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button type="button" size="sm" variant="ghost">
                  <Smile className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  maxLength={2000}
                />
                <Button 
                  type="submit"
                  className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MessageSquare className="h-24 w-24 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-sm">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}






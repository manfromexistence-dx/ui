import { useState, useCallback } from 'react'
import { useChatInputStore } from '@/store/chat-store'
import { useAIModelStore } from '@/store/ai-model-store'
import { googleGenAIService } from '@/services/google-genai-service'
import { Message } from '@/types/chat'
import { v4 as uuidv4 } from 'uuid'

interface UseChatOptions {
  onMessageAdded?: (message: Message) => void
  onError?: (error: string) => void
}

export function useChat(options: UseChatOptions = {}) {
  const { onMessageAdded, onError } = options
  
  const {
    chatState,
    addMessage,
    updateMessage,
    setLoading,
    setError,
    isStreaming,
    setIsStreaming,
    streamingMessageId,
    setStreamingMessageId
  } = useChatInputStore()
  
  const { currentModel } = useAIModelStore()

  const sendMessage = useCallback(async (content: string, useStreaming = true) => {
    if (!content.trim()) return

    setError(null)
    setLoading(true)

    // Create user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString()
    }

    // Add user message to chat
    addMessage(userMessage)
    onMessageAdded?.(userMessage)

    // Create assistant message placeholder
    const assistantMessageId = uuidv4()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    }

    addMessage(assistantMessage);
    try {
      const messages = [...chatState.messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      // Convert messages to Google GenAI format
      const formattedMessages = googleGenAIService.formatMessagesForAPI(messages)

      if (useStreaming) {
        setIsStreaming(true)
        setStreamingMessageId(assistantMessageId)

        // Use direct Google GenAI service call for much faster response
        let accumulatedContent = ''
        
        await googleGenAIService.generateContentStream(
          currentModel,
          formattedMessages,
          (chunk: string) => {
            // Real-time streaming update
            accumulatedContent += chunk
            updateMessage(assistantMessageId, {
              content: accumulatedContent
            })
          }
        )
        
        // Update the final message content
        assistantMessage.content = accumulatedContent
      } else {
        // Non-streaming request - use direct service call
        const response = await googleGenAIService.generateContent(
          currentModel,
          formattedMessages
        )

        updateMessage(assistantMessageId, {
          content: response.text
        })
        
        // Update the assistant message content
        assistantMessage.content = response.text
      }

      const finalAssistantMessage = {
        ...assistantMessage,
        content: assistantMessage.content
      }
      
      onMessageAdded?.(finalAssistantMessage)

    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message'
      
      setError(errorMessage)
      onError?.(errorMessage)
      
      // Remove the failed assistant message
      updateMessage(assistantMessageId, {
        content: `Error: ${errorMessage}`
      })
    } finally {
      setLoading(false)
      setIsStreaming(false)
      setStreamingMessageId(null)
    }
  }, [
    chatState.messages,
    currentModel,
    addMessage,
    updateMessage,
    setLoading,
    setError,
    setIsStreaming,
    setStreamingMessageId,
    onMessageAdded,
    onError
  ])

  const clearChat = useCallback(() => {
    const { clearMessages } = useChatInputStore.getState()
    clearMessages()
  }, [])

  return {
    messages: chatState.messages,
    isLoading: chatState.isLoading,
    error: chatState.error,
    isStreaming,
    streamingMessageId,
    sendMessage,
    clearChat
  }
}

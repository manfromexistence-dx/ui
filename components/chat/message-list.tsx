import React, { useLayoutEffect, useRef, useState, useCallback, useEffect } from "react"
import { Message } from "@/types/chat"
import { ChatMessage } from "@/components/chat/chat-message"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useChatInputStore } from "@/store/chat-store"

interface MessageListProps {
  chatId: string | null
  messages: Message[]
  messagesEndRef: React.RefObject<HTMLDivElement>
  isThinking?: boolean
  selectedAI?: string
}

export function MessageList({
  chatId,
  messages,
  messagesEndRef,
  isThinking = false,
  selectedAI = "",
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [visibleMessages, setVisibleMessages] = useState<Message[]>(messages)
  const [localShowThinking, setLocalShowThinking] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const previousScrollHeight = useRef<number>(0)
  
  const { showThinking, setShowThinking } = useChatInputStore()

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight + 2000
      setShowScrollButton(false)
    }
  }, [])

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      const nearBottom = scrollHeight - scrollTop - clientHeight < 100
      setShowScrollButton(!nearBottom)
    }
  }, [])

  // Synchronize local state with prop and global state
  useEffect(() => {
    const shouldShowThinking = isThinking || showThinking
    
    if (shouldShowThinking) {
      setLocalShowThinking(true)
      setIsFadingOut(false)
      
      const lastMessage = messages[messages.length - 1]
      const needsThinkingIndicator = lastMessage && lastMessage.role === "user"
      
      if (needsThinkingIndicator) {
        setVisibleMessages([
          ...messages,
          {
            id: "thinking-placeholder",
            content: "thinking",
            role: "assistant",
            timestamp: Date.now().toString(),
          },
        ])
      } else {
        setVisibleMessages([...messages])
      }
    } else if (localShowThinking) {
      setIsFadingOut(true)
    } else {
      setVisibleMessages([...messages])
    }
  }, [isThinking, showThinking, messages, localShowThinking])

  const handleTransitionEnd = useCallback(() => {
    if (isFadingOut) {
      setLocalShowThinking(false)
      setIsFadingOut(false)
      setVisibleMessages([...messages])
      setShowThinking(false)
    }
  }, [isFadingOut, messages, setShowThinking])

  useLayoutEffect(() => {
    scrollToBottom()
  }, [visibleMessages, localShowThinking, scrollToBottom])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      if (container) {
        const currentScrollHeight = container.scrollHeight
        
        if (currentScrollHeight > previousScrollHeight.current + 10) {
          setTimeout(() => {
            scrollToBottom()
            setTimeout(scrollToBottom, 100)
          }, 50)
        }
        previousScrollHeight.current = currentScrollHeight
      }
    })

    observer.observe(container)
    previousScrollHeight.current = container.scrollHeight

    return () => {
      observer.disconnect()
    }
  }, [scrollToBottom])

  useEffect(() => {
    const forceScrollToBottom = () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight + 5000
        
        setTimeout(() => {
          if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight + 5000
        }, 50)
        
        setTimeout(() => {
          if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight + 5000
        }, 150)
        
        setTimeout(() => {
          if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight + 5000
        }, 300)
        
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight + 5000
            setShowScrollButton(false)
          }
        }, 500)
      }
    }

    const handleImageLoad = () => {
      forceScrollToBottom()
    }

    const setupImageLoadListeners = () => {
      if (containerRef.current) {
        const images = containerRef.current.querySelectorAll("img")
        
        images.forEach(img => {
          if (img.complete) {
            setTimeout(forceScrollToBottom, 100)
          } else {
            img.addEventListener("load", handleImageLoad)
          }
          
          img.addEventListener("error", handleImageLoad)
        })
      }
    }

    setupImageLoadListeners()
    setTimeout(setupImageLoadListeners, 300)
    
    const currentContainer = containerRef.current
    return () => {
      if (currentContainer) {
        const images = currentContainer.querySelectorAll("img")
        images.forEach(img => {
          img.removeEventListener("load", handleImageLoad)
          img.removeEventListener("error", handleImageLoad)
        })
      }
    }
  }, [messages])

  useEffect(() => {
    const ref = containerRef.current
    if (!ref) return
    ref.addEventListener("scroll", handleScroll)
    return () => ref.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  useEffect(() => {
    const handleResize = () => setTimeout(scrollToBottom, 100)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [scrollToBottom])

  return (
    <div
      ref={containerRef}
      className="message-list-container relative h-full flex-1 overflow-y-auto px-1 pb-32 pt-16 md:pb-14"
      style={{ scrollBehavior: "smooth" }}
    >
      <div className="w-full space-y-4 md:px-4 lg:mx-auto lg:w-[90%] lg:px-0 xl:w-1/2">
        {visibleMessages.map((message, index) => (
          <ChatMessage
            key={`${message.id || index}-${message.timestamp}`}
            message={message}
            chatId={chatId}
            index={index}
            isFadingOut={isFadingOut && message.content === "thinking"}
            onTransitionEnd={message.content === "thinking" ? handleTransitionEnd : undefined}
            selectedAI={selectedAI}
          />
        ))}
        <div ref={messagesEndRef} className="h-20 w-full" />
      </div>
    </div>
  )
}

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Minus, Send } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import api from '../utils/api'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [showPulse, setShowPulse] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const location = useLocation()

  // Extract project ID from URL
  const projectId = location.pathname.match(/\/research\/([^/]+)/)?.[1] || null

  // Session storage key
  const storageKey = `chat_history_${projectId || 'global'}`

  // Load chat history from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem(storageKey)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setMessages(parsed.messages || [])
        setSuggestions(parsed.suggestions || [])
      } catch {}
    }
  }, [storageKey])

  // Save chat history to sessionStorage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(storageKey, JSON.stringify({ messages, suggestions }))
    }
  }, [messages, suggestions, storageKey])

  // Stop pulse after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, isMinimized])

  const sendMessage = async (text) => {
    const messageText = text || input.trim()
    if (!messageText || isLoading) return

    const userMessage = { role: 'user', content: messageText }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setSuggestions([])
    setIsLoading(true)

    try {
      const history = newMessages.slice(-20).map(m => ({ role: m.role, content: m.content }))
      const res = await api.post('/api/chat/message', {
        message: messageText,
        project_id: projectId,
        history: history.slice(0, -1), // exclude current message from history
      })

      const assistantMessage = { role: 'assistant', content: res.data.reply }
      setMessages([...newMessages, assistantMessage])
      setSuggestions(res.data.suggestions || [])
    } catch (err) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }
      setMessages([...newMessages, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion)
  }

  // Simple markdown: bold and lists
  const renderMarkdown = (text) => {
    const lines = text.split('\n')
    return lines.map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Inline code
      processed = processed.replace(/`(.*?)`/g, '<code class="bg-[#f0f0f0] dark:bg-[#2a2a2a] px-1 rounded text-sm">$1</code>')
      // List items
      if (processed.match(/^[-*•]\s/)) {
        processed = '• ' + processed.replace(/^[-*•]\s/, '')
        return <p key={i} className="ml-3 my-0.5" dangerouslySetInnerHTML={{ __html: processed }} />
      }
      // Numbered list
      if (processed.match(/^\d+\.\s/)) {
        return <p key={i} className="ml-3 my-0.5" dangerouslySetInnerHTML={{ __html: processed }} />
      }
      // Empty line = spacing
      if (!processed.trim()) return <br key={i} />
      return <p key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: processed }} />
    })
  }

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          >
            {showPulse && (
              <span className="absolute inset-0 rounded-full bg-[#2563eb] animate-ping opacity-40" />
            )}
            <MessageCircle size={24} className="relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={isMinimized
              ? { opacity: 1, y: 0, scale: 1, height: 56 }
              : { opacity: 1, y: 0, scale: 1, height: 'auto' }
            }
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#1a1a1a] border border-[#eee] dark:border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: isMinimized ? 56 : 'min(600px, calc(100vh - 6rem))' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#eee] dark:border-[#2a2a2a] bg-[#fafafa] dark:bg-[#151515] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm font-medium dark:text-white">Research Assistant</span>
                {projectId && (
                  <span className="text-[10px] bg-[#2563eb]/10 text-[#2563eb] px-1.5 py-0.5 rounded-full">
                    Project
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
                >
                  <Minus size={14} className="text-[#888]" />
                </button>
                <button
                  onClick={() => { setIsOpen(false); setIsMinimized(false) }}
                  className="p-1.5 hover:bg-[#f0f0f0] dark:hover:bg-[#2a2a2a] rounded-lg transition-colors"
                >
                  <X size={14} className="text-[#888]" />
                </button>
              </div>
            </div>

            {/* Messages */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 bg-[#2563eb]/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <MessageCircle size={20} className="text-[#2563eb]" />
                      </div>
                      <p className="text-sm font-medium dark:text-white">How can I help?</p>
                      <p className="text-xs text-[#888] mt-1">
                        {projectId
                          ? 'Ask me anything about your research project'
                          : 'Ask me about research methods, papers, or writing'}
                      </p>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-[#2563eb] text-white rounded-br-md'
                            : 'bg-[#f5f5f5] dark:bg-[#222] border border-[#eee] dark:border-[#333] text-[#333] dark:text-[#ddd] rounded-bl-md'
                        }`}
                      >
                        {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {/* Typing indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-[#f5f5f5] dark:bg-[#222] border border-[#eee] dark:border-[#333] px-4 py-3 rounded-2xl rounded-bl-md flex gap-1.5">
                        <span className="w-2 h-2 bg-[#888] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-[#888] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-[#888] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </motion.div>
                  )}

                  {/* Suggestions */}
                  {suggestions.length > 0 && !isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-wrap gap-1.5 pt-1"
                    >
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className="text-xs px-3 py-1.5 bg-[#2563eb]/5 hover:bg-[#2563eb]/10 text-[#2563eb] border border-[#2563eb]/20 rounded-full transition-colors text-left"
                        >
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-[#eee] dark:border-[#2a2a2a] p-3 shrink-0">
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask about your research..."
                      rows={1}
                      className="flex-1 resize-none bg-[#f5f5f5] dark:bg-[#222] border border-[#eee] dark:border-[#333] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-[#2563eb] dark:focus:border-[#2563eb] transition-colors placeholder:text-[#aaa] dark:text-[#ddd] max-h-[100px]"
                      style={{ minHeight: '40px' }}
                      onInput={(e) => {
                        e.target.style.height = '40px'
                        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px'
                      }}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || isLoading}
                      className="w-9 h-9 bg-[#2563eb] hover:bg-[#1d4ed8] disabled:bg-[#ccc] dark:disabled:bg-[#333] text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

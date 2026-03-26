import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { askStockQuestion, reindexStock, checkRAGHealth } from '../services/ragService';
import {
  Bot,
  Send,
  RefreshCw,
  Loader2,
  AlertCircle,
  Sparkles,
  User,
  MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Which products are out of stock?",
  "What needs urgent reordering?",
  "Show Electronics stock levels",
  "What is my total inventory value?",
  "Which items are below reorder point?",
  "Show low stock items across all categories",
];

export function StockAIChat() {
  const { user, isLoggedIn } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [healthStatus, setHealthStatus] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check health on mount
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const count = await checkRAGHealth();
        setHealthStatus(count);
      } catch (err) {
        console.error('Failed to check RAG health:', err);
        setHealthStatus(0);
      }
    };
    if (isLoggedIn) {
      fetchHealth();
    }
  }, [isLoggedIn]);

  const handleSendMessage = async (question: string) => {
    if (!question.trim() || isLoading || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Use user.id if available, otherwise fall back to user.email
      const ownerId = user.id || user.email;

      // Issue 3: 20s timeout so users aren't left hanging on cold starts
      const TIMEOUT_MS = 20_000;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('__TIMEOUT__')), TIMEOUT_MS)
      );

      const answer = await Promise.race([
        askStockQuestion(question.trim(), ownerId),
        timeoutPromise,
      ]);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Failed to get answer:', err);

      // Issue 3: friendly message when the request times out
      const errorMessage =
        err.message === '__TIMEOUT__'
          ? 'The assistant is taking longer than usual. The server may be waking up — please try again in a moment.'
          : err.response?.data?.detail || 'Failed to get response. Please try again.';

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReindex = async () => {
    if (isReindexing) return;

    setIsReindexing(true);
    try {
      const message = await reindexStock();
      toast.success(message);
      // Refresh health after reindex
      const count = await checkRAGHealth();
      setHealthStatus(count);
    } catch (err: any) {
      console.error('Failed to reindex:', err);
      const errorMessage = err.response?.data?.detail || 'Failed to refresh data';
      toast.error(errorMessage);
    } finally {
      setIsReindexing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Card className="flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-500/10 to-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Stock AI Assistant
              <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span
                className={`w-2 h-2 rounded-full ${healthStatus === null
                    ? 'bg-gray-400'
                    : healthStatus > 0
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
              />
              {healthStatus === null
                ? 'Checking...'
                : healthStatus > 0
                  ? `${healthStatus} items indexed`
                  : 'No data indexed'}
            </div>
          </div>
        </div>

        <button
          onClick={handleReindex}
          disabled={isReindexing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isReindexing ? 'animate-spin' : ''}`} />
          {isReindexing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Suggested Questions */}
      {messages.length === 0 && (
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(question)}
                disabled={isLoading}
                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300 transition-colors disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">Ask me anything about your inventory!</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex items-start gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                      ? 'bg-teal-500'
                      : 'bg-gradient-to-br from-purple-500 to-indigo-600'
                    }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`px-4 py-2.5 rounded-2xl ${message.role === 'user'
                      ? 'bg-teal-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                    }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${message.role === 'user'
                        ? 'text-teal-100'
                        : 'text-gray-400 dark:text-gray-500'
                      }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm">
              <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Thinking...
              </span>
            </div>
          </motion.div>
        )}

        {/* Error message */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask about your inventory..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}

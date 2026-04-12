import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  MessageSquare,
  RotateCcw
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

export function StockAIChat({ className = '' }: { className?: string } = {}) {
  const { user, isLoggedIn } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);
  const [healthStatus, setHealthStatus] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check health on mount — auto-reindex if collection is empty
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const count = await checkRAGHealth();
        setHealthStatus(count);

        // 1a: Auto-reindex when collection_count is 0
        if (count === 0) {
          setIsSyncing(true);
          try {
            await reindexStock();
            const newCount = await checkRAGHealth();
            setHealthStatus(newCount);
          } catch (reindexErr) {
            console.error('Auto-reindex failed:', reindexErr);
          } finally {
            setIsSyncing(false);
          }
        }
      } catch (err) {
        console.error('Failed to check RAG health:', err);
        setHealthStatus(0);
        // Even on health-check failure, try reindex
        setIsSyncing(true);
        try {
          await reindexStock();
          const newCount = await checkRAGHealth();
          setHealthStatus(newCount);
        } catch (reindexErr) {
          console.error('Auto-reindex failed:', reindexErr);
        } finally {
          setIsSyncing(false);
        }
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
    setIsTimeout(false);
    setLastQuestion(question.trim());

    try {
      const ownerId = user.id || user.email;

      // 1b: 60-second timeout
      const TIMEOUT_MS = 60_000;
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

      if (err.message === '__TIMEOUT__') {
        // 1b: Specific timeout message with retry button
        setIsTimeout(true);
        setError('Server is waking up. Please try again in 30 seconds.');
      } else {
        const errorMessage =
          err.response?.data?.detail || 'Failed to get response. Please try again.';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Retry handler for timeout
  const handleRetry = () => {
    if (lastQuestion) {
      handleSendMessage(lastQuestion);
    }
  };

  const handleReindex = async () => {
    if (isReindexing) return;

    setIsReindexing(true);
    try {
      const message = await reindexStock();
      toast.success(message);
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
    <Card className={`flex flex-col bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-500/10 to-green-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              Stock AI Assistant
              <Sparkles className="w-4 h-4 text-green-500" />
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSyncing
                    ? 'bg-green-500 animate-pulse'
                    : healthStatus === null
                      ? 'bg-gray-400'
                      : healthStatus > 0
                        ? 'bg-green-500'
                        : 'bg-green-500'
                }`}
              />
              {isSyncing
                ? 'Syncing your inventory data, please wait...'
                : healthStatus === null
                  ? 'Checking...'
                  : healthStatus > 0
                    ? `${healthStatus} items indexed`
                    : 'Syncing your inventory data, please wait...'}
            </div>
          </div>
        </div>

        <button
          onClick={handleReindex}
          disabled={isReindexing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
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
                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-300 transition-colors disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
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
                      ? 'bg-green-500'
                      : 'bg-gradient-to-br from-green-500 to-green-600'
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
                      ? 'bg-green-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-sm'
                    }`}
                >
                  {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div className="text-sm markdown-body prose dark:prose-invert max-w-none 
                        prose-p:leading-relaxed prose-pre:my-0 prose-ul:my-1 prose-li:my-0 
                        prose-table:border-collapse prose-table:w-full prose-th:bg-gray-200 
                        dark:prose-th:bg-gray-600 prose-th:px-3 prose-th:py-2 prose-td:border 
                        prose-td:border-gray-300 dark:prose-td:border-gray-600 prose-td:px-3 
                        prose-td:py-1">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  <p
                    className={`text-xs mt-1 ${message.role === 'user'
                        ? 'text-green-100'
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

        {/* 1c: Loading indicator — "Analyzing your inventory..." */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm">
              <Loader2 className="w-4 h-4 animate-spin text-green-500" />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Analyzing your inventory...
              </span>
            </div>
          </motion.div>
        )}

        {/* Error message with retry button for timeout */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
            {/* 1b: Retry button on timeout */}
            {isTimeout && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 self-start ml-2 px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Retry
              </button>
            )}
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
            className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="p-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

import React, { useState, useRef, useEffect } from 'react';
import { chat } from '../../services/ai';
import toast from 'react-hot-toast';
import { MessageSquareText, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ChatPanel() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async () => {
        const text = input.trim();
        if (!text || loading) return;

        const userMsg = { role: 'user', content: text };
        const updated = [...messages, userMsg];
        
        setMessages(updated);
        setInput('');
        setLoading(true);

        try {
            const res = await chat(updated);
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
        } catch {
            toast.error('Chat failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating button */}
            <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-[rgb(var(--accent-primary))] to-blue-500 text-white rounded-full shadow-xl flex items-center justify-center hover:shadow-2xl z-50 transition-shadow"
            >
                <AnimatePresence mode="wait">
                    {open ? (
                        <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                            <MessageSquareText className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Chat panel */}
            <AnimatePresence>
                {open && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[rgb(var(--accent-primary))] text-white">
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5 opacity-90" />
                                <span className="font-semibold text-sm tracking-wide">StockSense AI</span>
                            </div>
                            <button 
                                onClick={() => setMessages([])}
                                className="text-xs text-white/70 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10"
                            >
                                Clear
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
                                        <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">How can I help you today?</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Ask anything about your stock.<br/>
                                        e.g., "How many units of rice do I have?"
                                    </p>
                                </div>
                            )}

                            {messages.map((m, i) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={i} 
                                    className={`flex items-end gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {m.role === 'assistant' && (
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex flex-shrink-0 items-center justify-center">
                                            <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed shadow-sm ${
                                        m.role === 'user' 
                                            ? 'bg-[rgb(var(--accent-primary))] text-white rounded-br-sm' 
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm'
                                    }`}>
                                        {m.content}
                                    </div>
                                </motion.div>
                            ))}

                            {loading && (
                                <div className="flex justify-start items-end gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex flex-shrink-0 items-center justify-center">
                                        <Bot className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                                        <div className="flex gap-1">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} className="h-1" />
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <div className="flex items-end gap-2">
                                <textarea
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSend();
                                        }
                                    }}
                                    placeholder="Ask about your stock..."
                                    className="flex-1 max-h-32 min-h-[44px] text-sm bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent-primary))]/50 resize-none"
                                    rows={1}
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    className="w-[44px] h-[44px] flex items-center justify-center bg-[rgb(var(--accent-primary))] text-white rounded-xl shadow-sm hover:bg-[rgb(var(--accent-primary))]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-[10px] text-gray-400">StockSense AI can make mistakes. Check important info.</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

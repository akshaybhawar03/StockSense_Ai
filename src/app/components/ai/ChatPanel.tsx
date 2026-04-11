import { useState, useRef, useEffect } from 'react';
import { chat } from '../../services/ai';
import toast from 'react-hot-toast';

export function ChatPanel() {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

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
        } catch (err) {
            console.error('Chat error:', err);
            toast.error('Chat failed. Check backend connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Toggle button */}
            <button
                onClick={() => setOpen(o => !o)}
                className='fixed bottom-6 right-6 w-12 h-12 bg-green-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-green-700 z-50 text-lg'
            >
                {open ? ' ✕ ' : ' 💬 '}
            </button>

            {open && (
                <div className='fixed bottom-24 right-6 w-80 h-[480px] bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl flex flex-col z-50'>
                    {/* Header */}
                    <div className='flex items-center justify-between px-4 py-3 border-b border-gray-700/50'>
                        <div>
                            <p className='text-sm font-medium text-white'>StockSense AI</p>
                            <p className='text-xs text-gray-400'>Ask about your inventory</p>
                        </div>
                        <button onClick={() => setMessages([])} className='text-xs text-gray-500 hover:text-gray-300'>
                            Clear
                        </button>
                    </div>

                    {/* Messages */}
                    <div className='flex-1 overflow-y-auto p-3 space-y-3'>
                        {messages.length === 0 && (
                            <div className='text-center mt-8'>
                                <p className='text-xs text-gray-500 leading-relaxed'>
                                    Ask anything about your stock.<br />
                                    e.g. 'How many units of rice do I have?'
                                </p>
                            </div>
                        )}
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'bg-green-600 text-white rounded-br-sm' : 'bg-gray-800 text-gray-200 rounded-bl-sm'}`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className='flex justify-start'>
                                <div className='bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-2'>
                                    <span className='text-gray-400 text-sm animate-pulse'>...</span>
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <div className='p-3 border-t border-gray-700/50 flex gap-2'>
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder='Ask about your stock...'
                            className='flex-1 text-sm bg-gray-800 border border-gray-700/50 text-gray-200 rounded-xl px-3 py-2 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500'
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className='bg-green-600 text-white px-3 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-40'
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

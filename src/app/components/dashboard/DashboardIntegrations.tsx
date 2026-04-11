import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { MessageCircle, CheckCircle2 } from 'lucide-react';

interface Integration {
    id: string;
    name: string;
    logoUrl?: string;
    isText?: boolean;
    description?: string;
    connected: boolean;
    showRequest?: boolean;
}

export function DashboardIntegrations() {
    const [integrations, setIntegrations] = useState<Integration[]>([
        {
            id: 'shopify',
            name: 'Shopify',
            logoUrl: '/logos/shopify.svg', // Assumes existing from earlier
            connected: false
        },
        {
            id: 'tata-cliq',
            name: 'Tata CLiQ',
            isText: true,
            description: 'Tata CLiQ is an e-commerce company, providing products such as Electronics, Fashion, and more.',
            showRequest: true,
            connected: false
        },
        {
            id: 'meesho',
            name: 'meesho',
            logoUrl: '/logos/meesho.svg',
            connected: false
        },
        {
            id: 'flipkart',
            name: 'Flipkart',
            logoUrl: '/logos/flipkart.svg', // Assumes existing from earlier
            connected: false
        },
        {
            id: 'cred',
            name: 'CRED',
            logoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/27/CRED_logo.png', // Fallback, will style text if fails
            isText: true,
            connected: false
        },
        {
            id: 'inorbit',
            name: 'Inorbit',
            logoUrl: 'https://www.inorbit.in/images/inorbit-logo.png', // Temporary
            isText: true,
            connected: false
        },
        {
            id: 'nykaa',
            name: 'NYKAA FASHION',
            isText: true,
            connected: false
        },
        {
            id: 'jiomart',
            name: 'JioMart',
            isText: true,
            connected: false
        }
    ]);

    const toggleConnection = (id: string) => {
        setIntegrations(prev => prev.map(inv =>
            inv.id === id ? { ...inv, connected: !inv.connected } : inv
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Integrations</h1>
                    <p className="text-gray-500">Connect your sales channels and platforms to sync your inventory automatically.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {integrations.map((integration) => (
                    <Card
                        key={integration.id}
                        className={`relative group h-48 sm:h-56 flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 border rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden ${integration.id === 'tata-cliq' ? 'bg-[#eef6fa] dark:bg-green-900/10' : 'border-gray-100 dark:border-gray-700'
                            }`}
                        onClick={() => toggleConnection(integration.id)}
                    >
                        {/* Tata Cliq Special Card */}
                        {integration.id === 'tata-cliq' ? (
                            <div className="text-center w-full">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed px-2">
                                    {integration.description}
                                </p>
                                <button className="text-[#38bdf8] hover:text-[#0284c7] font-semibold text-sm transition-colors">
                                    Request for Integration
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Rendering other logos/text */}
                                <div className="flex-1 flex items-center justify-center w-full">
                                    {integration.id === 'shopify' && (
                                        <div className="flex items-center gap-2">
                                            <img src={integration.logoUrl} alt="Shopify" className="h-10 w-auto object-contain dark:invert" />
                                            <span className="text-2xl font-bold tracking-tight text-black dark:text-white">shopify</span>
                                        </div>
                                    )}
                                    {integration.id === 'meesho' && (
                                        <div className="flex items-center justify-center p-2 w-full h-full">
                                            <img src="/logos/meesho.svg" alt="Meesho" className="max-w-[120px] max-h-12 w-auto h-auto object-contain" />
                                        </div>
                                    )}
                                    {integration.id === 'flipkart' && (
                                        <div className="flex items-center">
                                            <span className="text-[#047BD5] font-bold text-2xl italic mr-1">Flipkart</span>
                                            <img src={integration.logoUrl} alt="Flipkart" className="h-8 w-auto object-contain" />
                                        </div>
                                    )}
                                    {integration.id === 'cred' && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 border-4 border-black dark:border-white rounded-lg flex items-center justify-center relative inner-shadow">
                                                <div className="w-4 h-4 rounded-full border-[3px] border-black dark:border-white absolute top-1.5 left-1.5"></div>
                                                <div className="absolute bottom-1 right-1 w-2 h-2 bg-black dark:bg-white rounded-full"></div>
                                            </div>
                                            <span className="font-extrabold text-2xl tracking-[0.2em] text-black dark:text-white">CRED</span>
                                        </div>
                                    )}
                                    {integration.id === 'inorbit' && (
                                        <div className="flex flex-col items-center">
                                            <div className="bg-[#1f378a] text-white px-3 py-1.5 rounded flex items-center gap-2 mb-1">
                                                <div className="w-6 h-6 rounded-full border-2 border-green-400 flex items-center justify-center relative">
                                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                                    <div className="absolute top-0 right-0 w-1 h-1 bg-white rounded-full"></div>
                                                </div>
                                                <span className="font-bold text-xl tracking-wider">Inorbit</span>
                                            </div>
                                            <span className="text-[10px] text-gray-500 italic">Come live an Inorbit Experience</span>
                                        </div>
                                    )}
                                    {integration.id === 'nykaa' && (
                                        <div className="flex flex-col items-center">
                                            <span className="font-black text-4xl tracking-tighter text-black dark:text-white" style={{ fontFamily: 'Impact, sans-serif' }}>NYKAA</span>
                                            <span className="text-sm tracking-[0.3em] font-medium text-black dark:text-white mt-0.5">FASHION</span>
                                        </div>
                                    )}
                                    {integration.id === 'jiomart' && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 bg-[#e31e24] rounded-full flex items-center justify-center">
                                                <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                                                    <path d="M19 6h-2c0-2.8-2.2-5-5-5S7 3.2 7 6H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.7 0 3 1.3 3 3H9c0-1.7 1.3-3 3-3z" />
                                                </svg>
                                            </div>
                                            <span className="font-bold text-2xl text-black dark:text-white">JioMart</span>
                                        </div>
                                    )}
                                </div>

                                {/* Overlay / Status */}
                                <div className={`absolute inset-0 bg-black/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px] ${integration.connected ? 'opacity-100 bg-green-500/10 dark:bg-green-500/20' : ''}`}>
                                    <Button
                                        variant={integration.connected ? "outline" : "default"}
                                        className={integration.connected ? "border-green-500 text-green-600 dark:text-green-400 bg-white dark:bg-gray-900" : "bg-[rgb(var(--accent-primary))] text-white"}
                                        onClick={(e) => { e.stopPropagation(); toggleConnection(integration.id); }}
                                    >
                                        {integration.connected ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Connected
                                            </>
                                        ) : 'Connect Account'}
                                    </Button>
                                    {integration.connected && (
                                        <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">Active Sync</span>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Chat / Support Icon on Bottom Right (like Profit Margin Analyzer had, or similar) */}
                        <div className="absolute bottom-4 right-4 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* In the image, there's a green chat bubble on the bottom right. We can add a generic one or per card. */}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Global floating support button mirroring the image's bottom right */}
            <div className="fixed bottom-8 right-8 z-50">
                <button className="w-14 h-14 bg-[#00d26a] hover:bg-[#00b85c] rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-105 active:scale-95">
                    <MessageCircle className="w-7 h-7" />
                </button>
            </div>
        </div>
    );
}

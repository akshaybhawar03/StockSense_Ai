import { motion } from 'motion/react';
import { ShieldCheck, Zap } from 'lucide-react';

const rings = [
    {
        name: 'Inner Ring (Logistics & Tech)',
        size: 'w-[40%] h-[40%]',
        orbitClass: 'animate-orbit-inner',
        reverseOrbitClass: 'animate-reverse-orbit-inner',
        borderClass: 'border-green-500/30 dark:border-green-400/30',
        glowClass: 'shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] dark:shadow-[inset_0_0_20px_rgba(59,130,246,0.3),_0_0_15px_rgba(59,130,246,0.2)]',
        items: [
            { src: '/logos/shiprocket.svg', name: 'Shiprocket', position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' },
            { src: '/logos/delhivery.svg', name: 'Delhivery', position: 'top-[25%] right-[-10%] -translate-x-1/2 -translate-y-1/2' },
            { src: '/logos/bluedart.svg', name: 'BlueDart', position: 'bottom-[10%] right-[5%] -translate-x-1/2 translate-y-1/2' },
            { src: '/logos/razorpay.svg', name: 'Razorpay', position: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' },
            { src: '/logos/analytics.svg', name: 'Analytics', position: 'bottom-[10%] left-[5%] -translate-x-1/2 translate-y-1/2' },
            { src: '/logos/whatsapp.svg', name: 'WhatsApp', position: 'top-[25%] left-[-10%] -translate-x-1/2 -translate-y-1/2' },
        ]
    },
    {
        name: 'Middle Ring (ERP & Accounting)',
        size: 'w-[65%] h-[65%]',
        orbitClass: 'animate-orbit-middle',
        reverseOrbitClass: 'animate-reverse-orbit-middle',
        borderClass: 'border-green-500/30 dark:border-green-400/30',
        glowClass: 'shadow-[inset_0_0_20px_rgba(168,85,247,0.1)] dark:shadow-[inset_0_0_20px_rgba(168,85,247,0.3),_0_0_15px_rgba(168,85,247,0.2)]',
        items: [
            { src: '/logos/sap.svg', name: 'SAP', position: 'top-[5%] right-[15%] translate-x-1/2 -translate-y-1/2' },
            { src: '/logos/tally.svg', name: 'Tally', position: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2' },
            { src: '/logos/zoho.svg', name: 'Zoho', position: 'bottom-[5%] right-[15%] translate-x-1/2 translate-y-1/2' },
            { src: '/logos/quickbooks.svg', name: 'QuickBooks', position: 'bottom-[5%] left-[15%] -translate-x-1/2 translate-y-1/2' },
            { src: '/logos/dynamics.svg', name: 'Dynamics', position: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2' },
            { src: '/logos/unicommerce.svg', name: 'Unicommerce', position: 'top-[5%] left-[15%] -translate-x-1/2 -translate-y-1/2' },
        ]
    },
    {
        name: 'Outer Ring (Marketplaces)',
        size: 'w-[95%] h-[95%]',
        orbitClass: 'animate-orbit-outer',
        reverseOrbitClass: 'animate-reverse-orbit-outer',
        borderClass: 'border-green-500/30 dark:border-green-400/30',
        glowClass: 'shadow-[inset_0_0_20px_rgba(99,102,241,0.1)] dark:shadow-[inset_0_0_20px_rgba(99,102,241,0.3),_0_0_15px_rgba(99,102,241,0.2)]',
        items: [
            { src: '/logos/shopify.svg', name: 'Shopify', position: 'top-[-5%] left-1/2 -translate-x-1/2 -translate-y-1/2' },
            { src: '/logos/amazon.svg', name: 'Amazon', position: 'top-[15%] right-[5%] translate-x-1/2 -translate-y-1/2' },
            { src: '/logos/flipkart.svg', name: 'Flipkart', position: 'top-1/2 right-[-5%] translate-x-1/2 -translate-y-1/2' },
            { src: '/logos/woo.svg', name: 'WooCommerce', position: 'bottom-[15%] right-[5%] translate-x-1/2 translate-y-1/2' },
            { src: '/logos/magento.svg', name: 'Magento', position: 'bottom-[-5%] left-1/2 -translate-x-1/2 translate-y-1/2' },
            { src: '/logos/myntra.svg', name: 'Myntra', position: 'bottom-[15%] left-[5%] -translate-x-1/2 translate-y-1/2' },
        ]
    }
];

export function Integrations() {
    return (
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-50/50 via-white to-white dark:from-[#0B1120] dark:via-[#0B1120] dark:to-[#020617] border-t border-gray-100 dark:border-gray-800/50 overflow-hidden relative min-h-[950px] flex flex-col justify-center">

            {/* Soft Ambient Floating Particles/Background Lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-400/5 dark:bg-green-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen"></div>

            <div className="max-w-7xl mx-auto w-full flex flex-col items-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-16 z-20 relative"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200/50 dark:border-white/10 shadow-sm text-green-600 dark:text-green-400 font-medium text-sm mb-6">
                        <Zap className="w-4 h-4 fill-current" />
                        Enterprise Ready
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mb-6 tracking-tight leading-tight drop-shadow-sm">
                        Seamless Integration With<br />Leading Platforms
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400/90 max-w-2xl mx-auto font-medium">
                        Trusted by global sellers, ERP systems, and logistics partners.
                    </p>
                </motion.div>

                {/* Circular Orbit System - Hard GPU Acceleration */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="relative w-full max-w-[850px] aspect-square flex items-center justify-center my-4 px-4 will-change-transform"
                >

                    {/* Central AI Hub Core - Identical in both modes */}
                    <div className="absolute z-30 w-36 h-36 md:w-48 md:h-48 bg-white/70 dark:bg-[#0F172A]/70 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),_0_0_30px_rgba(59,130,246,0.15)] border border-white/80 dark:border-white/10 flex flex-col items-center justify-center overflow-hidden p-6 group">

                        {/* Animated Glowing Border exactly same both themes */}
                        <div className="absolute inset-0 border-[2px] rounded-full border-transparent [background:linear-gradient(white,white)_padding-box,linear-gradient(45deg,rgb(59,130,246),rgb(147,197,253),rgb(168,85,247))_border-box] dark:[background:linear-gradient(#0F172A,#0F172A)_padding-box,linear-gradient(45deg,rgb(59,130,246),rgb(147,197,253),rgb(168,85,247))_border-box] opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <h3 className="text-xl md:text-2xl font-black bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-200 bg-clip-text text-transparent leading-tight drop-shadow-sm group-hover:scale-105 transition-transform duration-500">
                                Stock Sense
                            </h3>
                        </div>
                    </div>

                    {/* Orbit Tracks and Nodes */}
                    {rings.map((ring, rIdx) => (
                        <div
                            key={rIdx}
                            className={`absolute ${ring.size} rounded-full border-[2px] border-dashed ${ring.borderClass} ${ring.orbitClass} ${rIdx === 2 ? 'hidden sm:block' : ''}`}
                            style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                        >
                            {/* Glowing Neon paths on dark mode, soft shadow on light mode */}
                            <div className={`absolute inset-0 rounded-full ${ring.glowClass} pointer-events-none`}></div>

                            {ring.items.map((item, iIdx) => (
                                <div key={iIdx} className={`absolute ${item.position}`} style={{ willChange: 'transform' }}>
                                    {/* Glassmorphism Logo Background - Solid clean white/light-gray to make original colors pop in dark mode without inversion */}
                                    <div className={`${ring.reverseOrbitClass} w-16 h-16 md:w-20 md:h-20 bg-white/95 dark:bg-white/90 backdrop-blur-xl rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05),_0_0_15px_rgba(59,130,246,0.2)] border border-gray-100 dark:border-white/20 flex flex-col items-center justify-center p-3.5 relative hover:scale-[1.18] transition-all duration-300 cursor-pointer overflow-hidden z-40 group/logo`} style={{ willChange: 'transform' }}>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-green-50/50 to-green-50/50 opacity-0 group-hover/logo:opacity-100 transition-opacity"></div>
                                        <img
                                            src={item.src}
                                            alt={item.name}
                                            className="w-full h-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover/logo:scale-110"
                                            title={item.name}
                                            loading="lazy"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}

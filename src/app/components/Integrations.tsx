import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const flipkartLogo = (
    <img src="/logos/flipkart.svg" alt="Flipkart Logo" className="h-10 w-auto object-contain dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
);

const integrations = [
    {
        name: 'Shopify',
        logo: <img src="/logos/shopify.svg" alt="Shopify Logo" className="h-10 w-auto object-contain dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
    },
    {
        name: 'Amazon',
        logo: <img src="/logos/amazon.svg" alt="Amazon Logo" className="h-10 w-auto object-contain dark:drop-shadow-[0_0_2px_rgba(255,255,255,1)]" />
    },
    {
        name: 'Flipkart',
        logo: flipkartLogo
    }
];

export function Integrations() {
    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Seamless E-Commerce Integrations
                    </h2>
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        StockSense AI automatically connects with your existing online store and tracks inventory, sales trends and demand forecasting in real-time.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center items-center"
                >
                    <TooltipProvider>
                        {integrations.map((platform, idx) => (
                            <Tooltip key={idx}>
                                <TooltipTrigger asChild>
                                    <motion.div
                                        whileHover={{ y: -4, filter: 'drop-shadow(0px 8px 24px rgba(var(--accent-primary-rgb), 0.2))' }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        className="w-full h-full flex justify-center cursor-pointer"
                                    >
                                        {/* Card explicitly matches 14px border radius and soft shadow standards */}
                                        <Card className="w-full h-36 flex flex-col items-center justify-center p-6 bg-white rounded-[14px] shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-900 transition-all duration-300">
                                            {platform.logo}
                                        </Card>
                                    </motion.div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Connect your {platform.name} store with one click using API integration.</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                    </TooltipProvider>
                </motion.div>
            </div>
        </section>
    );
}

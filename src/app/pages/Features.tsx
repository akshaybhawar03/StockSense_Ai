import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import {
  Brain,
  TrendingDown,
  Bell,
  Package,
  Calendar,
  MessageSquare,
  PieChart,
  Star,
  Warehouse,
  Truck,
  RotateCcw,
  Tag,
  FileText,
  BarChart3,
  Award,
  Globe
} from 'lucide-react';

export function Features() {
  const coreFeatures = [
    {
      icon: TrendingDown,
      title: 'Dead Stock Detection',
      description: 'Identify products blocking your cash with AI-powered analysis',
      features: ['Real-time monitoring', 'Age-based alerts', 'Value calculation']
    },
    {
      icon: Brain,
      title: 'AI Demand Forecasting',
      description: 'Predict future demand with 95% accuracy using machine learning',
      features: ['Historical pattern analysis', 'Seasonal trends', 'Market insights']
    },
    {
      icon: Bell,
      title: 'Smart Reorder Suggestions',
      description: 'Never run out of bestsellers with intelligent reorder points',
      features: ['Automatic calculations', 'Lead time optimization', 'Supplier integration']
    },
    {
      icon: Package,
      title: 'Blocked Capital Tracker',
      description: 'See exactly where your money is stuck in inventory',
      features: ['Real-time tracking', 'Category breakdown', 'Recovery suggestions']
    }
  ];

  const advancedFeatures = [
    { icon: Calendar, title: 'Seasonal Demand Prediction', desc: 'Prepare for peak seasons with AI forecasts' },
    { icon: Calendar, title: 'Festival Sales Forecasting', desc: 'Optimize inventory for Diwali, Holi, and more' },
    { icon: MessageSquare, title: 'WhatsApp Low Stock Alerts', desc: 'Get instant alerts on your phone' },
    { icon: PieChart, title: 'Profit Margin Analyzer', desc: 'Track profitability by product and category' },
    { icon: Star, title: 'SKU Performance Ranking', desc: 'Identify your stars and dogs' },
    { icon: Warehouse, title: 'Multi Warehouse Management', desc: 'Manage inventory across locations' },
    { icon: Truck, title: 'Supplier Lead Time Prediction', desc: 'AI predicts delivery delays' },
    { icon: RotateCcw, title: 'Return Impact Analysis', desc: 'Understand returns effect on inventory' },
    { icon: Tag, title: 'Discount Recommendation Engine', desc: 'AI suggests optimal pricing' },
    { icon: FileText, title: 'Auto Purchase Order Generator', desc: 'Create POs with one click' },
    { icon: Bell, title: 'Slow Moving Stock Alerts', desc: 'Early warning system for stagnant items' },
    { icon: BarChart3, title: 'Category Wise Prediction', desc: 'Forecast demand by category' },
    { icon: Award, title: 'Best Seller Detection', desc: 'Automatically identify top products' },
    { icon: Package, title: 'Inventory Health Score', desc: 'Overall health metrics dashboard' },
    { icon: Globe, title: 'Competitor Demand Estimation', desc: 'Market intelligence insights' },
    { icon: FileText, title: 'Daily Email Summary Reports', desc: 'Stay informed with automated reports' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12">
      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Powerful Features for Smart Sellers
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Everything you need to optimize inventory, free blocked cash, and grow your eCommerce business
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Core Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              The foundation of intelligent inventory management
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className={`h-full group hover:shadow-2xl transition-all duration-500 overflow-hidden relative border ${index % 2 === 0 ? 'border-[rgb(var(--accent-primary))]/20 bg-gradient-to-br from-[rgb(var(--accent-primary))]/5 to-white dark:to-gray-900' : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/80'} p-8`}>

                  {/* Decorative Background Blob */}
                  <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none ${index % 2 === 0 ? 'bg-[rgb(var(--accent-primary))]' : 'bg-[rgb(var(--accent-secondary))]'}`}></div>

                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 relative z-10 group-hover:-translate-y-2 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500 ${index % 2 === 0 ? 'bg-[rgb(var(--accent-primary))] text-white shadow-[0_8px_16px_rgba(var(--accent-primary-rgb),0.3)]' : 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-sm text-[rgb(var(--accent-primary))]'}`}>
                    <feature.icon className="w-8 h-8" />
                  </div>

                  <div className="relative z-10 flex flex-col h-[calc(100%-6rem)]">
                    <h3 className="font-bold mb-4 group-hover:text-[rgb(var(--accent-primary))] transition-colors duration-300 text-2xl text-gray-900 dark:text-white">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-base">
                      {feature.description}
                    </p>

                    <div className="mt-auto space-y-3">
                      {feature.features.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-black/5 dark:border-white/5 hover:bg-white dark:hover:bg-gray-800 transition-colors duration-300">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Advanced Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Go beyond basics with enterprise-grade capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {advancedFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Card className="p-6 h-full bg-white dark:bg-gray-800/50 backdrop-blur border dark:border-gray-700 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[rgb(var(--accent-primary))]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="relative z-10 flex flex-col items-start">
                    <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-sm group-hover:bg-[rgb(var(--accent-primary))]/10 group-hover:border-[rgb(var(--accent-primary))]/20">
                      <feature.icon className="w-6 h-6 text-[rgb(var(--accent-primary))]" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-[rgb(var(--accent-primary))] transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Seamless Integrations
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Connect with your favorite platforms in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                name: 'Shopify',
                logo: <img src="/logos/shopify.svg" alt="Shopify Logo" className="w-12 h-auto object-contain dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
              },
              {
                name: 'Amazon',
                logo: <img src="/logos/amazon.svg" alt="Amazon Logo" className="w-12 h-auto object-contain dark:drop-shadow-[0_0_2px_rgba(255,255,255,1)]" />
              },
              {
                name: 'Flipkart',
                logo: <img src="/logos/flipkart.svg" alt="Flipkart Logo" className="w-12 h-auto object-contain dark:drop-shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
              },
              {
                name: 'WooCommerce',
                logo: <img src="/logos/woocommerce.png" alt="WooCommerce Logo" className="w-12 h-auto object-contain rounded-xl" />
              }
            ].map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <Card className="p-8 hover:shadow-lg transition-shadow">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[rgb(var(--accent-primary))]/10 to-[rgb(var(--accent-secondary))]/10 rounded-2xl flex items-center justify-center">
                    {platform.logo}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{platform.name}</h3>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

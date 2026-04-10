import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import {
  TrendingDown,
  AlertTriangle,
  FileSpreadsheet,
  Eye,
  Brain,
  Bell,
  TrendingUp,
  Package,
  DollarSign,
  BarChart3,
  Zap,
  Shield,
  Clock,
  Target,
  CheckCircle2,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Integrations } from '../components/Integrations';

export function Home() {
  const { t } = useLanguage();
  const [showROICalculator, setShowROICalculator] = useState(false);
  const [inventoryValue, setInventoryValue] = useState('');

  const calculateROI = () => {
    const value = parseFloat(inventoryValue);
    if (!value) return 0;
    return (value * 0.25).toFixed(0); // Estimate 25% cash recovery
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-36 pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#e9edf1] via-[#f1f5f9] to-[#ffffff] relative overflow-hidden">
        {/* Adds soft lighting effect like in the image */}
        <div className="absolute top-0 left-[-10%] w-[50%] h-[50%] bg-[#ffffff] blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-[-10%] w-[50%] h-[50%] bg-[#ffffff] blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          
          {/* Badge */}
          <div className="mb-10 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] font-semibold text-sm border border-[#22C55E]/30 shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.2 1.2L3 12l5.8 1.9a2 2 0 0 1 1.2 1.2L12 21l1.9-5.8a2 2 0 0 1 1.2-1.2L21 12l-5.8-1.9a2 2 0 0 1-1.2-1.2Z"/></svg>
            Trusted by 10,000+ Indian E-commerce Sellers
          </div>

          <div className="grid lg:grid-cols-2 gap-x-12 gap-y-12 items-center text-left w-full mt-4">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full lg:max-w-[650px] xl:max-w-[700px] flex-shrink-0"
            >
              <h1 className="text-[44px] sm:text-[52px] lg:text-[64px] xl:text-[70px] font-extrabold text-[#0F172A] leading-[1.1] mb-6 tracking-tight">
                <span className="whitespace-nowrap">Stop Losing <span className="text-[#22C55E]">₹Lakhs</span></span><br />
                on Dead Stock<br />
                Every Month
              </h1>
              <p className="text-[18px] sm:text-[20px] text-[#475569] mb-10 leading-[1.6] font-medium">
                India's #1 AI-powered inventory management platform. Predict demand with 95% accuracy, get WhatsApp alerts for low stock, and recover trapped working capital in weeks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button className="bg-[#22C55E] hover:bg-[#22C55E]/90 text-white px-8 py-7 text-[16px] font-semibold rounded-[10px] flex items-center justify-center gap-3 transition-colors shadow-md">
                  Start 14-Day Free Trial 
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Button>
                <Button variant="outline" className="px-8 py-7 text-[16px] font-semibold rounded-[10px] flex items-center justify-center gap-3 bg-white text-[#0F172A] border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch 2-Min Demo
                </Button>
              </div>
            </motion.div>

            {/* Warehouse Image right side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative w-full flex justify-end"
            >
              <img
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&h=800&fit=crop"
                alt="Warehouse"
                className="w-full max-w-[650px] rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] object-cover aspect-[4/3]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Integrations />
      </motion.div>

      {/* Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('problem.title')}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', title: t('problem.moneyStuck'), extraClass: 'grayscale sepia hue-rotate-[320deg] saturate-[5000%] brightness-110 drop-shadow-md' },
              { img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Warning.png', title: t('problem.stockouts') },
              { img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Microsoft_Excel_2013-2019_logo.svg/1200px-Microsoft_Excel_2013-2019_logo.svg.png', title: t('problem.excelForecasting') },
              { img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Magnifying%20Glass%20Tilted%20Right.png', title: t('problem.noVisibility') },
            ].map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 40 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 100 }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow border-2 dark:border-gray-800 group">
                  <div className="w-16 h-16 mb-4 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300">
                    <img
                      src={problem.img}
                      alt={problem.title}
                      className={`w-full h-full drop-shadow-xl ${problem.extraClass || ''}`}
                      loading="lazy"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{problem.title}</h3>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[rgb(var(--accent-primary))]/5 to-[rgb(var(--accent-secondary))]/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
            >
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop"
                alt="Analytics dashboard"
                className="rounded-2xl shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 50 }}
              whileInView={{ opacity: 1, scale: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Connect Once. Get AI-Powered Insights Forever.
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                Our system seamlessly connects with your store and analyzes years of sales data using advanced AI.
                Get actionable recommendations to optimize your inventory and free up blocked capital.
              </p>
              <Button size="lg" className="bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white">
                See How It Works
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('features.title')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Everything you need to optimize your inventory
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Chart%20Decreasing.png', title: t('features.deadStock'), desc: 'Identify products blocking your cash' },
              { img: 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets/Brain/3D/brain_3d.png', title: t('features.aiForecasting'), desc: 'Predict future demand with 95% accuracy' },
              { img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Bell.png', title: t('features.reorder'), desc: 'Never run out of bestsellers' },
              { img: 'https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Package.png', title: t('features.blockedCapital'), desc: 'See exactly where your money is stuck' },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.1, duration: 0.5, type: "spring", stiffness: 120 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="col-span-1"
              >
                <Card className="p-8 h-full hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[rgb(var(--accent-primary))]/10 to-[rgb(var(--accent-secondary))]/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="w-20 h-20 flex items-center justify-center mb-6 relative z-10 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-300">
                    <img src={feature.img} alt={feature.title} className="w-full h-full drop-shadow-2xl" loading="lazy" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 relative z-10 leading-relaxed">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}


          </div>

          {/* Advanced Features Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Advanced Features for Power Users
            </h3>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                'Seasonal demand prediction',
                'Festival sales forecasting',
                'WhatsApp low stock alerts',
                'Profit margin analyzer',
                'SKU performance ranking',
                'Multi warehouse management',
                'Supplier lead time prediction',
                'Return impact analysis',
                'Discount recommendation engine',
                'Auto purchase order generator',
                'Slow moving stock alerts',
                'Category wise prediction',
                'Best seller detection',
                'Inventory health score',
                'Competitor demand estimation',
                'Daily email summary reports'
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 150 }}
                  className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-default"
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ROI Calculator CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              How Much Cash Can You Recover?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Use our ROI calculator to estimate potential savings
            </p>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => setShowROICalculator(true)}
              className="bg-white text-[rgb(var(--accent-primary))] hover:bg-gray-100"
            >
              Calculate Your ROI
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: '₹50Cr+', label: 'Cash Recovered for Sellers' },
              { value: '2,500+', label: 'Active Stores' },
              { value: '95%', label: 'Prediction Accuracy' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.1, duration: 0.5, type: "spring" }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-[rgb(var(--accent-primary))] mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {[
              { q: 'Is my data safe?', a: 'Yes, we use bank-grade encryption and never share your data with third parties.' },
              { q: 'Do you support Amazon India?', a: 'Yes! We support Amazon India, Shopify, Flipkart, and WooCommerce.' },
              { q: 'Can I cancel anytime?', a: 'Absolutely. No long-term contracts. Cancel with one click.' },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
              >
                <Card className="p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Free Your Cash?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Join 2,500+ sellers who have recovered over ₹50 crores
            </p>
            <Button size="lg" className="bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white">
              Start Your Free Trial
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ROI Calculator Modal */}
      <Dialog open={showROICalculator} onOpenChange={setShowROICalculator}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>ROI Calculator</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Total Inventory Value (₹)</label>
              <Input
                type="number"
                placeholder="e.g., 1000000"
                value={inventoryValue}
                onChange={(e) => setInventoryValue(e.target.value)}
              />
            </div>
            {inventoryValue && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Estimated Cash Recovery:
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ₹{calculateROI()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Based on average 25% dead stock reduction
                </p>
              </motion.div>
            )}
            <Button className="w-full bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white">
              Start Free Trial
            </Button>
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}

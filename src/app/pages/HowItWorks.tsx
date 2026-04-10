import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plug, Brain, Target, CheckCircle2 } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Plug,
      title: 'Connect Your Store',
      description: 'Link your Shopify, Amazon, Flipkart or WooCommerce store in just 2 minutes with secure OAuth.',
      details: [
        'One-click integration',
        'Bank-grade security',
        'No technical knowledge needed',
        'Instant data sync'
      ],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'
    },
    {
      number: 2,
      icon: Brain,
      title: 'AI Analyzes Your Data',
      description: 'Our advanced AI engine analyzes years of sales history, seasonal patterns, and market trends.',
      details: [
        'Historical sales analysis',
        'Seasonal pattern detection',
        'Customer behavior insights',
        'Competitor benchmarking'
      ],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop'
    },
    {
      number: 3,
      icon: Target,
      title: 'Get Actionable Recommendations',
      description: 'Receive instant insights on dead stock, reorder points, and cash recovery opportunities.',
      details: [
        'Dead stock identification',
        'Smart reorder alerts',
        'Discount recommendations',
        'Cash recovery roadmap'
      ],
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop'
    }
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
              How Smart Inventory Works
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Three simple steps to transform your inventory management and free blocked cash
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{step.number}</span>
                      </div>
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[rgb(var(--accent-primary))]/20 to-[rgb(var(--accent-secondary))]/20 flex items-center justify-center">
                        <step.icon className="w-8 h-8 text-[rgb(var(--accent-primary))]" />
                      </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      {step.title}
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                      {step.description}
                    </p>

                    <Card className="p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-2 dark:border-gray-800">
                      <ul className="space-y-3">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>

                  <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] rounded-3xl blur-3xl opacity-20"></div>
                      <img
                        src={step.image}
                        alt={step.title}
                        className="relative rounded-3xl shadow-2xl"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powered by Advanced Technology
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Enterprise-grade infrastructure built for scale and reliability
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Machine Learning',
                description: 'Advanced ML models trained on millions of transactions',
                tech: ['TensorFlow', 'scikit-learn', 'Prophet']
              },
              {
                title: 'Real-time Processing',
                description: 'Lightning-fast data sync and analysis',
                tech: ['Node.js', 'PostgreSQL', 'Redis']
              },
              {
                title: 'Enterprise Security',
                description: 'Bank-grade encryption and compliance',
                tech: ['OAuth 2.0', 'AES-256', 'SOC 2']
              }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-8 h-full hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {tech.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {tech.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tech.tech.map((item, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[rgb(var(--accent-primary))]/10 text-[rgb(var(--accent-primary))] rounded-full text-sm"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join 2,500+ sellers who trust SmartGodown
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-white text-[rgb(var(--accent-primary))] hover:bg-gray-100">
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10">
                Book a Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { CheckCircle2, X } from 'lucide-react';

export function Pricing() {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      name: t('pricing.starter'),
      price: { monthly: 999, annual: 9990 },
      description: 'Perfect for small sellers starting out',
      features: [
        'Up to 500 SKUs',
        'Basic demand forecasting',
        'Dead stock detection',
        'Email support',
        '1 platform integration',
        'Monthly reports',
      ],
      limitations: [
        'No WhatsApp alerts',
        'No multi-warehouse',
        'No API access'
      ],
      color: 'blue',
      popular: false
    },
    {
      name: t('pricing.growth'),
      price: { monthly: 2999, annual: 29990 },
      description: 'For growing businesses that need more',
      features: [
        'Up to 2,000 SKUs',
        'Advanced AI forecasting',
        'Dead stock + reorder alerts',
        'WhatsApp alerts',
        'Priority support',
        '3 platform integrations',
        'Weekly reports',
        'Multi-warehouse support',
        'Profit margin analysis',
        'Auto PO generation',
      ],
      limitations: [
        'No API access',
        'No white label'
      ],
      color: 'purple',
      popular: true
    },
    {
      name: t('pricing.pro'),
      price: { monthly: 7999, annual: 79990 },
      description: 'Enterprise-grade for power sellers',
      features: [
        'Unlimited SKUs',
        'Advanced AI + ML models',
        'All premium features',
        'WhatsApp + SMS alerts',
        'Dedicated account manager',
        'Unlimited integrations',
        'Daily reports',
        'Multi-warehouse + location',
        'API access',
        'Custom integrations',
        'White label option',
        'Advanced analytics',
        'Competitor insights',
      ],
      limitations: [],
      color: 'orange',
      popular: false
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    const price = billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual;
    return billingCycle === 'monthly' ? price : Math.floor(price / 12);
  };

  const getSavings = () => {
    return billingCycle === 'annual' ? '17% OFF' : '';
  };

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
              {t('pricing.title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Transparent pricing. No hidden fees. Cancel anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm ${billingCycle === 'monthly' ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-14 h-7 bg-gray-300 dark:bg-gray-700 rounded-full transition-colors"
              >
                <motion.div
                  className="absolute top-1 left-1 w-5 h-5 bg-[rgb(var(--accent-primary))] rounded-full"
                  animate={{ x: billingCycle === 'annual' ? 28 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-sm ${billingCycle === 'annual' ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                Annual
              </span>
              {billingCycle === 'annual' && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  Save 17%
                </Badge>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-[rgb(var(--accent-primary))] text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <Card className={`p-8 h-full ${plan.popular ? 'border-2 border-[rgb(var(--accent-primary))] shadow-xl' : 'border dark:border-gray-800'}`}>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {plan.description}
                  </p>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ₹{getPrice(plan)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">/month</span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Billed annually at ₹{plan.price.annual}
                      </p>
                    )}
                  </div>

                  <Button 
                    className={`w-full mb-8 ${plan.popular ? 'bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    Start Free Trial
                  </Button>

                  <div className="space-y-3 mb-6">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {plan.limitations.length > 0 && (
                    <div className="space-y-2 pt-6 border-t dark:border-gray-800">
                      {plan.limitations.map((limitation, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <X className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Detailed Comparison
            </h2>
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Feature
                  </th>
                  {plans.map((plan, index) => (
                    <th key={index} className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">SKU Limit</td>
                  <td className="px-6 py-4 text-center text-sm">500</td>
                  <td className="px-6 py-4 text-center text-sm">2,000</td>
                  <td className="px-6 py-4 text-center text-sm">Unlimited</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">Platform Integrations</td>
                  <td className="px-6 py-4 text-center text-sm">1</td>
                  <td className="px-6 py-4 text-center text-sm">3</td>
                  <td className="px-6 py-4 text-center text-sm">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">WhatsApp Alerts</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">API Access</td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="w-5 h-5 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">Support Level</td>
                  <td className="px-6 py-4 text-center text-sm">Email</td>
                  <td className="px-6 py-4 text-center text-sm">Priority</td>
                  <td className="px-6 py-4 text-center text-sm">Dedicated Manager</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Pricing FAQs
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'Can I change plans later?',
                a: 'Yes! You can upgrade or downgrade anytime. Changes take effect immediately.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit/debit cards, UPI, net banking via Razorpay and Stripe.'
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes! All plans come with a 14-day free trial. No credit card required.'
              },
              {
                q: 'What if I exceed my SKU limit?',
                a: "You'll get a notification to upgrade. Your data stays safe until you upgrade."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
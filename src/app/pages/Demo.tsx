import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar, CheckCircle2, Video } from 'lucide-react';
import { toast } from 'sonner';

export function Demo() {
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    whatsapp: '',
    monthlyRevenue: '',
    platform: '',
    preferredDate: '',
    preferredTime: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Demo booked successfully! Check your email for confirmation.');
    setFormData({
      name: '',
      businessName: '',
      email: '',
      whatsapp: '',
      monthlyRevenue: '',
      platform: '',
      preferredDate: '',
      preferredTime: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const benefits = [
    'Personalized walkthrough of SmartGodown',
    'See how AI can identify your dead stock',
    'Get a custom ROI estimate for your business',
    'Learn integration options for your platform',
    'Ask questions to our product experts',
    'No commitment required'
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
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Book Your Free Demo
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              See SmartGodown in action. Get a personalized demo tailored to your business needs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Side - Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Schedule Your Free Strategy Call
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      type="text"
                      value={formData.businessName}
                      onChange={handleChange}
                      placeholder="Your Store Name"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp Number *</Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        required
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="monthlyRevenue">Monthly Revenue Range *</Label>
                    <Select 
                      value={formData.monthlyRevenue}
                      onValueChange={(value) => setFormData({ ...formData, monthlyRevenue: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-1L">₹0 - ₹1 Lakh</SelectItem>
                        <SelectItem value="1-5L">₹1 - ₹5 Lakhs</SelectItem>
                        <SelectItem value="5-10L">₹5 - ₹10 Lakhs</SelectItem>
                        <SelectItem value="10-25L">₹10 - ₹25 Lakhs</SelectItem>
                        <SelectItem value="25L+">₹25 Lakhs+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="platform">Platform Used *</Label>
                    <Select 
                      value={formData.platform}
                      onValueChange={(value) => setFormData({ ...formData, platform: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="shopify">Shopify</SelectItem>
                        <SelectItem value="amazon">Amazon</SelectItem>
                        <SelectItem value="flipkart">Flipkart</SelectItem>
                        <SelectItem value="woocommerce">WooCommerce</SelectItem>
                        <SelectItem value="multiple">Multiple Platforms</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredDate">Preferred Date</Label>
                      <Input
                        id="preferredDate"
                        name="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split('T')[0]}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredTime">Preferred Time</Label>
                      <Select 
                        value={formData.preferredTime}
                        onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10am">10:00 AM</SelectItem>
                          <SelectItem value="11am">11:00 AM</SelectItem>
                          <SelectItem value="12pm">12:00 PM</SelectItem>
                          <SelectItem value="2pm">2:00 PM</SelectItem>
                          <SelectItem value="3pm">3:00 PM</SelectItem>
                          <SelectItem value="4pm">4:00 PM</SelectItem>
                          <SelectItem value="5pm">5:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit"
                    size="lg"
                    className="w-full bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white gap-2"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule Free Strategy Call
                  </Button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    We'll send a calendar invite to your email with a video call link
                  </p>
                </form>
              </Card>
            </motion.div>

            {/* Right Side - Benefits */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  What You'll Get
                </h2>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Card className="p-6 bg-gradient-to-br from-[rgb(var(--accent-primary))]/10 to-[rgb(var(--accent-secondary))]/10 border-2 border-[rgb(var(--accent-primary))]/20">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                  💡 What to Prepare
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Current monthly inventory value</li>
                  <li>• Number of SKUs you manage</li>
                  <li>• Main challenges you're facing</li>
                  <li>• Questions about specific features</li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  30-Minute Session
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Our product experts will give you a personalized demo and answer all your questions.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Video className="w-4 h-4" />
                  <span>Via Google Meet or Zoom</span>
                </div>
              </Card>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] rounded-2xl blur-2xl opacity-20"></div>
                <img
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop"
                  alt="Demo session"
                  className="relative rounded-2xl shadow-xl"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="p-8 text-center">
              <div className="text-5xl mb-4">"</div>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 italic">
                The demo helped us understand exactly how Smart Inventory could solve our dead stock problem. 
                Within 3 months, we recovered ₹8.5 lakhs in blocked capital!
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[rgb(var(--accent-primary))] to-[rgb(var(--accent-secondary))] flex items-center justify-center text-white font-bold">
                  RS
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white">Rahul Sharma</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Fashion Store Owner, Mumbai</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Using the provided EmailJS credentials
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || "service_95vlpkm";
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "template_0qa1oqq";
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "GVlBzWg1-Gt1lVbOq";

      const templateParams = {
        from_name: formData.name,
        reply_to: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      console.error('EmailJS Error:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
              Get in Touch
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Have questions? We're here to help. Reach out and we'll respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info text removed for brevity... I will put it all below */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[rgb(var(--accent-primary))]/20 to-[rgb(var(--accent-secondary))]/20 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-[rgb(var(--accent-primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                      <a href="mailto:support@smartinventory.com" className="text-gray-600 dark:text-gray-400 hover:text-[rgb(var(--accent-primary))]">
                        support@smartinventory.com
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[rgb(var(--accent-primary))]/20 to-[rgb(var(--accent-secondary))]/20 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-[rgb(var(--accent-primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Phone</h3>
                      <a href="tel:+919876543210" className="text-gray-600 dark:text-gray-400 hover:text-[rgb(var(--accent-primary))]">
                        +91 98765 43210
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[rgb(var(--accent-primary))]/20 to-[rgb(var(--accent-secondary))]/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-[rgb(var(--accent-primary))]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Office</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Koramangala, Bangalore<br />
                        Karnataka, India - 560034
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card className="p-6 mt-6 bg-gradient-to-br from-[rgb(var(--accent-primary))]/10 to-[rgb(var(--accent-secondary))]/10 border-2 border-[rgb(var(--accent-primary))]/20">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Business Hours
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monday - Friday: 9:00 AM - 7:00 PM IST<br />
                  Saturday: 10:00 AM - 4:00 PM IST<br />
                  Sunday: Closed
                </p>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Send us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name *
                      </label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <Input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subject *
                      </label>
                      <Input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={isSubmitting}
                        placeholder="How can we help?"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message *
                    </label>
                    <Textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full bg-[rgb(var(--accent-primary))] hover:bg-[rgb(var(--accent-primary))]/90 text-white gap-2"
                  >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Send Message
                        </>
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Common Questions
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: 'How quickly will I get a response?',
                a: 'We typically respond within 24 hours during business days.'
              },
              {
                q: 'Do you offer phone support?',
                a: 'Yes! Growth and Pro plan users get priority phone support.'
              },
              {
                q: 'Can I schedule a demo?',
                a: 'Absolutely! Visit our Demo page to book a personalized walkthrough.'
              },
              {
                q: 'Where is your office located?',
                a: 'Our headquarters is in Bangalore, India. We serve customers globally.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {faq.a}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

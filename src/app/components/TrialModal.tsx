import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'sonner';
import { Loader2, Send, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function TrialModal({ open, onClose }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '14-Day Free Trial Request',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const serviceId  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || 'service_95vlpkm';
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_0qa1oqq';
      const publicKey  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || 'GVlBzWg1-Gt1lVbOq';

      await emailjs.send(serviceId, templateId, {
        from_name: formData.name,
        reply_to:  formData.email,
        phone:     formData.phone,
        subject:   formData.subject,
        message:   formData.message,
        name:      formData.name,
        title:     formData.subject,
        email:     formData.email,
      }, publicKey);

      toast.success("Request sent! We'll contact you within 24 hours.");
      setFormData({ name: '', email: '', phone: '', subject: '14-Day Free Trial Request', message: '' });
      onClose();
    } catch (err) {
      console.error('EmailJS Error:', err);
      toast.error('Failed to send. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#22C55E] to-[#16a34a] px-6 py-5 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              Start Your 14-Day Free Trial
            </DialogTitle>
          </DialogHeader>
          <p className="text-green-100 text-sm mt-1">
            Fill in your details — we'll set up your account within 24 hours.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name + Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          {/* Subject */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Subject
            </label>
            <Input
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="14-Day Free Trial Request"
            />
          </div>

          {/* Message */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Message
            </label>
            <Textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your business (optional)"
              rows={3}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#22C55E] hover:bg-[#16a34a] text-white"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="w-4 h-4 mr-2" /> Send Request</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

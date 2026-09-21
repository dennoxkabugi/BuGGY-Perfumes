import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Mail, Phone, MessageCircle, Send } from 'lucide-react';
import { submitContactMessage } from '@/services/api';
import { useToast } from '@/context/ToastContext';

export function ContactPage() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitContactMessage({ name, email, phone, subject, message });
      toast('Message sent! We will get back to you soon.');
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch {
      toast('Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <p className="text-amber-600 text-sm font-medium tracking-widest uppercase mb-2">Get In Touch</p>
        <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">Contact Us</h1>
        <p className="text-neutral-600 max-w-xl mx-auto">
          Have a question about a product, order, or anything else? We are here to help.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">Location</h3>
                <p className="text-sm text-neutral-600">Nairobi, Kenya</p>
                <p className="text-sm text-neutral-600">Available online nationwide</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">Business Hours</h3>
                <p className="text-sm text-neutral-600">Mon - Fri: 9:00 AM - 6:00 PM</p>
                <p className="text-sm text-neutral-600">Sat: 10:00 AM - 4:00 PM</p>
                <p className="text-sm text-neutral-600">Sun: Closed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">Email</h3>
                <a href="mailto:hello@buggyperfumes.com" className="text-sm text-amber-700 hover:underline">
                  hello@buggyperfumes.com
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-neutral-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-neutral-900 text-sm mb-1">Phone</h3>
                <p className="text-sm text-neutral-600">+254 712 345 678</p>
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/254712345678"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <MessageCircle size={18} /> Chat on WhatsApp
          </a>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-neutral-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Phone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700 mb-1.5 block">Message *</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-neutral-900 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Message'} <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

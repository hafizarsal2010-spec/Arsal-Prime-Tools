import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { api } from '../services/api';
import {
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Zap,
  ExternalLink
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const cleanWhatsApp = (settings?.whatsappNumber || '+923001234567').replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    'Hello Arsal Prime Tools Support, I have an inquiry.'
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      showToast('Please fill in your name, email, and message.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.sendContactMessage({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });
      showToast(res.message || 'Message sent successfully!', 'success');
      setSentSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'How fast will I receive my login credentials or license key?',
      a: 'Orders are dispatched within 10 to 15 minutes during operating hours (9:00 AM to 12:00 Midnight PKT) once your JazzCash, EasyPaisa, or Raast payment TID is verified. Credentials will appear directly in your Order Tracking page and will also be sent to your WhatsApp and email.',
    },
    {
      q: 'What does the replacement warranty cover?',
      a: 'We offer a 100% full replacement warranty for the entire duration of your plan (e.g. 30 days for 1-month subscriptions or 365 days for 1-year plans). If any account encounters a password lockout, profile error, or session issue, simply contact our WhatsApp team with your Order ID for a prompt fix or replacement.',
    },
    {
      q: 'What payment methods are supported?',
      a: 'We accept all major local Pakistani payment systems with zero extra surcharge: JazzCash, EasyPaisa, Raast ID (instant IBFT from any bank), Meezan Bank IBFT, and NayaPay/SadaPay.',
    },
    {
      q: 'Are the subscriptions private or shared?',
      a: 'We offer both options clearly marked in the catalogue: private personal accounts (activated directly on your own email address, such as Canva Pro and GitHub Copilot) and premium shared profiles (such as Semrush Guru and TradingView with isolated user profiles).',
    },
    {
      q: 'Can I request a custom digital tool not listed in the catalogue?',
      a: 'Yes! Send us a WhatsApp message with the exact software or AI tool you need. Our procurement team will check availability and provide you with a PKR rate within 30 minutes.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Syne',sans-serif]">
          Contact &amp; Customer Support
        </h1>
        <p className="text-xs text-zinc-400">
          Have a question about an account or payment? Our Lahore-based team is ready to assist you via WhatsApp and email.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Contact Info & WhatsApp Card */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick WhatsApp Action Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-zinc-900 border border-emerald-600/40 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Instant WhatsApp Chat</h3>
                <p className="text-xs text-emerald-300 font-mono">
                  {settings?.whatsappNumber || '+92 300 1234567'}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Connect directly with our senior support executive for immediate order verification, replacement assistance, or custom subscription queries.
            </p>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950/60"
            >
              <span>Chat on WhatsApp Now</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Contact Details List */}
          <div className="p-6 rounded-3xl bg-[#13161f] border border-white/[0.08] space-y-4 text-xs">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Direct Contact Channels
            </h4>

            <div className="flex items-start gap-3 text-zinc-300">
              <Mail className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-zinc-500 block text-[10px]">Email Support</span>
                <a href={`mailto:${settings?.supportEmail || 'support@arsalprimetools.com'}`} className="hover:text-white font-medium">
                  {settings?.supportEmail || 'support@arsalprimetools.com'}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 text-zinc-300">
              <Phone className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-zinc-500 block text-[10px]">Phone Line</span>
                <span className="font-mono">{settings?.whatsappNumber || '+92 300 1234567'}</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-zinc-300">
              <Clock className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-zinc-500 block text-[10px]">Operating Hours</span>
                <span>Monday – Sunday: 9:00 AM – 12:00 Midnight PKT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="lg:col-span-7">
          <div className="p-8 rounded-3xl bg-[#13161f] border border-white/[0.08] space-y-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white font-['Syne',sans-serif]">
                Send an Official Message
              </h3>
              <p className="text-xs text-zinc-400">
                Submit an inquiry and our team will reply to your email or phone promptly.
              </p>
            </div>

            {sentSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Thank you! Your message has been recorded. We will contact you shortly.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Asad Ullah"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="0300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-medium">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Order Inquiry or Custom Tool Request"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-medium">Message Details *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your inquiry, order question, or feedback in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-zinc-900 border border-white/[0.1] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Sending Message...' : 'Send Inquiry'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Section */}
      <div className="p-8 rounded-3xl bg-[#13161f] border border-white/[0.08] space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-white font-['Syne',sans-serif]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-zinc-400">
            Answers to common questions regarding delivery, warranties, and payments.
          </p>
        </div>

        <div className="space-y-3 max-w-3xl mx-auto">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-zinc-900/80 border border-white/[0.06] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-white hover:text-red-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-red-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-zinc-300 leading-relaxed border-t border-white/[0.04] mt-1">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

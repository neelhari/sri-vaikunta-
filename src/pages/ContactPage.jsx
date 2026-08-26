import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, MapPin, Send, CheckCircle2, User, HelpCircle, ChevronDown, AlertTriangle } from 'lucide-react';
import { BRAND, waLink } from '../config/brand';
import { saveContactMessageToSupabase } from '../lib/supabase';
import { useStoreData } from '../context/StoreDataContext';

export default function ContactPage() {
  const { settings = {} } = useStoreData();

  const storePhone = settings.phone || BRAND.phone;
  const storeEmail = settings.supportEmail || BRAND.email;
  const storeAddress = settings.address
    ? `${settings.address}, ${settings.city || ''}, ${settings.state || ''} ${settings.pincode || ''}`.replace(/,\s*,/g, ',').trim()
    : BRAND.address.full;
  const storeName = settings.storeName || BRAND.fullName;
  const cleanWhatsappDigits = settings.whatsapp ? settings.whatsapp.replace(/[^0-9]/g, '') : BRAND.whatsappNumber;
  const whatsappUrl = cleanWhatsappDigits
    ? `https://wa.me/${cleanWhatsappDigits}?text=${encodeURIComponent(`Hello ${storeName}, I would like to see saree options on WhatsApp.`)}`
    : waLink(`Hello ${storeName}, I would like to see saree options on WhatsApp.`);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full Name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-]{10,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Enter a valid phone number';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (!formData.message.trim()) errs.message = 'Please enter your message';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate() || submitting) return;

    setSubmitting(true);
    const result = await saveContactMessageToSupabase(formData);
    setSubmitting(false);
    setSaveFailed(!result.success);
    setSubmitted(true);
  };

  const contactCards = [
    {
      icon: <Phone className="w-6 h-6 text-[#68081C]" />,
      title: "Direct Store Phone",
      detail: storePhone,
      subdetail: "Available 9:30 AM - 9:00 PM IST",
      href: `tel:${storePhone}`,
      actionText: "Call Us Now"
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-[#25D366]" />,
      title: "WhatsApp Video Assist",
      detail: storePhone,
      subdetail: "Instant live saree draping view",
      href: whatsappUrl,
      actionText: "Chat on WhatsApp"
    },
    {
      icon: <Mail className="w-6 h-6 text-[#68081C]" />,
      title: "Email Inquiries",
      detail: storeEmail,
      subdetail: "Bulk & bridal orders assistance",
      href: `mailto:${storeEmail}`,
      actionText: "Send Email"
    }
  ];

  const faqs = [
    {
      q: "How do I place an order for pure pattu or handloom sarees?",
      a: `You can browse sarees on our website, add them to your cart, and click 'Place Order via WhatsApp'. You can also call or message us directly at ${storePhone}.`
    },
    {
      q: "Are the pure pattu sarees 100% authentic pure silk?",
      a: "Yes! All Dharmavaram and Pochampally pure pattu sarees at Sri Vaikunta are genuine handloom silk certified for pure zari and silk authenticity."
    },
    {
      q: "What payment methods are supported?",
      a: "We accept UPI (GPay, PhonePe, Paytm, BHIM), Net Banking, direct IMPS/NEFT Bank Transfer, and secure online checkout."
    },
    {
      q: "Do you provide shipping across India and internationally?",
      a: `Yes! We ship across India with express delivery (3 to 5 days). All orders above ₹${BRAND.freeShippingThreshold.toLocaleString('en-IN')} qualify for 100% Free Express Shipping.`
    },
    {
      q: "Where is your store located in Hyderabad?",
      a: `Our showroom is located at ${storeAddress}. We welcome you to visit us in person to experience the drape and fabric quality firsthand.`
    }
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Header */}
      <section className="text-center max-w-3xl mx-auto space-y-3" data-aos="fade-down">
        <span className="text-xs uppercase font-bold tracking-widest text-[#D4AF37]">Visit or Contact Us</span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
          Contact {BRAND.fullName}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
          Looking for bridal pattu, festive sarees, or personalized assistance? Our team in Hyderabad is ready to help.
        </p>
      </section>

      {/* Contact Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" data-aos="fade-up">
        {contactCards.map((card, idx) => (
          <a
            key={idx}
            href={card.href}
            target={card.href.startsWith('http') ? '_blank' : '_self'}
            rel="noreferrer"
            className="group bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-6 text-center"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FDF5F6] mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-900">{card.title}</h3>
                <p className="text-base font-extrabold text-[#68081C] mt-1">{card.detail}</p>
                <p className="text-xs text-gray-400 mt-1">{card.subdetail}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <span className="text-xs font-bold text-[#68081C] group-hover:underline">
                {card.actionText} →
              </span>
            </div>
          </a>
        ))}
      </section>

      {/* Main Form & Business Information Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12" data-aos="fade-up">
        {/* Left Side: Business Info */}
        <div className="lg:col-span-5 bg-[#68081C] text-white p-8 sm:p-10 rounded-3xl space-y-8 flex flex-col justify-between shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-full bg-[#FAF5EE] ring-2 ring-[#D4AF37]/60 shadow-md flex items-center justify-center shrink-0 overflow-hidden p-1">
                <img src="/logo-icon.png" alt={BRAND.fullName} className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="font-serif font-bold text-2xl text-white tracking-wide">
                  {BRAND.fullName}
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#D4AF37] font-semibold">
                  {BRAND.tagline}
                </div>
              </div>
            </div>

            <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
              Experience the royal touch of handcrafted Indian silk and cotton sarees. Sourced directly from certified handloom weaving clusters.
            </p>

            <div className="space-y-4 text-xs sm:text-sm text-gray-200 pt-4 border-t border-[#7E0C23]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#D4AF37] mt-0.5 shrink-0" />
                <span>{BRAND.address.full}</span>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <a href={`tel:${BRAND.phone}`} className="hover:text-white underline">
                  {BRAND.phone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <a href={waLink(`Hello ${BRAND.fullName}, I have an inquiry.`)} target="_blank" rel="noreferrer" className="hover:text-white underline">
                  WhatsApp: {BRAND.phone}
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#D4AF37]" />
                <a href={`mailto:${BRAND.email}`} className="hover:text-white underline">
                  {BRAND.email}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#7E0C23] text-xs text-gray-300">
            <p><strong>Showroom Hours:</strong> Monday – Sunday (9:30 AM to 9:00 PM)</p>
          </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-gray-900">Send Saree Inquiry</h3>
            <p className="text-xs text-gray-500 mt-1">Fill out the form below and our saree specialists will contact you promptly.</p>
          </div>

          {submitted ? (
            saveFailed ? (
              <div className="bg-amber-50 border border-amber-200 p-8 rounded-2xl text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-amber-900">We couldn't save your message</h4>
                <p className="text-xs text-amber-800 max-w-md mx-auto">
                  Please reach out directly on WhatsApp or phone instead so our team can assist you immediately.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <a
                    href={waLink(`Hello ${BRAND.fullName}, my inquiry: ${formData.message}`)}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Us
                  </a>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setSaveFailed(false);
                    }}
                    className="bg-white border border-gray-300 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center space-y-4 animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-2xl font-bold text-emerald-900">Inquiry Received!</h4>
                <p className="text-xs text-emerald-700 max-w-md mx-auto">
                  Thank you for contacting <strong>{BRAND.fullName}</strong>. Our team will get back to you with photos and details shortly.
                </p>
              </div>
            )
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Your Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full text-xs p-3 rounded-xl border focus:outline-none ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#68081C]'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Phone / WhatsApp Number *</label>
                  <input
                    type="tel"
                    placeholder="e.g. 99899 99999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`w-full text-xs p-3 rounded-xl border focus:outline-none ${
                      errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#68081C]'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full text-xs p-3 rounded-xl border focus:outline-none ${
                      errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#68081C]'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.email}</p>}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-gray-800 uppercase mb-1">Which Sarees are you looking for? *</label>
                <textarea
                  rows={4}
                  placeholder="e.g. Dharmavaram pure pattu bridal saree, Pochampally ikkat, Kota cotton..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={`w-full text-xs p-3 rounded-xl border focus:outline-none resize-none ${
                    errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#68081C]'
                  }`}
                />
                {errors.message && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#68081C] hover:bg-[#4A0513] disabled:opacity-60 text-white py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Sending...' : 'Submit Saree Inquiry'}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="space-y-6" data-aos="fade-up">
        <div className="text-center space-y-2">
          <HelpCircle className="w-6 h-6 text-[#68081C] mx-auto" />
          <h2 className="font-serif text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isFaqOpen = openFaq === idx;
            return (
              <div key={idx} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
                <button
                  onClick={() => setOpenFaq(isFaqOpen ? null : idx)}
                  className="w-full text-left p-4 font-serif font-bold text-base text-gray-900 flex justify-between items-center hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#68081C] transition-transform ${isFaqOpen ? 'rotate-180' : ''}`} />
                </button>
                {isFaqOpen && (
                  <div className="px-4 pb-4 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

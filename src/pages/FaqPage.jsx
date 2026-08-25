import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Search, ChevronDown, MessageCircle, ChevronRight } from 'lucide-react';
import { BRAND, waLink } from '../config/brand';

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      category: "Ordering & Delivery",
      q: `How can I place an order on ${BRAND.fullName}?`,
      a: `You can easily add sarees to your cart and click 'Proceed to Checkout', or place your order directly via WhatsApp at ${BRAND.phone}.`
    },
    {
      category: "Ordering & Delivery",
      q: "What is the delivery time across India?",
      a: "Orders are dispatched within 24 hours. Express courier delivery usually takes 3 to 5 business days anywhere in India."
    },
    {
      category: "Ordering & Delivery",
      q: "Is free shipping available?",
      a: `Yes! Orders worth ₹${BRAND.freeShippingThreshold.toLocaleString('en-IN')} or more get 100% FREE express shipping!`
    },
    {
      category: "Payments & Offers",
      q: "What payment methods are supported?",
      a: "We support UPI (GPay, PhonePe, Paytm), Net Banking, direct IMPS/NEFT, and WhatsApp payment links."
    },
    {
      category: "Payments & Offers",
      q: "Are there any promo codes available for festive buyers?",
      a: "Yes! Use promo code 'SV10' at checkout to receive an instant 10% discount on your saree order subtotal."
    },
    {
      category: "Sarees & Fabric Care",
      q: "Are your Dharmavaram and Pochampally pure pattu sarees authentic?",
      a: `Yes, 100%! Every saree at ${BRAND.fullName} is sourced directly from master weaver clusters with pure silk and pure zari quality standards.`
    },
    {
      category: "Sarees & Fabric Care",
      q: "What are the washing & care instructions for pure pattu and silk sarees?",
      a: "We recommend gentle dry cleaning for pure pattu, Banarasi, and silk sarees to preserve their weave, zari work, and sheen for generations."
    },
  ];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-[#68081C] transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3 text-gray-300" />
        <span className="text-[#68081C] font-semibold">Frequently Asked Questions</span>
      </nav>

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-[#FDF5F6] text-[#68081C] px-3.5 py-1.5 rounded-full text-xs font-bold">
          <HelpCircle className="w-4 h-4 text-[#D4AF37]" />
          <span>Help & Support Center</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 text-sm max-w-lg mx-auto">
          Everything you need to know about our authentic saree collections, orders, shipping, and care instructions.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-lg mx-auto">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search questions (e.g. pure pattu, delivery, payment)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:border-[#68081C] bg-white shadow-2xs"
        />
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No questions found matching your search. Feel free to contact our team directly on WhatsApp!
          </div>
        ) : (
          filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-2xs transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-serif font-bold text-base text-gray-900 hover:bg-gray-50/80 transition-colors cursor-pointer"
                >
                  <span className="flex-1">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#68081C] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4 bg-[#FFFDF9]">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* WhatsApp Support Box */}
      <div className="bg-[#FDF5F6] border border-[#F5D8DD] rounded-2xl p-6 text-center space-y-3">
        <h3 className="font-serif text-xl font-bold text-gray-900">Still have questions?</h3>
        <p className="text-xs text-gray-600 max-w-md mx-auto">
          Our saree consultants in Hyderabad are available on WhatsApp to share live photos, videos, and recommendations.
        </p>
        <a
          href={waLink(`Hello ${BRAND.fullName}, I have a question regarding sarees.`)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Ask on WhatsApp</span>
        </a>
      </div>
    </div>
  );
}

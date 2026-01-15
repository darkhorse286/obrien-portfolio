'use client';

import { useState } from 'react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');

    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setStatus('idle');
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Send a Message</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Web3Forms Access Key - Replace with yours */}
          <input type="hidden" name="access_key" value="0a756962-2ddd-43b2-8441-0f1d9ce18656" />
          <input type="hidden" name="subject" value="New Contact from obrienandson.com" />
          <input type="hidden" name="from_name" value="O'Brien & Son Contact Form" />
          
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Your name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              placeholder="Tell me about your project or question..."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? 'Sending...' : 'Send Message'}
          </button>

          {/* Status Messages */}
          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              <p className="font-semibold">Message sent successfully!</p>
              <p className="text-sm">I'll get back to you as soon as possible.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              <p className="font-semibold">Something went wrong.</p>
              <p className="text-sm">Please try again or reach out via LinkedIn.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
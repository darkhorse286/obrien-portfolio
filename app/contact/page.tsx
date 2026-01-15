'use client';

import { useState } from 'react';
import ContactModal from '@/components/ContactModal';

export default function Contact() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
        
        <p className="text-xl text-gray-600 mb-12">
          I'm always open to conversations about challenging problems, innovative projects, 
          or opportunities to collaborate on something worthwhile.
        </p>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          {/* LinkedIn */}
          <div className="border border-gray-200 rounded-lg p-8 hover:border-gray-400 transition">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <h2 className="text-2xl font-bold">LinkedIn</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Connect professionally and see my full work history.
            </p>
            <a 
              href="https://www.linkedin.com/in/liam-o-brien-a6438043/" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold text-lg inline-flex items-center gap-2"
            >
              Connect on LinkedIn
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Email - Opens Modal */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="border border-gray-200 rounded-lg p-8 hover:border-gray-400 transition text-left"
          >
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-2xl font-bold">Email</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Send me a message directly through the contact form.
            </p>
            <span className="text-blue-600 hover:text-blue-800 font-semibold text-lg inline-flex items-center gap-2">
              Send me an Email
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
          </button>

          {/* GitHub */}
          <div className="border border-gray-200 rounded-lg p-8 hover:border-gray-400 transition">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-bold">GitHub</h2>
            </div>
            <p className="text-gray-600 mb-4">
              View my code and open source contributions.
            </p>
            <a 
              href="https://github.com/yourusername" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-semibold text-lg inline-flex items-center gap-2"
            >
              View on GitHub
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Location */}
          <div className="border border-gray-200 rounded-lg p-8">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-2xl font-bold">Location</h2>
            </div>
            <p className="text-lg text-gray-700 font-semibold mb-1">Rochester, Minnesota</p>
            <p className="text-sm text-gray-500">Open to remote opportunities</p>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Important Note</h3>
          <p className="text-gray-700">
            I'm not interested in vendor solicitations, staffing agency cold outreach, or sales pitches. 
            If you're reaching out about actual engineering work or collaboration, I'd love to hear from you.
          </p>
        </div>

        {/* Footer Quote */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 italic text-lg">
            "Building things properly takes time. This is where I take that time."
          </p>
        </div>
      </main>

      {/* Modal */}
      <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
"use client";

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import { Link001, Link002, Link003, Link004 } from '@/components/ui/skiper-ui/skiper40'

const Footer = () => {
  const scrollToSection = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  const scrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== 'undefined' && window.location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '/');
    }
  };

  return (
    <section className="relative font-inter -mt-20 z-10">
      <div className="w-full bg-white rounded-t-[3rem] flex flex-col shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">

        <div className="w-full max-w-8xl mx-auto px-8 md:px-16 lg:px-8 pb-10 text-gray-800 flex flex-col gap-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16 text-sm font-inter">

            <div className="flex flex-col">
              <h3 className="text-gray-900 font-manrope font-semibold mb-6">Platform</h3>
              <div className="flex flex-col gap-4">
                <Link001 href="/" onClick={scrollToTop}>Home</Link001>
                <Link001 href="/#how-it-works" onClick={scrollToSection('how-it-works')}>How it works</Link001>
                <Link001 href="/#features" onClick={scrollToSection('features')}>Features</Link001>
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-gray-900 font-manrope font-semibold mb-6">Tools</h3>
              <div className="flex flex-col gap-4">
                <Link001 href="/ai-builder">AI Resume Builder</Link001>
                <Link001 href="/ats">ATS Checker</Link001>
                <Link001 href="/resume-builder">Resume Builder</Link001>
                <Link001 href="/dashboard/enhance">Resume Enhancer</Link001>
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-gray-900 font-manrope font-semibold mb-6">Company</h3>
              <div className="flex flex-col gap-4">
                <Link001 href="/#faqs" onClick={scrollToSection('faqs')}>FAQs</Link001>
                <Link001 href="/#features" onClick={scrollToSection('features')}>About Us</Link001>
                <Link001 href="/#contact">Contact</Link001>
              </div>
            </div>

            <div className="flex flex-col">
              <h3 className="text-gray-900 font-manrope font-semibold mb-6">Legal</h3>
              <div className="flex flex-col gap-4">
                <Link001 href="/privacy">Privacy Policy</Link001>
                <Link001 href="/terms">Terms of Service</Link001>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-200 text-xs font-inter text-gray-500">
            <p>© {new Date().getFullYear()} Resumind. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-6 md:mt-0">
              <Link002 href="https://linkedin.com">LinkedIn</Link002>
              <Link002 href="https://instagram.com">Instagram</Link002>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default Footer
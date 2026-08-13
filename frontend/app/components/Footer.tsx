"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUp, X, Shield, FileText, Sparkles } from "lucide-react";

// Inline Brand Icons (Clean standard SVG paths)
const LinkedInIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.7a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z" />
  </svg>
);

const TwitterIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const Footer = () => {
  const [modalType, setModalType] = useState<"privacy" | "terms" | null>(null);

  const scrollToSection = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/") {
        const el = document.getElementById(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `#${id}`);
        }
      }
    }
  };

  const scrollToTop = (e?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (typeof window !== "undefined") {
      if (window.location.pathname === "/") {
        if (e) e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", "/");
      } else {
        window.location.href = "/";
      }
    }
  };

  return (
    <footer className="relative font-inter -mt-20 z-10">
      <div className="w-full bg-white text-gray-700 rounded-t-[2.5rem] md:rounded-t-[3.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] border-t border-gray-100">
        <div className="w-full pt-10 pb-8 flex flex-col gap-6">
          
          {/* Main Layout: Logo Card Shifted Further Left + Options Grid on Right */}
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-10 lg:gap-20">
            
            {/* Double-Size Logo Card Shifted Further Left */}
            <div className="flex items-center justify-start shrink-0 -ml-1 sm:-ml-3 lg:-ml-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30 border border-blue-400/20 flex items-center justify-center hover:scale-105 transition-all duration-300 cursor-pointer">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Options Grid shifted to the Right with Gaps between columns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 flex-1 w-full justify-end text-left pt-1">
              
              {/* Platform */}
              <div className="flex flex-col gap-3">
                <h3 className="text-gray-900 font-manrope font-semibold text-base">Platform</h3>
                <ul className="flex flex-col gap-2 text-sm font-medium text-gray-600">
                  <li>
                    <Link href="/" onClick={scrollToTop} className="hover:text-blue-600 transition-colors">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/#how-it-works" onClick={scrollToSection("how-it-works")} className="hover:text-blue-600 transition-colors">
                      How it works
                    </Link>
                  </li>
                  <li>
                    <Link href="/#features" onClick={scrollToSection("features")} className="hover:text-blue-600 transition-colors">
                      Features
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Tools */}
              <div className="flex flex-col gap-3">
                <h3 className="text-gray-900 font-manrope font-semibold text-base">Tools</h3>
                <ul className="flex flex-col gap-2 text-sm font-medium text-gray-600">
                  <li>
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                      AI Resume Builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                      ATS Checker
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                      Resume Builder
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                      Resume Enhancer
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Company */}
              <div className="flex flex-col gap-3">
                <h3 className="text-gray-900 font-manrope font-semibold text-base">Company</h3>
                <ul className="flex flex-col gap-2 text-sm font-medium text-gray-600">
                  <li>
                    <Link href="/#faqs" onClick={scrollToSection("faqs")} className="hover:text-blue-600 transition-colors">
                      FAQs
                    </Link>
                  </li>
                  <li>
                    <a href="mailto:support@resumind.com" className="hover:text-blue-600 transition-colors">
                      Contact Us
                    </a>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div className="flex flex-col gap-3">
                <h3 className="text-gray-900 font-manrope font-semibold text-base">Legal</h3>
                <ul className="flex flex-col gap-2 text-sm font-medium text-gray-600">
                  <li>
                    <button
                      onClick={() => setModalType("privacy")}
                      className="hover:text-blue-600 transition-colors text-left font-medium cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setModalType("terms")}
                      className="hover:text-blue-600 transition-colors text-left font-medium cursor-pointer"
                    >
                      Terms of Service
                    </button>
                  </li>
                </ul>
              </div>

            </div>

          </div>

          {/* Full-width Horizontal Divider Line */}
          <div className="w-[calc(100%-2rem)] sm:w-[calc(100%-4rem)] mx-auto border-t border-gray-200/80 my-2" />

          {/* Bottom Bar */}
          <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-gray-500 font-medium">
            <p>© {new Date().getFullYear()} Resumind. All rights reserved.</p>
            
            <div className="flex items-center gap-4">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-200 transition-all"
              >
                <LinkedInIcon className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-200 transition-all"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:bg-gray-200 transition-all"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Raised Floating Scroll-To-Top Button on the Side */}
      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[90] bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 sm:p-3.5 shadow-lg shadow-blue-600/35 border border-blue-500/30 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center group"
      >
        <ArrowUp className="w-5 h-5 text-white transition-transform duration-200 group-hover:-translate-y-0.5" />
      </button>

      {/* Interactive Modal Dialog for Privacy Policy & Terms of Service */}
      {modalType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-lg font-manrope">
                {modalType === "privacy" ? (
                  <>
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span>Privacy Policy</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Terms of Service</span>
                  </>
                )}
              </div>
              <button
                onClick={() => setModalType(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-4 text-xs leading-relaxed text-gray-600 flex flex-col gap-3 pr-1">
              {modalType === "privacy" ? (
                <>
                  <p className="font-semibold text-gray-900">Effective Date: August 2026</p>
                  <p>
                    At <strong>Resumind</strong>, we respect your privacy and are committed to protecting your personal data.
                  </p>
                  <h4 className="font-semibold text-gray-900 pt-1">1. Data We Collect</h4>
                  <p>
                    We collect profile details provided during account creation and resume files uploaded for AI processing, enhancement, and ATS compatibility checks.
                  </p>
                  <h4 className="font-semibold text-gray-900 pt-1">2. How We Use Data</h4>
                  <p>
                    Your data is strictly used to render ATS scores, generate tailored bullet points, and store draft resumes securely in your dashboard. We do not sell user data to third parties.
                  </p>
                  <h4 className="font-semibold text-gray-900 pt-1">3. Security</h4>
                  <p>
                    All communication with our servers is encrypted using industry-standard TLS. Your records are isolated and protected.
                  </p>
                  <h4 className="font-semibold text-gray-900 pt-1">4. Contact</h4>
                  <p>For privacy inquiries, contact support@resumind.com.</p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-gray-900">Effective Date: August 2026</p>
                  <p>
                    Welcome to <strong>Resumind</strong>. By using our platform, you agree to these Terms of Service.
                  </p>
                  <h4 className="font-semibold text-gray-900 pt-1">1. Use of Service</h4>
                  <p>
                    Resumind provides AI-assisted resume building and ATS scoring tools. You agree to use the service in compliance with all applicable laws.
                  </p>
                  <h4 className="font-semibold text-gray-900 pt-1">2. User Account</h4>
                  <p>
                    You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
                  </p>
                  <h4 className="font-semibold text-gray-900 pt-1">3. AI Content Disclaimer</h4>
                  <p>
                    AI-generated text and ATS recommendations are provided for guidance. Users are responsible for verifying accuracy before submitting resumes to prospective employers.
                  </p>
                  <h4 className="font-semibold text-gray-900 pt-1">4. Termination</h4>
                  <p>
                    We reserve the right to suspend or terminate access to accounts that violate these terms or abuse platform resources.
                  </p>
                </>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
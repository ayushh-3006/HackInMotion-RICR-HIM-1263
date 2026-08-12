"use client";
import React from "react";
import NavbarDemo from "./navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import { FAQs } from "./components/FAQs";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <NavbarDemo />
      <main className="flex-grow">
        <Hero />
        <div id="features">
          <Features />
        </div>
        <div id="how-it-works">
          <HowItWorks />
        </div>
        <div id="faqs">
          <FAQs />
        </div>
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

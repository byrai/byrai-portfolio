"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    setIsContactFormOpen(false);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const closeContactForm = () => setIsContactFormOpen(false);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .h-fadein { animation: fadeIn  0.9s ease both; }
        .h-fadeup { animation: fadeUp  0.75s ease both; }
        .h-d1 { animation-delay: 0.10s; }
        .h-d2 { animation-delay: 0.25s; }
        .h-d3 { animation-delay: 0.38s; }
        .h-d4 { animation-delay: 0.52s; }
        .h-d5 { animation-delay: 0.66s; }
        .h-d6 { animation-delay: 0.80s; }
      `}</style>

      {/* ── Hero shell ── */}
      <section
        id="hero-section"
        className="relative w-full min-h-screen overflow-hidden grid grid-cols-1 md:grid-cols-2"
        style={{
          backgroundColor: "var(--bg-base)",
          color: "var(--fg-primary)",
        }}
      >
        {/* ════════ LEFT — photo ════════ */}
        <div className="relative min-h-[55vw] md:min-h-full h-full overflow-hidden h-fadein h-d1">
          <Image
            src="/images/hero-bg.png"
            alt="Rai M. Reyes Jr. — DevAdora"
            fill
            priority
            className="object-cover object-center"
            style={{
              filter: "grayscale(85%) brightness(0.80) contrast(1.12)",
            }}
          />
        </div>

        <div className="flex flex-col justify-between px-8 md:px-12 lg:px-16 py-10 md:py-14">
          <div className="flex flex-col gap-6 my-auto py-12">
            <p className="h-fadeup h-d2 text-[11px] tracking-[0.3em] uppercase opacity-40">
              Software Developer · Philippines
            </p>

            <h1
              className="h-fadeup h-d3 font-black leading-[0.90] tracking-tighter"
              style={{ fontSize: "clamp(3rem, 6.5vw, 6.5rem)" }}
            >
              Rai M.
              <br />
              Reyes Jr.
            </h1>

            <p className="h-fadeup h-d4 text-[0.9rem] leading-relaxed opacity-55 max-w-sm">
              Turning complex challenges into elegant, scalable solutions —
              built to perform, designed to endure.
            </p>

            {/* CTAs */}
            <div className="h-fadeup h-d5 flex flex-wrap gap-3 mt-1">
              <Link
                href="/pages/projects"
                className="px-6 py-3 rounded-full text-[11px] tracking-[0.2em] uppercase font-semibold transition-all duration-300 border"
                style={{
                  backgroundColor: "var(--fg-primary)",
                  color: "var(--bg-base)",
                  borderColor: "var(--fg-primary)",
                }}
              >
                View Works →
              </Link>
              <button
                onClick={() => setIsContactFormOpen(true)}
                className="px-6 py-3 rounded-full text-[11px] tracking-[0.2em] uppercase font-semibold transition-all duration-200 border opacity-55 hover:opacity-100"
                style={{
                  borderColor: "var(--border-subtle)",
                  color: "var(--fg-primary)",
                }}
              >
                Get in Touch
              </button>
            </div>
          </div>

          {/* Bottom meta */}
          <div className="h-fadeup h-d6 flex flex-col gap-1 opacity-30">
            <span className="text-[10px] tracking-[0.25em] uppercase">
              Design &amp; Innovation
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase">
              Kabankalan City, PH
            </span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CONTACT FORM SLIDE-IN
          — backdrop + panel now match Header.tsx exactly —
      ════════════════════════════════════════ */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-md z-[60] transition-all duration-500 ease-out ${
          isContactFormOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={closeContactForm}
      />

      <div
        className={`fixed top-0 right-0 h-full bg-[#0a0a09] z-[70] shadow-2xl transform transition-all duration-700 ease-in-out overflow-y-auto w-full sm:w-[85%] md:w-[65%] lg:w-[50%] xl:w-[40%] ${
          isContactFormOpen
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="sticky top-0 bg-[#0a0a09] border-b border-white/10 px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5 md:py-6 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl tracking-[-1px] text-white">
                  Get In Touch
                </h2>
                <p className="text-xs sm:text-sm text-white/60 mt-1">
                  Let's talk about your project
                </p>
              </div>
              <button
                onClick={closeContactForm}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors group"
                aria-label="Close contact form"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-all"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8">
            <div className="space-y-4 sm:space-y-6">
              {[
                {
                  label: "Full Name *",
                  id: "name",
                  type: "text",
                  placeholder: "John Doe",
                  delay: "100ms",
                },
                {
                  label: "Email Address *",
                  id: "email",
                  type: "email",
                  placeholder: "john@example.com",
                  delay: "200ms",
                },
                {
                  label: "Phone Number",
                  id: "phone",
                  type: "tel",
                  placeholder: "+63 9XX XXX XXXX",
                  delay: "300ms",
                },
              ].map(({ label, id, type, placeholder, delay }) => (
                <div
                  key={id}
                  className={`transform transition-all duration-500 ${
                    isContactFormOpen
                      ? "translate-x-0 opacity-100"
                      : "translate-x-8 opacity-0"
                  }`}
                  style={{ transitionDelay: delay }}
                >
                  <label
                    htmlFor={id}
                    className="block text-xs sm:text-sm text-white mb-2"
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    id={id}
                    name={id}
                    value={formData[id as keyof typeof formData]}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-white/30 rounded-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all bg-[#0a0a09] text-white placeholder-white/30"
                    placeholder={placeholder}
                  />
                </div>
              ))}

              <div
                className={`transform transition-all duration-500 ${
                  isContactFormOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0"
                }`}
                style={{ transitionDelay: "400ms" }}
              >
                <label
                  htmlFor="message"
                  className="block text-xs sm:text-sm text-white mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-white/30 rounded-lg focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all bg-[#0a0a09] text-white placeholder-white/30 resize-none"
                  placeholder="Tell me about your project..."
                />
              </div>

              <div
                className={`transform transition-all duration-500 ${
                  isContactFormOpen
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0"
                }`}
                style={{ transitionDelay: "500ms" }}
              >
                <button
                  onClick={handleSubmit}
                  className="w-full bg-white text-[#080807] py-3 sm:py-4 rounded-lg text-sm sm:text-base font-medium transition-all duration-300 hover:shadow-lg hover:bg-gray-100"
                >
                  Send Message →
                </button>
              </div>
            </div>

            <div
              className={`mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10 space-y-4 sm:space-y-6 transform transition-all duration-500 ${
                isContactFormOpen
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
              }`}
              style={{ transitionDelay: "600ms" }}
            >
              <div>
                <h3 className="text-xs sm:text-sm text-white mb-2">EMAIL</h3>
                <a
                  href="mailto:raireyesjr@gmail.com"
                  className="text-sm sm:text-base text-white/80 hover:text-white transition-colors break-all"
                >
                  raireyesjr@gmail.com
                </a>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm text-white mb-2">PHONE</h3>
                <a
                  href="tel:+639762583010"
                  className="text-sm sm:text-base text-white/80 hover:text-white transition-colors"
                >
                  +63 9 762 583 010
                </a>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm text-white mb-2">BASED</h3>
                <p className="text-sm sm:text-base text-white/80">
                  Kabankalan City, 6111
                  <br />
                  Negros Occidental, PH
                </p>
              </div>

              <div>
                <h3 className="text-xs sm:text-sm text-white mb-2">SOCIALS</h3>
                <div className="flex flex-wrap gap-3 sm:gap-4">
                  {[
                    {
                      label: "Instagram",
                      href: "https://www.instagram.com/soullessr4i/",
                    },
                    {
                      label: "LinkedIn",
                      href: "https://www.linkedin.com/in/rai-reyes-jr-6bb906272/",
                    },
                    { label: "GitHub", href: "https://github.com/DevAdora" },
                  ].map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base text-white/80 hover:text-white transition-colors"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

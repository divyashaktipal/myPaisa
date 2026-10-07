"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { NavbarProps } from "@/types/Navbar";
import { LANDING_NAV_LINKS, LANDING_NAVBAR_CONFIG } from "@/constants/Navbar";

const Navbar = (_props: NavbarProps = {}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <nav aria-label="Main Navigation" className="flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          className="flex items-center gap-2.5 text-white font-semibold text-xl tracking-tight transition hover:opacity-90 group"
          href={LANDING_NAVBAR_CONFIG.brandHref}
        >
          <div className="w-8 h-8 rounded-full bg-brand-lime flex items-center justify-center text-brand-deep shadow-sm transition-transform group-hover:scale-105">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-white text-lg font-bold tracking-tight">
            {LANDING_NAVBAR_CONFIG.brandPrefix}
            <span className="text-brand-lime">{LANDING_NAVBAR_CONFIG.brandSuffix}</span>
          </span>
        </Link>

        {/* Desktop Pill Nav Items */}
        <div className="hidden md:flex items-center p-1.5 px-3 rounded-full glass-pill text-sm font-normal text-white/90 gap-1 shadow-sm">
          {LANDING_NAV_LINKS.map((item, idx) => (
            <Link
              key={item.label}
              href={item.href}
              className={`px-3.5 py-1.5 rounded-full transition text-xs font-medium ${
                idx === 0
                  ? "bg-white/20 text-white font-semibold"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Schedule Demo / Sign In CTA & Mobile Menu Toggle */}
        <div className="flex items-center gap-3">
          <Link
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-brand-deep text-xs font-semibold hover:bg-gray-100 transition shadow-sm group"
            href={LANDING_NAVBAR_CONFIG.signInHref}
          >
            <span>{LANDING_NAVBAR_CONFIG.signInLabel}</span>
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M14 5l7 7m0 0l-7 7m7-7H3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </Link>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-full glass-pill text-white hover:bg-white/20 transition cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 p-4 rounded-2xl glass-pill bg-brand-forest/95 border border-white/20 text-white shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2">
            {LANDING_NAV_LINKS.map((item, idx) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  idx === 0
                    ? "bg-white/20 text-white font-medium"
                    : "hover:bg-white/10 text-white/90"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-white/15">
              <Link
                href={LANDING_NAVBAR_CONFIG.signInHref}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-brand-lime text-brand-deep font-semibold text-sm hover:bg-brand-lime-hover transition"
              >
                {LANDING_NAVBAR_CONFIG.signInLabel} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
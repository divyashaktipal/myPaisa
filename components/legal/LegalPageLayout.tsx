"use client";

import React from "react";
import Link from "next/link";
import type { LegalPageLayoutProps } from "@/types/LegalPageLayout";
import { LEGAL_LAYOUT_CONFIG } from "@/constants/LegalPageLayout";

const LegalPageLayout = ({ data }: LegalPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#070b11] text-gray-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar Minimal */}
      <header className="w-full border-b border-white/10 bg-[#070b11]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href={LEGAL_LAYOUT_CONFIG.brandHref} className="flex items-center gap-0.5 group">
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition">
              {LEGAL_LAYOUT_CONFIG.brandPrefix}
            </span>
            <span className="text-xl font-bold tracking-tight text-emerald-400">
              {LEGAL_LAYOUT_CONFIG.brandSuffix}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href={LEGAL_LAYOUT_CONFIG.backToHomeHref}
              className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20"
            >
              <span>←</span> {LEGAL_LAYOUT_CONFIG.backToHomeText}
            </Link>
            <Link
              href={LEGAL_LAYOUT_CONFIG.signInHref}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black transition"
            >
              {LEGAL_LAYOUT_CONFIG.signInText}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Hero Header */}
        <div className="max-w-3xl pb-10 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold tracking-wide uppercase mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {data?.badge}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {data?.title}
          </h1>
          <p className="mt-4 text-base text-gray-300 leading-relaxed">
            {data?.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-400 font-mono">
            <span>Effective: {data?.effectiveDate}</span>
            <span>•</span>
            <span>Last Updated: {data?.lastUpdated}</span>
          </div>
        </div>

        {/* Quick Summary Highlights Grid */}
        {data?.quickSummary && (data?.quickSummary?.length ?? 0) > 0 && (
          <div className="my-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-4">
              {LEGAL_LAYOUT_CONFIG.keyHighlightsHeading}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data?.quickSummary?.map?.((item) => (
                <div
                  key={item?.label}
                  className="p-4 rounded-2xl bg-[#0e1624] border border-white/10 flex flex-col justify-start"
                >
                  <span className="text-sm font-semibold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {item?.label}
                  </span>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    {item?.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Two-Column Layout: Table of Contents & Policy Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-12">
          {/* Left: Quick Jump Navigation */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-24 p-5 rounded-2xl bg-[#0c121d] border border-white/10 space-y-2">
              <p className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3">
                {LEGAL_LAYOUT_CONFIG.contentsHeading}
              </p>
              <nav className="flex flex-col space-y-1.5 text-xs text-gray-400">
                {data?.sections?.map?.((section) => (
                  <a
                    key={section?.id}
                    href={`#${section?.id}`}
                    className="hover:text-emerald-400 hover:translate-x-1 transition-all py-1 truncate"
                  >
                    {section?.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right: Policy Sections Body */}
          <article className="lg:col-span-8 space-y-10">
            {data?.sections?.map?.((section) => (
              <section
                key={section?.id}
                id={section?.id}
                className="scroll-mt-24 p-6 sm:p-8 rounded-3xl bg-[#0c121d] border border-white/5 space-y-4"
              >
                <h3 className="text-xl font-semibold text-white tracking-tight">
                  {section?.title}
                </h3>
                <div className="text-sm text-gray-300 leading-relaxed space-y-3">
                  <p>{section?.content}</p>
                  {section?.bullets && (section?.bullets?.length ?? 0) > 0 && (
                    <ul className="space-y-2 pt-2">
                      {section?.bullets?.map?.((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </article>
        </div>

        {/* Cross-Link Bar to Other Legal Documents */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <span>{LEGAL_LAYOUT_CONFIG.exploreOtherPoliciesHeading}</span>
          <div className="flex items-center gap-4">
            {LEGAL_LAYOUT_CONFIG.policyLinks?.map?.((link) => (
              <Link key={link?.href} href={link?.href} className="hover:text-white transition underline">
                {link?.label}
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="w-full border-t border-white/10 bg-[#070b11] py-8 text-center text-xs text-gray-500">
        <p>{LEGAL_LAYOUT_CONFIG.footerCopyrightText}</p>
      </footer>
    </div>
  );
};

export default LegalPageLayout;

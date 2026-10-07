import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { GoogleSignInButton } from "@/components/auth";
import { auth } from "@/auth";
import { LOGIN_PAGE_CONFIG } from "@/constants/LoginPage";
import type { LoginPageProps } from "@/types/LoginPage";

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const session = await auth();
  if (session) {
    redirect(LOGIN_PAGE_CONFIG.dashboardRedirect);
  }

  const resolvedParams = searchParams ? await searchParams : undefined;
  const errorParam = resolvedParams?.error;

  const errorNotice =
    errorParam === "OAuthAccountNotLinked"
      ? LOGIN_PAGE_CONFIG.oauthErrorNotices.OAuthAccountNotLinked
      : errorParam
      ? LOGIN_PAGE_CONFIG.oauthErrorNotices.default
      : null;

  return (
    <main className="min-h-screen bg-[#070b11] text-white flex flex-col justify-between selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar Minimal */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href={LOGIN_PAGE_CONFIG.backToHomeHref} className="flex items-center gap-0.5 group">
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition">
            {LOGIN_PAGE_CONFIG.brandPrefix}
          </span>
          <span className="text-xl font-bold tracking-tight text-emerald-400">
            {LOGIN_PAGE_CONFIG.brandSuffix}
          </span>
        </Link>
        <Link
          href={LOGIN_PAGE_CONFIG.backToHomeHref}
          className="text-xs text-gray-400 hover:text-white transition flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20"
        >
          <span>←</span> {LOGIN_PAGE_CONFIG.backToHomeText}
        </Link>
      </header>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md relative">
          {/* Subtle Ambient Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 rounded-[2.5rem] blur-xl opacity-75 pointer-events-none" />

          <section className="relative rounded-3xl border border-white/10 bg-[#0d141f]/90 backdrop-blur-xl p-8 sm:p-10 shadow-2xl">
            {errorNotice && (
              <div className="mb-6 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <span className="text-base leading-none">⚠️</span>
                <div>
                  <p className="font-medium text-amber-200">
                    {errorNotice.title}
                  </p>
                  <p className="text-[11px] text-amber-300/80 mt-0.5">
                    {errorNotice.message}
                  </p>
                </div>
              </div>
            )}

            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {LOGIN_PAGE_CONFIG.badgeText}
            </div>

            {/* Heading */}
            <h1 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              {LOGIN_PAGE_CONFIG.titleText}
            </h1>
            <p className="mt-2 text-sm text-gray-400 leading-relaxed">
              {LOGIN_PAGE_CONFIG.subtitleText}
            </p>

            {/* Privacy & Zero-Sharing Consent Reassurance */}
            <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{LOGIN_PAGE_CONFIG.privacyCardTitle}</span>
              </div>
              <ul className="text-[11px] text-gray-300/90 space-y-1.5 leading-relaxed">
                {LOGIN_PAGE_CONFIG.privacyPoints.map((pt, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span><strong>{pt.title}</strong> {pt.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Google Sign-in Action */}
            <div className="mt-6">
              <GoogleSignInButton />
            </div>

            {/* Consent & Terms Link */}
            <p className="mt-4 text-center text-[11px] text-gray-400 leading-relaxed">
              {LOGIN_PAGE_CONFIG.termsAgreementText}
              <Link href={LOGIN_PAGE_CONFIG.termsHref} className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                {LOGIN_PAGE_CONFIG.termsLinkText}
              </Link>{" "}
              and{" "}
              <Link href={LOGIN_PAGE_CONFIG.privacyHref} className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2">
                {LOGIN_PAGE_CONFIG.privacyLinkText}
              </Link>.
            </p>
          </section>
        </div>
      </div>

      {/* Footer Minimal */}
      <footer className="w-full text-center py-6 text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-center gap-4">
        <span>{LOGIN_PAGE_CONFIG.footerBrandText}</span>
        <div className="flex items-center gap-4 text-gray-400">
          {LOGIN_PAGE_CONFIG.footerLinks.map((link, idx) => (
            <span key={link.href} className="flex items-center gap-4">
              <Link href={link.href} className="hover:text-gray-200 transition">
                {link.label}
              </Link>
              {idx < LOGIN_PAGE_CONFIG.footerLinks.length - 1 && <span>•</span>}
            </span>
          ))}
        </div>
      </footer>
    </main>
  );
};

export default LoginPage;

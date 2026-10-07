import React from "react";
import Link from "next/link";
import { FOOTER_CONTENT } from "@/constants/Footer";
import type { FooterProps } from "@/types/Footer";

const Footer = (_props: FooterProps = {}) => {
  return (
    <footer className="bg-white py-8 border-t border-gray-100 text-gray-500 text-xs" data-purpose="site-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-400">{FOOTER_CONTENT.copyright}</p>
        <div className="flex items-center gap-6 text-gray-500 font-medium">
          {FOOTER_CONTENT.links.map((link) => (
            <Link key={link.href} className="hover:text-gray-900 transition" href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

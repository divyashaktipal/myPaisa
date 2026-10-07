import type { LegalSection, LegalSummaryItem, LegalPageData } from "@/types/legalData";

export type { LegalSection, LegalSummaryItem, LegalPageData };

export const privacyData: LegalPageData = {
  badge: "Privacy Policy",
  title: "Privacy & Data Protection",
  description:
    "We believe your financial research belongs strictly to you. myPaisa is designed to collect only the minimal data necessary to run your workspace, with zero selling, zero data broker sharing, and zero ad profiling.",
  lastUpdated: "October 7, 2026",
  effectiveDate: "October 1, 2026",
  quickSummary: [
    {
      label: "Zero Data Sharing",
      text: "We never sell, rent, or trade your personal data, watchlists, or search queries to third parties.",
    },
    {
      label: "Google Authentication Only",
      text: "We only retrieve your verified email and name via Google OAuth to create and secure your session.",
    },
    {
      label: "Encrypted Storage",
      text: "All watchlist and profile records are stored in encrypted databases with strict per-user authorization.",
    },
    {
      label: "Your Data, Your Control",
      text: "You can export or request complete deletion of your account and watchlist data at any time.",
    },
  ],
  sections: [
    {
      id: "information-we-collect",
      title: "1. Information We Collect",
      content:
        "We prioritize data minimization. When you use myPaisa, we only collect the essential information required to deliver live market insights and persist your personal watchlist:",
      bullets: [
        "Account Details: Your name, email address, and profile picture provided through Google Sign-In.",
        "Workspace Data: Stocks and indices you add to your custom watchlist.",
        "Technical Telemetry: Standard browser type, timestamp, and anonymous server error diagnostics to maintain system availability.",
      ],
    },
    {
      id: "how-we-use-information",
      title: "2. How We Use Your Information",
      content:
        "Your data is used solely to provide and improve your myPaisa experience:",
      bullets: [
        "To authenticate your identity and protect your account from unauthorized access.",
        "To synchronize your personalized watchlists across devices in real time.",
        "To filter relevant financial news matching your tracked tickers.",
        "We do NOT use your data for advertising, behavioural profiling, or commercial training.",
      ],
    },
    {
      id: "data-sharing-and-disclosure",
      title: "3. Absolute No-Sharing Policy",
      content:
        "myPaisa has a strict no-sharing policy. We do not sell your personal information or search queries to brokers, hedge funds, advertising networks, or third-party marketers. We will only disclose information if explicitly compelled by applicable law or a valid court order.",
    },
    {
      id: "cookies-and-tracking",
      title: "4. Cookies and Session Tokens",
      content:
        "We use strictly necessary cryptographic JWT tokens solely for authenticating your session. We do not use third-party advertising cookies, cross-site tracking pixels, or invasive session recorders.",
    },
    {
      id: "data-retention-and-deletion",
      title: "5. Data Retention & Your Rights",
      content:
        "You own your data. You may remove stocks from your watchlist at any time. If you wish to delete your entire account and associated records, you can contact us at privacy@mypaisa.com, and all associated database records will be permanently purged within 48 hours.",
    },
    {
      id: "contact-privacy",
      title: "6. Contact Our Privacy Team",
      content:
        "If you have questions, feedback, or concerns regarding your privacy on myPaisa, please reach out to our dedicated privacy desk at privacy@mypaisa.com.",
    },
  ],
};

export const termsData: LegalPageData = {
  badge: "Terms of Service",
  title: "Terms & Conditions",
  description:
    "Please read these terms carefully before accessing myPaisa. By using our platform, you agree to these transparent terms designed to ensure a secure, respectful, and reliable market workspace for all users.",
  lastUpdated: "October 7, 2026",
  effectiveDate: "October 1, 2026",
  quickSummary: [
    {
      label: "Information, Never Calls",
      text: "myPaisa provides market data, metrics, and signals for informational purposes only. We never provide buy/sell advice.",
    },
    {
      label: "Fair Platform Use",
      text: "You agree to use the platform for personal financial intelligence without scraping, abusing, or attacking APIs.",
    },
    {
      label: "Account Ownership",
      text: "You are responsible for maintaining the security of the Google account linked to your myPaisa workspace.",
    },
    {
      label: "Service Availability",
      text: "We strive for 99.9% uptime with redundant feeds, while acknowledging occasional market feed provider maintenance.",
    },
  ],
  sections: [
    {
      id: "informational-purpose",
      title: "1. Not Investment Advice (Facts, Never Calls)",
      content:
        "All data, charts, screeners, volume signals, and technical indicators provided on myPaisa are for informational and educational purposes only. myPaisa is NOT a SEBI-registered investment advisor or stock broker. We do not issue buy, sell, or hold recommendations. You are solely responsible for your own investment decisions and due diligence.",
    },
    {
      id: "user-accounts",
      title: "2. Account Registration and Security",
      content:
        "To access customized workspaces, you authenticate via Google Sign-In. You agree to provide accurate information and maintain the security of your Google credentials. You are responsible for all actions conducted under your account.",
    },
    {
      id: "acceptable-use",
      title: "3. Acceptable Use Policy",
      content:
        "You agree to use myPaisa in compliance with all applicable financial regulations and laws. You may not:",
      bullets: [
        "Use automated scripts, bots, or scrapers to extract market feeds or bypass rate limits without authorization.",
        "Reverse-engineer, disassemble, or tamper with the underlying platform or database architecture.",
        "Attempt unauthorized access to other users' accounts, watchlists, or server infrastructure.",
      ],
    },
    {
      id: "intellectual-property",
      title: "4. Intellectual Property & Market Data",
      content:
        "The myPaisa name, logo, UI designs, code, screener logic, and proprietary interfaces are protected by intellectual property laws. Exchange indices, stock tickers, and public market quotations remain the property of their respective exchanges (NSE/BSE) and authorized data providers.",
    },
    {
      id: "disclaimer-of-warranties",
      title: "5. Disclaimer of Warranties",
      content:
        "myPaisa provides its platform on an 'as-is' and 'as-available' basis. While we strive to provide split-adjusted, accurate, and low-latency market data, we do not warrant that feeds will be uninterrupted, error-free, or free from exchange transmission delays.",
    },
    {
      id: "limitation-of-liability",
      title: "6. Limitation of Liability",
      content:
        "Under no circumstances shall myPaisa or its operators be held liable for any direct, indirect, incidental, or consequential losses, including lost profits or trading losses, arising from the use or inability to use this platform.",
    },
    {
      id: "modifications-to-terms",
      title: "7. Modifications to Terms",
      content:
        "We reserve the right to revise these Terms of Service. Significant updates will be highlighted on the platform. Continued use of myPaisa after any changes constitutes acceptance of the modified terms.",
    },
  ],
};

export const securityData: LegalPageData = {
  badge: "Security Architecture",
  title: "Security & Infrastructure",
  description:
    "Security is foundational to how we build myPaisa. From passwordless Google OAuth to encrypted MongoDB databases and HTTPS-only protocols, your account is protected by enterprise-grade security standards.",
  lastUpdated: "October 7, 2026",
  effectiveDate: "October 1, 2026",
  quickSummary: [
    {
      label: "Zero Stored Passwords",
      text: "We use Google OAuth 2.0. We never store, process, or see your password.",
    },
    {
      label: "End-to-End Encryption",
      text: "All traffic is secured via TLS 1.3 encryption in transit and encrypted data-at-rest.",
    },
    {
      label: "Strict Authorization",
      text: "Cryptographic JWT session tokens verify that each user can only read and write their own data.",
    },
    {
      label: "Continuous Monitoring",
      text: "Proactive rate limiting, sanitization, and infrastructure monitoring against unauthorized access.",
    },
  ],
  sections: [
    {
      id: "authentication-security",
      title: "1. Passwordless OAuth 2.0 Authentication",
      content:
        "myPaisa deliberately avoids traditional password storage to eliminate credential stuffing and database breach risks. Authentication is delegated exclusively to Google's world-class OAuth 2.0 infrastructure, supporting multi-factor authentication (2FA/Passkeys) configured on your Google account.",
    },
    {
      id: "data-encryption",
      title: "2. Encryption in Transit and at Rest",
      content:
        "Every byte of communication between your browser and our servers is encrypted using modern TLS 1.3 / HTTPS protocols. Database persistence volumes leverage industry-standard AES-256 encryption at rest.",
    },
    {
      id: "session-protection",
      title: "3. Cryptographic Session Protection",
      content:
        "User sessions are managed through digitally signed, tamper-proof JSON Web Tokens (JWT) adhering to modern Auth.js security specifications. Cookies are set with HttpOnly, Secure, and SameSite=Lax flags to prevent Cross-Site Scripting (XSS) and CSRF attacks.",
    },
    {
      id: "database-isolation",
      title: "4. Multi-Tenant Database Isolation",
      content:
        "Every database query verifies the authenticated user token. Watchlist items and personal settings are strictly scoped to the authenticated user's ID, preventing any unauthorized cross-tenant data access.",
    },
    {
      id: "infrastructure-resilience",
      title: "5. Infrastructure Resilience & Rate Limiting",
      content:
        "Our APIs implement intelligent rate limiting and query throttling to prevent denial-of-service abuse. All database inputs are strictly sanitized to eliminate NoSQL injection vulnerabilities.",
    },
    {
      id: "responsible-disclosure",
      title: "6. Responsible Vulnerability Disclosure",
      content:
        "We welcome security researchers and community feedback. If you discover a potential vulnerability, please report it directly to security@mypaisa.com. We acknowledge and address legitimate reports with high priority.",
    },
  ],
};

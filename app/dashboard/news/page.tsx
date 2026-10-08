"use client";

import React from "react";
import { MarketNewsFeed } from "@/components/dashboard";

export const dynamic = "force-dynamic";

const NewsPage = () => {
  return (
    <div className="w-full py-4">
      <MarketNewsFeed />
    </div>
  );
};

export default NewsPage;

"use client";

import React from "react";
import { UnderDevelopmentSection } from "@/components/dashboard";

export const dynamic = "force-dynamic";

const ScreenerPage = () => {
  return (
    <div className="w-full py-4">
      <UnderDevelopmentSection tabName="screener" />
    </div>
  );
};

export default ScreenerPage;

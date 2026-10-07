import React from "react";
import type { GoogleIconProps } from "@/types/GoogleIcon";
import { GOOGLE_ICON_CONFIG } from "@/constants/GoogleIcon";

const GoogleIcon = (props: GoogleIconProps) => {
  return (
    <svg viewBox={GOOGLE_ICON_CONFIG.viewBox} fill="none" aria-hidden="true" {...props}>
      {GOOGLE_ICON_CONFIG.paths.map((p, idx) => (
        <path key={idx} fill={p.fill} d={p.d} />
      ))}
    </svg>
  );
};

export default GoogleIcon;

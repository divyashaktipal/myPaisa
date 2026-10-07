import type { SVGProps } from "react";

export interface GoogleIconPath {
  fill: string;
  d: string;
}

export interface GoogleIconConfig {
  viewBox: string;
  paths: GoogleIconPath[];
}

export type GoogleIconProps = SVGProps<SVGSVGElement>;

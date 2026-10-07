import type { GoogleSignInConfig } from "@/types/GoogleSignInButton";

export const GOOGLE_SIGN_IN_CONFIG: GoogleSignInConfig = {
  defaultRedirect: "/dashboard",
  buttonText: "Continue with Google",
  provider: "google",
};

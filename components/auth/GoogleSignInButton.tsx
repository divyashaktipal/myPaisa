import { signIn } from "@/auth";
import { GoogleIcon } from "@/components/icons";
import { GOOGLE_SIGN_IN_CONFIG } from "@/constants/GoogleSignInButton";
import type { GoogleSignInButtonProps } from "@/types/GoogleSignInButton";

const GoogleSignInButton = ({
  redirectTo = GOOGLE_SIGN_IN_CONFIG.defaultRedirect,
  className = "",
}: GoogleSignInButtonProps) => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn(GOOGLE_SIGN_IN_CONFIG.provider, { redirectTo });
      }}
      className="w-full"
    >
      <button
        className={`group relative flex w-full items-center justify-center gap-3.5 rounded-2xl border border-white/20 bg-white px-6 py-3.5 text-sm font-medium text-gray-900 shadow-lg shadow-black/20 transition-all duration-200 hover:bg-gray-50 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#0d141f] ${className}`}
        type="submit"
      >
        <GoogleIcon className="h-5 w-5 transition group-hover:scale-105" />
        <span>{GOOGLE_SIGN_IN_CONFIG.buttonText}</span>
      </button>
    </form>
  );
};

export default GoogleSignInButton;

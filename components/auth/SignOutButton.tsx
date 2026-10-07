import { signOut } from "@/auth";
import { SIGN_OUT_CONFIG } from "@/constants/SignOutButton";
import type { SignOutButtonProps } from "@/types/SignOutButton";

const SignOutButton = (_props: SignOutButtonProps = {}) => {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: SIGN_OUT_CONFIG.defaultRedirect });
      }}
    >
      <button className="text-xs text-[var(--muted)] transition hover:text-black cursor-pointer" type="submit">
        {SIGN_OUT_CONFIG.buttonText}
      </button>
    </form>
  );
};

export default SignOutButton;

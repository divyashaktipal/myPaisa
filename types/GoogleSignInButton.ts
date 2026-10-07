export interface GoogleSignInConfig {
  defaultRedirect: string;
  buttonText: string;
  provider: string;
}

export interface GoogleSignInButtonProps {
  redirectTo?: string;
  className?: string;
}

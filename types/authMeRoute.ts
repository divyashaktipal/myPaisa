import type { ErrorResponsePayload } from "./errors";

export interface AuthMeUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface AuthMeSuccessPayload {
  user: AuthMeUser;
  authenticated: true;
}

export type AuthMeRouteResponse = AuthMeSuccessPayload | ErrorResponsePayload;

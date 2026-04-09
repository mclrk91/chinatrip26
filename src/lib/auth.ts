export const AUTH_COOKIE_NAME = "trip-auth";
export const AUTH_TOKEN_VALUE = "authenticated-trip-user";

export function isAuthenticated(cookieValue: string | undefined): boolean {
  return cookieValue === AUTH_TOKEN_VALUE;
}

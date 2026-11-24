export const MEMBER_ROLE_COOKIE = "av_role";
export const ADMIN_ROLE_VALUE = "admin";
export const MEMBER_ROLE_VALUE = "member";

type RoleCookieOptions = {
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  path: string;
  maxAge: number;
};

type RoleCookieStore = {
  set: (name: string, value: string, options: RoleCookieOptions) => void;
};

export function memberRoleCookieOptions(): RoleCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  };
}

export function writeRoleCookie(store: RoleCookieStore, isAdmin: boolean) {
  store.set(
    MEMBER_ROLE_COOKIE,
    isAdmin ? ADMIN_ROLE_VALUE : MEMBER_ROLE_VALUE,
    memberRoleCookieOptions(),
  );
}

export function clearRoleCookie(store: RoleCookieStore) {
  store.set(MEMBER_ROLE_COOKIE, "", {
    ...memberRoleCookieOptions(),
    maxAge: 0,
  });
}

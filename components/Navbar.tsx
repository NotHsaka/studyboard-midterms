"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/", label: "Home" },
  { href: "/groups", label: "Groups" },
];

export default function Navbar() {
  const pathname = usePathname();
  // TODO (Step 9): Get the session with:
  const { data: session, status } = useSession();
  // `status` is one of "loading" | "authenticated" | "unauthenticated".

  return (
    <nav className="flex items-center justify-between border-b px-6 py-4">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">StudyBoard</span>
        <div className="flex gap-4">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "font-semibold text-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }
              >
                {link.label}
              </Link>
            );
          })}
          {/* TODO (Step 10): When status === "authenticated", render a
              <Link href="/groups/new"> "New Group" link here too. */}
              {status === "authenticated" && (
                <Link
                  href="/groups/new"
                  className={
                    pathname === "/groups/new"
                      ? "font-semibold text-blue-600"
                      : "text-gray-600 hover:text-blue-600"}
                >
                  New Group
                </Link>
              )}
        </div>
      </div>
        

      <div className="flex items-center gap-4 text-sm">
        {/* TODO (Step 11): Replace this placeholder with real auth-aware UI:
            - If status === "authenticated": show "Hi, {session.user?.name}"
              and a "Sign Out" button that calls signOut({ callbackUrl: "/" }).
            - Otherwise: show "Log In" and "Register" links, like below. */}
        {status === "authenticated" ? (
          <>
            <span className="text-gray-600">Hi, {session.user?.name}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-gray-600 hover:text-blue-600"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-600 hover:text-blue-600">
              Log In
            </Link>
            <Link href="/register" className="text-gray-600 hover:text-blue-600">
              Register
            </Link>
          </>
        )}

      </div>
    </nav>
  );
}
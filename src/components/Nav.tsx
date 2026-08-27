import Link from "next/link";
import { logout } from "@/app/login/actions";

export default function Nav({
  companyName,
  roleLabel,
  links,
}: {
  companyName: string;
  roleLabel: string;
  links?: { href: string; label: string }[];
}) {
  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs text-gray-500">{roleLabel}</p>
          <p className="font-semibold">{companyName}</p>
        </div>
        <div className="flex items-center gap-4">
          {links?.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-600 underline">
              {l.label}
            </Link>
          ))}
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-500 underline">
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

import Link from "next/link";
import { logout } from "@/app/login/actions";

export default function Nav({
  companyName,
  roleLabel,
  links,
  maxWidthClassName = "max-w-2xl",
}: {
  companyName: string;
  roleLabel: string;
  links?: { href: string; label: string }[];
  maxWidthClassName?: string;
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-100 bg-white">
      <div className={`mx-auto flex items-center justify-between px-4 py-3 ${maxWidthClassName}`}>
        <div>
          <p className="text-xs text-slate-400">{roleLabel}</p>
          <p className="font-semibold text-slate-800">{companyName}</p>
        </div>
        <div className="flex items-center gap-4">
          {links?.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-slate-500 no-underline hover:underline"
            >
              {l.label}
            </Link>
          ))}
          <form action={logout}>
            <button type="submit" className="text-sm text-slate-400 no-underline hover:underline">
              로그아웃
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

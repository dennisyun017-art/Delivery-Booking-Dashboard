import Link from "next/link";
import { logout } from "@/app/login/actions";
import { dateOnly, formatKoreanDate } from "@/lib/date";

export default function Nav({
  companyName,
  roleLabel,
  links,
  adminEmail,
  maxWidthClassName = "max-w-2xl",
}: {
  companyName: string;
  roleLabel: string;
  links?: { href: string; label: string }[];
  /** Shown as a mailto contact line — the operator's email, so every
   * partner company knows who to reach for errors/questions. */
  adminEmail?: string | null;
  maxWidthClassName?: string;
}) {
  const today = dateOnly(new Date());

  return (
    <header className="sticky top-0 z-10 border-b border-slate-100 bg-white">
      <div
        className={`mx-auto flex items-center justify-center border-b border-slate-50 px-4 py-1 text-xs text-slate-400 ${maxWidthClassName}`}
      >
        {formatKoreanDate(today)}
      </div>
      <div className={`mx-auto flex items-center justify-between px-4 py-3 ${maxWidthClassName}`}>
        <div>
          <p className="text-xs text-slate-400">{roleLabel}</p>
          <p className="font-semibold text-slate-800">{companyName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
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
          {adminEmail && (
            <a
              href={`mailto:${adminEmail}`}
              className="text-xs text-slate-400 no-underline hover:underline"
            >
              문의: {adminEmail}
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

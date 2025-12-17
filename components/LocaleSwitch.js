"use client"

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";

export default function LocaleSwitch() {
    const pathname = usePathname();
    const locale = useLocale();

    const segments = pathname?.split('/').filter(Boolean) || [];

    const segmentsWithoutLocale = segments[0] === locale ? segments.slice(1) : segments;

    const parentPath = segmentsWithoutLocale.length > 1
        ? `/${segmentsWithoutLocale[0]}`
        : segmentsWithoutLocale.length === 1
            ? `/${segmentsWithoutLocale[0]}`
            : '/';

    return (
        <>
            {locale === 'en' ? (
                <Link href={parentPath} locale="vi" className="btn btn-primary">
                    <span className="fi fi-vn"></span> VI
                </Link>
            ) : (
                <Link href={parentPath} locale="en" className="btn btn-primary">
                    <span className="fi fi-us"></span> US
                </Link>
            )}
        </>
    )
}

"use client"
import { usePageTitle } from "@/hooks/usePageTitle";
import { useTranslations } from "next-intl";

export default function About() {

    const t = useTranslations('About');
    usePageTitle(t('aboutus'));

    return (
        <div className="px-8 py-4">
            <h1 className="text-2xl font-bold mb-4">{t('about')} AniGal</h1>

            <p className="mb-2">
                {t('aboutParagraph1')}
            </p>

            <p>
                {t('aboutParagraph2')}
            </p>
        </div>
    );
}

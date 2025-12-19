"use client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "@/i18n/navigation";

export default function Terms() {
    usePageTitle("Terms & Conditions");

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Terms & Conditions</h1>

            <section className="space-y-4">
                <p>
                    Welcome to <span className="font-bold">AniGal</span>. By accessing or
                    using this website, you agree to comply with and be bound by these Terms
                    and Conditions. If you do not agree, please discontinue use of the site.
                </p>

                <div>
                    <h2 className="text-lg font-bold">1. About the Service</h2>
                    <p>
                        AniGal is a fan-made anime gallery that allows users to browse and
                        discover anime-related images for entertainment and informational
                        purposes only.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">2. Intellectual Property</h2>
                    <p>
                        All characters, images, and media featured on AniGal are owned by
                        their respective copyright holders. AniGal does not claim ownership
                        of third-party content.
                    </p>
                    <p>
                        Copyright owners may request removal of content by contacting us
                        directly.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">3. Acceptable Use</h2>
                    <p>
                        You agree not to misuse the website, attempt to disrupt its
                        functionality, scrape content, or use it for unlawful purposes.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">4. Disclaimer</h2>
                    <p>
                        AniGal is provided <span className="font-bold">as is</span> without warranties of any kind. We do not
                        guarantee accuracy, availability, or reliability of content.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">5. Limitation of Liability</h2>
                    <p>
                        AniGal shall not be liable for any damages arising from the use or
                        inability to use the website.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">6. Changes</h2>
                    <p>
                        We reserve the right to update these Terms at any time. Continued use
                        of the site indicates acceptance of any changes.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">7. Privacy</h2>
                    <p>
                        Your use of AniGal is also governed by our{" "}
                        <Link
                            href="/privacy"
                            className="font-bold hover:text-accent transition-[color]"
                        >
                            Privacy Policy
                        </Link>
                        , which explains how we collect and use information.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">8. Contact</h2>
                    <p>
                        For questions or legal concerns, contact us at{" "}
                        <a
                            href="mailto:itsldqs2103@gmail.com"
                            className="font-bold hover:text-accent transition-[color]"
                        >
                            itsldqs2103@gmail.com
                        </a>.
                    </p>
                </div>
            </section>
        </div>
    );
}

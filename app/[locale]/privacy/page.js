"use client";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Link } from "@/i18n/navigation";

export default function Privacy() {
    usePageTitle("Privacy Policy");

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>

            <section className="space-y-4">
                <p>
                    At <span className="font-bold">AniGal</span>, your privacy matters.
                    This Privacy Policy explains how we handle information when you use our
                    website.
                </p>

                <div>
                    <h2 className="text-lg font-bold">1. Information We Collect</h2>
                    <p>
                        AniGal does not require account registration and does not
                        intentionally collect personal information such as names, addresses,
                        or payment details.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">2. Automatically Collected Data</h2>
                    <p>
                        Basic technical data such as browser type, device information, and
                        pages visited may be collected through standard analytics tools to
                        improve site performance and user experience.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">3. Cookies</h2>
                    <p>
                        AniGal may use cookies or similar technologies for essential
                        functionality and analytics. You can control cookie usage through
                        your browser settings.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">4. Third-Party Services</h2>
                    <p>
                        We may use third-party services (such as analytics providers) that
                        collect information in accordance with their own privacy policies.
                        AniGal is not responsible for third-party practices.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">5. Data Security</h2>
                    <p>
                        Reasonable measures are taken to protect information, but no method
                        of transmission or storage is completely secure.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">6. Changes to This Policy</h2>
                    <p>
                        This Privacy Policy may be updated periodically. Continued use of
                        the website after changes indicates acceptance of the revised policy.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">7. Related Terms</h2>
                    <p>
                        By using AniGal, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="font-bold hover:text-accent transition-[color]"
                        >
                            Terms & Conditions
                        </Link>
                        , which govern access to and use of the website.
                    </p>
                </div>

                <div>
                    <h2 className="text-lg font-bold">8. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy, contact us at{" "}
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

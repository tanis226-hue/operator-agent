import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy | OpsAdvisor",
  description: "OpsAdvisor privacy policy and data handling practices",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <Header />

      <main className="mx-auto max-w-shell px-12 py-16">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-serif mb-2" style={{ color: "var(--ink)" }}>
            Privacy Policy
          </h1>
          <p className="text-[14px] text-ink-2 mb-8">
            Last updated: April 26, 2026
          </p>

          <div className="prose prose-sm max-w-none space-y-6" style={{ color: "var(--ink-2)" }}>
            {/* Data Storage */}
            <section>
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--ink)" }}>
                🔒 We Do Not Store Your Data
              </h2>
              <p>
                OpsAdvisor does <strong>not store, save, or retain</strong> any of your data, files, or database information after your analysis session ends. 
              </p>
              <p className="mt-3">
                Specifically:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-2">
                <li>Files you upload are processed only to generate your analysis</li>
                <li>Database queries are executed only to retrieve the data you request</li>
                <li>All data is held temporarily in memory during your session</li>
                <li>Data is completely removed when you close your analysis or leave the page</li>
                <li>No backups, logs, or archives of your data are retained</li>
                <li>Your data is never shared with third parties</li>
              </ul>
            </section>

            {/* Data Usage */}
            <section className="border-t border-line pt-6">
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--ink)" }}>
                📋 How We Use Your Data
              </h2>
              <p>
                Your data and context are used exclusively to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
                <li>Analyze your workflow and identify bottlenecks</li>
                <li>Generate process insights and improvement recommendations</li>
                <li>Create your customized DMAIC analysis report</li>
              </ul>
              <p className="mt-4 text-sm text-ink-muted">
                We do not use your data for training, model development, or any secondary purpose.
              </p>
            </section>

            {/* Database Security */}
            <section className="border-t border-line pt-6">
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--ink)" }}>
                🔐 Database Credentials
              </h2>
              <p>
                If you connect a database to OpsAdvisor:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
                <li>Your credentials are transmitted securely over HTTPS</li>
                <li>Credentials are used only once to execute your specific query</li>
                <li><strong>Credentials are never stored</strong> on our servers or in any backup</li>
                <li>Credentials are not logged or persisted in any form</li>
              </ul>
              <p className="mt-4 text-sm text-ink-muted">
                We recommend using read-only database accounts for added security.
              </p>
            </section>

            {/* Cloud File Links */}
            <section className="border-t border-line pt-6">
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--ink)" }}>
                🔗 Cloud File Links
              </h2>
              <p>
                When you provide links to cloud files (Google Drive, SharePoint, OneDrive, etc.):
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
                <li>We fetch and process the file contents to extract your data</li>
                <li>The file URL is never stored or logged</li>
                <li>Only the contents are used during your session</li>
                <li>All content is deleted when your session ends</li>
              </ul>
            </section>

            {/* Session Data */}
            <section className="border-t border-line pt-6">
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--ink)" }}>
                💾 Session & Technical Data
              </h2>
              <p>
                Browser storage (sessionStorage) is used to preserve your progress during a single session:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2 mt-3">
                <li>Session data is stored only in your browser, not on our servers</li>
                <li>Session data is cleared when you close your browser or clear cache</li>
                <li>We may collect basic analytics (page views, errors) for improvement purposes</li>
              </ul>
            </section>

            {/* Contact */}
            <section className="border-t border-line pt-6">
              <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--ink)" }}>
                📧 Questions?
              </h2>
              <p>
                If you have privacy questions or concerns about how OpsAdvisor handles your data, please reach out to{" "}
                <a
                  href="https://zldagroup.com/about"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", textDecoration: "underline" }}
                >
                  David Tanis
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer muted />
    </div>
  );
}

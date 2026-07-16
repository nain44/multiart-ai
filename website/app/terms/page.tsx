import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service — MultiArt AI',
  description: 'MultiArt AI Terms of Service. Free wallpapers platform usage rules and conditions.',
};

const LAST_UPDATED = 'April 18, 2025';

export default function TermsPage() {
  return (
    <div className="container" style={{ padding: '64px 24px', maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <Link
          href="/"
          className="text-link-hover"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
          ← Back to Home
        </Link>

        <h1 style={{
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 800,
          background: 'linear-gradient(135deg, #fff 30%, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '12px',
        }}>
          Terms of Service
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Last updated: {LAST_UPDATED}</p>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.8 }}>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using MultiArt AI (the "Service"), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, please do not use the Service.
          </p>
        </Section>

        <Section title="2. Service Description">
          <p>
            MultiArt AI provides a collection of free and premium digital wallpaper images for
            personal, non-commercial use on mobile and desktop devices. The Service is accessible
            via our website and mobile applications.
          </p>
        </Section>

        <Section title="3. License to Use Wallpapers">
          <p>
            <strong style={{ color: 'var(--text)' }}>Free wallpapers</strong> may be downloaded
            and used as device wallpapers for personal use at no cost.
          </p>
          <p style={{ marginTop: '12px' }}>
            <strong style={{ color: 'var(--text)' }}>Attribution:</strong> For wallpapers sourced
            from Pexels or Unsplash, attribution is displayed within the app. You may not remove
            attribution metadata when redistributing images.
          </p>
          <p style={{ marginTop: '12px' }}>
            You may <strong style={{ color: 'var(--text)' }}>not</strong>:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li>Redistribute or resell MultiArt AI wallpapers as your own</li>
            <li>Use wallpapers for commercial purposes without explicit permission</li>
            <li>Claim ownership of any MultiArt AI-hosted wallpaper</li>
            <li>Scrape or bulk-download wallpapers via automated means</li>
          </ul>
        </Section>

        <Section title="4. User Conduct">
          <p>You agree to use the Service only for lawful purposes and in a way that does not infringe the rights of others. You agree not to:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li>Attempt to gain unauthorized access to the Service's systems</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
            <li>Upload or transmit malicious code or harmful content</li>
            <li>Use any robot, spider, or automated tool to access the Service</li>
          </ul>
        </Section>

        <Section title="5. Intellectual Property">
          <p>
            All original content created by MultiArt AI, including but not limited to artwork,
            user interface design, logos, and related materials, is owned by MultiArt AI and
            protected by intellectual property laws.
          </p>
          <p style={{ marginTop: '12px' }}>
            Third-party images sourced from Pexels and Unsplash remain the property of their
            respective creators and are used under their respective API licenses.
          </p>
        </Section>

        <Section title="6. Disclaimer of Warranties">
          <p>
            The Service is provided "as is" and "as available" without warranties of any kind,
            either express or implied. MultiArt AI does not warrant that:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li>The Service will be uninterrupted or error-free</li>
            <li>Any defects will be corrected</li>
            <li>The Service is free of viruses or other harmful components</li>
          </ul>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, MultiArt AI shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages, including
            loss of data, arising from your use of the Service.
          </p>
        </Section>

        <Section title="8. Termination">
          <p>
            We reserve the right to terminate or suspend access to the Service immediately,
            without prior notice, for any breach of these Terms of Service.
          </p>
        </Section>

        <Section title="9. Changes to Terms">
          <p>
            We may modify these Terms at any time. We will indicate the date of the last update
            at the top of this page. Your continued use of the Service after any changes
            constitutes your acceptance of the new Terms.
          </p>
        </Section>

        <Section title="10. Governing Law">
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws.
            Any disputes arising under these Terms shall be subject to the exclusive jurisdiction
            of the courts in the applicable territory.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            For any questions about these Terms of Service, please contact us at:{' '}
            <a href="mailto:legal@multiartai.app" style={{ color: '#a78bfa' }}>
              legal@multiartai.app
            </a>
          </p>
        </Section>
      </div>

      {/* Footer nav */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '60px', paddingTop: '32px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <Link href="/privacy-policy" className="text-link-hover" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Privacy Policy
        </Link>
        <Link href="/wallpapers" className="text-link-hover" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Browse Wallpapers
        </Link>
        <Link href="/" className="text-link-hover" style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Home
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 style={{
        fontSize: '20px', fontWeight: 700, marginBottom: '16px',
        color: '#d4d0ff',
        paddingBottom: '10px',
        borderBottom: '1px solid var(--border)',
      }}>
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

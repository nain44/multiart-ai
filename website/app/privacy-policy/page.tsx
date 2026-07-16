export const metadata = {
  title: 'Privacy Policy — MultiArt AI',
  description: 'MultiArt AI privacy policy. Learn how we handle your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '760px' }}>
      <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '8px' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      {[
        {
          title: '1. Introduction',
          content: `MultiArt AI ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how our app and website handle your information. By using MultiArt AI, you agree to this policy.`,
        },
        {
          title: '2. Information We Collect',
          content: `MultiArt AI is designed with privacy in mind. We do not require you to create an account. We do not collect personally identifiable information.\n\nWe may collect anonymous, aggregated usage data including:\n• App crash reports (for bug fixing purposes)\n• Download counts per wallpaper (non-personal, stored on our servers)\n• General device type and OS version (for compatibility purposes)`,
        },
        {
          title: '3. How We Use Information',
          content: `The limited anonymous data we collect is used solely to:\n• Fix bugs and improve app stability\n• Understand which wallpapers are most popular\n• Improve the overall user experience\n\nWe do not sell, rent, or share any data with third parties for marketing or advertising purposes.`,
        },
        {
          title: '4. Third-Party Services',
          content: `MultiArt AI may display wallpapers sourced from Pexels (pexels.com) and Unsplash (unsplash.com). These platforms have their own privacy policies which govern their services.\n\nWe use Cloudinary to store and serve images. Cloudinary's privacy policy applies to image storage and delivery.`,
        },
        {
          title: '5. Image Attribution',
          content: `For all images sourced from Pexels or Unsplash, we display photographer attribution as required by their respective API terms. Original images uploaded by MultiArt AI are owned by MultiArt AI.`,
        },
        {
          title: '6. Children\'s Privacy',
          content: `MultiArt AI does not knowingly collect data from children under the age of 13. The app is rated for general audiences and does not contain content inappropriate for children.`,
        },
        {
          title: '7. Data Security',
          content: `We implement industry-standard security measures to protect our servers and the limited data we store. However, no internet transmission is 100% secure.`,
        },
        {
          title: '8. Changes to This Policy',
          content: `We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the date at the top of this page. Continued use of MultiArt AI after changes constitutes acceptance of the updated policy.`,
        },
        {
          title: '9. Contact Us',
          content: `If you have questions about this Privacy Policy, please contact us at:\n\nEmail: privacy@multiartai.app\nWebsite: multiartai.app`,
        },
      ].map(section => (
        <div key={section.title} style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#a78bfa' }}>{section.title}</h2>
          <div style={{ color: 'var(--text-muted)', lineHeight: 1.8, whiteSpace: 'pre-line', fontSize: '15px' }}>
            {section.content}
          </div>
        </div>
      ))}
    </div>
  );
}

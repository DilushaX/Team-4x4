import PageHero, { PageContent } from "@/components/PageHero";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        image="/assets/images/restoration.png"
        eyebrow="Legal"
        title="Privacy Policy"
        meta="How we collect, use, and protect your information."
      />
      <PageContent>
        <div className="space-y-4 text-zinc-400 leading-relaxed">
          <p>4X4 Defender Parts respects your privacy. We collect personal information only when you create an account, place an order, or contact us.</p>
          <p>Information collected includes name, email, phone number, vehicle details, and delivery address. This data is used to process orders, provide customer support, and improve our services.</p>
          <p>We do not sell or share your personal information with third parties except as required to fulfill orders or comply with legal obligations.</p>
          <p>For questions about your data, contact us at info@team4x4.com.</p>
        </div>
      </PageContent>
    </>
  );
}

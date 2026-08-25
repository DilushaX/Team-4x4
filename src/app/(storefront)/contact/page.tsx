import PageHero, { PageContent } from "@/components/PageHero";
import ContactForm from "@/components/ContactForm";

export const metadata = {
  title: "Contact",
  description: "Get in touch for parts inquiries, service bookings, or project consultations.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Get In Touch"
        title="Contact Us"
        meta="Parts inquiries, service bookings, and project consultations."
      />
      <PageContent wide className="pt-8">
        <ContactForm />
      </PageContent>
    </>
  );
}

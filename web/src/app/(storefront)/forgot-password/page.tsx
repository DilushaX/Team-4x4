import PageHero, { PageContent } from "@/components/PageHero";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export const metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Account Recovery"
        title="Forgot Password"
        meta="Enter your email and we'll send a reset link."
      />
      <PageContent className="pt-8">
        <ForgotPasswordForm />
      </PageContent>
    </>
  );
}

import PageHero, { PageContent } from "@/components/PageHero";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata = { title: "Reset Password" };

export default function ResetPasswordPage() {
  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Account Recovery"
        title="Reset Password"
        meta="Choose a new password for your account."
      />
      <PageContent className="pt-8">
        <ResetPasswordForm />
      </PageContent>
    </>
  );
}

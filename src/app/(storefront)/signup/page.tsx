import PageHero, { PageContent } from "@/components/PageHero";
import SignupForm from "@/components/SignupForm";

export const metadata = { title: "Sign Up" };

export default function SignupPage() {
  return (
    <>
      <PageHero
        image="/assets/images/intake.png"
        eyebrow="Join Us"
        title="Create Account"
        meta="Track orders and save your details for faster checkout."
      />
      <PageContent className="pt-8">
        <SignupForm />
      </PageContent>
    </>
  );
}

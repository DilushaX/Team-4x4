import PageHero, { PageContent } from "@/components/PageHero";
import LoginForm from "@/components/LoginForm";

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <>
      <PageHero
        image="/assets/images/hero-bg.jpeg"
        eyebrow="Account"
        title="Login"
        meta="Access your account or admin portal."
      />
      <PageContent className="pt-8">
        <LoginForm />
      </PageContent>
    </>
  );
}

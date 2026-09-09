import { SignUp } from "@clerk/nextjs";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <SignUp
      fallbackRedirectUrl="/home"
      initialValues={email ? { emailAddress: email } : undefined}
    />
  );
}

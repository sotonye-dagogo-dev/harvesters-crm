import { Metadata } from "next";
import ReferralLanding from "./ReferralLanding";

export const metadata: Metadata = {
  title: "Join Harvesters Church - Referral Invitation",
  description:
    "You have been invited to join Harvesters International Christian Centre Small Groups CRM.",
  openGraph: {
    title: "Join Harvesters Church",
    description:
      "You have been invited to join Harvesters Church Small Groups CRM.",
    type: "website",
  },
};

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { code } = await params;
  return <ReferralLanding code={code} />;
}

import type { Metadata } from "next";
import { LegalPageLayout, Section, SubHeading, List } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Venture Collective Group, LLC collects, uses, and protects information in connection with Grant Scout Pro.",
  alternates: { canonical: "/privacy" },
};

const TOC = [
  { id: "who-we-are", label: "Who We Are" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use-information", label: "How We Use Information" },
  { id: "ai-processing", label: "AI Processing of Your Content" },
  { id: "how-we-share-information", label: "How We Share Information" },
  { id: "public-grant-data", label: "Public Grant Data Sources" },
  { id: "cookies", label: "Cookies & Similar Technologies" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-rights", label: "Your Rights & Choices" },
  { id: "security", label: "Data Security" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "international", label: "International Users" },
  { id: "compliance-data", label: "Federal Compliance Data" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Us" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated="October 4, 2026"
      toc={TOC}
      intro={
        <p>
          This Privacy Policy explains how Venture Collective Group, LLC
          (&ldquo;VCG,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;) collects, uses, shares, and protects information
          in connection with Grant Scout Pro (the &ldquo;Service&rdquo;), our
          platform for discovering, tracking, and preparing federal, state,
          and foundation grant applications. By creating an account or
          otherwise using the Service, you agree to the collection and use of
          information as described in this policy.
        </p>
      }
    >
      <Section id="who-we-are" title="1. Who We Are">
        <p>
          Grant Scout Pro is operated by Venture Collective Group, LLC, a
          Delaware limited liability company (&ldquo;VCG&rdquo;). VCG is the
          data controller for the information described in this policy
          unless otherwise stated. If your organization has questions about
          how its data is handled, contact us using the details in{" "}
          <a href="#contact" className="text-[#0F2A4A] underline underline-offset-2">
            Section 15
          </a>
          .
        </p>
      </Section>

      <Section id="information-we-collect" title="2. Information We Collect">
        <p>We collect the following categories of information:</p>

        <SubHeading>a. Account Information</SubHeading>
        <p>
          When you create an account, our authentication provider (Clerk)
          collects your name, email address, and authentication credentials.
          If you sign up using a third-party login such as Google, we
          receive the basic profile information that provider shares with
          us.
        </p>

        <SubHeading>b. Organization & Grant Profile Information</SubHeading>
        <p>
          To match you with relevant funding opportunities and, where you
          choose to use it, pre-populate federal application forms (such as
          the SF-424 family), we collect information you enter about your
          organization, which may include: organization name, type, and
          mission; website and social profiles; physical address, county,
          and phone number; congressional district; EIN/UEI identifiers; and
          the name, title, phone number, and email of an authorized
          representative. You are responsible for having the authority to
          submit information about an authorized representative who is not
          you.
        </p>

        <SubHeading>c. Workspace Content</SubHeading>
        <p>
          Documents, budgets, narratives, saved grants, tasks, reports, and
          other content you or your team upload or create within a workspace
          (&ldquo;Workspace Content&rdquo;). To power search and AI features,
          we may generate and store vector embeddings (numerical
          representations) of Workspace Content you upload.
        </p>

        <SubHeading>d. Payment Information</SubHeading>
        <p>
          Subscription payments are processed by Stripe. We do not store
          full payment card numbers on our servers; Stripe provides us with
          limited billing details (such as plan, billing status, and card
          type/last four digits) needed to manage your subscription.
        </p>

        <SubHeading>e. Usage & Device Information</SubHeading>
        <p>
          We automatically collect information about how you use the
          Service, including log data, IP address, browser and device type,
          pages viewed, and timestamps, for security, troubleshooting, and
          service-improvement purposes.
        </p>

        <SubHeading>f. Communications</SubHeading>
        <p>
          If you contact support or use our in-app assistant, we retain
          records of that correspondence, including messages exchanged with
          our AI assistant chat feature, to provide support and improve the
          Service.
        </p>
      </Section>

      <Section id="how-we-use-information" title="3. How We Use Information">
        <List
          items={[
            "Operate, maintain, and improve the Service, including grant matching, deadline tracking, and application-package preparation.",
            "Generate AI-assisted search results, insights, narrative drafts, and pre-filled form content from your Workspace Content and profile information.",
            "Process payments, manage subscriptions, trials, and billing.",
            "Communicate with you about your account, updates, and support requests.",
            "Monitor, detect, and prevent fraud, abuse, and security incidents.",
            "Comply with legal obligations and enforce our Terms of Service.",
            "With your consent, send product updates or marketing communications, which you may opt out of at any time.",
          ]}
        />
      </Section>

      <Section id="ai-processing" title="4. AI Processing of Your Content">
        <p>
          Grant Scout Pro uses third-party artificial intelligence providers
          &mdash; including OpenAI, Anthropic, and Groq &mdash; to power
          search, matching, drafting, and chat features. When you use these
          features, relevant portions of your Workspace Content and profile
          information are sent to these providers for processing in order to
          generate a response. We send this data under each provider&rsquo;s
          commercial API terms, which, as of the date of this policy, state
          that data submitted through their business/API products is not
          used to train their general-purpose models. These terms can change,
          and we encourage you to avoid uploading information you do not
          want processed by a third-party AI system.
        </p>
        <p>
          Content generated by these AI features (including pre-filled
          federal forms) is a draft starting point only. You remain
          responsible for reviewing, correcting, and certifying any
          AI-assisted content before relying on it or submitting it to any
          funder or government agency.
        </p>
      </Section>

      <Section id="how-we-share-information" title="5. How We Share Information">
        <p>
          We do not sell your personal information. We share information
          with:
        </p>
        <SubHeading>Service Providers (Subprocessors)</SubHeading>
        <p>
          Companies that perform services on our behalf, including: Clerk
          (authentication), Stripe (payment processing), Supabase and our
          database hosting providers (storage/infrastructure), OpenAI,
          Anthropic, and Groq (AI processing), email delivery providers
          (such as Resend, SendGrid, or Amazon SES), and web data/search
          providers (such as Firecrawl and third-party search APIs) used to
          enrich grant discovery. These providers are contractually
          restricted to using your information only to provide services to
          us.
        </p>
        <SubHeading>Legal & Safety</SubHeading>
        <p>
          We may disclose information if required by law, or if we believe
          in good faith that disclosure is necessary to protect our rights,
          your safety, or the safety of others, or to investigate fraud or
          security issues.
        </p>
        <SubHeading>Business Transfers</SubHeading>
        <p>
          If VCG is involved in a merger, acquisition, financing, or sale of
          assets, your information may be transferred as part of that
          transaction. We will notify you of any such change in ownership or
          control of your personal information.
        </p>
        <SubHeading>With Your Direction</SubHeading>
        <p>
          Other members of a workspace you join can see Workspace Content and
          certain profile information associated with that workspace, as
          controlled by your organization&rsquo;s workspace administrators.
        </p>
      </Section>

      <Section id="public-grant-data" title="6. Public Grant Data Sources">
        <p>
          To surface funding opportunities, the Service retrieves publicly
          available grant listing data from government sources such as
          Grants.gov and SAM.gov, as well as publicly available foundation
          and nonprofit information. This publicly sourced grant data is not
          personal information about you, and our use of these sources is
          separate from, and does not affect, how we handle the personal and
          organizational information described elsewhere in this policy.
        </p>
      </Section>

      <Section id="cookies" title="7. Cookies & Similar Technologies">
        <p>
          We use essential cookies and similar technologies required for
          authentication and basic functionality (for example, to keep you
          signed in). We do not currently use third-party advertising
          cookies. If this changes, we will update this policy and provide
          any consent mechanism required by applicable law.
        </p>
      </Section>

      <Section id="data-retention" title="8. Data Retention">
        <p>
          We retain account and Workspace Content for as long as your
          account or workspace remains active, and for a reasonable period
          afterward to comply with legal obligations, resolve disputes,
          maintain backups, and enforce our agreements. Your organization
          can request deletion of its workspace and associated content at
          any time by contacting us, subject to the retention needs
          described above.
        </p>
      </Section>

      <Section id="your-rights" title="9. Your Rights & Choices">
        <p>
          Depending on where you live, you may have rights to access,
          correct, export, or delete the personal information we hold about
          you, and to opt out of certain uses. This includes rights
          available under U.S. state privacy laws (such as California&rsquo;s
          CCPA/CPRA) and, where applicable, the EU/UK General Data Protection
          Regulation. To exercise these rights, contact us using the details
          in{" "}
          <a href="#contact" className="text-[#0F2A4A] underline underline-offset-2">
            Section 15
          </a>
          . We will respond in accordance with applicable law. You can update
          most profile information directly from your account settings at
          any time.
        </p>
      </Section>

      <Section id="security" title="10. Data Security">
        <p>
          We use administrative, technical, and physical safeguards designed
          to protect your information, including encryption of sensitive
          data and access controls limiting who can view workspace
          information. No method of transmission or storage is completely
          secure, and we cannot guarantee absolute security.
        </p>
      </Section>

      <Section id="childrens-privacy" title="11. Children's Privacy">
        <p>
          The Service is intended for business and organizational use by
          adults and is not directed to individuals under 18. We do not
          knowingly collect personal information from children. If you
          believe a child has provided us with personal information, please
          contact us so we can delete it.
        </p>
      </Section>

      <Section id="international" title="12. International Users">
        <p>
          The Service is operated from, and our infrastructure is hosted in,
          the United States. If you access the Service from outside the
          United States, your information will be transferred to, stored,
          and processed in the United States, which may have data protection
          laws different from those of your jurisdiction.
        </p>
      </Section>

      <Section id="compliance-data" title="13. Federal Compliance Data">
        <p>
          Certain features let you enter detailed organizational and
          representative information used to pre-populate standard federal
          grant forms (for example, the SF-424 family). This information is
          used solely to generate application materials for your use and is
          not submitted on your behalf to any government agency by us. You
          are solely responsible for reviewing, completing, certifying, and
          submitting any application through the appropriate official
          channel, such as the Grants.gov Workspace.
        </p>
      </Section>

      <Section id="changes" title="14. Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. If we make
          material changes, we will notify you by updating the &ldquo;Last
          updated&rdquo; date above and, where appropriate, through
          additional notice such as an email or in-app message. Your
          continued use of the Service after changes take effect constitutes
          acceptance of the updated policy.
        </p>
      </Section>

      <Section id="contact" title="15. Contact Us">
        <p>
          If you have questions about this Privacy Policy or how we handle
          your information, contact us at:
        </p>
        <p className="font-medium text-gray-900">
          privacy@grantscoutpro.com
          <br />
          Venture Collective Group, LLC
        </p>
      </Section>
    </LegalPageLayout>
  );
}

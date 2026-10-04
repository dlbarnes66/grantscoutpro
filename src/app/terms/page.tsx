"use client";

import { LegalPageLayout, Section, SubHeading, List } from "@/components/legal/LegalPageLayout";

const TOC = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "description", label: "Description of Service" },
  { id: "eligibility", label: "Eligibility & Accounts" },
  { id: "subscriptions", label: "Subscriptions, Trials & Billing" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "your-content", label: "Your Content" },
  { id: "ai-disclaimer", label: "AI-Generated Content Disclaimer" },
  { id: "federal-forms", label: "Federal Form Disclaimer" },
  { id: "third-party-data", label: "Third-Party Services & Data" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "termination", label: "Termination" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "dispute-resolution", label: "Governing Law & Arbitration" },
  { id: "changes-to-terms", label: "Changes to These Terms" },
  { id: "general", label: "General Provisions" },
  { id: "contact", label: "Contact Us" },
];

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated="October 4, 2026"
      toc={TOC}
      intro={
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to
          and use of Grant Scout Pro (the &ldquo;Service&rdquo;), provided by
          Venture Collective Group, LLC, a Delaware limited liability company
          (&ldquo;VCG,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;). By creating an account or using the Service,
          you agree to be bound by these Terms. If you are using the Service
          on behalf of an organization, you represent that you have the
          authority to bind that organization to these Terms, and
          &ldquo;you&rdquo; refers to both you and that organization.
        </p>
      }
    >
      <Section id="acceptance" title="1. Acceptance of Terms">
        <p>
          By accessing or using the Service, you agree to these Terms and
          our{" "}
          <a href="/privacy" className="text-[#0F2A4A] underline underline-offset-2">
            Privacy Policy
          </a>
          , which is incorporated by reference. If you do not agree, do not
          use the Service.
        </p>
      </Section>

      <Section id="description" title="2. Description of Service">
        <p>
          Grant Scout Pro is a software platform that helps organizations
          discover federal, state, and foundation grant opportunities, track
          deadlines and workflow, and prepare grant application materials,
          including AI-assisted drafting and pre-populated federal forms.
        </p>
        <p>
          <strong>Grant Scout Pro is not a law firm, accounting firm, or
          grant-writing service, and does not guarantee that you will be
          awarded any grant.</strong> The Service is a productivity and
          research tool; funding decisions are made solely by the relevant
          government agencies, foundations, or funders, which are
          independent of VCG.
        </p>
      </Section>

      <Section id="eligibility" title="3. Eligibility & Accounts">
        <p>
          You must be at least 18 years old and able to form a binding
          contract to use the Service. You are responsible for maintaining
          the confidentiality of your account credentials and for all
          activity that occurs under your account. You agree to provide
          accurate and current information, including organizational and
          billing information.
        </p>
      </Section>

      <Section id="subscriptions" title="4. Subscriptions, Trials & Billing">
        <SubHeading>Plans</SubHeading>
        <p>
          The Service is offered under subscription plans (currently Basic,
          Team, Business, and Enterprise), each with its own pricing, seat
          limits, and feature access as described on our pricing page.
          Enterprise pricing is custom and governed by a separate order form
          where applicable. We may introduce, modify, or discontinue plans
          at any time; material price changes to your then-current plan will
          be communicated in advance.
        </p>
        <SubHeading>Free Trials</SubHeading>
        <p>
          We may offer a free trial period. You will not be charged during
          the trial. Unless you cancel before the trial ends, your account
          will automatically convert to a paid subscription and be billed
          using your payment method on file.
        </p>
        <SubHeading>Billing & Renewal</SubHeading>
        <p>
          Subscriptions are billed monthly or annually (with an annual
          discount) in advance through our payment processor, Stripe, and
          automatically renew each billing period unless cancelled before
          the renewal date. Cancelling stops future billing; your
          subscription remains active through the end of the then-current
          billing period.
        </p>
        <SubHeading>Refunds</SubHeading>
        <p>
          Refunds are handled on a case-by-case basis as described in our{" "}
          <a href="/refund" className="text-[#0F2A4A] underline underline-offset-2">
            Refund Policy
          </a>
          . Fees are otherwise non-refundable except as required by law.
        </p>
        <SubHeading>Usage Limits</SubHeading>
        <p>
          Each plan includes limits on seats, workspaces, manual and
          AI-assisted searches, and monthly AI usage. We enforce these
          limits to keep the Service reliable and fairly priced; exceeding
          them may require upgrading your plan.
        </p>
      </Section>

      <Section id="acceptable-use" title="5. Acceptable Use">
        <p>You agree not to:</p>
        <List
          items={[
            "Use the Service for any unlawful purpose, including to prepare or submit fraudulent, false, or misleading information to any funder or government agency.",
            "Circumvent, disable, or attempt to exceed usage limits, rate limits, or access controls, including through automated scraping or abuse of AI features.",
            "Reverse engineer, decompile, or attempt to extract the source code of the Service, except as permitted by law.",
            "Upload content that infringes the rights of others or that you do not have the right to share (including personal information about a third party, such as an authorized representative, without their consent).",
            "Interfere with or disrupt the integrity or performance of the Service or its underlying infrastructure.",
            "Resell, sublicense, or provide access to the Service to third parties outside your organization's licensed seats without our consent.",
          ]}
        />
      </Section>

      <Section id="your-content" title="6. Your Content">
        <p>
          You retain ownership of the organizational profile information,
          documents, and other content you or your team submit to the
          Service (&ldquo;Your Content&rdquo;). You grant VCG a worldwide,
          non-exclusive license to host, store, process, transmit, and
          display Your Content solely to provide, maintain, and improve the
          Service for you, including processing by the AI providers
          described in our Privacy Policy. You are responsible for Your
          Content and for having all rights necessary to submit it.
        </p>
      </Section>

      <Section id="ai-disclaimer" title="7. AI-Generated Content Disclaimer">
        <p>
          The Service uses artificial intelligence to generate search
          results, matches, insights, narrative drafts, budget breakdowns,
          and pre-filled form content (collectively, &ldquo;AI
          Output&rdquo;). <strong>AI Output may be inaccurate, incomplete, or
          unsuitable for your specific grant application and is provided as
          a drafting aid only.</strong> You are solely responsible for
          independently reviewing, verifying, editing, and certifying any AI
          Output before relying on it or submitting it to any third party,
          funder, or government agency. VCG disclaims liability for any
          consequence of relying on AI Output without independent review.
        </p>
      </Section>

      <Section id="federal-forms" title="8. Federal Form Disclaimer">
        <p>
          Certain features generate copies of standard federal grant forms
          (such as the SF-424, SF-424A, and SF-424B) populated with
          information from your organization&rsquo;s profile, for your
          convenience. These are independently generated documents designed
          to resemble the official forms; they are not sourced from, hosted
          by, submitted to, or endorsed by Grants.gov or any federal agency.
          You are responsible for completing, certifying, and submitting any
          actual application through the official Grants.gov Workspace or
          other required channel, and for ensuring the final submission
          meets all applicable requirements.
        </p>
      </Section>

      <Section id="third-party-data" title="9. Third-Party Services & Data">
        <p>
          The Service displays grant opportunity data drawn from public
          sources such as Grants.gov, SAM.gov, and publicly available
          foundation information, and relies on third-party infrastructure
          and AI providers to operate. We do our best to keep this data
          accurate and current but do not guarantee its accuracy,
          completeness, or timeliness, and are not responsible for errors,
          omissions, or changes made by these third parties. Your use of any
          third-party service linked from or integrated with the Service is
          subject to that provider&rsquo;s own terms.
        </p>
      </Section>

      <Section id="intellectual-property" title="10. Intellectual Property">
        <p>
          The Service, including its software, design, text, graphics, and
          the Grant Scout Pro name and logo, is owned by VCG or its
          licensors and is protected by intellectual property laws. Subject
          to these Terms, we grant you a limited, non-exclusive,
          non-transferable license to access and use the Service for your
          internal business purposes. All rights not expressly granted are
          reserved.
        </p>
      </Section>

      <Section id="termination" title="11. Termination">
        <p>
          You may cancel your account at any time from your account
          settings or by contacting us. We may suspend or terminate your
          access to the Service if you breach these Terms, fail to pay
          applicable fees, or engage in conduct that we reasonably believe
          harms the Service or other users. Upon termination, your right to
          use the Service ends; we will handle your data in accordance with
          our Privacy Policy and applicable retention obligations.
        </p>
      </Section>

      <Section id="disclaimers" title="12. Disclaimers">
        <p>
          THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
          AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR
          IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
          THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR
          THAT ANY GRANT APPLICATION PREPARED USING THE SERVICE WILL RESULT
          IN FUNDING.
        </p>
      </Section>

      <Section id="liability" title="13. Limitation of Liability">
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, VCG AND ITS OFFICERS,
          EMPLOYEES, AND SERVICE PROVIDERS WILL NOT BE LIABLE FOR ANY
          INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
          OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GRANT FUNDING, ARISING
          OUT OF OR RELATED TO YOUR USE OF THE SERVICE. OUR TOTAL LIABILITY
          FOR ANY CLAIM ARISING OUT OF OR RELATED TO THESE TERMS OR THE
          SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE (12)
          MONTHS BEFORE THE CLAIM AROSE. SOME JURISDICTIONS DO NOT ALLOW
          CERTAIN LIMITATIONS OF LIABILITY, SO SOME OF THE ABOVE LIMITATIONS
          MAY NOT APPLY TO YOU.
        </p>
      </Section>

      <Section id="indemnification" title="14. Indemnification">
        <p>
          You agree to indemnify and hold harmless VCG and its officers,
          employees, and agents from any claims, damages, liabilities, and
          expenses (including reasonable attorneys&rsquo; fees) arising out
          of your use of the Service, Your Content, your violation of these
          Terms, or your violation of any law or third-party right,
          including any grant application you submit based on AI Output you
          did not independently verify.
        </p>
      </Section>

      <Section id="dispute-resolution" title="15. Governing Law & Arbitration">
        <p>
          These Terms are governed by the laws of the State of Delaware,
          without regard to its conflict-of-laws principles.
        </p>
        <SubHeading>Binding Arbitration & Class Action Waiver</SubHeading>
        <p>
          You and VCG agree that any dispute, claim, or controversy arising
          out of or relating to these Terms or the Service will be resolved
          through final and binding individual arbitration administered by
          the American Arbitration Association (AAA) under its Commercial
          Arbitration Rules, rather than in court, except that either party
          may bring an individual claim in small claims court if it
          qualifies.{" "}
          <strong>
            YOU AND VCG EACH WAIVE THE RIGHT TO A JURY TRIAL AND TO
            PARTICIPATE IN A CLASS ACTION, CLASS ARBITRATION, OR
            REPRESENTATIVE PROCEEDING.
          </strong>{" "}
          Arbitration will take place on an individual basis; the arbitrator
          may not consolidate claims or preside over any form of
          representative or class proceeding. If this class action waiver is
          found unenforceable as to a particular claim, that claim (and only
          that claim) may proceed in court, with the remainder of this
          arbitration provision remaining in effect.
        </p>
      </Section>

      <Section id="changes-to-terms" title="16. Changes to These Terms">
        <p>
          We may update these Terms from time to time. If we make material
          changes, we will update the &ldquo;Last updated&rdquo; date above
          and provide reasonable notice, such as by email or in-app message.
          Your continued use of the Service after changes take effect
          constitutes acceptance of the updated Terms.
        </p>
      </Section>

      <Section id="general" title="17. General Provisions">
        <p>
          These Terms, together with our Privacy Policy and any order form
          or plan-specific terms, constitute the entire agreement between
          you and VCG regarding the Service. If any provision of these
          Terms is found unenforceable, the remaining provisions will remain
          in full effect. Our failure to enforce any provision is not a
          waiver of our right to do so later. You may not assign these Terms
          without our consent; we may assign these Terms in connection with
          a merger, acquisition, or sale of assets. Neither party is liable
          for delays caused by events beyond its reasonable control.
        </p>
      </Section>

      <Section id="contact" title="18. Contact Us">
        <p>If you have questions about these Terms, contact us at:</p>
        <p className="font-medium text-gray-900">
          legal@grantscoutpro.com
          <br />
          Venture Collective Group, LLC
        </p>
      </Section>
    </LegalPageLayout>
  );
}

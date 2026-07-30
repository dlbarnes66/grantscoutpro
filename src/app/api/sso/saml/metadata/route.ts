export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";




export async function GET() {
  const metadata = `
<EntityDescriptor entityID="${process.env.SAML_ENTITY_ID}">
  <SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <AssertionConsumerService
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
      Location="${process.env.NEXT_PUBLIC_BASE_URL}/api/sso/saml/acs"
      index="1"/>
  </SPSSODescriptor>
</EntityDescriptor>
  `;

  return new Response(metadata, {
    headers: { "Content-Type": "application/xml" },
  });
}

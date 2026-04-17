/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_URL = 'https://khotrjtyyrtyuvlzlzrd.supabase.co/storage/v1/object/public/email-assets/logo.jpg'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Family Food OS verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} alt="Family Food OS" width="56" height="56" style={logo} />
        </Section>
        <Heading style={h1}>Confirm it's you</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Hr style={hr} />
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { marginBottom: '24px' }
const logo = { borderRadius: '12px' }
const h1 = {
  fontFamily: '"Fraunces", Georgia, serif',
  fontSize: '28px',
  fontWeight: '600' as const,
  color: '#1f1f1c',
  margin: '0 0 16px',
  lineHeight: '1.2',
}
const text = { fontSize: '15px', color: '#5b5b54', lineHeight: '1.6', margin: '0 0 16px' }
const codeStyle = {
  fontFamily: '"Fraunces", Georgia, serif',
  fontSize: '32px',
  fontWeight: '600' as const,
  color: '#477359',
  letterSpacing: '6px',
  margin: '12px 0 24px',
}
const hr = { borderColor: '#e8e4dc', margin: '32px 0 20px' }
const footer = { fontSize: '12px', color: '#999991', margin: '0' }

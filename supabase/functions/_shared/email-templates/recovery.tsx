/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

const LOGO_URL = 'https://khotrjtyyrtyuvlzlzrd.supabase.co/storage/v1/object/public/email-assets/logo.jpg'

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your Family Food OS password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} alt="Family Food OS" width="56" height="56" style={logo} />
        </Section>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your Family Food OS password. Click below to choose a new one — the link expires shortly.
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Reset password
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          If you didn't request this, you can safely ignore this email — your password won't change.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
const buttonSection = { margin: '28px 0' }
const button = {
  backgroundColor: '#477359',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const hr = { borderColor: '#e8e4dc', margin: '32px 0 20px' }
const footer = { fontSize: '12px', color: '#999991', margin: '0' }

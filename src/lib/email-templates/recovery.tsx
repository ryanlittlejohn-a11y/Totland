import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'

import {
  brandMark,
  button,
  container,
  darkModeCss,
  footer,
  h1,
  main,
  tagline,
  text,
} from './brand'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ siteName, confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Reset your {siteName} password</Preview>
    <Body style={main}>
      <Container className="dm-card" style={container}>
        <Text style={brandMark}>{siteName}</Text>
        <Text style={tagline}>Kids learn by playing.</Text>
        <Heading className="dm-head" style={h1}>
          Reset your password
        </Heading>
        <Text className="dm-text" style={text}>
          We received a request to reset the password for your {siteName} grown-up account. Choose a
          new one below.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Choose a new password
        </Button>
        <Text style={footer}>
          If you didn&apos;t ask for a password reset, you can safely ignore this email — your
          password stays the same.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

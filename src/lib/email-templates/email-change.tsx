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

interface EmailChangeEmailProps {
  siteName: string
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Confirm your new {siteName} email address</Preview>
    <Body style={main}>
      <Container className="dm-card" style={container}>
        <Text style={brandMark}>{siteName}</Text>
        <Text style={tagline}>Kids learn by playing.</Text>
        <Heading className="dm-head" style={h1}>
          Confirm your new email
        </Heading>
        <Text className="dm-text" style={text}>
          You asked to change the email on your {siteName} account from{' '}
          <strong>{oldEmail || email}</strong> to <strong>{newEmail || email}</strong>.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm the change
        </Button>
        <Text style={footer}>
          If you didn&apos;t request this change, you can safely ignore this email and your address
          stays the same.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

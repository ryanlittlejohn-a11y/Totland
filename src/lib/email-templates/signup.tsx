import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
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
  link,
  main,
  tagline,
  text,
} from './brand'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Confirm your email for {siteName}</Preview>
    <Body style={main}>
      <Container className="dm-card" style={container}>
        <Text style={brandMark}>{siteName}</Text>
        <Text style={tagline}>Kids learn by playing.</Text>
        <Heading className="dm-head" style={h1}>
          Confirm your email
        </Heading>
        <Text className="dm-text" style={text}>
          Thanks for creating a grown-up account at{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . One quick step and the learning adventures are ready.
        </Text>
        <Text className="dm-text" style={text}>
          Confirm {recipient} by tapping the button below:
        </Text>
        <Button style={button} href={confirmationUrl}>
          Verify my email
        </Button>
        <Text style={footer}>
          If you didn&apos;t create a {siteName} account, you can safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

export interface ContactConfirmationProps {
  name?: string
  message?: string
}

export function ContactConfirmation({
  name = 'there',
  message = '',
}: ContactConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>We received your message — Totland</Preview>
      <Body style={{ backgroundColor: '#faf7f2', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <Container style={{ padding: '24px', maxWidth: '560px' }}>
          <Heading style={{ fontSize: '20px', margin: '0 0 12px' }}>
            Thanks for reaching out, {name}!
          </Heading>
          <Text>
            We received your message and a real person will reply soon, usually within one or two
            business days.
          </Text>
          {message ? (
            <>
              <Hr />
              <Text style={{ fontSize: '13px', color: '#6b6257' }}>Your message:</Text>
              <Text style={{ whiteSpace: 'pre-wrap' }}>{message}</Text>
            </>
          ) : null}
          <Hr />
          <Text style={{ fontSize: '13px', color: '#6b6257' }}>
            Totland — kids learn by playing.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: ContactConfirmation,
  subject: 'We received your message — Totland',
  displayName: 'Contact form confirmation',
  previewData: {
    name: 'Jamie',
    message: 'My child loves the letter games! How do I add a second profile?',
  },
} satisfies TemplateEntry

import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
} from "@react-email/components";

export default function NotificationEmail({
  giftTitle,
  message,
  name,
  email,
  amountPaid,
  totalPaid,
  goalAmount,
}: {
  giftTitle: string;
  message: string;
  name: string;
  email: string;
  amountPaid: number;
  totalPaid: number;
  goalAmount: number;
}) {
  return (
    <Html>
      <Head />
      <Preview>New gift contribution notification</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif" }}>
        <Container>
          <Heading>New Gift Contribution</Heading>
          <Text>
            <strong>Gift:</strong> {giftTitle}
          </Text>
          <Text>
            <strong>Amount Paid:</strong> €{(amountPaid / 100).toFixed(2)}
          </Text>
          <Text>
            <strong>From:</strong> {name}
          </Text>
          <Text>
            <strong>Email:</strong> {email}
          </Text>
          <Text>
            <strong>Message:</strong> {message}
          </Text>
          <hr />
          <Text>
            <strong>Total Paid:</strong> €{(totalPaid / 100).toFixed(2)} / €
            {(goalAmount / 100).toFixed(2)}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

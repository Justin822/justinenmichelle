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
      <Preview>Nieuw cadeau ontvangen</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif" }}>
        <Container>
          <Heading>Nieuw cadeau ontvangen</Heading>
          <Text>
            <strong>Cadeau:</strong> {giftTitle}
          </Text>
          <Text>
            <strong>Bedrag betaald:</strong> €{(amountPaid / 100).toFixed(2)}
          </Text>
          <Text>
            <strong>Van:</strong> {name}
          </Text>
          <Text>
            <strong>Email:</strong> {email}
          </Text>
          <Text>
            <strong>Persoonlijk bericht:</strong> {message}
          </Text>
          <hr />
          <Text>
            <strong>Eindtotaal cadeau:</strong> €{(totalPaid / 100).toFixed(2)}{" "}
            / €{(goalAmount / 100).toFixed(2)}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

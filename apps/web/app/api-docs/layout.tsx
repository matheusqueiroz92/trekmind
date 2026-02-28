import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API — TrekMind",
  description: "Documentação da API TrekMind (Swagger/OpenAPI)",
};

export default function ApiDocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// @ts-expect-error swagger-ui-react peer deps (React 18) conflict with React 19
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SwaggerUI url="/openapi.json" />
    </div>
  );
}

"use client";
import { Suspense } from "react";
import HomeClient from "./homeclient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeClient />
    </Suspense>
  );
}
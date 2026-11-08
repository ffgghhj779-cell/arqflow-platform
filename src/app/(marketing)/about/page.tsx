import type { Metadata } from "next";
import AboutClient from "./client";

export const metadata: Metadata = {
  title: "من نحن · About",
  description:
    "قصة ArqFlow — موظف ذكاء اصطناعي متكامل لخدمة ومبيعات عملائك ٢٤ ساعة في السعودية ومصر.",
};

export default function AboutPage() {
  return <AboutClient />;
}

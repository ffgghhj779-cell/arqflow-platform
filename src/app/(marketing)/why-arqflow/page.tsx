import type { Metadata } from "next";
import WhyArqflowClient from "./client";

export const metadata: Metadata = {
  title: "ليه ArqFlow · Why ArqFlow",
  description:
    "سرعة فائقة، إتقان اللهجات السعودية والمصرية، أتمتة حقيقية بمحرك n8n، ذكاء اصطناعي خاص لكل نشاط، ومحفظة رصيد مرنة وتحويل بشري ذكي.",
};

export default function WhyArqflowPage() {
  return <WhyArqflowClient />;
}

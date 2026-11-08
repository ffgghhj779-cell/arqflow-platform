import { SiteHeader, SiteFooter } from "@/components/marketing/SiteChrome";
import TrackerAndPopup from "@/components/marketing/TrackerAndPopup";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <TrackerAndPopup />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

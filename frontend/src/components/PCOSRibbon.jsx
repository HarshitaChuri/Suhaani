import { Ribbon } from "lucide-react";

// Teal is the real, official PCOS awareness color (PCOS Awareness Month is
// September). lucide-react's Ribbon icon is purpose-built for this.
export default function PCOSRibbon({ size = 64 }) {
  return <Ribbon size={size} color="var(--color-secondary)" strokeWidth={1.75} />;
}
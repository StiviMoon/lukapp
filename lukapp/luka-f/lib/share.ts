import { formatCompact } from "@/lib/utils";

export async function shareMonthSummary(
  spaceName: string,
  total: number,
  mySpent: number,
  partnerName: string
): Promise<boolean> {
  if (!navigator.share) return false;
  try {
    await navigator.share({
      title: `Resumen ${spaceName} — Lukapp`,
      text: `Este mes gastamos ${formatCompact(total)} juntos. Yo: ${formatCompact(mySpent)}, ${partnerName}: ${formatCompact(total - mySpent)}`,
    });
    return true;
  } catch {
    return false;
  }
}

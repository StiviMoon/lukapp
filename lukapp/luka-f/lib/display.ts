export function displayMemberName(
  fullName: string | null | undefined,
  email: string | null | undefined,
  spaceType: "PAREJA" | "FAMILIAR",
  isMe: boolean
): string {
  if (isMe) return "Yo";
  if (fullName) return fullName.split(" ")[0];
  if (!email) return spaceType === "PAREJA" ? "My love" : "Miembro";
  if (spaceType === "PAREJA") return "My love";
  const prefix = email.split("@")[0];
  return prefix.length > 12 ? prefix.slice(0, 10) + "…" : prefix;
}

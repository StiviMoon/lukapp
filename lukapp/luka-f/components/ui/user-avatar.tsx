import { cn } from "@/lib/utils";

interface UserAvatarProps {
  letter: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { container: "w-[42px] h-[42px]", text: "text-sm font-bold" },
  md: { container: "w-16 h-16",          text: "text-2xl font-black" },
  lg: { container: "w-20 h-20",          text: "text-3xl font-black" },
};

export function UserAvatar({ letter, size = "sm", className }: UserAvatarProps) {
  const { container, text } = sizeMap[size];
  return (
    <div
      className={cn("rounded-full flex items-center justify-center", container, className)}
      style={{ backgroundColor: "var(--avatar-bg)" }}
    >
      <span className={cn("text-primary uppercase", text)}>{letter}</span>
    </div>
  );
}

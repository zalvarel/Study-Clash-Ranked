import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padding?: "none" | "sm" | "md" | "lg";
};

const PADDING = { none: "", sm: "p-4", md: "p-5 sm:p-6", lg: "p-6 sm:p-10" };

/** Kartu putih berbingkai tipis, sudut besar. */
export function Card({ padding = "md", className = "", ...props }: CardProps) {
  return (
    <div className={`rounded-card-sm border-[1.5px] border-line bg-white ${PADDING[padding]} ${className}`} {...props} />
  );
}

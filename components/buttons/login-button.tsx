import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LoginButtonProps {
  href: string;
  text?: string;
  className?: string;
}

export default function LoginButton({
  href,
  text,
  className,
}: LoginButtonProps) {
  return (
    <Link href={href}>
      <Button
        size="lg"
        variant="default"
        className={cn(
          `bg-gray-300 hover:bg-gray-300/80 dark:bg-gray-500 dark:hover:bg-gray-500/80 border-2 text-text border-gray-300 px-6 h-9 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105
          justify-center items-center`,
          className
        )}
      >
        {text || "Login"}
      </Button>
    </Link>
  );
}

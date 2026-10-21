import { getDomainBadge } from "@/lib/domains/icon-utils";
import { cn } from "@/lib/utils";

/** Small coloured square identifying a mail domain; the letters come from the Domains page or the hostname. */
export function DomainBadge({ hostname, iconLabel, iconColor, title, className }: {
	hostname: string;
	iconLabel?: string | null;
	iconColor?: string | null;
	title?: string;
	className?: string;
}) {
	const badge = getDomainBadge(hostname, iconLabel, iconColor);
	return (
		<span
			aria-hidden={title ? undefined : true}
			role={title ? "img" : undefined}
			aria-label={title}
			title={title}
			className={cn(
				"inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded px-0.5 text-[9px] font-bold leading-none tracking-tight",
				className,
			)}
			style={badge.style}
		>
			{badge.text}
		</span>
	);
}

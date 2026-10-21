import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type NavLink = {
	href?: string;
	label?: string;
	icon?: LucideIcon;
	iconColor?: string;
	primary?: boolean;
	preloadMessages?: boolean;
	count?: number;
	onMessageDrop?: (messageIds: string[]) => void;
	/** Overrides the pathname match, for several links that share one href. */
	active?: boolean;
	/** Runs on click before navigating. */
	onSelect?: () => void;
	indent?: boolean;
	/** Drawn in place of `icon`. */
	iconNode?: ReactNode;
	/** Inline after the label. */
	suffix?: ReactNode;
	title?: string;
};

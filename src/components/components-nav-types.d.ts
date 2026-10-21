import type { LucideIcon } from "lucide-react";

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
};

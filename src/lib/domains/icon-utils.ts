import { getAvatarColorStyle } from "@/lib/avatar-colors";

export const DOMAIN_ICON_LABEL_MAX = 3;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

type DomainIconInput = { iconLabel?: string | null; iconColor?: string | null };

/**
 * Validates an icon edit from the Domains page. Only the fields sent are returned; an empty
 * string clears that field back to the hostname-derived default.
 */
export function parseDomainIconInput(body: { iconLabel?: unknown; iconColor?: unknown }): DomainIconInput | { error: string } {
	const result: DomainIconInput = {};
	if (body.iconLabel !== undefined) {
		if (typeof body.iconLabel !== "string") return { error: "iconLabel must be a string" };
		const label = body.iconLabel.trim();
		if (Array.from(label).length > DOMAIN_ICON_LABEL_MAX) return { error: `iconLabel can be at most ${DOMAIN_ICON_LABEL_MAX} characters` };
		result.iconLabel = label || null;
	}
	if (body.iconColor !== undefined) {
		if (typeof body.iconColor !== "string") return { error: "iconColor must be a string" };
		const color = body.iconColor.trim().toLowerCase();
		if (color && !HEX_COLOR.test(color)) return { error: "iconColor must be a #rrggbb colour" };
		result.iconColor = color || null;
	}
	return result;
}

/** Text and colours for a domain's badge, falling back to its first letter and a hashed colour. */
export function getDomainBadge(hostname: string, iconLabel?: string | null, iconColor?: string | null) {
	const text = iconLabel || hostname.charAt(0).toUpperCase();
	if (!iconColor) return { text, style: getAvatarColorStyle(hostname) };
	const value = Number.parseInt(iconColor.slice(1), 16);
	const luminance = (0.299 * (value >> 16) + 0.587 * ((value >> 8) & 0xff) + 0.114 * (value & 0xff)) / 255;
	return { text, style: { backgroundColor: iconColor, color: luminance > 0.6 ? "#202124" : "#ffffff" } };
}

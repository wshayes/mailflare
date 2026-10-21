import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLanguage } from "@/components/language-provider";
import { DomainBadge } from "@/components/domain-badge";
import { clearMailboxesCache } from "@/components/mailbox-provider-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DOMAIN_ICON_LABEL_MAX, getDomainBadge } from "@/lib/domains/icon-utils";
import { requestJson } from "./api";
import type { Domain } from "./types";

/** Letters and colour of the badge that marks this domain's mailboxes in the sidebar and All inboxes. */
export default function DomainIconEditor({ domain }: { domain: Domain }) {
	const { t } = useLanguage();
	const qc = useQueryClient();
	const [label, setLabel] = useState(domain.iconLabel ?? "");
	const [color, setColor] = useState(domain.iconColor ?? "");
	const save = useMutation({
		mutationFn: (body: { iconLabel: string; iconColor: string }) => requestJson(`/api/domains/${domain.id}`, "PATCH", body),
		onSuccess: () => {
			clearMailboxesCache();
			void qc.invalidateQueries({ queryKey: ["domains"] });
		},
	});
	const dirty = label !== (domain.iconLabel ?? "") || color !== (domain.iconColor ?? "");
	const fallback = getDomainBadge(domain.hostname);

	return (
		<div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600">
			<span className="font-medium">{t("domains.icon.title")}</span>
			<DomainBadge hostname={domain.hostname} iconLabel={label.trim() || null} iconColor={color || null} className="h-6 min-w-6 text-[11px]" />
			<Input
				value={label}
				onChange={(event) => setLabel(event.target.value)}
				maxLength={DOMAIN_ICON_LABEL_MAX}
				placeholder={fallback.text}
				aria-label={t("domains.icon.letters")}
				className="h-8 w-16 text-center text-xs"
			/>
			<input
				type="color"
				value={color || fallback.style.backgroundColor}
				onChange={(event) => setColor(event.target.value)}
				aria-label={t("navigation.color")}
				className="h-8 w-10 cursor-pointer rounded border border-neutral-200 bg-white p-0.5"
			/>
			<Button size="sm" variant="outline" className="h-8" disabled={!dirty || save.isPending} onClick={() => save.mutate({ iconLabel: label, iconColor: color })}>
				{save.isPending ? t("common.saving") : t("domains.icon.save")}
			</Button>
			{(label || color) && (
				<button type="button" className="text-blue-600 hover:text-blue-800" onClick={() => { setLabel(""); setColor(""); }}>
					{t("domains.icon.reset")}
				</button>
			)}
			{save.isSuccess && !dirty && <span className="text-green-700">{t("common.saved")}</span>}
			{save.isError && <span className="text-red-600">{save.error.message}</span>}
		</div>
	);
}

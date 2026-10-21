import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { domains } from "@/db/schema";
import { getEnv } from "@/lib/cloudflare";
import { requireUser } from "@/lib/auth/cookies";
import { canManageDomains } from "@/lib/auth/admin";
import { getDomainForUser, removeDomainForUser } from "@/lib/domains/service";
import { hasValidSessionMutationOrigin } from "@/lib/auth/origin";
import { parseDomainIconInput } from "@/lib/domains/icon-utils";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
	const { id } = await params;
	const env = getEnv();
	const user = await requireUser(env, request);
	const domain = await getDomainForUser(env, user.id, id);
	if (!domain) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ domain });
}

/** Clears the "DNS skipped" warning once the operator has set the records themselves, or sets the sidebar icon. */
export async function PATCH(request: Request, { params }: Params) {
	const { id } = await params;
	const env = getEnv();
	const user = await requireUser(env, request);
	if (!canManageDomains(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	if (!hasValidSessionMutationOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
	const body = (await request.json().catch(() => null)) as { dnsSkipped?: unknown; iconLabel?: unknown; iconColor?: unknown } | null;
	if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
	if (body.dnsSkipped !== undefined && typeof body.dnsSkipped !== "boolean") {
		return NextResponse.json({ error: "dnsSkipped must be a boolean" }, { status: 400 });
	}
	const icon = parseDomainIconInput(body);
	if ("error" in icon) return NextResponse.json({ error: icon.error }, { status: 400 });
	const values = { ...icon, ...(body.dnsSkipped !== undefined ? { dnsSkipped: body.dnsSkipped as boolean } : {}) };
	if (Object.keys(values).length === 0) return NextResponse.json({ error: "No changes requested" }, { status: 400 });
	const domain = await getDomainForUser(env, user.id, id);
	if (!domain) return NextResponse.json({ error: "Not found" }, { status: 404 });
	await getDb(env).update(domains).set(values).where(eq(domains.id, id));
	return NextResponse.json({ domain: { ...domain, ...values } });
}

export async function DELETE(request: Request, { params }: Params) {
	const { id } = await params;
	const env = getEnv();
	const user = await requireUser(env, request);
	if (!canManageDomains(user)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
	if (!hasValidSessionMutationOrigin(request)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
	try {
		await removeDomainForUser(env, user.id, id);
		return NextResponse.json({ ok: true });
	} catch (err) {
		const message = err instanceof Error ? err.message : "Failed to remove domain";
		return NextResponse.json({ error: message }, { status: 400 });
	}
}

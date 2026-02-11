import { headers } from "next/headers";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser, updateUserByClerkId, deleteUserByClerkId } from "@/lib/queries/users";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET env variable");
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch {
    console.error("Webhook verification failed");
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, public_metadata } = evt.data;
    const email = email_addresses[0]?.email_address ?? "";
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || "User";
    const role = (public_metadata as { role?: string })?.role === "admin" ? "ADMIN" : "USER";

    await createUser({
      clerkId: id,
      email,
      fullName,
      role: role as "ADMIN" | "USER",
    });
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses[0]?.email_address ?? "";
    const fullName = [first_name, last_name].filter(Boolean).join(" ") || "User";

    await updateUserByClerkId(id, { email, fullName });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      try {
        await deleteUserByClerkId(id);
      } catch {
        console.log("User not found in DB during deletion");
      }
    }
  }

  return NextResponse.json({ received: true });
}


import CrudOperations from "@/lib/crud-operations";
import { createSuccessResponse, createErrorResponse } from "@/lib/create-response";
import { requestMiddleware, parseQueryParams, validateRequestBody } from "@/lib/api-utils";
import { generateAdminUserToken } from "@/lib/auth";

interface HomepageAdSlot {
  id: number;
  slot_key: string;
  title: string;
  html_content: string;
  is_active: boolean;
  start_time?: string | null;
  end_time?: string | null;
  display_order: number;
}

function isInDisplayWindow(slot: HomepageAdSlot, now: Date): boolean {
  const startAt = slot?.start_time ? new Date(slot.start_time) : null;
  const endAt = slot?.end_time ? new Date(slot.end_time) : null;
  const afterStart = !startAt || now >= startAt;
  const beforeEnd = !endAt || now <= endAt;
  return afterStart && beforeEnd;
}

// GET - public fetch for homepage display
export const GET = requestMiddleware(async (request) => {
  try {
    const url = new URL(request.url);
    const slotKey = url.searchParams.get("slot_key") || "home_mid_banner";
    const adminMode = url.searchParams.get("admin") === "true";

    const adminToken = await generateAdminUserToken();
    const adSlotsCrud = new CrudOperations("homepage_ad_slots", adminToken);

    if (adminMode) {
      const allSlots = await adSlotsCrud.findMany(
        {},
        { limit: 100, offset: 0, orderBy: { column: "display_order", direction: "asc" } }
      );
      return createSuccessResponse(allSlots);
    }

    const rawSlots = await adSlotsCrud.findMany(
      { slot_key: slotKey, is_active: true },
      { limit: 50, offset: 0, orderBy: { column: "display_order", direction: "asc" } }
    );

    const now = new Date();
    const visibleSlots = (Array.isArray(rawSlots) ? rawSlots : []).filter((slot) =>
      isInDisplayWindow(slot as HomepageAdSlot, now)
    );

    return createSuccessResponse(visibleSlots);
  } catch (error) {
    console.error("Operation failed");
    return createErrorResponse({ errorMessage: "Failed to fetch homepage ad slots", status: 500 });
  }
}, false);

// POST - create new ad slot (admin only)
export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);

  if (!body.title || !body.html_content || !body.slot_key) {
    return createErrorResponse({ errorMessage: "title, slot_key and html_content are required", status: 400 });
  }

  const adminToken = await generateAdminUserToken();
  const adSlotsCrud = new CrudOperations("homepage_ad_slots", adminToken);

  const data = await adSlotsCrud.create({
    slot_key: body.slot_key || "home_mid_banner",
    title: body.title,
    html_content: body.html_content,
    is_active: body.is_active ?? true,
    start_time: body.start_time || null,
    end_time: body.end_time || null,
    display_order: body.display_order || 1,
    created_by_user_id: context.payload?.sub || null,
  });

  return createSuccessResponse(data, 201);
}, true);

// PUT - update existing ad slot (admin only)
export const PUT = requestMiddleware(async (request) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return createErrorResponse({ errorMessage: "ID is required", status: 400 });
  }

  const body = await validateRequestBody(request);
  const adminToken = await generateAdminUserToken();
  const adSlotsCrud = new CrudOperations("homepage_ad_slots", adminToken);

  const existing = await adSlotsCrud.findById(id);
  if (!existing) {
    return createErrorResponse({ errorMessage: "Ad slot not found", status: 404 });
  }

  const data = await adSlotsCrud.update(id, {
    ...(body.title !== undefined && { title: body.title }),
    ...(body.html_content !== undefined && { html_content: body.html_content }),
    ...(body.is_active !== undefined && { is_active: body.is_active }),
    ...(body.slot_key !== undefined && { slot_key: body.slot_key }),
    ...(body.start_time !== undefined && { start_time: body.start_time }),
    ...(body.end_time !== undefined && { end_time: body.end_time }),
    ...(body.display_order !== undefined && { display_order: body.display_order }),
    modify_time: new Date().toISOString(),
  });

  return createSuccessResponse(data);
}, true);

// DELETE - remove ad slot (admin only)
export const DELETE = requestMiddleware(async (request) => {
  const { id } = parseQueryParams(request);

  if (!id) {
    return createErrorResponse({ errorMessage: "ID is required", status: 400 });
  }

  const adminToken = await generateAdminUserToken();
  const adSlotsCrud = new CrudOperations("homepage_ad_slots", adminToken);

  const existing = await adSlotsCrud.findById(id);
  if (!existing) {
    return createErrorResponse({ errorMessage: "Ad slot not found", status: 404 });
  }

  await adSlotsCrud.delete(id);
  return createSuccessResponse({ id });
}, true);

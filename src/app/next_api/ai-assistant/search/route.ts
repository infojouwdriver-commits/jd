
import { requestMiddleware, parseQueryParams } from "@/lib/api-utils";
import { createSuccessResponse, createErrorResponse } from "@/lib/create-response";
import { generateAdminUserToken } from "@/lib/auth";
import CrudOperations from "@/lib/crud-operations";

export const GET = requestMiddleware(async (request) => {
  const { search, type } = parseQueryParams(request);

  if (!search || !type) {
    return createErrorResponse({ errorMessage: "search and type are required", status: 400 });
  }

  const adminToken = await generateAdminUserToken();

  try {
    if (type === "company") {
      const crud = new CrudOperations("companies", adminToken);
      const all = await crud.findMany({}, { limit: 200 });
      const results = (all || []).filter((c: any) =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.kbo_number?.toLowerCase().includes(search.toLowerCase())
      );
      return createSuccessResponse(results.slice(0, 5));
    }

    if (type === "driver") {
      const crud = new CrudOperations("drivers", adminToken);
      const all = await crud.findMany({}, { limit: 200 });
      const results = (all || []).filter((d: any) =>
        d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        d.phone?.toLowerCase().includes(search.toLowerCase())
      );
      return createSuccessResponse(results.slice(0, 5));
    }

    if (type === "vehicle") {
      const crud = new CrudOperations("vehicles", adminToken);
      const all = await crud.findMany({}, { limit: 200 });
      const results = (all || []).filter((v: any) =>
        v.plate_number?.toLowerCase().includes(search.toLowerCase()) ||
        v.brand?.toLowerCase().includes(search.toLowerCase()) ||
        v.model?.toLowerCase().includes(search.toLowerCase())
      );
      return createSuccessResponse(results.slice(0, 5));
    }

    if (type === "trip") {
      const crud = new CrudOperations("trips", adminToken);
      const all = await crud.findMany({}, { limit: 200 });
      const results = (all || []).filter((t: any) =>
        String(t.id).includes(search) ||
        t.status?.toLowerCase().includes(search.toLowerCase())
      );
      return createSuccessResponse(results.slice(0, 5));
    }

    return createErrorResponse({ errorMessage: "Invalid search type", status: 400 });
  } catch (error: any) {
    return createErrorResponse({ errorMessage: error.message || "Search failed", status: 500 });
  }
}, false);

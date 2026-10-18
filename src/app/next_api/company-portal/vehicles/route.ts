import { fleetChange } from "@/lib/company-changes";
export const POST = fleetChange("vehicle", "create");
export const PUT = fleetChange("vehicle", "update");
export const DELETE = fleetChange("vehicle", "deactivate");

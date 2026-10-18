import { fleetChange } from "@/lib/company-changes";
export const POST = fleetChange("driver", "create");
export const PUT = fleetChange("driver", "update");
export const DELETE = fleetChange("driver", "deactivate");

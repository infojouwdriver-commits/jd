
import { requestMiddleware } from "@/lib/api-utils";
import { createSuccessResponse, createErrorResponse } from "@/lib/create-response";
import { authCrudOperations, generateAdminUserToken, getAuthRoles } from "@/lib/auth";
import CrudOperations from "@/lib/crud-operations";

async function resolveEffectiveUserType(user: any, adminToken: string): Promise<string> {
  const initialType = user?.user_type || "driver";

  if (initialType === "driver") {
    return initialType;
  }

  try {
    const driversCrud = new CrudOperations("drivers", adminToken);
    const drivers = await driversCrud.findMany({ user_id: user?.id });

    if (drivers?.[0]?.id) {
      return "driver";
    }
  } catch (error) {
    console.error("Operation failed");
  }

  return initialType;
}

async function resolveDistributorInfo(
  user: any,
  effectiveUserType: string,
  adminToken: string
) {
  if (effectiveUserType !== "distributor") {
    return null;
  }

  try {
    const distributorsCrud = new CrudOperations("distributors", adminToken);
    const distributors = await distributorsCrud.findMany({ user_id: user?.id });
    return distributors?.[0] || null;
  } catch (error) {
    console.error("Operation failed");
    return null;
  }
}

export const GET = requestMiddleware(async (_request, params) => {
  try {
    const userId = params.payload?.sub;

    if (!userId) {
      return createErrorResponse({
        errorMessage: "The user does not exist.",
        status: 401,
      });
    }

    const { usersCrud } = await authCrudOperations();
    const user = await usersCrud.findById(userId);

    if (!user?.id) {
      return createErrorResponse({
        errorMessage: "The user does not exist.",
        status: 401,
      });
    }

    const { adminRole } = getAuthRoles();
    const adminToken = await generateAdminUserToken();
    const effectiveUserType = await resolveEffectiveUserType(user, adminToken);
    const distributorInfo = await resolveDistributorInfo(
      user,
      effectiveUserType,
      adminToken
    );

    return createSuccessResponse({
      sub: String(user?.id),
      id: user?.id,
      email: user?.email,
      role: user?.role,
      isAdmin: params.payload?.isAdmin === true,
      userType: effectiveUserType,
      distributorInfo,
    });
  } catch (error: any) {
    console.error("Operation failed");

    return createErrorResponse({
      errorMessage: error?.message || "Failed to obtain user information",
      status: 500,
    });
  }
}, true);

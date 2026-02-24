import { NextRequest } from "next/server";
import { userDb } from "@/lib/data/database";
import { requireRole } from "@/lib/utils/middleware";
import { userToAuthUser } from "@/lib/utils/auth";
import { registerSchema } from "@/lib/utils/validation";
import { USER_ROLES } from "@/lib/constants";
import {
  paginatedResponse,
  successResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { UserRole } from "@/lib/types";

// GET /api/users - List all users (Superadmin only)
export async function GET(request: NextRequest) {
  try {
    // Require superadmin role
    const { error } = await requireRole([USER_ROLES.SUPERADMIN as UserRole]);
    if (error) return error;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const role = searchParams.get("role") as UserRole | null;
    const groupId = searchParams.get("groupId");
    const cellId = searchParams.get("cellId");
    const campusId = searchParams.get("campusId");
    const zoneId = searchParams.get("zoneId");
    const departmentId = searchParams.get("departmentId");
    const search = searchParams.get("search") || undefined;
    const isActive = searchParams.get("isActive");

    // Build filters
    const filters: UserFilters = {
      role: role || undefined,
      groupId: groupId || undefined,
      cellId: cellId || undefined,
      campusId: campusId || undefined,
      zoneId: zoneId || undefined,
      departmentId: departmentId || undefined,
      search,
      isActive: isActive ? isActive === "true" : undefined,
    };

    // Get users
    const allUsers = userDb.findAll(filters);
    const total = allUsers.length;

    // Paginate
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedUsers = allUsers.slice(start, end);

    // Convert to auth users (remove passwords)
    const authUsers = paginatedUsers.map(userToAuthUser);

    return paginatedResponse(authUsers, total, page, pageSize);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/users - Create a new user (Superadmin only)
export async function POST(request: NextRequest) {
  try {
    const { error } = await requireRole([USER_ROLES.SUPERADMIN as UserRole]);
    if (error) return error;

    const body = await request.json();

    // Validate required fields using registerSchema (same as registration)
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse(
        validation.error.issues.map((i) => i.message).join(", ")
      );
    }

    // Check existing email
    const existing = userDb.findByEmail(validation.data.email);
    if (existing) {
      return badRequestResponse("A user with this email already exists");
    }

    // Hash password
    const hashedPassword = await userDb.hashPassword(validation.data.password);

    // Create user
    const newUser = userDb.create({
      firstName: validation.data.firstName,
      lastName: validation.data.lastName,
      email: validation.data.email,
      password: hashedPassword,
      phone: validation.data.phone,
      whatsappPhone: validation.data.whatsappPhone || "",
      location: validation.data.location || "",
      age: validation.data.age,
      maritalStatus: (validation.data.maritalStatus || "SINGLE") as import("@/lib/types").MaritalStatus,
      employmentStatus: (validation.data.employmentStatus || "EMPLOYED") as import("@/lib/types").EmploymentStatus,
      interests: validation.data.interests || [],
      role: (body.role as UserRole) || UserRole.MEMBER,
      isActive: true,
      avatar: "",
      groupId: validation.data.groupId || "",
      campusId: validation.data.campusId || "",
      zoneId: validation.data.zoneId || "",
      departmentId: validation.data.departmentId || "",
      cellId: validation.data.cellId || "",
      invitedById: validation.data.invitedById || "",
      inviteCode: validation.data.inviteCode || "",
    });

    return successResponse(userToAuthUser(newUser), "User created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

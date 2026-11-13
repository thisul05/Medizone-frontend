import { access, MODULES, STAFF_ROLES, type ModuleId, type ModuleInfo, type Role } from "@/types/roles";

/** True when the role may open the module. Dashboard is strictly reserved for the owner. */
export function canOpen(role: Role, module: ModuleId): boolean {
  if (module === "admin") {
    return role === "owner";
  }
  const list = access[role];
  return list.includes("*") || list.includes(module);
}

/** The modules a role may open, in the standard order. */
export function modulesFor(role: Role): ModuleInfo[] {
  return MODULES.filter((m) => canOpen(role, m.id));
}

export function isStaff(role: Role): boolean {
  return STAFF_ROLES.includes(role);
}

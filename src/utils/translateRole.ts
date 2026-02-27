// utils/translateRole.ts

export function translateRole(role: string | undefined | null): string {
  switch (role?.toLowerCase()) {
    case "superadmin":
      return "Super Administrador";
    case "administrator":
      return "Administrador";
    case "user":
      return "Usuario";
    default:
      return role ?? "";
  }
}

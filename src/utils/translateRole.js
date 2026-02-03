// utils/translateRole.js

export function translateRole(role) {
  switch (role?.toLowerCase()) {
    case "superadmin":
      return "Super Administrador";
    case "administrator":
      return "Administrador";
    case "user":
      return "Usuario";
    default:
      return role;
  }
}

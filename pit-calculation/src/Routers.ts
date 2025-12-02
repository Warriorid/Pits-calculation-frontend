// Routers.ts
export const ROUTES = {
  HOME: "/",
  MATERIALS: "/materials",
  MATERIAL_DETAIL: "/materials/:id",
  LOGIN: "/login",
  PITS: "/pits",
  PIT_DETAIL: "/pits/:pit_id",
  PROFILE: "/profile",
}

export type RouteKeyType = keyof typeof ROUTES;

export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
  HOME: "Главная",
  MATERIALS: "Материалы",
  MATERIAL_DETAIL: "Детали материала",
  LOGIN: "Авторизация",
  PITS: "Мои заявки",
  PIT_DETAIL: "Детали заявки",
  PROFILE: "Профиль",
};
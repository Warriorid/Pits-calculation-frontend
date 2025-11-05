export const ROUTES = {
    HOME: "/",
    MATERIALS: "/materials",
    MATERIAL_DETAIL: "/materials/:id",
  }
  
  export type RouteKeyType = keyof typeof ROUTES;
  
  export const ROUTE_LABELS: {[key in RouteKeyType]: string} = {
    HOME: "Главная",
    MATERIALS: "Материалы",
    MATERIAL_DETAIL: "Детали материала",
  };
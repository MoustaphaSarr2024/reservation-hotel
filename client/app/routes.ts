import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("rooms", "routes/rooms.tsx"),
    route("rooms/:id", "routes/room-details.tsx"),
    route("admin", "routes/admin.tsx"),
    route("login", "routes/login.tsx"),
] satisfies RouteConfig;

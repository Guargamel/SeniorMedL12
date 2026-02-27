import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: ["resources/js/app.jsx"],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: true,          // same as 0.0.0.0
        port: 5173,
        strictPort: true,
        hmr: {
            host: "localhost", // <-- your PC LAN IP
            port: 5173,
        },
        cors: true,
    },
});

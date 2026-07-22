import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(
        env.VITE_SUPABASE_URL || "https://fgwcrutmndkefigzfwkv.supabase.co"
      ),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(
        env.VITE_SUPABASE_PUBLISHABLE_KEY ||
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZnd2NydXRtbmRrZWZpZ3pmd2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2OTA5NDAsImV4cCI6MjA4NDI2Njk0MH0.3Nilnvp0dhWG3qRWqhxcfb2W0UxxTJ_Tjl-6_wiQcls"
      ),
    },
    server: {
      host: "0.0.0.0",
      port: 5000,
      allowedHosts: true,
      hmr: { overlay: false },
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
  };
});

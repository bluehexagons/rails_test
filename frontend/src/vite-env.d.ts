/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string | undefined;
  readonly VITE_SITE_ROOT: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

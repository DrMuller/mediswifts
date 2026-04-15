import { defineConfig } from 'vite';

// GitHub project pages: https://user.github.io/repo-name/ → base must be /repo-name/
// User/org site repo (name.github.io): base is /
// Set at build time: VITE_BASE_PATH=/my-repo/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
});

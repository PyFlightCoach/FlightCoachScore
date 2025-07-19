import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    sveltekit(),
    VitePWA()
  ],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts,md,BIN}']
	},
});

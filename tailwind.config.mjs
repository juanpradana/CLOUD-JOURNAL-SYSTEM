/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				glass: {
					surface: 'rgba(255, 255, 255, 0.05)',
					border: 'rgba(255, 255, 255, 0.1)',
					highlight: 'rgba(255, 255, 255, 0.15)',
				},
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
			backgroundImage: {
				'deep-space': 'linear-gradient(to bottom right, #020617, #1e1b4b, #0f172a)',
			},
		},
	},
	plugins: [],
};

import { defineConfig } from 'astro/config';

// ⚠️ 把 your-username 换成你的 GitHub 用户名（Task 12 部署前）。
// 仓库名 personal-website，走 project page，故 base 为 '/personal-website'。
export default defineConfig({
  site: 'https://your-username.github.io',
  base: '/personal-website',
});

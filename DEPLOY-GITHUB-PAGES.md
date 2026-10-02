# GitHub Pages deployment

Repository: `rabiyudin/motionexporter`
Live path: `https://rabiyudin.github.io/motionexporter/`

This project uses a Vite base path of `/motionexporter/` only when `GITHUB_ACTIONS=true`. On Netlify/local builds it uses `/`.

GitHub Pages deployment is handled by `.github/workflows/deploy.yml` and publishes the Vite `dist/` output.

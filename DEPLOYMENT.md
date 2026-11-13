# Deployment & Operational Runbook

## 1. Hosting Architecture

Breakout Radar is structured as a client-side SPA with real-time Google Cloud Firestore synchronization and edge CDN distribution.
- **Node.js Runtime**: v20.x or higher LTS
- **Build Tool**: Vite 6 with Rollup code splitting
- **Dev Server Port**: Port 3000

## 2. Environment Variables Configuration

Create a `.env` file based on `.env.example`:
```bash
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e"
VITE_FIREBASE_STORAGE_BUCKET="ai-studio-3334bd27-8aa0-41c6-9860-b19ab887f53e.firebasestorage.app"
VITE_FIREBASE_APP_ID="1:637162713279:web:abcdef"
VITE_APP_ENV="production"
```

## 3. Production Compilation & Containerization

### Standard Build
```bash
# Type check and build minified production bundle
npm run build
```
Generates production assets in `/dist`.

### Docker Multi-Stage Build
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

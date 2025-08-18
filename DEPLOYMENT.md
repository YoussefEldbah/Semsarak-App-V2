# Deployment Guide

This guide provides instructions for deploying the Semsarak application to various environments.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI
- Access to deployment platform

## Build Process

### Development Build

```bash
# Install dependencies
npm install

# Build for development
ng build --configuration development

# Serve locally
ng serve
```

### Production Build

```bash
# Build for production
ng build --configuration production

# Build with SSR (Server-Side Rendering)
ng build --configuration production --ssr
```

## Environment Configuration

### Environment Files

Create environment files in `src/environments/`:

```typescript
// environment.ts (development)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Semsarak',
  version: '1.0.0'
};

// environment.prod.ts (production)
export const environment = {
  production: true,
  apiUrl: 'https://api.semsarak.com',
  appName: 'Semsarak',
  version: '1.0.0'
};
```

### Environment Variables

Set environment variables for sensitive data:

```bash
# .env.local
API_URL=https://api.semsarak.com
GOOGLE_CLIENT_ID=your-google-client-id
STRIPE_PUBLIC_KEY=your-stripe-public-key
```

## Deployment Platforms

### Vercel

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Configure Build Settings**:
   - Build Command: `ng build --configuration production`
   - Output Directory: `dist/semsarak-app/browser`
   - Install Command: `npm install`

### Netlify

1. **Build Command**:
   ```bash
   ng build --configuration production
   ```

2. **Publish Directory**:
   ```
   dist/semsarak-app/browser
   ```

3. **Environment Variables**:
   - Set in Netlify dashboard
   - Use `REACT_APP_` prefix for Angular

### Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase**:
   ```bash
   firebase init hosting
   ```

3. **Configure firebase.json**:
   ```json
   {
     "hosting": {
       "public": "dist/semsarak-app/browser",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     }
   }
   ```

4. **Deploy**:
   ```bash
   firebase deploy
   ```

### AWS S3 + CloudFront

1. **Build the application**:
   ```bash
   ng build --configuration production
   ```

2. **Upload to S3**:
   ```bash
   aws s3 sync dist/semsarak-app/browser s3://your-bucket-name
   ```

3. **Configure CloudFront**:
   - Set origin to S3 bucket
   - Configure error pages for SPA routing
   - Enable HTTPS

### Docker

1. **Create Dockerfile**:
   ```dockerfile
   # Build stage
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build --configuration production

   # Production stage
   FROM nginx:alpine
   COPY --from=build /app/dist/semsarak-app/browser /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf**:
   ```nginx
   server {
       listen 80;
       server_name localhost;
       root /usr/share/nginx/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

3. **Build and run**:
   ```bash
   docker build -t semsarak-app .
   docker run -p 80:80 semsarak-app
   ```

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build application
      run: npm run build --configuration production
      env:
        API_URL: ${{ secrets.API_URL }}
    
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm test

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build --configuration production
  artifacts:
    paths:
      - dist/semsarak-app/browser

deploy:
  stage: deploy
  image: alpine:latest
  script:
    - apk add --no-cache curl
    - curl -X POST $DEPLOY_WEBHOOK
  only:
    - main
```

## Performance Optimization

### Build Optimization

1. **Enable production mode**:
   ```bash
   ng build --configuration production
   ```

2. **Enable source maps for debugging**:
   ```bash
   ng build --configuration production --source-map
   ```

3. **Optimize bundle size**:
   ```bash
   ng build --configuration production --stats-json
   ```

### Runtime Optimization

1. **Enable gzip compression**
2. **Configure caching headers**
3. **Use CDN for static assets**
4. **Implement lazy loading**
5. **Enable service workers**

## Monitoring and Analytics

### Error Tracking

1. **Sentry Integration**:
   ```typescript
   import * as Sentry from "@sentry/angular";
   
   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: environment.production ? 'production' : 'development'
   });
   ```

2. **Logging Service**:
   ```typescript
   @Injectable({
     providedIn: 'root'
   })
   export class LoggingService {
     logError(error: Error) {
       console.error('Error:', error);
       // Send to logging service
     }
   }
   ```

### Performance Monitoring

1. **Google Analytics**:
   ```typescript
   import { environment } from '../environments/environment';
   
   // Add to index.html
   <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
   ```

2. **Web Vitals**:
   ```bash
   npm install web-vitals
   ```

## Security Considerations

1. **HTTPS Only**: Force HTTPS in production
2. **Security Headers**: Configure CSP, HSTS, etc.
3. **Environment Variables**: Never commit sensitive data
4. **Dependency Scanning**: Regular security audits
5. **Input Validation**: Validate all user inputs

## Troubleshooting

### Common Issues

1. **Routing Issues**: Ensure proper SPA configuration
2. **Build Failures**: Check Node.js version and dependencies
3. **Performance Issues**: Optimize bundle size and assets
4. **CORS Issues**: Configure proper CORS headers

### Debug Commands

```bash
# Check bundle size
npm run build --configuration production --stats-json
npx webpack-bundle-analyzer dist/semsarak-app/browser/stats.json

# Check for vulnerabilities
npm audit

# Run linting
ng lint

# Check TypeScript errors
ng build --configuration development
```

## Support

For deployment issues:

- Check the [Angular Deployment Guide](https://angular.dev/guide/deployment)
- Review platform-specific documentation
- Contact the development team
- Check GitHub issues for similar problems 
# Use Node.js LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV REACT_APP_API_URL=http://backend:8000/api/v1

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Use nginx for serving static files in production
FROM nginx:alpine

# Copy built static files to nginx serve directory
COPY --from=0 /app/build /usr/share/nginx/html

# Copy custom nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
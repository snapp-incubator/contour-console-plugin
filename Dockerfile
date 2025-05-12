# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and yarn.lock (if exists)
COPY package.json yarn.lock* ./

# Install dependencies
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the application
RUN yarn build

# Production stage
FROM nginx:alpine

# Copy custom nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Create Nginx cache directories and set permissions
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp \
    && chmod 755 /var/cache/nginx

# Set permissions for other Nginx directories
RUN chown -R nginx:nginx /var/cache/nginx \
                         /var/log/nginx \
                         /etc/nginx \
                         /usr/share/nginx/html \
    && chmod -R 755 /var/cache/nginx \
                    /var/log/nginx \
                    /etc/nginx \
                    /usr/share/nginx/html
                    
# Copy the built assets from the build stage
COPY --from=build --chown=nginx:nginx /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]

FROM node:22-slim
RUN npm install -g serve
WORKDIR /app
COPY dist/ ./dist/
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]

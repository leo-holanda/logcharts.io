# To create a container, run: docker run -it --rm -d -p 8080:80 --name CONTAINER_NAME IMAGE_NAME

FROM node AS build
WORKDIR /app
COPY . .
RUN npm i && node build.mjs

FROM nginx:stable
COPY --from=build /app/dist /usr/share/nginx/html
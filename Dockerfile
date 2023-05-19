# To create a container, run: docker run -it --rm -d -p 8080:80 --name CONTAINER_NAME IMAGE_NAME

FROM nginx:stable
COPY . /usr/share/nginx/html
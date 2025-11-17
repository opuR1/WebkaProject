FROM nginx:stable-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN rm -rf /usr/share/nginx/html/*

COPY HTML/ /usr/share/nginx/html/
COPY CSS/ /usr/share/nginx/html/CSS/
COPY Scripts/ /usr/share/nginx/html/Scripts/
COPY Images/ /usr/share/nginx/html/Images/

COPY robots.txt /usr/share/nginx/html/
COPY sitemap.xml /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

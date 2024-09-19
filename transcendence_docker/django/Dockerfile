FROM debian:bullseye

RUN apt update && \
    apt upgrade -y && \
    apt install python3-pip -y && \
    pip3 install django


RUN django-admin startproject transcendence

WORKDIR /transcendence

RUN python3 manage.py migrate

EXPOSE 8000

#CMD ["tail", "-f", "/dev/null"]

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]




#Don't forget to run "docker run -d -p 8000:8000 django", otherwise it won't work

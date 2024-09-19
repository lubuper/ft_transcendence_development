FROM debian:bullseye

RUN apt update && \
    apt upgrade -y && \
    apt install python3-pip -y && \
    pip3 install django psycopg2-binary


RUN django-admin startproject transcendence

WORKDIR /transcendence

COPY project_files/. .

RUN python3 manage.py migrate

EXPOSE 8000

#CMD ["tail", "-f", "/dev/null"]

CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]




#If you want to test the container alone, 
#don't forget to run "docker run -d -p 8000:8000 django", 
#otherwise it won't work

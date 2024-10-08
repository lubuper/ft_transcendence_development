FROM debian:bullseye

RUN apt-get update && \
    apt upgrade -y && \
    apt install -y python3-pip netcat && \
    pip3 install django psycopg2-binary


RUN django-admin startproject transcendence

WORKDIR /transcendence

COPY project_files/. .

RUN pip3 install Pillow

#RUN python3 manage.py migrate

COPY wait_for_db.sh .
RUN chmod +x wait_for_db.sh

EXPOSE 8000

#CMD ["tail", "-f", "/dev/null"]

ENTRYPOINT ["./wait_for_db.sh"]
CMD ["python3", "manage.py", "runserver"]




#If you want to test the container alone,
#don't forget to run "docker run -d -p 8000:8000 django",
#otherwise it won't work

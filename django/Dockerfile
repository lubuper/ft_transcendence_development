FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN pip install django psycopg2-binary
RUN mkdir /project

WORKDIR /project

RUN django-admin startproject transcendence

WORKDIR /project/transcendence

COPY mainApp /project/transcendence/mainApp

COPY transcendence /project/transcendence/transcendence

EXPOSE 8000

#RUN python manage.py migrate

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
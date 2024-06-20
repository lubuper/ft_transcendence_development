from django.urls import path
from . import views

urlpatterns = [
    path('',views.transcendence, name='transcendence')

]
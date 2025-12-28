from django.urls import path
from .views import WordListCreateView

urlpatterns = [
    path('words/', WordListCreateView.as_view(), name='word-list-create'),  
]
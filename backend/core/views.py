from rest_framework import generics
from .models import Word
from .serializers import WordSerializer

class WordListCreateView(generics.ListCreateAPIView):
    queryset = Word.objects.all()
    serializer_class = WordSerializer
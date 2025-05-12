from django.urls import path
from .views import translate_text,analyze_words,tense_comparison

urlpatterns = [
    path('text/', translate_text),
    path('analyze/words/', analyze_words),
    path('tense/comparison/', tense_comparison),
]

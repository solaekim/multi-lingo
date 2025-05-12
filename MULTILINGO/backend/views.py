from django.shortcuts import render

# Create your views here.
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework.decorators import api_view
from rest_framework.response import Response
# from googletrans import Translator
import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

# from googletrans import Translator
from rest_framework.decorators import api_view
from rest_framework.response import Response

# @api_view(['POST'])
# def translate_text(request):
#     text = request.data.get('text')
#     target_lang = request.data.get('language')
    
#     try:
#         translator = Translator()
#         translated = translator.translate(text, dest=target_lang)
#         return Response({"translated_text": translated.text})
#     except Exception as e:
#         print("Translation error:", e)
#         return Response({"error": "Translation failed."}, status=500)


from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
import json
import time

@api_view(['POST'])
def translate_text(request):
    """
    Translate text to a target language using MyMemory API
    """
    text = request.data.get('text')
    target_lang = request.data.get('language')
    is_sequential = request.data.get('sequential', False)
    
    # Add artificial delay for sequential mode to illustrate the difference
    if is_sequential:
        time.sleep(1)  # Add 1 second delay to demonstrate sequential processing
    
    try:
        # tag #### Use MyMemory API for translation
        url = "https://api.mymemory.translated.net/get"
        params = {
            'q': text,
            'langpair': f'en|{target_lang}'
        }
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        translated_text = data['responseData']['translatedText']
        return Response({"text":text,'translated_text': translated_text})

    except Exception as e:
        print("Translation error:", e)
        return Response({"error": "Failed to translate"}, status=500)

import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response
import requests
import re
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response

# Download necessary NLTK resources (should be done once during deployment)
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

@api_view(['POST'])
def analyze_words(request):
    """
    Analyze text to extract vocabulary and get synonyms, antonyms, meanings, idioms, and expressions
    using Datamuse and Free Dictionary API
    """
    words = request.data.get('words', [])
    text = request.data.get('text', '')
    
    # If no words provided but text is, extract important words from text
    if not words and text:
        words = extract_vocabulary(text)
    
    # Extract potential idioms and expressions from the text
    idioms_from_text = extract_idioms_expressions(text)
    
    results = []
    
    try:
        for word in words:
            # Skip very short words
            if len(word) < 3:
                continue
                
            # Clean the word
            word = word.lower().strip()
            
            # Initialize data holders
            synonyms = []
            antonyms = []
            definition = ""
            idioms = []
            expressions = []
            
            # --- Get synonyms from Datamuse ---
            syn_url = f"https://api.datamuse.com/words?rel_syn={word}"
            syn_response = requests.get(syn_url, timeout=5)
            if syn_response.status_code == 200:
                syn_data = syn_response.json()
                synonyms = [item['word'] for item in syn_data]
                
            # If no synonyms from rel_syn, try means-like (ml) parameter
            if not synonyms:
                ml_url = f"https://api.datamuse.com/words?ml={word}"
                ml_response = requests.get(ml_url, timeout=5)
                if ml_response.status_code == 200:
                    ml_data = ml_response.json()
                    synonyms = [item['word'] for item in ml_data]

            # --- Get antonyms from Datamuse ---
            ant_url = f"https://api.datamuse.com/words?rel_ant={word}"
            ant_response = requests.get(ant_url, timeout=5)
            if ant_response.status_code == 200:
                ant_data = ant_response.json()
                antonyms = [item['word'] for item in ant_data]
                
            # --- Get definitions from Free Dictionary API ---
            dict_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{word}"
            dict_response = requests.get(dict_url, timeout=5)
            if dict_response.status_code == 200:
                dict_data = dict_response.json()
                
                if dict_data and len(dict_data) > 0:
                    # Get the first definition
                    meanings = dict_data[0].get('meanings', [])
                    if meanings and len(meanings) > 0:
                        definition = meanings[0].get('definitions', [{}])[0].get('definition', "")
                        
                    # Look for examples that might contain idiomatic usage
                    for meaning in meanings:
                        for definition_item in meaning.get('definitions', []):
                            example = definition_item.get('example', '')
                            if example and contains_word(example, word) and is_potentially_idiomatic(example):
                                idioms.append(example)
            
            # --- Get idiomatic phrases with Datamuse ---
            idiom_url = f"https://api.datamuse.com/words?ml={word}+idiom&max=5"
            idiom_response = requests.get(idiom_url, timeout=5)
            if idiom_response.status_code == 200:
                idiom_data = idiom_response.json()
                for item in idiom_data:
                    if len(item['word'].split()) > 1 and word in item['word'].lower():
                        idioms.append(item['word'])
            
            # --- Get phrases and expressions from Datamuse using triggers ---
            phrase_approaches = [
                f"https://api.datamuse.com/words?rel_trg={word}&max=10",  # Triggered by word
                f"https://api.datamuse.com/words?rel_bgb={word}&max=10",  # Phrases that come before
                f"https://api.datamuse.com/words?rel_bga={word}&max=10",  # Phrases that come after
                f"https://api.datamuse.com/words?sp=*{word}*&max=10"      # Contains the word
            ]
            
            for url in phrase_approaches:
                phrase_response = requests.get(url, timeout=5)
                if phrase_response.status_code == 200:
                    phrase_data = phrase_response.json()
                    for item in phrase_data:
                        if len(item['word'].split()) > 1:  # Only multi-word phrases
                            expressions.append(item['word'])
            
            # Add idioms found in the text that contain this word
            for idiom in idioms_from_text["idioms"]:
                if contains_word(idiom, word) and idiom not in idioms:
                    idioms.append(idiom)
                    
            # Add expressions found in the text that contain this word
            for expression in idioms_from_text["expressions"]:
                if contains_word(expression, word) and expression not in expressions:
                    expressions.append(expression)
            
            # Remove duplicates
            idioms = list(set(idioms))  # Keep top 5
            expressions = list(set(expressions))  # Keep top 5

            # Add result for the word
            results.append({
                'word': word,
                'synonyms': synonyms,
                'antonyms': antonyms,
                'definition': definition,
                'idioms': idioms,
                'expressions': expressions
            })

        return Response({'results': results})
    except Exception as e:
        return Response({'error': str(e)}, status=500)


def extract_vocabulary(text):
    """Extract important vocabulary words from the text"""
    # Tokenize the text
    tokens = word_tokenize(text)
    
    # Get English stopwords
    stop_words = set(stopwords.words('english'))
    
    # Filter out stopwords, punctuation, and numbers
    words = [word.lower() for word in tokens if word.isalpha() and len(word) > 3 and word.lower() not in stop_words]
    
    # Return unique words
    return list(set(words))


def extract_idioms_expressions(text):
    """
    Extract potential idioms and expressions from the text
    This is a simple implementation. For better results, consider using NLP libraries.
    """
    results = {
        "idioms": [],
        "expressions": []
    }
    
    idiom_patterns = [
        r"(between a rock and a hard place)",
        r"(no walk in the park)",
        r"(through thick and thin)",
        r"(where there's a will there's a way)",
        r"(once in a blue moon)",
        r"(it's raining cats and dogs)",
        r"(a piece of cake)",
        r"(hit the nail on the head)",
        r"(cost an arm and a leg)",
        r"(break the ice)",
        r"(cut corners)",
        r"(under the weather)",
        r"\b(get|getting|got) (the|a) (hang of)",
        r"(on the fence)",
        r"(in hot water)",
        # Add more idiom patterns as needed
    ]
    
    # Expression patterns - typically multi-word phrases that are common in language
    expression_patterns = [
        r"(as soon as possible)",
        r"(all things considered)",
        r"(at the end of the day)",
        r"(in a nutshell)",
        r"(having said that)",
        r"(taking into account)",
        r"(for what it's worth)",
        r"(on the other hand)",
        r"(by and large)",
        r"(in the long run)",
        # Add more expression patterns as needed
    ]
    
    # Search for idioms
    for pattern in idiom_patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            if isinstance(match, tuple):  # If the match is a tuple (from capture groups)
                match = ' '.join(match).strip()
            results["idioms"].append(match)
    
    # Search for expressions
    for pattern in expression_patterns:
        matches = re.findall(pattern, text.lower())
        for match in matches:
            if isinstance(match, tuple):  # If the match is a tuple (from capture groups)
                match = ' '.join(match).strip()
            results["expressions"].append(match)
    
    # Look for potential multi-word expressions (3-5 words)
    words = text.split()
    for i in range(len(words) - 2):
        # 3-word phrases
        phrase3 = ' '.join(words[i:i+3]).lower()
        if is_potentially_idiomatic(phrase3) and phrase3 not in results["expressions"]:
            results["expressions"].append(phrase3)
        
        # 4-word phrases
        if i <= len(words) - 4:
            phrase4 = ' '.join(words[i:i+4]).lower()
            if is_potentially_idiomatic(phrase4) and phrase4 not in results["expressions"]:
                results["expressions"].append(phrase4)
        
        # 5-word phrases
        if i <= len(words) - 5:
            phrase5 = ' '.join(words[i:i+5]).lower()
            if is_potentially_idiomatic(phrase5) and phrase5 not in results["expressions"]:
                results["expressions"].append(phrase5)
    
    return results


def contains_word(phrase, word):
    """Check if a phrase contains a word (accounts for word boundaries)"""
    return re.search(rf'\b{re.escape(word)}\b', phrase.lower()) is not None


def is_potentially_idiomatic(phrase):
    """Heuristic to check if a phrase might be idiomatic or an expression"""
    # This is a simple implementation - could be improved with NLP approaches
    # Filter out simple phrases that are likely not idiomatic
    if len(phrase.split()) < 2:
        return False
        
    # Phrases with certain prepositions or conjunctions are more likely to be idiomatic
    common_markers = ['in', 'on', 'at', 'by', 'with', 'against', 'under', 'over', 'through', 'between', 'and']
    
    for marker in common_markers:
        if f" {marker} " in phrase:
            return True
            
    return False


@api_view(['POST'])
def tense_comparison(request):
    """
    Generate tense comparison table for verbs across multiple languages
    """
    verb = request.data.get('verb', 'analyze')
    languages = request.data.get('languages', ['english', 'french', 'korean'])
    
    # In a real implementation, you would integrate with a language API
    # For demonstration, we'll return sample data based on the verb
    
    # Sample tense mappings that would come from an API
    tense_data = {
        'analyze': {
            'english': {
                'present': 'I analyze',
                'past': 'I analyzed',
                'future': 'I will analyze',
                'conditional': 'I would analyze'
            },
            'french': {
                'present': 'J\'analyse',
                'past': 'J\'ai analysé',
                'future': 'J\'analyserai',
                'conditional': 'J\'analyserais'
            },
            'korean': {
                'present': '나는 분석한다',
                'past': '나는 분석했다',
                'future': '나는 분석 할 것이다',
                'conditional': '나는 분석할 것이다 (가정법)'
            }
        },
        # Default responses for any other verb
        'default': {
            'english': {
                'present': f'I {verb}',
                'past': f'I {verb}ed',
                'future': f'I will {verb}',
                'conditional': f'I would {verb}'
            },
            'french': {
                'present': f'Je {verb}',
                'past': f'J\'ai {verb}é',
                'future': f'Je {verb}erai',
                'conditional': f'Je {verb}erais'
            },
            'korean': {
                'present': f'나는 {verb}한다',
                'past': f'나는 {verb}했다',
                'future': f'나는 {verb} 할 것이다',
                'conditional': f'나는 {verb}할 것이다 (가정법)'
            }
        }
    }
    
    # Get the verb data or fall back to default
    verb_data = tense_data.get(verb, tense_data['default'])
    
    # Build response table
    table = []
    for tense in ['present', 'past', 'future', 'conditional']:
        row = {'tense': tense.capitalize()}
        
        for lang in languages:
            if lang.lower() in verb_data:
                row[lang.lower()] = verb_data[lang.lower()][tense]
            else:
                row[lang.lower()] = f"{lang} form not available"
        
        table.append(row)
    
    return Response({'table': table})
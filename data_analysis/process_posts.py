import json
import os
import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Download necessary NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('punkt_tab', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('omw-1.4', quiet=True)
except Exception as e:
    print(f"Warning: NLTK download failed: {e}")

def clean_text(text):
    if not isinstance(text, str):
        return ""
    # Tokenize
    try:
        tokens = word_tokenize(text.lower())
    except Exception:
        # Fallback to simple split if word_tokenize fails
        tokens = text.lower().split()
    # Remove stopwords and non-alphabetic tokens
    stop_words = set(stopwords.words('english'))
    tokens = [t for t in tokens if t.isalpha() and t not in stop_words]
    # Lemmatize
    lemmatizer = WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    return " ".join(tokens)

def categorize_post(text):
    categories = {
        "harassment": ["harassment", "bullying", "toxic", "abuse", "threat", "insult"],
        "safety concerns": ["safety", "danger", "risk", "protection", "security", "harm"],
        "reporting systems": ["report", "flag", "moderator", "banned", "appeal", "system"],
        "user experiences": ["experience", "happened", "observed", "feeling", "community"],
        "platform trust": ["trust", "policy", "integrity", "transparency", "reliable"]
    }
    
    post_lower = text.lower()
    scores = {cat: 0 for cat in categories}
    
    for cat, keywords in categories.items():
        for kw in keywords:
            if kw in post_lower:
                scores[cat] += 1
                
    # Get the category with the highest score
    best_cat = max(scores, key=scores.get)
    if scores[best_cat] == 0:
        return "general"
    return best_cat

def process_data(input_file, output_file):
    if not os.path.exists(input_file):
        print(f"Input file {input_file} not found.")
        return

    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    df = pd.DataFrame(data)
    
    if df.empty:
        print("Dataset is empty.")
        return

    # Initialize sentiment analyzer
    analyzer = SentimentIntensityAnalyzer()
    
    # Process each post
    processed_results = []
    
    for _, row in df.iterrows():
        content = row['content'] if 'content' in row else ""
        title = row['title'] if 'title' in row else ""
        full_text = f"{title} {content}"
        
        # Clean text
        cleaned = clean_text(full_text)
        
        # Sentiment analysis
        sentiment = analyzer.polarity_scores(full_text)
        sentiment_score = sentiment['compound']
        
        # Keyword detection and categorization
        category = categorize_post(full_text)
        
        processed_results.append({
            "post_id": row.get('post_id', 'unknown'),
            "title": title,
            "platform": row.get('platform', 'Reddit'),
            "date": row.get('date', ''),
            "sentiment_score": sentiment_score,
            "category": category,
            "cleaned_text": cleaned
        })
        
    # Save processed analysis
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(processed_results, f, indent=2)
        
    print(f"Processed {len(processed_results)} posts. Saved to {output_file}")

if __name__ == "__main__":
    base_dir = os.path.dirname(__file__)
    input_path = os.path.join(base_dir, "..", "dataset_sample", "raw_posts.json")
    output_path = os.path.join(base_dir, "..", "dataset_sample", "processed_posts.json")
    
    process_data(input_path, output_path)

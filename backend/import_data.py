import json
import os
from pymongo import MongoClient

def import_data():
    client = MongoClient('mongodb://localhost:27017/')
    db = client['digital_safety_analyzer']
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    parent_dir = os.path.dirname(base_dir)
    print(f"DEBUG: base_dir: {base_dir}")
    print(f"DEBUG: parent_dir (project root?): {parent_dir}")
    print(f"DEBUG: contents of parent_dir: {os.listdir(parent_dir)}")
    
    raw_path = os.path.abspath(os.path.join(parent_dir, "dataset_sample", "raw_posts.json"))
    processed_path = os.path.abspath(os.path.join(parent_dir, "dataset_sample", "processed_posts.json"))
    
    print(f"DEBUG: raw_path: {raw_path}")
    print(f"DEBUG: processed_path: {processed_path}")
    
    raw_exists = os.path.exists(raw_path)
    proc_exists = os.path.exists(processed_path)
    
    print(f"DEBUG: raw_exists: {raw_exists}")
    print(f"DEBUG: proc_exists: {proc_exists}")
    
    if not raw_exists or not proc_exists:
        print("Required data files not found. Please run the scrapers and processing pipeline first.")
        return

    with open(raw_path, "r", encoding="utf-8") as f:
        raw_data = json.load(f)
        
    with open(processed_path, "r", encoding="utf-8") as f:
        processed_data = json.load(f)
        
    # Import Posts
    posts_col = db['posts']
    posts_col.delete_many({}) # Clear existing
    if raw_data:
        for p in raw_data:
            p['_id'] = p['post_id']
        posts_col.insert_many(raw_data)
        print(f"Imported {len(raw_data)} posts.")

    # Import Analysis Results
    analysis_col = db['analysisresults']
    analysis_col.delete_many({}) # Clear existing
    if processed_data:
        for a in processed_data:
            a['post_id'] = a['post_id'] # This is already the string ID
        analysis_col.insert_many(processed_data)
        print(f"Imported {len(processed_data)} analysis results.")

    print("Data import complete.")

if __name__ == "__main__":
    import_data()

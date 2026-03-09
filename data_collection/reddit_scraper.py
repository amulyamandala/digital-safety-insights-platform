import time
import json
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

def scrape_reddit(search_query="online safety", limit=10):
    print(f"Starting scraper for query: {search_query}")
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    url = f"https://www.reddit.com/search/?q={search_query}"
    driver.get(url)
    
    posts_data = []
    
    try:
        # Wait for the search results to load
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.TAG_NAME, "shreddit-post")))
        
        # Scroll to load more if needed
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        
        soup = BeautifulSoup(driver.page_source, "html.parser")
        posts = soup.find_all("shreddit-post")
        
        for post in posts[:limit]:
            post_id = post.get("id", "")
            title = post.get("post-title", "")
            content = "" # Shreddit posts might not have text in the search preview, or it's truncated
            # We can try to find the content or just use the title for now if it's a search result
            
            # Extract additional data
            platform = "Reddit"
            date = post.get("created-timestamp", "")
            subreddit = post.get("subreddit-prefixed-name", "")
            comment_count = post.get("comment-count", "0")
            
            # Better way to get content if possible
            content_div = post.find("div", slot="text-body")
            if content_div:
                content = content_div.get_text(separator=" ", strip=True)
            
            # If no content yet, try to find the description or similar
            if not content:
                content = post.get("post-title", "") # Fallback to title
            
            posts_data.append({
                "post_id": post_id,
                "title": title,
                "content": content,
                "date": date,
                "platform": platform,
                "subreddit": subreddit,
                "comment_count": comment_count,
                "topic_keywords": [search_query]
            })
            
    except Exception as e:
        print(f"An error occurred during scraping: {e}")
    finally:
        driver.quit()
        
    return posts_data

if __name__ == "__main__":
    queries = ["online harassment", "platform safety", "content moderation", "digital safety"]
    all_posts = []
    
    for query in queries:
        all_posts.extend(scrape_reddit(query, limit=5))
    
    # Ensure directory exists
    output_dir = os.path.join(os.path.dirname(__file__), "..", "dataset_sample")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, "raw_posts.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_posts, f, indent=2)
        
    print(f"Scraping complete. Saved {len(all_posts)} posts to {output_path}")

import json
import os
import random
from datetime import datetime, timedelta

def generate_sample_data(count=50):
    platforms = ["Reddit", "SafetyForum", "DigitalRights"]
    subreddits = ["r/online_safety", "r/privacy", "r/socialmedia", "r/tech_ethics"]
    
    titles = [
        "How do I report harassment on this platform?",
        "Latest updates on safety reporting systems",
        "My experience with toxic communities",
        "Trust in moderation is declining",
        "Privacy concerns with new safety policies",
        "Blocked for no reason? How to appeal?",
        "The impact of trolling on mental health",
        "Community guidelines for safer discussions",
        "Has anyone used the new safety features?",
        "Reporting system is broken and unresponsive"
    ]
    
    contents = [
        "I've been experiencing significant harassment in several threads and the reporting system doesn't seem to help much. Any tips?",
        "The latest policy changes regarding content moderation are quite controversial. Are we losing our privacy for safety?",
        "I've been a member of this community for years, but lately, the toxicity has become unbearable. We need better moderators.",
        "The transparency report shows a 20% increase in banned accounts. Is this effective or just over-moderation?",
        "Safety is paramount, but the way some platforms implement it feels like surveillance. What do you think?",
        "I was banned for expressing an opinion that wasn't even hateful. The appeal process is just a black box.",
        "We need more human-in-the-loop moderation instead of relying purely on biased AI algorithms.",
        "Discussion on digital safety should be a priority for every platform, but some just ignore it for profit.",
        "I reported a death threat and it was marked as 'not violating guidelines'. This is ridiculous.",
        "Let's share our experiences with reporting systems across different platforms."
    ]
    
    keywords = ["harassment", "reporting", "safety", "moderation", "trust", "privacy", "toxic", "banned"]
    
    posts = []
    start_date = datetime.now() - timedelta(days=30)
    
    for i in range(count):
        post_date = start_date + timedelta(days=random.randint(0, 30), hours=random.randint(0, 23))
        
        posts.append({
            "post_id": f"t3_{random.randint(100000, 999999)}",
            "title": random.choice(titles),
            "content": random.choice(contents),
            "date": post_date.isoformat(),
            "platform": random.choice(platforms),
            "subreddit": random.choice(subreddits),
            "comment_count": str(random.randint(0, 500)),
            "topic_keywords": random.sample(keywords, 2)
        })
        
    output_dir = os.path.join(os.path.dirname(__file__), "..", "dataset_sample")
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, "raw_posts.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(posts, f, indent=2)
        
    print(f"Generated {len(posts)} sample posts in {output_path}")

if __name__ == "__main__":
    generate_sample_data()

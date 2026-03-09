#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
#include <sstream>

// Very simple JSON string extractor for "cleaned_text": "..."
std::vector<std::string> extract_texts(const std::string& filename) {
    std::vector<std::string> texts;
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cerr << "Could not open file: " << filename << std::endl;
        return texts;
    }

    std::string line;
    std::string key = "\"cleaned_text\": \"";
    while (std::getline(file, line)) {
        size_t pos = line.find(key);
        if (pos != std::string::npos) {
            size_t start = pos + key.length();
            size_t end = line.find("\"", start);
            if (end != std::string::npos) {
                texts.push_back(line.substr(start, end - start));
            }
        }
    }
    return texts;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <processed_json_file>" << std::endl;
        return 1;
    }

    std::string filename = argv[1];
    std::vector<std::string> texts = extract_texts(filename);
    
    std::map<std::string, int> word_counts;
    for (const auto& text : texts) {
        std::stringstream ss(text);
        std::string word;
        while (ss >> word) {
            // Remove any non-alphanumeric chars that might have slipped in
            word.erase(std::remove_if(word.begin(), word.end(), [](char c) {
                return !std::isalnum(c);
            }), word.end());
            
            if (!word.empty()) {
                word_counts[word]++;
            }
        }
    }

    // Convert to sorted vector
    std::vector<std::pair<std::string, int>> sorted_words(word_counts.begin(), word_counts.end());
    std::sort(sorted_words.begin(), sorted_words.end(), [](const auto& a, const auto& b) {
        return b.second < a.second; // Sort by frequency descending
    });

    // Output as JSON
    std::cout << "{\n  \"keyword_frequencies\": [\n";
    for (size_t i = 0; i < sorted_words.size() && i < 100; ++i) {
        std::cout << "    {\"keyword\": \"" << sorted_words[i].first << "\", \"count\": " << sorted_words[i].second << "}";
        if (i < sorted_words.size() - 1 && i < 99) std::cout << ",";
        std::cout << "\n";
    }
    std::cout << "  ]\n}" << std::endl;

    return 0;
}

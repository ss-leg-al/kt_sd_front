import React, { useState, useEffect } from "react";
import axios from "axios";

const News = () => {
  const [news, setNews] = useState([]);
  const [query, setQuery] = useState("환경"); // 기본 검색어
  const [loading, setLoading] = useState(false);

  const fetchNews = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:4000/news", {
        params: { query: searchQuery, sort: "sim" }, // 관련도 정렬
      });
      setNews(response.data.items);
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(query); // 초기 검색
  }, [query]);

  const handleTagClick = (tag) => {
    setQuery(tag); // 태그 클릭 시 검색어 변경
  };

  // HTML 엔티티를 디코딩하는 함수
  const decodeHtmlEntities = (str) => {
    return str.replace(/&quot;/g, '"');
  };

  return (
    <div style={styles.container}>
     

      {/* 태그 버튼 */}
      <div style={styles.tagContainer}>
        {["환경", "재활용", "친환경", "분리수거", "성동구"].map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            style={{
              ...styles.tagButton,
              backgroundColor: query === tag ? "#000" : "#fff",
              color: query === tag ? "#fff" : "#000",
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={styles.loadingText}>로딩 중...</p>
      ) : (
        <ul style={styles.newsList}>
          {news.map((item) => (
            <li key={item.link} style={styles.newsItem}>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.newsTitle}
              >
                {decodeHtmlEntities(item.title.replace(/<\/?[^>]+(>|$)/g, ""))}
              </a>
              <p style={styles.newsDescription}>
                {decodeHtmlEntities(item.description.replace(/<\/?[^>]+(>|$)/g, ""))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const styles = {
  container: {
    borderRadius: "12px",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "2rem",
    backgroundColor: "white",
    color: "#333",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    marginTop: "1rem",
  },
  tagContainer: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  tagButton: {
    padding: "0.6rem 1.2rem",
    border: "2px solid #2e8b57",
    borderRadius: "999px",
    fontSize: "0.95rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backgroundColor: "#fff",
    color: "#2e8b57",
  },
  loadingText: {
    textAlign: "center",
    fontSize: "1rem",
    fontStyle: "italic",
  },
  newsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    maxHeight: "332px",        // ✅ 스크롤 높이 제한
    overflowY: "auto",         // ✅ 세로 스크롤 활성화
    border: "1px solid #ddd",  // (선택) 영역 구분선
    borderRadius: "8px",
  },
  newsItem: {
    marginBottom: "1.5rem",
    padding: "0.8rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
  },
  newsTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#2e8b57",
    textDecoration: "none",
    marginBottom: "0.5rem",
    display: "block",
    textAlign: "left",
  },
  newsDescription: {
    fontSize: "0.95rem",
    color: "#444",
    lineHeight: "1.6",
    textAlign: "left",
  },
};

export default News;
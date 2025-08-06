import React, { useEffect, useState } from "react";

// JSON 파일 경로
const dataMap = {
  의류수거함: "/data/sd_cloth_bins.json",
  폐건전지: "/data/sd_battery_bins.json",
  휴지통: "/data/sd_trash_bins.json",
};

// 마커 색상 설정
const markerColorMap = {
  의류수거함: "#2e8b57", // 초록
  폐건전지: "#1e90ff",   // 파랑
  휴지통: "#ff6347",     // 빨강
};

const MapTab = () => {
  const [selectedTag, setSelectedTag] = useState("의류수거함");
  const [locations, setLocations] = useState([]);
  const [mapReady, setMapReady] = useState(false);

  // Kakao Maps SDK 로드
  useEffect(() => {
    const scriptId = "kakao-map-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=★카카오_키★&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => setMapReady(true));
      };
      document.head.appendChild(script);
    } else {
      window.kakao.maps.load(() => setMapReady(true));
    }
  }, []);

  // 선택된 태그의 데이터 로드
  useEffect(() => {
    if (!mapReady) return;
    fetch(dataMap[selectedTag])
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error("JSON 로드 오류:", err));
  }, [selectedTag, mapReady]);

  // 지도 및 마커 표시
  useEffect(() => {
    if (!mapReady || locations.length === 0) return;

    const container = document.getElementById("map");
    const options = {
      center: new window.kakao.maps.LatLng(37.5634, 127.0366),
      level: 4,
    };
    const map = new window.kakao.maps.Map(container, options);

    const color = markerColorMap[selectedTag];

    locations.forEach((item) => {
      const position = new window.kakao.maps.LatLng(item.lat, item.lng);

      // 색상 원형 마커 (CustomOverlay)
      const markerContent = `
        <div style="
          width: 16px;
          height: 16px;
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
        " title="${item.location}"></div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        position,
        content: markerContent,
        yAnchor: 0.5,
        xAnchor: 0.5,
      });

      overlay.setMap(map);
    });
  }, [locations, mapReady]);

  return (
    <div style={styles.container}>
      <div style={styles.tagContainer}>
        {["의류수거함", "폐건전지", "휴지통"].map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            style={{
              ...styles.tagButton,
              backgroundColor: selectedTag === tag ? "#000" : "#fff",
              color: selectedTag === tag ? "#fff" : "#000",
            }}
          >
            {tag}
          </button>
        ))}
      </div>
      <div id="map" style={styles.map}></div>
    </div>
  );
};

const styles = {
  container: {
    borderRadius: "12px",
    maxWidth: "800px",
    margin: "1rem auto",
    padding: "2rem",
    backgroundColor: "white",
    color: "#333",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
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
  map: {
    width: "100%",
    height: "332px",
    borderRadius: "8px",
  },
};

export default MapTab;
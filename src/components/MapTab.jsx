import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const dataMap = {
  의류수거함: "/data/sd_cloth_bins.json",
  폐건전지함: "/data/sd_battery_bins.json",
  휴지통: "/data/sd_trash_bins.json",
};

const markerColorMap = {
  의류수거함: "#2e8b57",
  폐건전지함: "#1e90ff",
  휴지통: "#ff6347",
};

const MapTab = () => {
  const [selectedTag, setSelectedTag] = useState("의류수거함");
  const [locations, setLocations] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    const scriptId = "kakao-map-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=3aee0877c425e13706117fd64850e552&autoload=false`;
      script.async = true;
      script.onload = () => {
        window.kakao.maps.load(() => setMapReady(true));
      };
      document.head.appendChild(script);
    } else {
      window.kakao.maps.load(() => setMapReady(true));
    }
  }, []);

  useEffect(() => {
    if (!mapReady) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("위치 정보 가져오기 실패:", error);
        Swal.fire({
          icon: "warning",
          title: "위치 권한이 필요합니다",
          text: "브라우저에서 위치 권한을 허용해주세요.",
          confirmButtonColor: '#2e8b57'
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady) return;
    fetch(dataMap[selectedTag])
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error("JSON 로드 오류:", err));
  }, [selectedTag, mapReady]);

  useEffect(() => {
    if (!mapReady || locations.length === 0) return;

    const container = document.getElementById("map");
    const options = {
      center: new window.kakao.maps.LatLng(37.5634, 127.0366),
      level: 4,
    };
    const map = new window.kakao.maps.Map(container, options);
    setMapInstance(map);

    const color = markerColorMap[selectedTag];

    locations.forEach((item) => {
      const position = new window.kakao.maps.LatLng(item.lat, item.lng);
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

  const findNearestLocation = async () => {
    if (!userLocation || locations.length === 0 || !mapInstance) {
      alert("위치 정보 또는 수거함 정보가 없습니다.");
      return;
    }

    const toRad = (value) => (value * Math.PI) / 180;
    const distance = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lng2 - lng1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    let minDist = Infinity;
    let nearest = null;

    for (const loc of locations) {
      const dist = distance(userLocation.lat, userLocation.lng, loc.lat, loc.lng);
      if (dist < minDist) {
        minDist = dist;
        nearest = loc;
      }
    }

    if (!nearest) return;

    Swal.fire({
      icon: "info",
      title: `가장 가까운 ${selectedTag}`,
      text: nearest.location,
      confirmButtonColor: '#2e8b57'
    });

    // Kakao Mobility 도보 길찾기 API 호출
    try {
      const REST_API_KEY = "52da38bbf02e1b42826b5084208c6c01";
      const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${userLocation.lng},${userLocation.lat}&destination=${nearest.lng},${nearest.lat}&waypoints=&priority=RECOMMEND&car_fuel=GASOLINE&car_hipass=false&alternatives=false&road_details=false`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `KakaoAK ${REST_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!data.routes || !data.routes[0]) {
        throw new Error("경로 없음");
      }

      const linePath = [];

      const roads = data.routes[0].sections.flatMap((s) => s.roads);
      roads.forEach((road) => {
        for (let i = 0; i < road.vertexes.length; i += 2) {
          const lng = road.vertexes[i];
          const lat = road.vertexes[i + 1];
          linePath.push(new window.kakao.maps.LatLng(lat, lng));
        }
      });

      new window.kakao.maps.Polyline({
        map: mapInstance,
        path: linePath,
        strokeWeight: 5,
        strokeColor: "#2e8b57",
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });

      mapInstance.setLevel(4);
      mapInstance.setCenter(new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng));
    } catch (error) {
      console.error("도보 경로 요청 실패:", error);
      Swal.fire({
        icon: "error",
        title: "도보 경로를 불러올 수 없습니다",
        text: "경로 데이터 요청 중 오류가 발생했습니다.",
        confirmButtonColor: '#2e8b57'
      });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.tagContainer}>
        {Object.keys(dataMap).map((tag) => (
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

      <div style={{ textAlign: "right", marginTop: "1rem" }}>
        <button onClick={findNearestLocation} style={styles.nearestButton}>
          가장 가까운 {selectedTag} 찾기
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    borderRadius: "12px",
    maxWidth: "800px",
    margin: "1rem auto",
    padding: "0.5rem",
    backgroundColor: "white",
    color: "#333",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
  },
  tagContainer: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "0.5rem",
    marginBottom: "1rem",
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
  nearestButton: {
    marginBottom: "0.5rem",
    padding: "0.6rem 1.2rem",
    backgroundColor: "#2e8b57",
    color: "white",
    borderRadius: "999px",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
  },
  map: {
    width: "100%",
    height: "332px",
    borderRadius: "8px",
  },
};

export default MapTab;
const MapTab = () => {
  return (
    <div style={styles.container}>
      <h2>환경 지도</h2>
      <ul>
        <li>📰 재활용률 증가... 성동구 헌옷 수거함 50개 확대</li>
        <li>📰 쓰레기통 분리수거 정책 강화 추진</li>
        <li>📰 환경의 날 캠페인 안내</li>
      </ul>
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
    marginTop: "2rem",
  },
}
export default MapTab;
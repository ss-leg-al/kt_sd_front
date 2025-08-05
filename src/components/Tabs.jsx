// src/components/Tabs.jsx
import { useState } from 'react';
import MapTab from './MapTab';
import NewsTab from './NewsTab';
import ChatbotTab from './ChatbotTab';
import './Tabs.css';

const Tabs = () => {
  const [activeTab, setActiveTab] = useState('map');

  const renderTab = () => {
    switch (activeTab) {
      case 'map':
        return <MapTab />;
      case 'news':
        return <NewsTab />;
      case 'chat':
        return <ChatbotTab />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="tab-buttons">
        <button className={activeTab === 'map' ? 'active' : ''} onClick={() => setActiveTab('map')}>환경 지도</button>
        <button className={activeTab === 'news' ? 'active' : ''} onClick={() => setActiveTab('news')}>환경 뉴스</button>
        <button className={activeTab === 'chat' ? 'active' : ''} onClick={() => setActiveTab('chat')}>환경 챗봇</button>
      </div>
      <div className="tab-content">{renderTab()}</div>
    </div>
  );
};

export default Tabs;
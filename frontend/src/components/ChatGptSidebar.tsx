/** @format */

import React, { useState } from "react";
import {
  Search,
  PanelLeftClose,
  SquarePen,
  Image as ImageIcon,
  Library,
  Clock,
  Boxes,
  Folder,
  Code2,
  MoreHorizontal,
  MessageSquare,
  Gift,
  Plus,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface ChatGptSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewChat: () => void;
  onSelectChat: (chatTitle: string) => void;
  activeChatTitle?: string;
  onOpenWorkTab?: (tab: string) => void;
}

export function ChatGptSidebar({
  isOpen,
  onToggle,
  onNewChat,
  onSelectChat,
  activeChatTitle,
  onOpenWorkTab,
}: ChatGptSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Exact pinned items from screenshot
  const pinnedItems = [
    { id: "dict", title: "Dicitonary", icon: MessageSquare },
    { id: "teasing", title: "Teasing Twist Transla...", icon: MessageSquare },
  ];

  // Agricultural & conversation recent items
  const recentItems = [
    "Tomato Early Blight grad-cam",
    "Muhanga Soil Lime Calc",
    "Rain washout forecast - Sep 29",
    "Maize Armyworm Pheromone Protocol",
    "DeepSeek-V3 MoE Plant Pathology",
  ];

  if (!isOpen) return null;

  return (
    <aside
      className="chatgpt-sidebar"
      style={{
        width: 260,
        minWidth: 260,
        maxWidth: 260,
        height: "100vh",
        backgroundColor: "#171717",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        userSelect: "none",
        zIndex: 50,
        fontFamily: "var(--font-family-aeonik)",
      }}
    >
      {/* Top Header: Logo, Search, Collapse */}
      <div
        style={{
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 6,
        }}
      >
        {/* ChatGPT Header Title with Logo */}
        <div
          onClick={onNewChat}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            padding: "4px 6px",
            borderRadius: 8,
            transition: "background 0.15s ease",
          }}
          className="chatgpt-header-title-btn"
        >
          {/* OpenAI ChatGPT Flower / Spiral Logo SVG */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "#ffffff" }}
          >
            <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12a10 10 0 0 1 10-10z" />
            <path d="M12 6a6 6 0 0 1 6 6" />
            <path d="M12 18a6 6 0 0 1-6-6" />
            <circle cx="12" cy="12" r="2" fill="#ffffff" />
          </svg>
          <span
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-0.01em",
            }}
          >
            ChatGPT
          </span>
        </div>

        {/* Right action icons: Search & Collapse */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <button
            onClick={() => setIsSearching(!isSearching)}
            title="Search chats"
            style={{
              background: "transparent",
              border: "none",
              color: "#b4b4b4",
              padding: 6,
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="chatgpt-icon-hover"
          >
            <Search size={17} />
          </button>

          <button
            onClick={onToggle}
            title="Close sidebar"
            style={{
              background: "transparent",
              border: "none",
              color: "#b4b4b4",
              padding: 6,
              borderRadius: 6,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            className="chatgpt-icon-hover"
          >
            <PanelLeftClose size={17} />
          </button>
        </div>
      </div>

      {/* Optional Search Input */}
      {isSearching && (
        <div style={{ padding: "0 12px 8px 12px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#212121",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 8,
              padding: "6px 10px",
            }}
          >
            <Search size={14} color="#8e8e8e" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#ffffff",
                fontSize: 13,
                width: "100%",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>
      )}

      {/* New Chat Button (Pill shaped button matching screenshot) */}
      <div style={{ padding: "0 12px 10px 12px" }}>
        <button
          onClick={onNewChat}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            backgroundColor: "transparent",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s ease",
            textAlign: "left",
          }}
          className="chatgpt-newchat-btn"
        >
          <SquarePen size={16} color="#ffffff" />
          <span>New chat</span>
        </button>
      </div>

      {/* Middle Scrollable Section: Navigation, Pinned, Recents */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
        className="chatgpt-scrollbar"
      >
        {/* Main Menu Items from Screenshot */}
        {[
          { label: "Images", icon: ImageIcon, action: () => onOpenWorkTab?.("crop-doctor") },
          { label: "Library", icon: Library, action: () => onOpenWorkTab?.("seasonal-planner") },
          { label: "Scheduled", icon: Clock, action: () => onOpenWorkTab?.("decision-fusion") },
          { label: "Plugins", icon: Boxes, action: () => onOpenWorkTab?.("soil-advisor") },
          { label: "Projects", icon: Folder, action: () => onOpenWorkTab?.("marketplace") },
          { label: "Codex", icon: Code2, action: () => onOpenWorkTab?.("ml-workbench") },
          { label: "More", icon: MoreHorizontal, action: () => {} },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "8px 10px",
                background: "transparent",
                border: "none",
                borderRadius: 8,
                color: "#e3e3e3",
                fontSize: 14,
                fontWeight: 400,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.15s ease",
              }}
              className="chatgpt-nav-item"
            >
              <Icon size={17} color="#c7c7c7" />
              <span>{item.label}</span>
            </button>
          );
        })}

        {/* Pinned Section */}
        <div style={{ marginTop: 14, marginBottom: 4, padding: "0 10px" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#8e8e8e",
              letterSpacing: "0.02em",
            }}
          >
            Pinned
          </span>
        </div>

        {pinnedItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectChat(item.title)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "7px 10px",
              background: activeChatTitle === item.title ? "rgba(255, 255, 255, 0.08)" : "transparent",
              border: "none",
              borderRadius: 8,
              color: "#e3e3e3",
              fontSize: 13.5,
              cursor: "pointer",
              textAlign: "left",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            className="chatgpt-nav-item"
          >
            <MessageSquare size={16} color="#8e8e8e" style={{ flexShrink: 0 }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{item.title}</span>
          </button>
        ))}

        {/* Recents Section */}
        <div style={{ marginTop: 14, marginBottom: 4, padding: "0 10px" }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: "#8e8e8e",
              letterSpacing: "0.02em",
            }}
          >
            Recents
          </span>
        </div>

        {recentItems
          .filter((t) => !searchQuery || t.toLowerCase().includes(searchQuery.toLowerCase()))
          .map((title, idx) => (
            <button
              key={idx}
              onClick={() => onSelectChat(title)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "7px 10px",
                background: activeChatTitle === title ? "rgba(255, 255, 255, 0.08)" : "transparent",
                border: "none",
                borderRadius: 8,
                color: "#e3e3e3",
                fontSize: 13.5,
                cursor: "pointer",
                textAlign: "left",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              className="chatgpt-nav-item"
            >
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
            </button>
          ))}
      </div>

      {/* Bottom Profile Footer: "kope nshuti", "Free", and "Claim offer" */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          background: "#171717",
        }}
      >
        {/* User Identity Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 6px",
            borderRadius: 8,
            cursor: "pointer",
          }}
          className="chatgpt-user-row"
        >
          {/* Avatar: Red circle with "KN" */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#b91c1c", // terracotta/crimson red from screenshot
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            KN
          </div>

          {/* User Name & Plan */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#ffffff",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              kope nshuti
            </span>
            <span
              style={{
                fontSize: 12,
                color: "#8e8e8e",
                lineHeight: 1.2,
              }}
            >
              Free
            </span>
          </div>
        </div>

        {/* Claim offer button (exact pill button from screenshot) */}
        <button
          onClick={() => alert("FarmerAI Pro Offer: Unlimited DeepSeek-V3 MoE reasoning, RAB agronomist certification, and satellite radar included!")}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "8px 12px",
            backgroundColor: "#212121",
            color: "#ffffff",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          className="chatgpt-claim-offer-btn"
        >
          <Gift size={15} color="#ffffff" />
          <span>Claim offer</span>
        </button>
      </div>
    </aside>
  );
}

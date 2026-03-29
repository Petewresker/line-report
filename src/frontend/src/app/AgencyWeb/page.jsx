"use client";

import { useRef, useState, useEffect } from "react";
import liff from "@line/liff";

const STATUS_BADGE = {
  FORWARD:     { bg: "#FEF3C7", text: "#92400E", label: "รอรับงาน",        dot: "#F59E0B" },
  IN_PROGRESS: { bg: "#DBEAFE", text: "#1E40AF", label: "กำลังดำเนินการ", dot: "#3B82F6" },
  FINISHED:    { bg: "#D1FAE5", text: "#065F46", label: "เสร็จสิ้น",       dot: "#10B981" },
};

const TABS = ["ALL", "FORWARD", "IN_PROGRESS", "FINISHED"];
const TAB_LABEL = { ALL: "ALL", FORWARD: "รอรับงาน", IN_PROGRESS: "กำลังดำเนิน", FINISHED: "เสร็จสิ้น" };
const TAB_COLOR = { ALL: "#111", FORWARD: "#F59E0B", IN_PROGRESS: "#3B82F6", FINISHED: "#10B981" };

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

function formatTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

export default function AgencyWeb() {
  const [auth, setAuth] = useState(null); // { userId, agencyId }
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [showSendForm, setShowSendForm] = useState(false);
  const [sendPhoto, setSendPhoto] = useState(null);
  const [sendPhotoFile, setSendPhotoFile] = useState(null); // used when submit is implemented
  const [summary, setSummary] = useState("");
  const sendPhotoRef = useRef(null);

  // ── LIFF Init + Auth ───────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID_AGENCY });
        if (!liff.isLoggedIn()) { liff.login(); return; }

        const profile = await liff.getProfile();
        const agencyId = localStorage.getItem("agencyId");

        if (!agencyId) {
          setError("ไม่พบข้อมูลหน่วยงาน กรุณาลงทะเบียนก่อน");
          setLoading(false);
          return;
        }

        setAuth({ userId: profile.userId, agencyId });
      } catch (err) {
        setError(err?.message ?? "LIFF initialization failed");
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Fetch cases ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!auth) return;
    const { userId, agencyId } = auth;
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/agencies/${agencyId}/cases`, {
      headers: { userid: userId, agencyid: agencyId, role: "agency" },
    })
      .then((r) => r.json())
      .then((data) => {
        setCases(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [auth]);

  const handleSendPhotoCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSendPhoto(URL.createObjectURL(file));
    setSendPhotoFile(file);
    e.target.value = "";
  };

  const counts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === "ALL" ? cases.length : cases.filter((c) => c.status === tab).length;
    return acc;
  }, {});

  const filtered = cases.filter((c) => {
    const matchTab = activeTab === "ALL" || c.status === activeTab;
    const matchSearch = c.title?.includes(search) || c.caseId?.includes(search);
    return matchTab && matchSearch;
  });

  // ── Loading / Error ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 text-sm">กำลังโหลด...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <p className="text-red-400 text-sm text-center">{error}</p>
      </div>
    );
  }

  // ── Top Bar (shared) ───────────────────────────────────────────────────────
  const TopBar = ({ onBack, title }) => (
    <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b-2 border-gray-200 shadow-sm">
      {onBack ? (
        <button onClick={onBack} className="flex items-center gap-1 text-gray-700 font-semibold text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {title}
        </button>
      ) : (
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
      )}
      <div className="flex items-center gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
          </svg>
        </div>
      </div>
    </div>
  );

  // ── Detail View ────────────────────────────────────────────────────────────
  if (selected) {
    const badge = STATUS_BADGE[selected.status] ?? { bg: "#f0f0f0", text: "#555", label: selected.status, dot: "#aaa" };
    const images = selected.imageUrl ? [selected.imageUrl] : [];

    return (
      <div className="min-h-screen bg-white flex flex-col">
        <TopBar onBack={() => { setSelected(null); setAccepted(false); }} title="Problem List" />

        <div className="flex-1 overflow-y-auto px-4 py-4">

          {/* Title + Badge */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="text-base font-bold text-gray-900 flex-1">{selected.title}</h2>
            <span className="text-xs px-2 py-1 rounded-lg flex-shrink-0 font-medium"
              style={{ backgroundColor: badge.bg, color: badge.text }}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4">{selected.caseId}</p>

          {/* Images */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mb-5">
              {images.map((src, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden bg-gray-100 aspect-video">
                  <img src={src} alt="" className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = "none"; }} />
                </div>
              ))}
            </div>
          )}

          {/* อธิบาย */}
          <div className="mb-5">
            <h3 className="text-sm font-bold text-gray-800 mb-2">อธิบาย</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{selected.description}</p>
          </div>

          {/* ตำแหน่ง */}
          <div className="mb-5">
            <h3 className="text-sm font-bold text-gray-800 mb-2">ตำแหน่ง</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
              <span>{selected.lat}, {selected.lon}</span>
              <a href={`https://www.google.com/maps?q=${selected.lat},${selected.lon}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          </div>

          {/* ข้อมูลรายงาน */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-800 mb-2">ข้อมูลรายงาน</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                วันที่ {formatDate(selected.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                {formatTime(selected.createdAt)}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pb-6">
            <button
              onClick={() => { setSelected(null); setAccepted(false); }}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-gray-700 border border-gray-300 bg-white"
            >
              Backward
            </button>
            <button
              onClick={() => setAccepted(true)}
              className="w-full py-3 rounded-2xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300"
              style={{ backgroundColor: accepted ? "#065F46" : "#10B981" }}
            >
              {accepted && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {accepted ? "รับงานแล้ว" : "รับงาน"}
            </button>
            {accepted && (
              <button
                onClick={() => setShowSendForm(true)}
                className="w-full py-3 rounded-2xl text-sm font-semibold text-white"
                style={{ backgroundColor: "#3B82F6" }}
              >
                ส่งงาน
              </button>
            )}
          </div>

        </div>

        {/* Send Form Overlay */}
        {showSendForm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-end">
            <div className="bg-white w-full rounded-t-3xl px-4 pt-5 pb-8">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">ส่งงาน</h2>
                <button onClick={() => { setShowSendForm(false); setSendPhoto(null); setSendPhotoFile(null); setSummary(""); }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <p className="text-xs font-medium text-gray-600 mb-2">แนบรูปงานของท่าน</p>
              <input ref={sendPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleSendPhotoCapture} />
              {sendPhoto ? (
                <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4" style={{ border: "1px solid #5D5A5A" }}>
                  <img src={sendPhoto} alt="work" className="w-full h-full object-cover" />
                  <button
                    onClick={() => { URL.revokeObjectURL(sendPhoto); setSendPhoto(null); setSendPhotoFile(null); }}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div
                  className="w-full h-44 rounded-2xl flex items-center justify-center cursor-pointer mb-4"
                  style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
                  onClick={() => sendPhotoRef.current?.click()}
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="text-gray-400 text-sm">แตะเพื่อแนบรูป</span>
                  </div>
                </div>
              )}
              <p className="text-xs font-medium text-gray-600 mb-2">Summary</p>
              <textarea
                className="w-full px-3 py-2 rounded-xl text-gray-700 text-sm resize-none h-28 mb-4"
                style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
                placeholder="สรุปงานที่ดำเนินการ..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
              />
              <button className="w-full py-3 rounded-2xl text-sm font-semibold text-white" style={{ backgroundColor: "#10B981" }}>
                ยืนยันส่งงาน
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // ── List View ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <TopBar title="Problem List" />

      {/* Tabs */}
      <div className="flex px-4 gap-2 my-4">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="flex-1 flex flex-col items-center py-3 rounded-2xl text-xs font-semibold transition-all"
            style={{
              background: activeTab === tab ? "#fff" : "#F5F5F5",
              color: activeTab === tab ? TAB_COLOR[tab] : "#999",
              border: activeTab === tab ? `2px solid ${TAB_COLOR[tab]}` : "2px solid transparent",
              boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.10)" : "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            <span>{TAB_LABEL[tab]}</span>
            <span className="text-lg font-bold mt-0.5" style={{ color: TAB_COLOR[tab] }}>{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 px-4 mb-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
          style={{ backgroundColor: "#F5F5F5", border: "1px solid #E0E0E0" }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <input type="text" placeholder="ค้นหา..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-gray-700 outline-none w-full" />
        </div>
      </div>

      {/* Case List */}
      <div className="flex flex-col px-4 flex-1">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 text-sm mt-10">ไม่มีรายการ</p>
        ) : (
          filtered.map((item) => {
            const badge = STATUS_BADGE[item.status] ?? { dot: "#aaa" };
            return (
              <div key={item.caseId} onClick={() => setSelected(item)}
                className="flex gap-3 py-3 border-b border-gray-100 cursor-pointer active:bg-gray-50">
                <div className="w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt="" className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; }} />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-400 mb-1">{item.caseId}</p>
                    <p className="text-xs text-gray-500 leading-snug line-clamp-2">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      {formatDate(item.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {formatTime(item.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 pt-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: badge.dot }} />
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}

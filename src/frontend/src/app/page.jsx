"use client";

import { useEffect, useRef, useState } from "react";
import liff from "@line/liff";

export default function Home() {
  const [profile, setProfile] = useState(null);
  const [liffReady, setLiffReady] = useState(false);
  const [liffError, setLiffError] = useState(null);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [topic, setTopic] = useState("");
  const [detail, setDetail] = useState("");
  const inputRef = useRef(null);
  const [locState, setLocState] = useState("idle");
  const [coords, setCoords] = useState(null);
  const [submitState, setSubmitState] = useState("idle"); // idle | loading | success | error

  // ── LIFF Init & Login ──────────────────────────────────────────────────────
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID });

        if (!liff.isLoggedIn()) {
          liff.login();
          return;
        }

        const userProfile = await liff.getProfile();
        setProfile(userProfile);
        setLiffReady(true);
      } catch (err) {
        console.error("LIFF Initialization failed", err);
        setLiffError(err?.message ?? String(err));
      }
    };

    initLiff();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (submitState === "loading" || submitState === "success") return;
    setSubmitState("loading");
    try {
      let imageKey = null;

      if (photoFile) {
        // 1. ขอ presigned URL จาก backend
        const presignedRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/cases/presigned-url?filename=${encodeURIComponent(photoFile.name)}&contentType=${encodeURIComponent(photoFile.type)}`
        );
        const { uploadUrl, key } = await presignedRes.json();

        // 2. PUT รูปตรงไป S3
        await fetch(uploadUrl, {
          method: "PUT",
          body: photoFile,
          headers: { "Content-Type": photoFile.type },
        });

        imageKey = key;
      }

      // 3. POST ข้อมูล case ไป backend
      const payload = {
        title: topic,
        description: detail,
        userId: profile?.userId ?? null,
        lat: coords?.lat ?? null,
        lon: coords?.lng ?? null,
        imageUrlBefore: imageKey,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const result = await res.json();
      console.log("Case created:", result);
      setSubmitState("success");
    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitState("idle");
    }
  };

  const handleCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoFile(file);
    e.target.value = "";
  };

  const handleGetLocation = () => {
    setLocState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocState("found");
      },
      () => setLocState("idle"),
    );
  };

  // ── Loading screen ─────────────────────────────────────────────────────────
  if (liffError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFE2C2] px-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 w-full max-w-sm text-center">
          <p className="text-red-500 font-semibold mb-2">LIFF Error</p>
          <p className="text-gray-500 text-sm break-all">{liffError}</p>
        </div>
      </div>
    );
  }

  if (!liffReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFE2C2]">
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFE2C2] px-4 py-4 flex flex-col">
      <div className="bg-white rounded-2xl shadow-sm p-4 flex-1">

        {/* Profile Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-3 mb-4">
          <img
            src={profile.pictureUrl}
            alt="profile"
            className="w-10 h-10 rounded-full border border-green-400"
          />
          <span className="text-sm font-medium text-gray-700">{profile.displayName}</span>
        </div>

        {/* Form Title */}
        <div className="border-b border-gray-200 pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Incidence Request</h2>
        </div>

        {/* Topic */}
        <div className="relative">
          <select
            className="w-full px-3 py-2 rounded-lg text-gray-400 text-sm appearance-none"
            style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            <option value="" disabled>-- Select Topic --</option>
            <option value="Road & Pavement Damage">Road & Pavement Damage</option>
            <option value="Flooding & Drainage">Flooding & Drainage</option>
            <option value="Streetlight Malfunction">Streetlight Malfunction</option>
            <option value="Illegal Dumping & Waste">Illegal Dumping & Waste</option>
            <option value="Public Safety Hazard">Public Safety Hazard</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg className="w-3 h-3 text-gray-500" viewBox="0 0 10 6" fill="currentColor">
              <path d="M0 0L5 6L10 0H0Z" />
            </svg>
          </div>
        </div>

        {/* Detail */}
        <textarea
          className="w-full mt-3 px-3 py-2 rounded-lg text-gray-400 text-sm resize-none h-40"
          style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
          placeholder="Type detail..."
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />

        {/* Photo */}
        <div className="border-b border-gray-200 mt-3 pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Take a photo</h2>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleCapture}
        />

        {photoPreview ? (
          <div className="relative w-full h-40 rounded-lg overflow-hidden" style={{ border: "1px solid #5D5A5A" }}>
            <img src={photoPreview} alt="captured" className="w-full h-full object-cover" />
            <button
              onClick={() => {
                URL.revokeObjectURL(photoPreview);
                setPhotoPreview(null);
                setPhotoFile(null);
              }}
              className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <button
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 right-2 bg-black bg-opacity-50 rounded-full p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            className="w-full h-40 rounded-lg flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
            onClick={() => inputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span className="text-gray-400 text-sm">Please take a photo</span>
            </div>
          </div>
        )}

        {/* Location */}
        <div className="border-b border-gray-200 mt-3 pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Location</h2>
        </div>

        {locState === "idle" && (
          <div
            className="w-full h-20 rounded-lg flex items-center justify-center gap-3 cursor-pointer"
            style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
            onClick={handleGetLocation}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-gray-400 text-sm">Searching your Location</span>
          </div>
        )}

        {locState === "loading" && (
          <div
            className="w-full h-20 rounded-lg flex items-center justify-center gap-3"
            style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
          >
            <svg className="w-5 h-5 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        )}

        {locState === "found" && coords && (
          <div
            className="w-full h-20 rounded-lg flex flex-col items-start justify-center px-4 gap-1"
            style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
          >
            <span className="text-gray-700 text-sm font-medium">Location found</span>
            <span className="text-gray-400 text-xs">Lat: {coords.lat.toFixed(6)}, Long: {coords.lng.toFixed(6)}</span>
          </div>
        )}

        {/* Submit */}
        <button
          className={`w-full mt-4 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
            submitState === "success"
              ? "bg-green-500 scale-[1.02]"
              : submitState === "loading"
              ? "opacity-70 cursor-not-allowed"
              : "hover:brightness-110 active:scale-95"
          }`}
          style={submitState !== "success" ? { backgroundColor: "#F29A4E" } : {}}
          onClick={handleSubmit}
          disabled={submitState === "loading" || submitState === "success"}
        >
          {submitState === "loading" && (
            <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          {submitState === "success" && (
            <svg
              className="w-5 h-5 animate-[checkmark_0.4s_ease-out_forwards]"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ strokeDasharray: 30, strokeDashoffset: 0, animation: "draw 0.4s ease-out forwards" }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {submitState === "success" ? "รับเรื่องแล้ว!" : submitState === "loading" ? "กำลังส่ง..." : "Submit Confirmed"}
        </button>

        <style>{`
          @keyframes draw {
            from { stroke-dashoffset: 30; }
            to   { stroke-dashoffset: 0; }
          }
        `}</style>

        <img src="capibara_san.png" alt="capibara" />
      </div>
    </div>
  );
}

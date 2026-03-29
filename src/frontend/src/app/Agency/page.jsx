"use client";

import { useEffect, useRef, useState } from "react";
import liff from "@line/liff";

export default function AgencyRegister() {
  const [profile, setProfile] = useState(null);
  const [liffReady, setLiffReady] = useState(false);
  const [liffError, setLiffError] = useState(null);

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const inputRef = useRef(null);

  const [submitState, setSubmitState] = useState("idle"); // idle | loading | success

  // ── LIFF Init ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID_AGENCY });

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

  const handleCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoFile(file);
    e.target.value = "";
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (submitState === "loading" || submitState === "success") return;

    if (!name || !surname || !phoneNumber || !agencyName) {
      alert("กรุณากรอกข้อมูลที่จำเป็นให้ครบ");
      return;
    }

    setSubmitState("loading");
    try {
      // 1. ถ้ามีรูป → ขอ presigned URL แล้วอัปโหลดไป S3
      let imageKey = null;
      if (photoFile) {
        const presignRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agencies/presign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: photoFile.name, contentType: photoFile.type }),
        });
        if (!presignRes.ok) throw new Error("ขอ presigned URL ไม่สำเร็จ");
        const { uploadUrl, key } = await presignRes.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: photoFile,
          headers: { "Content-Type": photoFile.type },
        });
        if (!uploadRes.ok) throw new Error("อัปโหลดรูปไม่สำเร็จ");
        imageKey = key;
      }

      // 2. ส่งข้อมูล registration
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agencies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          userid: profile?.userId ?? "",
        },
        body: JSON.stringify({
          name,
          surname,
          phoneNumber,
          agencyName,
          email,
          lineUserID: profile?.userId ?? "",
          ...(imageKey && { imageKey }),
        }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      setSubmitState("success");
    } catch (err) {
      console.error("Submit failed:", err);
      setSubmitState("idle");
    }
  };

  // ── Loading / Error ────────────────────────────────────────────────────────
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
          <h2 className="text-xl font-semibold text-gray-800">Agency Registration</h2>
        </div>

        {/* Agency Card Photo */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleCapture}
        />

        {photoPreview ? (
          <div className="relative w-full h-44 rounded-lg overflow-hidden mb-4" style={{ border: "1px solid #5D5A5A" }}>
            <img src={photoPreview} alt="agency card" className="w-full h-full object-cover" />
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
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </button>
          </div>
        ) : (
          <div
            className="w-full h-44 rounded-lg flex items-center justify-center cursor-pointer mb-4"
            style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
            onClick={() => inputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <span className="text-gray-400 text-sm">แตะเพื่อแนบรูปบัตรหน่วยงาน</span>
            </div>
          </div>
        )}

        {/* ชื่อ */}
        <div className="flex flex-col gap-1 mb-3">
          <label className="text-xs font-medium text-gray-600">ชื่อ *</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg text-gray-700 text-sm"
            style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
            placeholder="กรอกชื่อ"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* นามสกุล */}
        <div className="flex flex-col gap-1 mb-3">
          <label className="text-xs font-medium text-gray-600">นามสกุล *</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg text-gray-700 text-sm"
            style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
            placeholder="กรอกนามสกุล"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
          />
        </div>

        {/* เบอร์โทรศัพท์ */}
        <div className="flex flex-col gap-1 mb-3">
          <label className="text-xs font-medium text-gray-600">เบอร์โทรศัพท์ *</label>
          <input
            type="tel"
            className="w-full px-3 py-2 rounded-lg text-gray-700 text-sm"
            style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
            placeholder="0812345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        {/* ชื่อหน่วยงาน */}
        <div className="flex flex-col gap-1 mb-3">
          <label className="text-xs font-medium text-gray-600">ชื่อหน่วยงาน *</label>
          <input
            type="text"
            className="w-full px-3 py-2 rounded-lg text-gray-700 text-sm"
            style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
            placeholder="กรอกชื่อหน่วยงาน"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
          />
        </div>

        {/* อีเมล */}
        <div className="flex flex-col gap-1 mb-3">
          <label className="text-xs font-medium text-gray-600">อีเมล</label>
          <input
            type="email"
            className="w-full px-3 py-2 rounded-lg text-gray-700 text-sm"
            style={{ backgroundColor: "#F5F5F5", border: "1px solid #5D5A5A" }}
            placeholder="example@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

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
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {submitState === "success" ? "ส่งคำขอแล้ว!" : submitState === "loading" ? "กำลังส่ง..." : "ส่งคำขอลงทะเบียน"}
        </button>

      </div>
    </div>
  );
}

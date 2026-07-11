"use client";
import React, { useState, useEffect, useRef } from "react";
import { Award, Download, CheckCircle, FileCheck, ShieldAlert, Loader2, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useMasteryStore } from "../store/useMasteryStore";
import { Alex_Brush } from "next/font/google";
import Link from "next/link";

const alexBrush = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
});

export default function CertificateClaim() {
  const { userId, userName, setClaimedCertificate, selectedPath } = useMasteryStore();
  const [name, setName] = useState(userName || "");
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [certificate, setCertificate] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Check progress on mount
  useEffect(() => {
    if (userId) {
      fetch("/api/progress", {
        headers: {
          'x-user-id': userId,
          'x-user-name': userName,
        }
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setProgress(data.progress || []);
          }
        })
        .catch((err) => console.error("Error fetching progress:", err))
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [userId, userName]);

  const completedCount = progress.filter((p) => p.score >= 70).length;
  // Let's allow claiming if they have completed at least 1 module for developer preview, but show requirements
  const isEligible = completedCount >= 1;

  const handleClaim = async () => {
    if (!name.trim()) {
      alert("Please enter your name as you would like it to appear on the certificate.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/certify", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-id": userId,
          "x-user-name": userName,
        },
        body: JSON.stringify({ name, path: selectedPath }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to certify");
      }

      setCertificate(data);
      setClaimedCertificate(selectedPath);
    } catch (err: any) {
      setError(err.message || "Failed to claim certificate.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    const certElement = document.getElementById("certificate-pdf-template");
    if (!certElement) return;

    setLoading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(certElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0f172a",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      // Landscape letter format is 11in x 8.5in
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "in",
        format: "letter",
      });

      pdf.addImage(imgData, "PNG", 0, 0, 11, 8.5);
      pdf.save(`ASA_Certification_${name.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to export PDF certificate. Please check console.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center gap-2 p-6 bg-[var(--sidebar-bg)] border border-[var(--border-color)] rounded-lg">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
        <span className="text-[var(--text-muted)]">Verifying course mastery credentials...</span>
      </div>
    );
  }

  // Generate QR Code Payload URL (Clean Public URL)
  const qrPayload = certificate
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/credential/${certificate.certId}`
    : "";
  const qrUrl = certificate
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrPayload)}`
    : "";

  return (
    <div className="mt-8 border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--sidebar-bg)] shadow-sm">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-yellow-500" />
          <div>
            <h3 className="m-0 font-bold text-[var(--text-main)] text-base">ASA Cryptographic Certification Engine</h3>
            <p className="m-0 text-xs text-[var(--text-muted)]">Verifies local sqlite database progress and issues cryptographically signed credentials.</p>
          </div>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-900 cursor-pointer"
          title="Close and return to Dashboard"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        {/* Eligibility Warning */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900 flex items-start gap-3">
          <FileCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
          <div>
            <p className="font-bold m-0">Your Course Progress: {Math.min(completedCount, 77)} / 77 modules mastered</p>
            <p className="m-0 mt-1">
              {isEligible
                ? "You have completed the required modules and are eligible to claim your Aegis Automation certification!"
                : "You must complete and pass at least 1 module assessment to unlock certificate generation."}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-sm text-red-900 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-bold m-0">Verification Denied</p>
              <p className="m-0 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!certificate ? (
          <div className="flex flex-col gap-4 max-w-md">
            <div>
              <label className="block text-sm font-semibold text-[var(--text-main)] mb-1">
                Candidate Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name for the certificate"
                className="w-full px-4 py-2 rounded border border-[var(--border-color)] bg-[var(--bg-color)] text-[var(--text-main)] focus:outline-none focus:border-[var(--accent)]"
                disabled={!isEligible}
              />
            </div>

            <button
              onClick={handleClaim}
              disabled={loading || !isEligible || !name.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[var(--accent)] text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Award className="w-5 h-5" />}
              Generate Secure Certificate
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded text-sm text-green-900 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
              <div>
                <p className="font-bold m-0">Certificate Issued Successfully!</p>
                <p className="m-0 mt-1">Verify ID: <strong>{certificate.certId}</strong>. You can now download the high-resolution PDF certificate.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleDownloadPDF}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded font-medium hover:bg-green-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Download High-Res PDF
              </button>

              <Link
                href="/resume"
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all cursor-pointer no-underline"
              >
                <FileCheck className="w-5 h-5" />
                Unlock Resume Builder
              </Link>
            </div>

            {/* LinkedIn Integration Panel */}
            <div className="bg-[#0e76a8]/10 border border-[#0e76a8]/30 rounded-lg p-5 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-[#0e76a8] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                <div>
                  <h4 className="m-0 font-bold text-[var(--text-main)]">Share your Success</h4>
                  <p className="m-0 text-xs text-[var(--text-muted)]">Add this credential to your LinkedIn profile to stand out to recruiters.</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <a 
                  href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=Playwright+Automation+Legend&organizationName=Aegis+Automation+Academy&issueYear=${new Date().getFullYear()}&issueMonth=${new Date().getMonth() + 1}&certUrl=${qrPayload}&certId=${certificate.certId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0e76a8] text-white rounded font-medium hover:bg-[#006097] transition-colors no-underline text-sm"
                >
                  Add to Profile
                </a>
                <a 
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(qrPayload)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-transparent border border-[#0e76a8] text-[#0e76a8] rounded font-medium hover:bg-[#0e76a8]/10 transition-colors no-underline text-sm"
                >
                  Share to Feed
                </a>
              </div>
            </div>

            {/* Hidden Certificate HTML Template for PDF Generation */}
            <div className="border border-[var(--border-color)] rounded-lg overflow-hidden mt-4">
              <p className="text-xs text-[var(--text-muted)] p-2 bg-gray-50 border-b border-[var(--border-color)] text-center">Certificate Preview (Landscape Print Layout)</p>
              
              <div 
                id="certificate-pdf-template"
                style={{
                  width: "880px",
                  height: "680px",
                  padding: "0",
                  background: "radial-gradient(circle at center, #060d1a 0%, #01040a 100%)",
                  color: "#cbd5e1",
                  fontFamily: "Outfit, sans-serif",
                  display: "flex",
                  flexDirection: "column",
                  boxSizing: "border-box",
                  position: "relative",
                  margin: "0 auto",
                  overflow: "hidden",
                }}
              >
                {/* Security Paper Texture (Using subtle lines) */}
                <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "repeating-linear-gradient(45deg, #cbd5e1 0px, #cbd5e1 1px, transparent 1px, transparent 10px)", pointerEvents: "none" }} />

                {/* Platinum Outer Border with Metallic Shine */}
                <div style={{ position: "absolute", inset: "14px", border: "4px solid #94a3b8", borderRadius: "2px", boxShadow: "inset 0 0 10px rgba(255,255,255,0.3), 0 0 10px rgba(255,255,255,0.2)", pointerEvents: "none" }} />
                
                {/* Gold Inner Border with Foil Stamping Feel */}
                <div style={{ position: "absolute", inset: "24px", border: "1px solid #fbbf24", boxShadow: "inset 0 0 10px rgba(251, 191, 36, 0.4), 0 0 10px rgba(251, 191, 36, 0.4)", pointerEvents: "none" }} />
                
                {/* Huge Watermark Seal behind name — reduced opacity so name is undisputed focal point */}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.02, pointerEvents: "none" }}>
                  <ShieldAlert style={{ width: "480px", height: "480px", color: "#f8fafc" }} />
                </div>

                <div style={{ padding: "28px 60px 22px", display: "flex", flexDirection: "column", height: "100%", zIndex: 10 }}>
                  
                  {/* Top: Institute Title & Subtitle */}
                  <div style={{ textAlign: "center", marginBottom: "14px" }}>
                    <h1 style={{ margin: 0, fontSize: "1.55rem", fontWeight: 900, letterSpacing: "2px", background: "linear-gradient(to right, #f8fafc, #94a3b8)", WebkitBackgroundClip: "text", color: "transparent", whiteSpace: "nowrap" }}>
                      PLAYWRIGHT AUTOMATION ACADEMY
                    </h1>
                    <p style={{ margin: "3px 0 0", fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "3px", fontWeight: 600 }}>
                      Certifying Authority: Automation Excellence Institute
                    </p>
                    <p style={{ margin: "8px 0 0", fontSize: "1rem", color: "#fbbf24", textTransform: "uppercase", letterSpacing: "6px", fontWeight: 800, textShadow: "0 0 10px rgba(251,191,36,0.3)" }}>
                      CERTIFICATE OF MASTERY
                    </p>
                    <p style={{ margin: "4px 0 0", fontSize: "0.62rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "2.5px", fontWeight: 500 }}>
                      Advanced Automation Engineering Credential
                    </p>
                  </div>

                  {/* Main Body */}
                  <div style={{ textAlign: "center", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <p style={{ fontSize: "0.9rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "3px", fontStyle: "italic", marginBottom: "8px" }}>
                      Presented To
                    </p>
                    
                    {/* Metal Engraved Name */}
                    <h2 style={{ fontSize: "3.2rem", margin: "0 0 8px 0", fontWeight: 900, letterSpacing: "2px", color: "#ffffff", textShadow: "0 4px 6px rgba(0,0,0,0.5), 0 0 30px rgba(255,255,255,0.4)" }}>
                      {name.toUpperCase()}
                    </h2>

                    {/* Achievement Ribbon — rank impossible to miss */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", background: "linear-gradient(135deg, #92400e, #b45309, #d97706, #b45309, #92400e)", padding: "5px 20px", borderRadius: "2px", margin: "0 auto 10px auto", boxShadow: "0 0 20px rgba(251,191,36,0.4), inset 0 1px 0 rgba(255,255,255,0.2)", border: "1px solid rgba(253,230,138,0.5)" }}>
                      <Award style={{ width: "16px", height: "16px", color: "#fde68a" }} />
                      <span style={{ fontSize: "0.8rem", fontWeight: 900, letterSpacing: "3px", color: "#fde68a", textTransform: "uppercase" }}>LEVEL ACHIEVED: AUTOMATION LEGEND</span>
                      <Award style={{ width: "16px", height: "16px", color: "#fde68a" }} />
                    </div>

                    <p style={{ fontSize: "1rem", margin: "0 auto 6px auto", color: "#cbd5e1", fontStyle: "italic" }}>
                      For successfully completing
                    </p>
                    <p style={{ fontSize: "1.6rem", fontWeight: 900, background: "linear-gradient(to right, #f8fafc, #cbd5e1)", WebkitBackgroundClip: "text", color: "transparent", margin: "0 0 6px 0", letterSpacing: "2px" }}>
                      AEGIS AUTOMATION
                    </p>
                    <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fbbf24", margin: "0", letterSpacing: "3px", textShadow: "0 0 15px rgba(251,191,36,0.4)" }}>
                      AUTOMATION LEGEND TRACK
                    </p>
                  </div>

                  {/* Bottom Area (3 Columns: Left Signature, Center Seal, Right QR) */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: "12px", paddingBottom: "6px", gap: "12px" }}>
                    
                    {/* Left: Signature & Authority */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                      {/* AI Signature — SVG filter strips black bg, viewport crops to center of JB monogram */}
                      <svg 
                        width="190" height="80" 
                        style={{ display: "block", marginLeft: "-5px", transform: "rotate(-2deg) translateY(-10px)", overflow: "visible" }}
                      >
                        <defs>
                          <filter id="sig-extract" x="-10%" y="-10%" width="120%" height="120%">
                            <feColorMatrix type="saturate" values="0" result="gray"/>
                            <feComponentTransfer in="gray" result="boosted">
                              <feFuncR type="linear" slope="4" intercept="-1.5"/>
                              <feFuncG type="linear" slope="4" intercept="-1.5"/>
                              <feFuncB type="linear" slope="4" intercept="-1.5"/>
                            </feComponentTransfer>
                            <feColorMatrix in="boosted" type="luminanceToAlpha" result="alpha"/>
                            <feFlood floodColor="#e2e8f0" result="ink"/>
                            <feComposite in="ink" in2="alpha" operator="in"/>
                          </filter>
                        </defs>
                        {/* Image rendered at 210x210 (natural 1:1), offset y=-35 to crop to JB center */}
                        <image 
                          href="/signature-jb.png" 
                          x="-5" y="-25" 
                          width="200" height="200"
                          filter="url(#sig-extract)"
                          preserveAspectRatio="none"
                        />
                      </svg>
                      <div style={{ borderBottom: "2px solid rgba(148, 163, 184, 0.8)", width: "190px", boxShadow: "0 1px 2px rgba(0,0,0,0.5)", marginTop: "2px" }} />
                      <div style={{ fontSize: "0.85rem", color: "#f8fafc", marginTop: "5px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase" }}>
                        Founder & Course Director
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#fbbf24", marginTop: "1px", fontWeight: 600, textTransform: "uppercase" }}>
                        Aegis Automation
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#22d3ee", marginTop: "3px", display: "flex", alignItems: "center", gap: "6px", textShadow: "0 0 8px rgba(34, 211, 238, 0.4)", fontWeight: 700 }}>
                        <CheckCircle style={{ width: "14px", height: "14px" }} /> Digitally Signed & Verified
                      </div>
                    </div>

                    {/* Center: Massive Premium Seal */}
                     <div style={{ position: "relative", width: "100px", height: "100px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {/* Gold Foil Outer Ring */}
                      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "linear-gradient(135deg, #fcd34d, #b45309, #fde68a, #d97706)", boxShadow: "0 0 20px rgba(251, 191, 36, 0.6), inset 0 0 10px rgba(0,0,0,0.5)" }} />
                      {/* Platinum Inner Ring */}
                      <div style={{ position: "absolute", inset: "6px", borderRadius: "50%", background: "linear-gradient(135deg, #f8fafc, #94a3b8, #e2e8f0, #475569)", border: "1px solid rgba(0,0,0,0.3)" }} />
                      {/* Red Gem Center */}
                      <div style={{ position: "absolute", inset: "12px", borderRadius: "50%", background: "radial-gradient(circle at 30% 30%, #ef4444, #7f1d1d)", border: "2px solid rgba(255,255,255,0.2)", boxShadow: "inset 0 0 15px rgba(0,0,0,0.8)" }} />
                      
                      {/* Seal Text */}
                      <div style={{ position: "relative", zIndex: 10, textAlign: "center", color: "#fff", textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>
                        <Award style={{ width: "24px", height: "24px", margin: "0 auto 4px auto", color: "#fde68a", filter: "drop-shadow(0 0 5px rgba(251,191,36,0.8))" }} />
                        <div style={{ fontSize: "0.55rem", fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase" }}>Automation</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 900, letterSpacing: "2px", color: "#fde68a" }}>LEGEND</div>
                        <div style={{ fontSize: "0.45rem", fontWeight: 700, letterSpacing: "1px", marginTop: "2px", opacity: 0.9 }}>ELITE VERIFIED</div>
                        <div style={{ fontSize: "0.55rem", fontWeight: 800, marginTop: "2px" }}>2026</div>
                      </div>
                    </div>

                    {/* Right: Holographic QR Code & Metadata */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      
                      {/* Metadata right above QR */}
                      <div style={{ textAlign: "right", marginBottom: "10px" }}>
                        <div style={{ fontSize: "0.55rem", color: "#64748b", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "1px" }}>CERTIFICATE NO.</div>
                        <div style={{ fontSize: "0.7rem", color: "#f8fafc", fontFamily: "monospace", textTransform: "uppercase", fontWeight: 700, letterSpacing: "1px" }}>{certificate.certId}</div>
                        <div style={{ fontSize: "0.6rem", color: "#94a3b8", fontFamily: "monospace", textTransform: "uppercase", marginTop: "4px" }}>
                          <span style={{ color: "#cbd5e1" }}>ISSUED:</span> {new Date(certificate.issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }).toUpperCase()}
                        </div>
                      </div>

                      {qrPayload && (
                        <div style={{ position: "relative", padding: "4px", borderRadius: "8px", background: "linear-gradient(135deg, rgba(34, 211, 238, 0.5), rgba(56, 189, 248, 0.2), rgba(34, 211, 238, 0.5))", boxShadow: "0 0 20px rgba(34, 211, 238, 0.2)" }}>
                          <div style={{ background: "#fff", padding: "6px", borderRadius: "4px" }}>
                            <QRCodeSVG 
                              value={qrPayload}
                              size={88}
                              level="H"
                              includeMargin={false}
                            />
                          </div>
                          {/* Holographic scanner line effect */}
                          <div style={{ position: "absolute", inset: 0, border: "1px solid #22d3ee", borderRadius: "8px", pointerEvents: "none" }} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

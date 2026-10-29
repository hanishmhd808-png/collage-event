"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { Award, Download, CheckCircle, Search, Star } from "lucide-react";

function CertCard({ cert, index }: { cert: { id: string; studentId: string; studentName: string; eventId: string; eventTitle: string; eventDate: string; issuedAt: string; verificationCode: string; organizerName?: string }; index: number }) {
  const handleDownload = () => {
    const content = `
EVENTORA AI - Certificate of Participation

This is to certify that

${cert.studentName}

has successfully participated in

${cert.eventTitle}

held on ${new Date(cert.eventDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

Verification Code: ${cert.verificationCode}
Issued: ${new Date(cert.issuedAt).toLocaleDateString()}

EVENTORA AI - Every Campus Moment, Perfectly Organized.
    `.trim();
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(`<pre style="font-family:serif;padding:60px;font-size:16px;max-width:700px;margin:auto;line-height:2;text-align:center">${content}</pre>`);
      win.document.close();
      win.print();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative rounded-3xl overflow-hidden border-2 border-yellow-400/30"
      style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.05), rgba(245,158,11,0.03))" }}
    >
      {/* Decorative corner stars */}
      <div className="absolute top-3 left-3 text-yellow-400/30 text-lg">⭐</div>
      <div className="absolute top-3 right-3 text-yellow-400/30 text-lg">⭐</div>
      <div className="absolute bottom-3 left-3 text-yellow-400/30 text-lg">⭐</div>
      <div className="absolute bottom-3 right-3 text-yellow-400/30 text-lg">⭐</div>

      <div className="p-8 text-center">
        {/* Logo/Seal */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <Award className="w-8 h-8 text-white" />
        </div>

        <p className="text-yellow-400/60 text-xs font-semibold uppercase tracking-widest mb-2">EVENTORA AI</p>
        <h3 className="text-white font-black text-xl mb-1">Certificate of Participation</h3>
        <div className="w-16 h-0.5 bg-yellow-400/30 mx-auto my-4" />

        <p className="text-white/40 text-sm mb-2">This certifies that</p>
        <p className="text-white font-black text-2xl mb-4">{cert.studentName}</p>
        <p className="text-white/40 text-sm mb-1">has successfully participated in</p>
        <p className="text-yellow-400 font-bold text-lg mb-4">{cert.eventTitle}</p>

        <p className="text-white/30 text-sm mb-1">held on</p>
        <p className="text-white/70 text-sm mb-6">{new Date(cert.eventDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="border border-white/10 rounded-2xl p-4 mb-6">
          <p className="text-white/30 text-xs mb-1">Verification Code</p>
          <p className="text-white font-mono font-bold tracking-widest">{cert.verificationCode}</p>
          <p className="text-white/20 text-xs mt-1">Issued: {new Date(cert.issuedAt).toLocaleDateString()}</p>
        </div>

        <div className="flex gap-3 justify-center">
          <button onClick={handleDownload} className="flex items-center gap-2 btn-primary px-5 py-2.5 text-sm">
            <Download className="w-4 h-4" />Download
          </button>
          <Link href={`/certificates/verify/${cert.id}`}>
            <button className="flex items-center gap-2 btn-secondary text-white border-white/20 px-5 py-2.5 text-sm">
              <CheckCircle className="w-4 h-4" />Verify
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function CertificatesPage() {
  const { certificates } = useApp();
  const { user, studentProfile } = useAuth();
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState<{ found: boolean; cert?: typeof certificates[0] } | null>(null);

  const handleVerify = () => {
    const cert = certificates.find(c => c.verificationCode === verifyCode.trim().toUpperCase());
    setVerifyResult({ found: !!cert, cert });
  };

  return (
    <div className="bg-[#0a0a0f] min-h-screen">
      <div className="pt-24 pb-12 px-6" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(245,158,11,0.04))" }}>
        <div className="max-w-5xl mx-auto">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-yellow-400 text-sm font-semibold mb-2 uppercase tracking-widest">Your Achievements</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-black text-white mb-2">My Certificates</motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/40">{certificates.length} certificate{certificates.length !== 1 ? "s" : ""} earned</motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {certificates.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">No Certificates Yet</h3>
            <p className="text-white/40 mb-6">Participate in events to earn certificates</p>
            <Link href="/explore"><button className="btn-primary px-8 py-3">Explore Events</button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {certificates.map((cert, i) => <CertCard key={cert.id} cert={cert} index={i} />)}
          </div>
        )}

        {/* Verify section */}
        <div className="glass-dark border border-white/8 rounded-3xl p-8">
          <h2 className="text-white font-bold text-xl mb-2">Verify a Certificate</h2>
          <p className="text-white/40 text-sm mb-6">Enter a verification code to confirm authenticity</p>
          <div className="flex gap-3">
            <input
              value={verifyCode}
              onChange={e => setVerifyCode(e.target.value.toUpperCase())}
              placeholder="Enter verification code (e.g. CERT-2026-ABCD)"
              className="flex-1 glass border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/30 outline-none focus:border-yellow-500/30 font-mono"
            />
            <button onClick={handleVerify} className="btn-primary px-6 py-3 text-sm flex items-center gap-2">
              <Search className="w-4 h-4" />Verify
            </button>
          </div>
          {verifyResult !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 p-4 rounded-2xl border ${verifyResult.found ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
              {verifyResult.found && verifyResult.cert ? (
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-400 font-bold">✅ Certificate Verified!</p>
                    <p className="text-white/60 text-sm mt-1">Issued to <strong className="text-white">{verifyResult.cert.studentName}</strong> for <strong className="text-white">{verifyResult.cert.eventTitle}</strong></p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-red-400" />
                  <p className="text-red-400">Certificate not found. Please check the code and try again.</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

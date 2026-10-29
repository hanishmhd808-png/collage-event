"use client";

import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { CheckCircle, XCircle, Award, ArrowLeft } from "lucide-react";

export default function VerifyCertificatePage() {
  const { id } = useParams() as { id: string };
  const { certificates } = useApp();
  const cert = certificates.find(c => c.id === id);

  return (
    <div className="bg-[#0a0a0f] min-h-screen flex items-center justify-center px-6 pt-20">
      <div className="max-w-lg w-full text-center">
        <Link href="/certificates" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Certificates
        </Link>

        {cert ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 20 }}>
            <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <p className="text-green-400 font-bold text-lg mb-2">✅ Certificate Verified!</p>
            <h1 className="text-white font-black text-3xl mb-8">Authentic Certificate</h1>

            <div className="glass-dark border border-yellow-400/20 rounded-3xl p-8 text-left space-y-4" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.05), rgba(245,158,11,0.02))" }}>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="text-center mb-6">
                <p className="text-yellow-400/60 text-xs uppercase tracking-widest mb-1">EVENTORA AI</p>
                <p className="text-white font-black text-xl">Certificate of Participation</p>
              </div>

              {[
                { label: "Issued To", value: cert.studentName },
                { label: "Event", value: cert.eventTitle },
                { label: "Event Date", value: new Date(cert.eventDate).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }) },
                { label: "Issued On", value: new Date(cert.issuedAt).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" }) },
                { label: "Verification Code", value: cert.verificationCode },
                { label: "Certificate ID", value: cert.id },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start py-3 border-b border-white/5 last:border-0">
                  <span className="text-white/40 text-sm">{label}</span>
                  <span className="text-white font-semibold text-sm text-right max-w-[200px] font-mono">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex gap-4 justify-center">
              <Link href="/certificates"><button className="btn-secondary text-white border-white/20 px-6 py-3 text-sm">View All Certificates</button></Link>
              <Link href="/explore"><button className="btn-primary px-6 py-3 text-sm">Explore More Events</button></Link>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", damping: 20 }}>
            <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <p className="text-red-400 font-bold text-lg mb-2">Certificate Not Found</p>
            <h1 className="text-white font-black text-3xl mb-4">Invalid Certificate</h1>
            <p className="text-white/40 mb-8">No certificate found with ID: <span className="font-mono text-white/60">{id}</span>. The certificate may have been revoked or the link is incorrect.</p>
            <Link href="/certificates"><button className="btn-primary px-8 py-3">Go to Certificates</button></Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

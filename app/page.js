'use client';
import { useState, useRef } from 'react';
import Script from 'next/script';
import QRCode from 'qrcode'; // Perlu install: npm install qrcode

export default function Home() {
  const [showDocs, setShowDocs] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const qrisInputRef = useRef(null);
  const amountInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // --- LOGIC QR ---
  const handleGenerate = async () => {
    const qris = qrisInputRef.current.value;
    const amount = amountInputRef.current.value;

    if (!qris || !amount) {
      alert("Isi data dulu bro!");
      return;
    }

    setLoading(true);
    
    // Kita tembak API sendiri biar sekalian ngetes API-nya
    try {
      const res = await fetch('/api/convert', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ qris, amount })
      });
      const json = await res.json();
      
      if(json.status) {
        setResult(json.data);
        // Render QR ke Canvas
        if(canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, json.data.qris_modified, { width: 220, margin: 2 }, function (error) {
                if (error) console.error(error)
            })
        }
      } else {
        alert("Gagal: " + json.error);
      }
    } catch (e) {
      alert("Error system");
    }
    setLoading(false);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const link = document.createElement('a');
    link.download = `qris-${result.amount}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };
  
  // Baca File Gambar (Pake JSQR logic, simplified)
  // Catatan: Di Next.js, loading external script agak beda, 
  // tapi untuk simpelnya logic decode gambar bisa pakai library 'jsqr' via npm install jsqr
  // Disini saya skip code decode gambar biar fokus ke struktur API & UI.

  return (
    <div className="min-h-screen bg-[#e5efff] flex justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-blue-100 p-6 relative">
        
        {/* HEADER & MENU */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-blue-900">QRIS CONVERTER API</h1>
            <p className="text-gray-500 text-sm">Convert Static to Dynamic by Ray.</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-200">V 3.0 API</span>
            {/* BUTTON TITIK TIGA (DOCS) */}
            <button 
              onClick={() => setShowDocs(true)}
              className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full hover:bg-gray-200 cursor-pointer"
            >
              ⋮
            </button>
          </div>
        </div>

        {/* INFO BOX */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-6">
            <strong>INFO:</strong> Web ini sekarang Open API! Klik titik tiga di pojok kanan atas untuk melihat Dokumentasi API.
        </div>

        {/* INPUT FORM */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">String QRIS</label>
            <textarea ref={qrisInputRef} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm h-24" placeholder="Paste string QRIS lu disini..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nominal (Rp)</label>
            <input ref={amountInputRef} type="number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="10000" />
          </div>
          
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-500/30"
          >
            {loading ? 'Processing...' : 'GENERATE QRIS'}
          </button>
        </div>

        {/* RESULT */}
        {result && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-center animate-fade-in">
                <h3 className="font-bold text-gray-800 mb-2">HASIL GENERATE</h3>
                <p className="text-gray-500 mb-4">Nominal: Rp {parseInt(result.amount).toLocaleString('id-ID')}</p>
                
                <div className="flex justify-center mb-4">
                    <canvas ref={canvasRef} className="border p-2 rounded-lg shadow-sm"></canvas>
                </div>

                <div className="flex gap-2 justify-center">
                    <button onClick={handleDownload} className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition">Download Image</button>
                    <button onClick={() => {setResult(null); qrisInputRef.current.value = ''; amountInputRef.current.value = '';}} className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-600 transition">Reset</button>
                </div>

                <div className="mt-4 text-left">
                    <label className="text-xs font-bold text-gray-500">Payload String:</label>
                    <textarea readOnly value={result.qris_modified} className="w-full p-2 bg-gray-50 text-xs border rounded mt-1 h-20 font-mono"></textarea>
                </div>
            </div>
        )}

        {/* MODAL API DOCS */}
        {showDocs && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDocs(false)}></div>
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl z-10 p-6 relative animate-scale-in">
              <button onClick={() => setShowDocs(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl">×</button>
              
              <h2 className="text-xl font-bold text-blue-900 mb-4">API Documentation</h2>
              <p className="text-sm text-gray-600 mb-4">Silakan gunakan endpoint ini untuk mengintegrasikan QRIS Converter ke aplikasi lu sendiri.</p>
              
              <div className="space-y-4">
                <div className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                  <span className="text-green-400">POST</span> /api/convert
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-700">Request Body (JSON):</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs mt-1 text-gray-700">
{`{
  "qris": "000201010211...",
  "amount": "15000"
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-700">Response (JSON):</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs mt-1 text-gray-700">
{`{
  "status": true,
  "data": {
    "qris_original": "...",
    "amount": "15000",
    "qris_modified": "000201010212..." // Siap scan
  }
}`}
                  </pre>
                </div>

                <div className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded border border-red-100">
                  <strong>Note:</strong> API ini hanya mengubah string QRIS menjadi Dinamis. Tidak ada fitur pengecekan status pembayaran (callback) karena membutuhkan akses Merchant Aggregator.
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const PORT = 3000;

// Lazy-loaded Gemini AI client to avoid crashes on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is required. Please set it in your environment variables/secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  app.use(express.json());

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", mode: process.env.NODE_ENV || "development" });
  });

  // Draft Procurement Document Generator Endpoint
  app.post("/api/generate-procurement", async (req, res) => {
    try {
      const { docType, payload } = req.body;
      if (!docType || !payload) {
        return res.status(400).json({ error: "docType and payload are required" });
      }

      const ai = getGeminiClient();

      const {
        packageName,
        budget,
        procType, // 'goods' | 'construction' | 'services' | 'consultancy'
        description,
        additionalNotes,
      } = payload;

      const translateProcType = (type: string) => {
        switch (type) {
          case "goods": return "Pengadaan Barang";
          case "construction": return "Pekerjaan Konstruksi";
          case "services": return "Jasa Lainnya";
          case "consultancy": return "Jasa Konsultansi";
          default: return "Pengadaan Barang/Jasa";
        }
      };

      // System prompt tailored for LKPP & Indonesian PBJP standards (Perpres 12/2021)
      let prompt = "";
      if (docType === "spek_teknis") {
        prompt = `Anda adalah ahli pengadaan barang/jasa pemerintah Indonesia. Buatlah draf dokumen resmi **SPESIFIKASI TEKNIS** yang lengkap, matang, dan profesional yang siap dipakai oleh Pejabat Pembuat Komitmen (PPK).
Gunakan bahasa birokrasi Indonesia yang formal, berwibawa, dan rinci, mengacu pada Perpres No. 12 Tahun 2021 tentang Pengadaan Barang/Jasa Pemerintah.

INFORMASI PAKET PEKERJAAN:
- Nama Pekerjaan: ${packageName}
- Pagu Anggaran: Rp ${Number(budget).toLocaleString("id-ID")}
- Jenis Pengadaan: ${translateProcType(procType)}
- Deskripsi Kebutuhan Utama: ${description}
- Catatan Tambahan/Spesifik: ${additionalNotes || "-"}

STRUKTUR DRAF DOKUMEN YANG HARUS ANDA BUAT:
1. **Latar Belakang**: Alasan urgensi pengadaan barang/jasa ini dengan kalimat birokrasi pemerintahan yang rapi.
2. **Maksud dan Tujuan**: Maksud pelaksanaan dan tujuan akhir yang ingin dicapai dari aktivitas ini.
3. **Nama Organisasi Pengadaan**: Pejabat Pembuat Komitmen (PPK) pada Satuan Kerja Pemerintah terkait.
4. **Spesifikasi Teknis Detail**: 
   - Detail spesifikasi (merek, fungsi, dimensi, kapasitas, material, jumlah, atau standar kinerja industri).
   - Standar/Kualitas/Sertifikasi wajib (contoh: SNI, TKDN, dll).
5. **Waktu Pelaksanaan Pekerjaan**: Estimasi jangka waktu penyelesaian/pengiriman barang, lokasi serah terima (FOB Destinasi), dan draf jadwal mingguan/bulanan.
6. **Kualifikasi Penyedia**: Syarat administrasi dan teknis esensial bagi Penyedia yang akan melamar (contoh: ijin usaha NIB, SBU/KBLI yang sesuai, kepemilikan alat/tenaga terampil).
7. **Laporan & Dokumentasi (jika relevan)**: Pelaporan progres, Berita Acara, dll.

Buat draf dokumen ini secara UTUH dan PANJANG. Format dalam Markdown yang rapi dengan heading, list, dan tabel jika diperlukan. Jangan gunakan placeholders kosong seperti "[Isi di sini]", carikan atau buat asumsi logis yang sangat mendekati spesifikasi teknis industri riil di Indonesia sesuai data pekerjaan tersebut.`;
      } else if (docType === "kak") {
        prompt = `Anda adalah seorang ahli penyusun dokumen proyek pemerintahan Indonesia (PBJP). Buatlah draf **KERANGKA ACUAN KERJA (KAK) / TERM OF REFERENCE (TOR)** yang komprehensif untuk pengadaan jasa konsultansi atau layanan jasa lainnya berlandaskan ketentuan LKPP.
Gunakan bahasa birokrasi formal.

INFORMASI PAKET PEKERJAAN:
- Nama Pekerjaan: ${packageName}
- Estimasi Nilai Pekerjaan: Rp ${Number(budget).toLocaleString("id-ID")}
- Jenit Kegiatan: ${translateProcType(procType)}
- Deskripsi Aktivitas/Ruang Lingkup: ${description}
- Catatan Khusus: ${additionalNotes || "-"}

STRUKTUR KAK YANG HARUS DIHASILKAN:
1. **Pendahuluan**: Latar belakang, gambaran umum, kelayakan proyek.
2. **Dasar Hukum**: Referensi aturan yang relevan (UUD, UU, Perpres No. 12/2021, Perlem LKPP terkait).
3. **Ruang Lingkup Pekerjaan**: Tahapan-tahapan pelaksanaan pekerjaan secara sistematis dari awal hingga akhir kontrak.
4. **Keluaran (Output)**: Produk akhir atau dokumen kajian/barang jadi yang diserahkan.
5. **Kebutuhan Tenaga Ahli (Personal/Sertifikasi)**: Daftar personil kunci, jenjang pendidikan minimal, pengalaman tahunan, dan sertifikasi ahli (jika jasa konsultansi/keahlian).
6. **Jangka Waktu Penyelesaian**: Batas pengerjaan, milestone pelaporan (Laporan Pendahuluan, Antara, Akhir).
7. **Sumber Pendanaan & Anggaran**: APBN/APBD beserta alokasi anggaran belanja jasa terkait.

Buat draf ini dalam format Markdown yang indah dan matang tanpa placeholder kosong. Berikan teks aslinya dengan detail tinggi.`;
      } else if (docType === "klausul_kontrak") {
        prompt = `Anda adalah Penasihat Hukum Pengadaan (Procurement Legal Counsel) spesialis Kontrak Pemerintah Indonesia (Perpres PBJP).
Buatlah rancangan draf **KLAUSUL UTAMA SYARAT-SYARAT KHUSUS KONTRAK (SSKK)** atau Klausul Kontrak Esensial untuk melindungi kepentingan negara serta menjaga kesepakatan komersial yang adil bagi penyedia dan pengguna jasa.

INFORMASI PAKET PEKERJAAN:
- Nama Pekerjaan: ${packageName}
- Nilai Kotrak Estimasi: Rp ${Number(budget).toLocaleString("id-ID")}
- Kategori PBJ: ${translateProcType(procType)}
- Pokok-Pokok Perjanjian/Risk Factor: ${description}
- Catatan Tambahan: ${additionalNotes || "-"}

KLAUSUL-KLAUSUL YANG HARUS ANDA RANCISE SECARA FORMAL LEGISLATIF:
1. **Ketentuan Pembayaran & Termin**: Pembayaran berdasarkan termin/milestone, uang muka (jika ada), retensi (jika konstruksi/pemeliharaan), atau prestasi kerja bulanan (monthly certificate).
2. **Sanksi dan Denda Keterlambatan**: Formula denda (seperseribu per hari dari nilai kontrak atau bagian kontrak sebelum PPN), pemutusan kontrak secara sepihak.
3. **Keadaan Kahar (Force Majeure)**: Klausa komprehensif penanganan bencana alam, kerusuhan, wabah, serta mekanisme notifikasi keadaan kahar.
4. **Penyelesaian Sengketa**: Tahapan penyelesaian sengketa (Musyawarah, Mediasi Layanan Penyelesaian Sengketa LKPP, atau Arbitrase/Pengadilan Negeri).
5. **Jaminan-Jaminan Kontrak**: Jaminan Pelaksanaan, Jaminan Uang Muka, Jaminan Pemeliharaan (syarat bank penerbit/Asuransi penerbit).

Format tulisan mengadopsi standar Dokumen Pemilihan LKPP yang formal, kaku, presisi, dan berkekuatan hukum kuat. Tulis secara komprehensif dalam Markdown.`;
      } else if (docType === "kriteria_evaluasi") {
        prompt = `Buatlah draf panduan **KRITERIA & LEMBAR EVALUASI PENAWARAN (ADMINISTRASI, TEKNIS, & HARGA)** untuk membantu Pejabat Pengadaan atau Pokja Pemilihan menyeleksi penawaran dari para calon penyedia.

INFORMASI PEKERJAAN:
- Nama Paket: ${packageName}
- Pagu Anggaran Paket: Rp ${Number(budget).toLocaleString("id-ID")}
- Jenis Barang/Jasa: ${translateProcType(procType)}
- Detail Kebutuhan Evaluasi: ${description}
- Keunikan/Spesifik Pekerjaan: ${additionalNotes || "-"}

FORMAT EVALUASI YANG HARUS DIHASILKAN (dalam bentuk instruksi & checklist tabel Markdown):
1. **Evaluasi Administrasi**: Checklist wajib (NIB, KSWP status Valid, SPT Pajak tahun terakhir, jaminan penawaran jika tender, surat kuasa).
2. **Evaluasi Teknis**: Metode evaluasi teknis yang disarankan (Sistem Gugur atau Nilai Ambang Batas). Kriteria teknis detail (spesifikasi produk ditawarkan, jaminan purna jual, pengalaman di bidang sejenis, ketersediaan peralatan utama).
3. **Evaluasi Harga / Kewajaran Harga**: Cara melakukan koreksi aritmatik, pengujian harga timpang (di bawah 80% HPS), pembuktian kualifikasi penawaran harga terendah.

Tulis draf ini secara instruktif, sistematis, lengkap dengan poin persentase bobot penilaian evaluasi jika menggunakan metode evaluasi nilai teknis. Sajikan dalam format Markdown yang rapi.`;
      } else {
        return res.status(400).json({ error: "Invalid docType requested" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "Anda adalah pakar Pengadaan Barang/Jasa Pemerintah (PBJP) Indonesia dan LKPP. Anda membantu Pejabat Pengadaan dan PPK menyusun rancangan dokumen pengadaan berkualitas premium dengan bahasa formal birokrasi, tanpa mengompromikan kredibilitas hukum dan ketepatan teknis.",
          temperature: 0.7,
        }
      });

      res.json({ result: response.text });
    } catch (error: any) {
      console.error("Error generating procurement document:", error);
      res.status(500).json({ error: error.message || "Gagal menghasilkan dokumen pengadaan." });
    }
  });

  // Chat Consultation Room with Gemini Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "messages array is required" });
      }

      const ai = getGeminiClient();

      // Map conversation array to Gemini API schema
      const geminiHistory = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
      }));

      // The last message in history is the current user request
      const currentMessage = geminiHistory.pop();
      if (!currentMessage) {
        return res.status(400).json({ error: "empty messages array" });
      }

      const systemInstruction = `Anda adalah "Konsultan PBJP Cerdas" — pakar bersertifikat LKPP, Auditor/Inspektur Pengadaan Senior Indonesia.
Tugas utama Anda adalah menjawab kendala, pertanyaan hukum, strategi pemaketan paket pekerjaan, sengketa, sanggahan, metode pemilihan, e-purchasing e-katalog, Swakelola, maupun ketentuan mitigasi penyelewengan dalam Pengadaan Barang/Jasa Pemerintah (PBJP) Indonesia berdasarkan Perpres No. 16 Tahun 2018, Perpres No. 12 Tahun 2021 beserta aturan turunan LKPP.

Sikap & Gaya Komunikasi Anda:
1. Sangat sopan, taktis, profesional, dan memberikan jawaban tegas berdasarkan kekuatan hukum pengadaan.
2. Selalu mencantumkan pasal dasar hukum yang dirujuk jika relevan (misalnya menyebutkan 'Pasal 38 Perpres 12/2021 tentang metode pemilihan...').
3. Berikan solusi pragmatis jika pengguna (Pejabat Pengadaan/PPK) sedang buntu menghadapi tenggat waktu atau ketakutan audit Inspektorat/BPK/KPK.
4. Jangan ragu membedah skenario pengadaan langsung, penunjukan langsung, tender cepat, ataupun e-purchasing.
5. Jawab dalam format Markdown yang rapi dengan pembagian visual yang bagus. Gunakan bahasa Indonesia.`;

      // Construct the contents parameter using prior history and the current user query turn
      const contents: any[] = [];
      geminiHistory.forEach((turn: any) => {
        contents.push({
          role: turn.role,
          parts: turn.parts,
        });
      });
      contents.push({
        role: currentMessage.role,
        parts: currentMessage.parts,
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("Error in procurement consultation chat:", error);
      res.status(500).json({ error: error.message || "Gagal berkomunikasi dengan asisten pengadaan." });
    }
  });


  // ----------------------------------------------------
  // VITE OR STATIC FILE SERVING
  // ----------------------------------------------------

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled express error:", err);
    res.status(500).json({ error: "Something went wrong in the server." });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Procurement Assistant server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start procurement assistant server:", err);
});

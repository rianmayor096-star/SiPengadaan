import React, { useState, useEffect } from "react";
import {
  ListTodo,
  Calculator,
  FileText,
  MessageSquare,
  HelpCircle,
  Trash2,
  Plus,
  Share2,
  CheckCircle,
  Copy,
  Calendar,
  AlertCircle,
  Check,
  FileSpreadsheet,
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  User,
  ShieldCheck,
  Volume2,
  X,
  FileCheck
} from "lucide-react";
import {
  HPSItem,
  ProcurementCategory,
  ProcurementMethod,
  WorkflowStep,
  ChatMessage,
  DocumentDraft,
} from "./types";

// Standard LKPP reference rules for Pejabat Pengadaan / PPK
const REGULATION_POCKET_GUIDE = [
  {
    title: "Batas Nilai Pengadaan Langsung",
    desc: "Barang/Pekerjaan Konstruksi/Jasa Lainnya s.d Rp 200 Juta. Jasa Konsultansi s.d Rp 100 Juta.",
    ref: "Pasal 38 Perpres 12/2021"
  },
  {
    title: "Ketentuan Denda Keterlambatan",
    desc: "1/1000 (seperseribu) per hari dari nilai kontrak atau bagian kontrak (sebelum PPN) yang terlambat.",
    ref: "Pasal 120 Perpres 16/2018"
  },
  {
    title: "Jaminan Pelaksanaan Konstruksi",
    desc: "Wajib untuk nilai kontrak di atas Rp 200 Juta. Nilai jaminan: 5% dari nilai kontrak (bila penawaran 80-100% HPS) atau 5% dari HPS (bila penawaran < 80% HPS).",
    ref: "Pasal 30 Perpres 12/2021"
  },
  {
    title: "Syarat Pelaku Keuangan Swakelola",
    desc: "Tipe I (Satker sendiri), Tipe II (Instansi lain), Tipe III (Ormas), Tipe IV (Kelompok Masyarakat).",
    ref: "Perlem LKPP 8/2021"
  },
  {
    title: "Evaluasi Harga di Bawah 80% HPS",
    desc: "Penawaran di bawah 80% HPS wajib dilakukan Evaluasi Kewajaran Harga secara rinci termasuk analisa satuan harga.",
    ref: "Aturan Pemilihan LKPP"
  }
];

// Presets for Indonesian Procurement Workflows
const PRESET_STEPS: Record<ProcurementMethod, Omit<WorkflowStep, "id" | "completed">[]> = {
  direct_proc: [
    {
      title: "Identifikasi Kebutuhan & Persiapan KAK",
      description: "PPK mengidentifikasi barang/jasa yang dibutuhkan dan menyusun Kerangka Acuan Kerja (KAK) atau Spesifikasi Teknis.",
      durationDays: 2,
      notes: "Pastikan spesifikasi menghindari penyebutan merek tertentu kecuali suku cadang atau komponen e-catalog.",
      regulatorySource: "Pasal 19 Perpres 12/2021"
    },
    {
      title: "Penetapan HPS (Harga Perkiraan Sendiri)",
      description: "PPK menyusun HPS berdasarkan survei pasar terdekat (minimal 3 sumber harga pembanding) dan menandatanganinya.",
      durationDays: 1,
      notes: "HPS adalah alat menilai kewajaran harga, bukan dasar menentukan pagu anggaran.",
      regulatorySource: "Pasal 26 Perpres 12/2021"
    },
    {
      title: "Sertifikasi Dokumen & Penyerahan ke Pejabat Pengadaan",
      description: "PPK menyerahkan KAK, HPS, dan rancangan kupon/kuitansi/SPK kepada Pejabat Pengadaan.",
      durationDays: 1,
      notes: "Periksa kelengkapan administrasi sebelum diserahkan untuk proses pemilihan.",
      regulatorySource: "Dokumen Persiapan Pengadaan"
    },
    {
      title: "Undangan & Permintaan Penawaran Harga",
      description: "Pejabat Pengadaan mencari minimal 1 penyedia yang dinilai mampu dan mengirimkan lembar permintaan harga beserta KAK/Spesifikasi.",
      durationDays: 1,
      notes: "Bisa dilangsungkan melalui LPSE non-tender (Sistem Pengadaan Secara Elektronik).",
      regulatorySource: "Pasal 38 Perpres 12/2021"
    },
    {
      title: "Evaluasi & Negosiasi Harga",
      description: "Pejabat Pengadaan membuka penawaran, melakukan evaluasi administrasi/teknis secara instan, lalu menawar harga sampai optimal.",
      durationDays: 1,
      notes: "Negosiasi wajib dituangkan dalam Berita Acara Negosiasi Harga (BANH).",
      regulatorySource: "Evaluasi Pengadaan Langsung"
    },
    {
      title: "Penerbitan BAHP (Berita Acara Hasil Pengadaan)",
      description: "Pejabat Pengadaan menetapkan penyedia terpilih dan membuat laporan akhir penyelesaian pengadaan ke PPK.",
      durationDays: 1,
      notes: "Laporan memuat kronologi, hasil penawaran mulanya, dan hasil negosiasi final.",
      regulatorySource: "Pasal 50 Perpres 12/2021"
    },
    {
      title: "Penandatanganan SPK / Bukti Pembelian",
      description: "PPK menerbitkan Surat Perintah Kerja (SPK) untuk nilai di atas Rp 50 Juta s.d Rp 200 Juta, atau kuitansi untuk di bawah Rp 50 Juta.",
      durationDays: 2,
      notes: "Isi SPK harus menyebut hak kewajiban, jangka waktu pengiriman, jaminan (bila ada).",
      regulatorySource: "Bentuk Kontrak PBJP"
    },
    {
      title: "Serah Terima Hasil Pekerjaan (BAST)",
      description: "Serah terima barang/jasa didokumentasikan dengan Berita Acara Serah Terima (BAST). Pembayaran diproses.",
      durationDays: 2,
      notes: "Periksa kembali kuantitas dan kualitas barang sebelum menandatangani BAST.",
      regulatorySource: "Pasal 57 Perpres 12/2021"
    }
  ],
  e_purchasing: [
    {
      title: "Perencanaan E-Purchasing",
      description: "PPK memeriksa ketersediaan barang/jasa sesuai spesifikasi teknis di portal E-Katalog LKPP.",
      durationDays: 1,
      notes: "Pastikan penyedia di dalam katalog memiliki status aktif dan produk tayang resmi.",
      regulatorySource: "Instruksi Presiden 2/2022"
    },
    {
      title: "Analisis Harga Banding & Negosiasi",
      description: "PPK melakukan mini-kompetisi atau negosiasi harga, ongkos kirim, jasa instalasi langsung di dalam sistem e-purchasing.",
      durationDays: 2,
      notes: "Negosiasi ditekankan pada jumlah pembelian volume silang.",
      regulatorySource: "Pasal 38 Ayat 2 Perpres 12/2021"
    },
    {
      title: "Pernyataan Komitmen & Pembuatan Pesanan (Cart)",
      description: "PPK menyetujui transaksi, menunjuk penyedia, dan mengeluarkan detail Surat Pesanan dari sistem.",
      durationDays: 1,
      notes: "Surat Pesanan yang diunduh dari katalog mengikat secara hukum sebagai kontrak.",
      regulatorySource: "Sistem Katalog LKPP"
    },
    {
      title: "Pelaksanaan Pekerjaan & Pengiriman",
      description: "Penyedia mengirimkan barang/jasa sesuai detail lokasi dan waktu dalam pesanan e-purchasing.",
      durationDays: 5,
      notes: "Penyedia wajib melampirkan resi, jaminan garansi resmi distributor.",
      regulatorySource: "Ketentuan Kontrak e-Purchasing"
    },
    {
      title: "Verifikasi Fisik & BAST E-Purchasing",
      description: "Panitia/Pejabat Penerima Hasil Pekerjaan melakukan tes fungsi (UAT) dan menandatangani Berita Acara Serah Terima (BAST) untuk pembayaran.",
      durationDays: 2,
      notes: "Catat nomor e-purchasing di dalam berkas SPJ pembayaran purna anggaran.",
      regulatorySource: "Pasal 57 Perpres 12/2021"
    }
  ],
  tender: [
    {
      title: "Penyusunan Dokumen Persiapan Tender",
      description: "PPK menetapkan Dokumen Spesifikasi, KAK, HPS, Rancangan Kontrak, dan dokumen kualifikasi penyedia.",
      durationDays: 3,
      notes: "PPK kemudian melimpahkan penugasan pengadaan ke Pokja Pemilihan (UKPBJ).",
      regulatorySource: "Pasal 25 Perpres 12/2021"
    },
    {
      title: "Pengumuman Tender di LPSE",
      description: "Pokja Pemilihan mengumumkan paket pekerjaan di sistem SPSE nasional agar dapat diakses publik.",
      durationDays: 5,
      notes: "Penyedia bersertifikat SPSE dapat mengunduh Dokumen Pemilihan.",
      regulatorySource: "Pengumuman Tender LKPP"
    },
    {
      title: "Pemberian Penjelasan (Aanwijzing)",
      description: "Pertemuan online/forum chat di website LPSE untuk menjawab ketidakjelasan spek atau draf kontrak dari penyedia.",
      durationDays: 1,
      notes: "Berita Acara Pemberian Penjelasan (BAPP) diterbitkan usai sesi.",
      regulatorySource: "Aanwijzing SPSE"
    },
    {
      title: "Pemasukan & Pembukaan Dokumen Penawaran",
      description: "Penyedia mengunggah dokumen administrasi, teknis, dan penawaran harga secara terenkripsi ke portal SPSE.",
      durationDays: 4,
      notes: "Terlambat mengirimkan penawaran 1 detik pun akan langsung dianulir sistem.",
      regulatorySource: "Pasal 42 Perpres 12/2021"
    },
    {
      title: "Evaluasi Penawaran (Admin, Teknis, Harga)",
      description: "Pokja mengevaluasi berkas kualifikasi, metode teknis, ketersediaan alat, kelayakan harga, dan klarifikasi harga timpang.",
      durationDays: 5,
      notes: "Wajib melakukan evaluasi kewajaran harga apabila harga di bawah 80% dari total HPS.",
      regulatorySource: "Evaluasi Pokja Pemilihan"
    },
    {
      title: "Klarifikasi dan Pembuktian Kualifikasi",
      description: "Pokja mengundang calon pemenang untuk memperlihatkan dokumen asli (SITU, SIUP/NIB, Ijazah Personil, Invoice alat).",
      durationDays: 2,
      notes: "Klarifikasi langsung untuk validasi fisik agar menghindari penyedia fiktif.",
      regulatorySource: "Pembuktian Kualifikasi LKPP"
    },
    {
      title: "Pengumuman Pemenang & Masa Sanggah",
      description: "Pokja mengumumkan pemenang tender di LPSE. Masa sanggah dibuka selama 5 hari kerja bagi penyedia lain yang keberatan.",
      durationDays: 5,
      notes: "Bila sanggahan terbukti benar, proses penyerahan dievaluasi ulang atau tender batal.",
      regulatorySource: "Pasal 51 Perpres 12/2021"
    },
    {
      title: "Penerbitan SPPBJ oleh PPK",
      description: "Setelah masa sanggah selesai tanpa kendala, PPK menerbitkan Surat Penunjukan Penyedia Barang/Jasa (SPPBJ).",
      durationDays: 2,
      notes: "Penyedia terpilih wajib menyerahkan Jaminan Pelaksanaan sebelum kontrak diteken.",
      regulatorySource: "Penerbitan SPPBJ"
    },
    {
      title: "Penandatanganan Kontrak Pokok",
      description: "Sesi penandatanganan kesepakatan kontrak antara PPK dan Direktur Penyedia dengan materai.",
      durationDays: 3,
      notes: "Wajib disusul dengan SPMK (Surat Perintah Mulai Kerja) untuk tanda start pengerjaan.",
      regulatorySource: "Pasal 52 Perpres 12/2021"
    }
  ],
  direct_appointment: [
    {
      title: "Pembuatan Nota Dinas Justifikasi",
      description: "PPK menyusun berkas alasan teknis mengapa pengadaan harus dilakukan dengan metode penunjukan langsung.",
      durationDays: 2,
      notes: "Hanya sah untuk keadaan darurat, hak paten eksklusif, sewa gedung spesifik, atau penyedia tunggal terdaftar resmi.",
      regulatorySource: "Pasal 38 Ayat 4 Perpres 12/2021"
    },
    {
      title: "Permintaan Penawaran Terhadap Target Penyedia",
      description: "Pejabat Pengadaan melayangkan surat resmi langsung kepada 1 penyedia tertentu beserta spesifikasi/KAK.",
      durationDays: 1,
      notes: "Hanya melibatkan 1 rekanan utama.",
      regulatorySource: "Metode Penunjukan Langsung"
    },
    {
      title: "Evaluasi, Klarifikasi, Teknis & Negosiasi Harga",
      description: "Evaluasi menyeluruh terhadap kualifikasi penyedia tunggal tersebut dan negosiasi harga agar harga tetap wajar di bawah HPS.",
      durationDays: 2,
      notes: "Negosiasi tetap mutlak diperlukan demi akuntabilitas pemeriksa keuangan.",
      regulatorySource: "Negosiasi Kontrak Penunjukan"
    },
    {
      title: "Penandatanganan Kontrak / Perjanjian Kerjasama",
      description: "Penandatanganan Kontrak Penunjukan Langsung dan surat penugasan terkait.",
      durationDays: 2,
      notes: "Sebutkan klausul garansi dan pemeliharaan secara detail.",
      regulatorySource: "Dokumen Kontrak Darurat/Penunjukan"
    }
  ]
};

export default function App() {
  // Tabs: 'workflow' | 'calculator' | 'draft-assistant' | 'consultation'
  const [activeTab, setActiveTab] = useState<"workflow" | "calculator" | "draft-assistant" | "consultation">("workflow");

  // State 1: Active workflow selection
  const [procMethod, setProcMethod] = useState<ProcurementMethod>("direct_proc");
  const [startDate, setStartDate] = useState<string>("2026-06-08"); // default start date is next day
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);

  // Load preset steps on startup or method change
  useEffect(() => {
    const list: WorkflowStep[] = PRESET_STEPS[procMethod].map((step, idx) => ({
      ...step,
      id: `${procMethod}_step_${idx + 1}`,
      completed: false
    }));
    setWorkflowSteps(list);
    setSelectedStep(list[0]);
  }, [procMethod]);

  // Recalculate helper for date completion target
  const getStepTargetDate = (stepIndex: number): string => {
    if (!startDate) return "-";
    const startObj = new Date(startDate);
    let cumulativeDays = 0;
    for (let i = 0; i <= stepIndex; i++) {
      cumulativeDays += workflowSteps[i]?.durationDays || 0;
    }
    startObj.setDate(startObj.getDate() + cumulativeDays);
    return startObj.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getWorkflowTotalDays = (): number => {
    return workflowSteps.reduce((sum, s) => sum + s.durationDays, 0);
  };

  const getWorkflowCompletedCount = (): number => {
    return workflowSteps.filter(s => s.completed).length;
  };

  // Toggle step completion status
  const toggleStepCompleted = (id: string) => {
    setWorkflowSteps(prev =>
      prev.map(step => (step.id === id ? { ...step, completed: !step.completed } : step))
    );
  };

  // State 2: Calculator (RAB / HPS Ledger)
  const [hpsList, setHpsList] = useState<HPSItem[]>([
    {
      id: "item-1",
      name: "PC All-in-One Core i5 RAM 8GB SSD 256GB (E-Katalog Standard)",
      quantity: 5,
      unit: "Unit",
      pricePerUnit: 12500000,
      ppnPercent: 11,
      pphType: "pph22"
    },
    {
      id: "item-2",
      name: "Jasa Instalasi Jaringan LAN & Konfigurasi Server Kantor",
      quantity: 1,
      unit: "Paket",
      pricePerUnit: 18000000,
      ppnPercent: 11,
      pphType: "pph23"
    },
    {
      id: "item-3",
      name: "Printer Laser Multi-function (Scan, Copy, Print)",
      quantity: 3,
      unit: "Unit",
      pricePerUnit: 4500000,
      ppnPercent: 11,
      pphType: "pph22"
    }
  ]);

  // Form input for HPS Item
  const [newHpsName, setNewHpsName] = useState<string>("");
  const [newHpsQty, setNewHpsQty] = useState<number>(1);
  const [newHpsUnit, setNewHpsUnit] = useState<string>("Unit");
  const [newHpsPrice, setNewHpsPrice] = useState<number>(0);
  const [newHpsPpn, setNewHpsPpn] = useState<number>(11);
  const [newHpsPph, setNewHpsPph] = useState<"none" | "pph22" | "pph23">("none");

  // HPS Calculations
  const calculateTotals = () => {
    let subtotalHargaKotor = 0; // DPP
    let totalPpn = 0;
    let totalPph22 = 0; // 1.5%
    let totalPph23 = 0; // 2%
    let totalHps = 0; // include PPN in Indonesia

    hpsList.forEach(item => {
      const lineCost = item.quantity * item.pricePerUnit;
      subtotalHargaKotor += lineCost;

      const ppnAmount = (lineCost * item.ppnPercent) / 100;
      totalPpn += ppnAmount;

      if (item.pphType === "pph22") {
        totalPph22 += lineCost * 0.015;
      } else if (item.pphType === "pph23") {
        totalPph23 += lineCost * 0.02;
      }

      totalHps += lineCost + ppnAmount;
    });

    return {
      subtotalHargaKotor,
      totalPpn,
      totalPph22,
      totalPph23,
      totalPph: totalPph22 + totalPph23,
      totalHps,
      netSupplierOutput: subtotalHargaKotor - (totalPph22 + totalPph23), // Supplier net before their own tax declaration
    };
  };

  const addHpsItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHpsName.trim() || newHpsQty <= 0 || newHpsPrice <= 0) return;

    const item: HPSItem = {
      id: `item-${Date.now()}`,
      name: newHpsName,
      quantity: newHpsQty,
      unit: newHpsUnit,
      pricePerUnit: newHpsPrice,
      ppnPercent: newHpsPpn,
      pphType: newHpsPph,
    };

    setHpsList(prev => [...prev, item]);
    // Reset Form
    setNewHpsName("");
    setNewHpsQty(1);
    setNewHpsUnit("Unit");
    setNewHpsPrice(0);
    setNewHpsPpn(11);
    setNewHpsPph("none");
  };

  const deleteHpsItem = (id: string) => {
    setHpsList(prev => prev.filter(item => item.id !== id));
  };


  // State 3: Draft Document Assistant (Gemini powered)
  const [docType, setDocType] = useState<"spek_teknis" | "kak" | "klausul_kontrak" | "kriteria_evaluasi">("spek_teknis");
  const [packageName, setPackageName] = useState<string>("Pengadaan Alat Digital Smart Kantor Camat");
  const [budget, setBudget] = useState<number>(145000000);
  const [procCategory, setProcCategory] = useState<ProcurementCategory>("goods");
  const [description, setDescription] = useState<string>("Pengadaan 8 unit komputer desktop spek administrasi, 2 unit printer wireless laser, 1 unit router handal, dan jasa setup jaringan internet LAN area kantor.");
  const [additionalNotes, setAdditionalNotes] = useState<string>("Diwajibkan produk memiliki TKDN minimal 35%, pelayanan perbaikan garansi langsung di tempat (on-site) selama 12 bulan.");
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDraft, setGeneratedDraft] = useState<string>("");
  const [generationFeedback, setGenerationFeedback] = useState<string>("");

  // Loading indicator words
  const loadingPhrases = [
    "Membuka Dokumen Referensi LKPP ...",
    "Menganalisis Kategori Pekerjaan ...",
    "Merumuskan Latar Belakang & Dasar Hukum Pemerintahan ...",
    "Menyusun Spesifikasi Teknis/Ketentuan Standardisasi SNI/TKDN ...",
    "Mengharmonisasikan Klausul Kontrak Akuntabel ...",
    "Membuat Draf Final Dokumen Pengadaan Rasional ...",
  ];

  const generateDocumentDraft = async () => {
    setIsGenerating(true);
    setGeneratedDraft("");
    let phraseIdx = 0;
    setGenerationFeedback(loadingPhrases[0]);

    // Interval to rotate loading notes
    const interval = setInterval(() => {
      phraseIdx = (phraseIdx + 1) % loadingPhrases.length;
      setGenerationFeedback(loadingPhrases[phraseIdx]);
    }, 2800);

    try {
      const response = await fetch("/api/generate-procurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docType,
          payload: {
            packageName,
            budget,
            procType: procCategory,
            description,
            additionalNotes,
          },
        }),
      });

      const data = await response.json();
      if (response.ok && data.result) {
        setGeneratedDraft(data.result);
      } else {
        setGeneratedDraft(`### Gagal Menghasilkan Dokumen\n\nError: ${data.error || "Server tidak merespons dengan benar."}`);
      }
    } catch (error: any) {
      console.error(error);
      setGeneratedDraft(`### Gagal Menghubungkan ke Server\n\nHarap periksa jaringan Anda atau konfigurasi GEMINI_API_KEY. Detail: ${error.message}`);
    } finally {
      clearInterval(interval);
      setIsGenerating(false);
      setGenerationFeedback("");
    }
  };


  // State 4: Advisory Chat (Gemini powered)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Halo! Saya adalah **Asisten Regulasi PBJP Cerdas**. Saya dirancang khusus untuk mempermudah tugas Anda sebagai Pejabat Pengadaan (PP) atau Pejabat Pembuat Komitmen (PPK).\n\nAda kendala apa hari ini terkait pengadaan barang/jasa pemerintah? Anda bisa menanyakan kepada saya tentang aturan metode pemilihan, denda keterlambatan kontrak, penanganan gagal tender, jaminan perbankan, Swakelola, atau cara aman lolos audit akuntabilitas keuangan negara.",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [userInput, setUserInput] = useState<string>("");
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);

  // Quick Questions handlers
  const quickQuestions = [
    "Bagaimana bila penawar hanya satu dalam Pengadaan Langsung?",
    "Bagaimana aturan denda keterlambatan kontrak milsetone?",
    "Swakelola Tipe IV: Siapa saja yang bisa ditunjuk?",
    "Cara menghadapi Sanggahan dari Penyedia yang kalah?",
    "Apa itu e-Purchasing Mini Kompetisi di Katalog?"
  ];

  const handleQuickQuestionClick = (question: string) => {
    setUserInput(question);
  };

  const sendChatMessage = async (overrideText?: string) => {
    const textToSend = overrideText || userInput;
    if (!textToSend.trim() || isSendingChat) return;

    const userMessageObj: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages(prev => [...prev, userMessageObj]);
    if (!overrideText) setUserInput("");
    setIsSendingChat(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMessageObj].map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      const data = await response.json();
      if (response.ok && data.reply) {
        setChatMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}-bot`,
            role: "assistant",
            content: data.reply,
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        setChatMessages(prev => [
          ...prev,
          {
            id: `msg-${Date.now()}-bot`,
            role: "assistant",
            content: `Maaf, saya berkendala menghubungi server. Harap pastikan kunci API tersemat dengan baik di akun Anda. Error: ${data.error || "Gagal merespons."}`,
            timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (e: any) {
      console.error(e);
      setChatMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-bot`,
          role: "assistant",
          content: `Terjadi kesalahan jaringan atau server tidak aktif. Detail: ${e.message}`,
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Draf disalin ke papan klip!");
  };

  const copyHpsAsTableText = () => {
    const totals = calculateTotals();
    let text = "--- DAFTAR RINCIAN HARGA PERKIRAAN SENDIRI (HPS) ---\n\n";
    text += `Nama Paket: ${packageName}\nTanggal Cetak: ${new Date().toLocaleDateString("id-ID")}\n\n`;
    text += "No.\tNama Pekerjaan / Barang\tVol\tSat.\tHarga Satuan (Rp)\tPPN (%)\tJumlah (Rp)\n";

    hpsList.forEach((item, idx) => {
      const lineCost = item.quantity * item.pricePerUnit;
      text += `${idx + 1}.\t${item.name}\t${item.quantity}\t${item.unit}\tRp ${item.pricePerUnit.toLocaleString("id-ID")}\t${item.ppnPercent}%\tRp ${lineCost.toLocaleString("id-ID")}\n`;
    });

    text += "\n----------------------------------------------------\n";
    text += `Dasar Pengenaan Pajak (DPP): Rp ${totals.subtotalHargaKotor.toLocaleString("id-ID")}\n`;
    text += `Nilai PPN (PPJP): Rp ${totals.totalPpn.toLocaleString("id-ID")}\n`;
    text += `Estimasi Jatah PPh Negara (Potongan): Rp ${totals.totalPph.toLocaleString("id-ID")}\n`;
    text += `TOTAL NILAI HPS (Termasuk PPN): Rp ${totals.totalHps.toLocaleString("id-ID")}\n`;
    text += "----------------------------------------------------\n\nKet: Dokumen ini dirancang sah menggunakan Pemroses HPS Sipengadaan.";

    copyToClipboard(text);
  };

  // Switch generated draft directly to Chat adjustment
  const handleLoadDraftToChat = () => {
    if (!generatedDraft) return;
    setActiveTab("consultation");
    const query = `Saya memiliki draf dokumen ${docType.toUpperCase()} sebagai berikut:\n\n${generatedDraft.slice(0, 1500)}...\n\nMohon tinjau draf ini dari sisi kepatuhan Perpres 12/2021 dan berikan rekomendasi penyempurnaannya!`;
    setUserInput(query);
  };

  const summaryCalculations = calculateTotals();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Upper Navigation / Decorative Banner */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-xs">
              <FileCheck className="h-6 w-6" id="app-logo-icon" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Sipengadaan
              </h1>
              <span className="text-xs text-slate-500 font-medium">
                Asisten & Template Pengadaan Barang/Jasa Pemerintah (PBJP)
              </span>
            </div>
          </div>

          {/* LKPP standard status tag */}
          <div className="hidden md:flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-800">
              Acuan Perpres 12 Tahun 2021 & Perlem LKPP
            </span>
          </div>
        </div>
      </header>

      {/* Hero Header Area */}
      <section className="bg-indigo-900 text-white py-10 px-4 shadow-inner relative overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.2),transparent_60%)]"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
              <Sparkles className="h-3 w-3" /> Solusi Kendala PPK & Pejabat Pengadaan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Permudah Proses Pengadaan Barang/Jasa Anda
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base leading-relaxed">
              Didesain khusus untuk menghilangkan kekhawatiran salah prosedur, salah hitung denda pajak, rincian rancangan HPS/RAB yang tidak konsisten, maupun kesulitan penyusunan draf KAK/Spesifikasi Teknis.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 bg-indigo-950/40 p-2 rounded-2xl border border-indigo-700/30">
            <button
              onClick={() => setActiveTab("workflow")}
              id="tab-btn-workflow"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "workflow"
                  ? "bg-white text-indigo-900 shadow-sm"
                  : "text-indigo-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <ListTodo className="h-4 w-4" /> Alur & Checklist
            </button>
            <button
              onClick={() => setActiveTab("calculator")}
              id="tab-btn-calculator"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "calculator"
                  ? "bg-white text-indigo-900 shadow-sm"
                  : "text-indigo-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calculator className="h-4 w-4" /> Kalkulator HPS
            </button>
            <button
              onClick={() => setActiveTab("draft-assistant")}
              id="tab-btn-draft-assistant"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "draft-assistant"
                  ? "bg-white text-indigo-900 shadow-sm"
                  : "text-indigo-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileText className="h-4 w-4" /> Generator Draft AI
            </button>
            <button
              onClick={() => setActiveTab("consultation")}
              id="tab-btn-consultation"
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === "consultation"
                  ? "bg-white text-indigo-900 shadow-sm"
                  : "text-indigo-200 hover:text-white hover:bg-white/5"
              }`}
            >
              <MessageSquare className="h-4 w-4" /> Ruang Konsultasi AI
              <span className="absolute -top-1 -right-1 bg-rose-500 h-2 w-2 rounded-full ring-2 ring-indigo-900"></span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Body Grid */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-8 md:grid md:grid-cols-4 items-start">
        {/* Left Side: Handy Regulation Reference Box */}
        <aside className="w-full md:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-indigo-600" /> Saku Regulasi Pengadaan
            </h3>
            <div className="space-y-4">
              {REGULATION_POCKET_GUIDE.map((pocket, idx) => (
                <div key={idx} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                  <h4 className="text-xs font-bold text-slate-800 mb-1 flex justify-between items-center">
                    <span>{pocket.title}</span>
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed mb-1.5">{pocket.desc}</p>
                  <span className="inline-block px-2 py-0.5 bg-slate-100 text-[10px] text-slate-500 font-mono rounded">
                    {pocket.ref}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
              <p className="text-xs text-indigo-900 leading-normal font-medium flex items-start gap-1.5">
                <AlertCircle className="h-4 w-4 text-indigo-600 shrink-0" />
                Ingin konsultansi isu khusus? Gunakan <strong>Tab Ruang Konsultasi AI</strong> untuk bimbingan regulasi instan.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h4 className="text-xs font-bold tracking-wider text-slate-300 uppercase">Status Akreditasi PPKBJ</h4>
            </div>
            <p className="text-xs text-slate-400">
              Aplikasi ini membantu menyiapkan kelayakan dokumen sesuai standar Audit BPK & Inspektorat Daerah/Nasional.
            </p>
            <div className="text-[11px] font-mono bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-300">
              <div>Inspeksi: Perpres 12/2021</div>
              <div>Standardisasi: LKPP V.42</div>
              <div>PPK-Officer: {new Date().toLocaleDateString("id-ID")}</div>
            </div>
          </div>
        </aside>

        {/* Center / Right Content Box */}
        <section className="w-full md:col-span-3 flex flex-col gap-6" id="content-display-section">
          
          {/* TAB 1: WORKFLOW CHECKLIST */}
          {activeTab === "workflow" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Skenario & Checklist Prosedur Pemilihan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilih skenario metode pengadaan untuk merancang jadwal pengerjaan proyek dari awal hingga tanda tangan kontrak.
                  </p>
                </div>
                {/* Method selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="text-xs font-bold text-slate-700 hidden sm:inline" htmlFor="method-select-box">Metode:</label>
                  <select
                    id="method-select-box"
                    value={procMethod}
                    onChange={(e) => setProcMethod(e.target.value as ProcurementMethod)}
                    className="text-xs font-semibold bg-white border border-slate-300 px-3 py-1.5 rounded-lg text-slate-800"
                  >
                    <option value="direct_proc">Pengadaan Langsung (≤ Rp 200Jt)</option>
                    <option value="e_purchasing">E-Purchasing (E-Katalog)</option>
                    <option value="tender">TENDER (Umum/Cepat &gt; Rp 200Jt)</option>
                    <option value="direct_appointment">Penunjukan Langsung (Spesifik/Darurat)</option>
                  </select>
                </div>
              </div>

              {/* Configure Start Date Tracker */}
              <div className="p-5 bg-indigo-50/35 border-b border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-indigo-600 shrink-0" />
                  <div>
                    <label className="block text-xs font-bold text-indigo-950">Atur Tanggal Mulai Pengadaan</label>
                    <p className="text-[11px] text-indigo-800">Kami akan menyusun sebaran tanggal target rampung logis.</p>
                  </div>
                </div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border border-indigo-200 rounded-lg text-xs font-semibold px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 text-slate-800"
                />
              </div>

              {/* Progress Summary bar */}
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 font-medium">Jadwal Progres Tahapan:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-indigo-700">{getWorkflowCompletedCount()}</span>
                    <span className="text-xs text-slate-400">dari</span>
                    <span className="text-sm font-bold text-slate-800">{workflowSteps.length}</span>
                    <span className="text-xs text-slate-500">tahap selesai</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="block text-[11px] text-slate-400 font-semibold uppercase">Estimasi Waktu</span>
                    <span className="text-xs font-bold text-slate-700">{getWorkflowTotalDays()} Hari Kerja</span>
                  </div>
                  {/* Circle progress bar */}
                  <div className="h-9 w-9 rounded-full border-4 border-slate-200 flex items-center justify-center relative overflow-hidden">
                    <span className="text-xs font-bold text-indigo-600">
                      {Math.round((getWorkflowCompletedCount() / workflowSteps.length) * 100) || 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Two Panel Layout: List & Selection detail */}
              <div className="grid grid-cols-1 lg:grid-cols-5 flex-1 min-h-[400px]">
                {/* Scrollable list of steps (Left) */}
                <div className="lg:col-span-3 border-r border-slate-200 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                  {workflowSteps.map((step, idx) => {
                    const isSelected = selectedStep?.id === step.id;
                    return (
                      <div
                        key={step.id}
                        onClick={() => setSelectedStep(step)}
                        id={`workflow-step-row-${step.id}`}
                        className={`p-4 cursor-pointer transition-colors flex items-start gap-3 relative ${
                          isSelected ? "bg-indigo-50/50" : "hover:bg-slate-50/50"
                        }`}
                      >
                        {/* Selector marker */}
                        {isSelected && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
                        )}

                        {/* Interactive checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStepCompleted(step.id);
                          }}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
                            step.completed
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-slate-300 hover:border-indigo-400"
                          }`}
                        >
                          {step.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 font-mono">Tahap {idx + 1}</span>
                            <span className="inline-block px-1.5 py-0.5 bg-slate-100 text-[9px] text-slate-500 font-bold rounded">
                              {step.durationDays} h
                            </span>
                          </div>
                          <h4 className={`text-xs font-bold ${step.completed ? "text-slate-400 line-through font-medium" : "text-slate-800"}`}>
                            {step.title}
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-indigo-800 font-semibold">
                            <Clock className="h-3 w-3" />
                            Target: {getStepTargetDate(idx)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Step Technical Guidance Detail (Right) */}
                <div className="lg:col-span-2 p-5 bg-slate-50/40 flex flex-col justify-between">
                  {selectedStep ? (
                    <div className="space-y-4">
                      <div>
                        <span className="inline-block px-2.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded-sm mb-2">
                          Detail Regulasi Operasional
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{selectedStep.title}</h4>
                        <div className="text-xs mt-1.5 flex items-center gap-1.5 bg-indigo-50/60 text-indigo-950 px-2.5 py-1 rounded border border-indigo-100 font-mono">
                          <span className="font-bold">Rujukan:</span>
                          <span>{selectedStep.regulatorySource}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Deskripsi Tugas</label>
                        <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                          {selectedStep.description}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Poin Mitigasi / Kendala PP</label>
                        <div className="text-xs text-slate-600 leading-relaxed bg-slate-100 p-3 rounded-xl border border-slate-200 italic">
                          "{selectedStep.notes}"
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                      <ListTodo className="h-10 w-10 text-slate-300 stroke-1 mb-2" />
                      <p className="text-xs">Pilih salah satu tahap alur di samping untuk meninjau detail panduan hukum dan tugas operasional.</p>
                    </div>
                  )}

                  <div className="border-t border-slate-200 mt-6 pt-4 space-y-2">
                    <p className="text-[10px] text-slate-400 italic leading-snug">
                      Catatan: Skenario ini didasarkan pada tata alur standar LKPP. Aturan daerah (DPA/Dinas) mungkin memberlakukan berkas verifikasi tambahan di luar sistem SPSE.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* TAB 2: CALCULATOR (HPS & TAX) */}
          {activeTab === "calculator" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col gap-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-indigo-600" /> Kalkulator HPS & Potongan Pajak PBJP
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Hitung secara cermat Dasar Pengenaan Pajak (DPP), Pajak Pertambahan Nilai (PPN 11%), estimasi PPh 22/23. Semua total siap disalin langsung ke lampiran dokumen HPS atau rancangan kontrak Anda.
                </p>
              </div>

              {/* Add Item Form */}
              <form onSubmit={addHpsItem} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5 space-y-1.5">
                  <label htmlFor="comp-item-name" className="text-xs font-bold text-slate-700 block">Nama Barang / Deskripsi Jasa</label>
                  <input
                    type="text"
                    id="comp-item-name"
                    required
                    placeholder="Contoh: Pengadaan Meja Kerja Kayu Jati Solid"
                    value={newHpsName}
                    onChange={(e) => setNewHpsName(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label htmlFor="comp-item-qty" className="text-xs font-bold text-slate-700 block">Volume</label>
                  <input
                    type="number"
                    id="comp-item-qty"
                    required
                    min={1}
                    value={newHpsQty}
                    onChange={(e) => setNewHpsQty(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label htmlFor="comp-item-unit" className="text-xs font-bold text-slate-700 block">Satuan</label>
                  <input
                    type="text"
                    id="comp-item-unit"
                    required
                    placeholder="Unit / Paket"
                    value={newHpsUnit}
                    onChange={(e) => setNewHpsUnit(e.target.value)}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                <div className="md:col-span-3 space-y-1.5">
                  <label htmlFor="comp-item-price" className="text-xs font-bold text-slate-700 block">Harga Satuan (Rp)</label>
                  <input
                    type="number"
                    id="comp-item-price"
                    required
                    placeholder="Harga Satuan"
                    value={newHpsPrice || ""}
                    onChange={(e) => setNewHpsPrice(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                  />
                </div>

                {/* Sub row options: Pajak set */}
                <div className="md:col-span-4 space-y-1.5">
                  <label htmlFor="comp-item-ppn" className="text-xs font-bold text-slate-700 block">PPN (Pajak Pertambahan Nilai)</label>
                  <select
                    id="comp-item-ppn"
                    value={newHpsPpn}
                    onChange={(e) => setNewHpsPpn(Number(e.target.value))}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                  >
                    <option value={11}>PPN 11% (Tarif Standard LKPP)</option>
                    <option value={12}>PPN 12% (Tarif Mendatang)</option>
                    <option value={0}>PPN 0% (Non-PPN / Dibebaskan)</option>
                  </select>
                </div>

                <div className="md:col-span-5 space-y-1.5">
                  <label htmlFor="comp-item-pph" className="text-xs font-bold text-slate-700 block">PPh Potongan (Pajak Penghasilan)</label>
                  <select
                    id="comp-item-pph"
                    value={newHpsPph}
                    onChange={(e) => setNewHpsPph(e.target.value as "none" | "pph22" | "pph23")}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                  >
                    <option value="none">Tanpa Potongan PPh</option>
                    <option value="pph22">PPh Pasal 22 (1.5% - Pengadaan Barang Utama)</option>
                    <option value="pph23">PPh Pasal 23 (2.0% - Jasa / Sewa / Instalasi)</option>
                  </select>
                </div>

                <div className="md:col-span-3 flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Masukkan Item
                  </button>
                </div>
              </form>

              {/* HPS Items List Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4 text-center w-12">No.</th>
                        <th className="py-3 px-4">Deskripsi Item</th>
                        <th className="py-3 px-4 text-center">Volume</th>
                        <th className="py-3 px-4 text-right">Harga Satuan (Rp)</th>
                        <th className="py-3 px-4 text-center">PPN / PPh</th>
                        <th className="py-3 px-4 text-right">Harga Kotor (Rp)</th>
                        <th className="py-3 px-4 text-center w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {hpsList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-slate-400">
                            RAB Anda masih kosong. Masukkan item di atas untuk merancang HPS.
                          </td>
                        </tr>
                      ) : (
                        hpsList.map((item, idx) => {
                          const lineCost = item.quantity * item.pricePerUnit;
                          return (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                              <td className="py-3 px-4 text-center font-mono text-slate-400">{idx + 1}</td>
                              <td className="py-3 px-4 font-medium text-slate-900">{item.name}</td>
                              <td className="py-3 px-4 text-center font-semibold bg-indigo-50/20">
                                {item.quantity} <span className="text-slate-400 font-normal">{item.unit}</span>
                              </td>
                              <td className="py-3 px-4 text-right font-mono">
                                {item.pricePerUnit.toLocaleString("id-ID")}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="space-y-0.5">
                                  <span className="inline-block px-1.5 py-0.5 bg-sky-50 text-sky-700 rounded text-[9px] font-bold">
                                    PPN {item.ppnPercent}%
                                  </span>
                                  {item.pphType !== "none" && (
                                    <span className="block text-[9px] font-mono text-amber-600 font-semibold text-center">
                                      {item.pphType === "pph22" ? "PPh-22 (1.5%)" : "PPh-23 (2%)"}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                                {lineCost.toLocaleString("id-ID")}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => deleteHpsItem(item.id)}
                                  className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Calculations Ledger */}
              {hpsList.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                  <div className="md:col-span-7 bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Ringkasan Pembayaran & Kewajiban Perpajakan
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Di dalam aturan LKPP, nilai HPS yang dipakai di tender/SPK wajib menampung komponen PPN. Sementara potongan PPh adalah pemotongan langsung oleh Bendahara Satker pasca pekerjaan berstatus selesai.
                      </p>
                    </div>

                    <div className="border-t border-slate-200 mt-4 pt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={copyHpsAsTableText}
                        className="bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" /> Salin Rincian Teks HPS
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-5 bg-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-indigo-800 space-y-4">
                    <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Total Pagu Realisasi RAB</h4>
                    
                    <div className="space-y-2.5 divide-y divide-indigo-800/60 text-xs">
                      <div className="flex justify-between py-1.5">
                        <span className="text-indigo-200">Dasar Pengenaan (Kotor) :</span>
                        <span className="font-mono font-bold">Rp {summaryCalculations.subtotalHargaKotor.toLocaleString("id-ID")}</span>
                      </div>
                      
                      <div className="flex justify-between py-1.5">
                        <span className="text-indigo-200">PPN (Diakumulasi) :</span>
                        <span className="font-mono font-bold">Rp {summaryCalculations.totalPpn.toLocaleString("id-ID")}</span>
                      </div>

                      <div className="flex justify-between py-1.5">
                        <span className="text-indigo-200">Total Potongan PPh (Fiskal) :</span>
                        <span className="font-mono font-bold text-amber-300">Rp {summaryCalculations.totalPph.toLocaleString("id-ID")}</span>
                      </div>

                      <div className="flex justify-between py-2 text-sm font-extrabold border-t border-indigo-700 text-emerald-300">
                        <span>TOTAL NILAI HPS :</span>
                        <span className="font-mono">Rp {summaryCalculations.totalHps.toLocaleString("id-ID")}</span>
                      </div>
                    </div>

                    <div className="bg-indigo-900/40 p-2.5 rounded-lg border border-indigo-800 text-[10px] text-indigo-200 leading-normal">
                      PPN: Pajak Pertambahan Nilai dianggarkan di dalam HPS. PPh: Dipotong bends dari termin pembayaran penyedia seiring regulasi pajak terbaru.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* TAB 3: DRAFT GENERATOR AI */}
          {activeTab === "draft-assistant" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col gap-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" /> Generator Dokumen Pengadaan Cerdas
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Asisten AI kami akan menyusun draf dokumen teknis resmi LKPP yang matang. Cukup tentukan isian dasar paket pekerjaan Anda, pilih tipe draf dokumen yang ingin diunduh, lalu tekan tombol ramifikasi draf.
                </p>
              </div>

              {/* Form and Input Parameter */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Left Inputs (Col 1-5) */}
                <div className="md:col-span-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">Pilih Dokumen yang Diperlukan</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDocType("spek_teknis")}
                        className={`text-xs p-2.5 rounded-xl border font-semibold text-left transition-all ${
                          docType === "spek_teknis"
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        Spesifikasi Teknis
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocType("kak")}
                        className={`text-xs p-2.5 rounded-xl border font-semibold text-left transition-all ${
                          docType === "kak"
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        Acuan Kerja KAK (TOR)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocType("klausul_kontrak")}
                        className={`text-xs p-2.5 rounded-xl border font-semibold text-left transition-all ${
                          docType === "klausul_kontrak"
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        Klausul Utama SSKK
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocType("kriteria_evaluasi")}
                        className={`text-xs p-2.5 rounded-xl border font-semibold text-left transition-all ${
                          docType === "kriteria_evaluasi"
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-xs"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        Kriteria & Lembar Evaluasi
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="comp-input-packname" className="text-xs font-bold text-slate-700 block">Nama Paket Pekerjaan</label>
                    <input
                      type="text"
                      id="comp-input-packname"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      placeholder="Masukkan nama paket pengadaan"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="comp-input-budget" className="text-xs font-bold text-slate-700 block">Pagu Anggaran (Rp)</label>
                      <input
                        type="number"
                        id="comp-input-budget"
                        value={budget || ""}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        placeholder="Rp"
                        className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="comp-input-proctype" className="text-xs font-bold text-slate-700 block">Jenis Kategori PBJ</label>
                      <select
                        id="comp-input-proctype"
                        value={procCategory}
                        onChange={(e) => setProcCategory(e.target.value as ProcurementCategory)}
                        className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800"
                      >
                        <option value="goods">Pengadaan Barang</option>
                        <option value="construction">Pekerjaan Konstruksi</option>
                        <option value="services">Jasa Lainnya</option>
                        <option value="consultancy">Jasa Konsultansi</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="comp-input-desc" className="text-xs font-bold text-slate-700 block">Deskripsi Detail Kebutuhan</label>
                    <textarea
                      id="comp-input-desc"
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Sebutkan rincian kasar barang/jasa yang ingin dibeli agar draf spesifikasi Anda akurat."
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    ></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="comp-input-addnotes" className="text-xs font-bold text-slate-700 block">Catatan TKDN / Persyaratan Tambahan (Opsional)</label>
                    <input
                      type="text"
                      id="comp-input-addnotes"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Merek tertentu, syarat SNI, TKDN minimal, dll"
                      className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={generateDocumentDraft}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:bg-indigo-400"
                  >
                    <Sparkles className="h-4 w-4" /> {isGenerating ? "Sedang Mengolah Draf Berkas..." : "Mulai Olah & Terbitkan Draf"}
                  </button>
                </div>

                {/* Right Area (Output Display Col 6-12) */}
                <div className="md:col-span-7 border border-slate-200 rounded-2xl min-h-[400px] flex flex-col justify-between bg-slate-50 overflow-hidden relative">
                  {/* Status loading overlay */}
                  {isGenerating && (
                    <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-20">
                      <div className="bg-white p-6 rounded-2xl shadow-md space-y-4 max-w-xs border border-slate-100 flex flex-col items-center">
                        <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">Merumuskan Dokumen</h4>
                          <p className="text-[11px] text-slate-500 mt-1 font-medium italic animate-pulse">{generationFeedback}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
                    <span className="text-xs font-bold text-slate-800">
                      Pratinjau Hasil Dokumen Draf
                    </span>
                    {generatedDraft && (
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(generatedDraft)}
                          className="text-[10px] bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold py-1 px-2.5 rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Copy className="h-3 w-3" /> Salin Draf
                        </button>
                        <button
                          type="button"
                          onClick={handleLoadDraftToChat}
                          className="text-[10px] bg-indigo-50 border border-indigo-200 hover:bg-indigo-150 text-indigo-700 font-bold py-1 px-2.5 rounded flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="h-3 w-3" /> Sesuaikan di Chat
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Scrollable document output */}
                  <div className="p-5 flex-1 overflow-y-auto font-sans leading-relaxed text-slate-700 prose max-w-none text-xs selection:bg-indigo-300">
                    {generatedDraft ? (
                      <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs whitespace-pre-wrap font-sans">
                        {generatedDraft}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 gap-2 min-h-[300px]">
                        <FileText className="h-12 w-12 text-slate-300 stroke-1" />
                        <div>
                          <h4 className="text-xs font-bold text-slate-600">Draf Belum Dibuat</h4>
                          <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                            Isi isian informasi pekerjaan di panel kiri, lalu klik tombol generator untuk memulai draf dokumen komprehensif.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-indigo-50 border-t border-slate-200 text-[10px] text-indigo-900 font-semibold text-center shrink-0">
                    Aturan LKPP mewajibkan penelaahan ulang KAK & Spek oleh Pokja s.d PPK sebelum draf disahkan secara tanda tangan basah/elektronik.
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* TAB 4: CONSULTATION CHAT */}
          {activeTab === "consultation" && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col min-h-[500px]">
              {/* Box Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-ping"></div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Ruang Konsultansi & Advokasi Hukum PBJP</h3>
                    <p className="text-[10px] text-slate-500">Ajukan problematik administrasi Anda & dapatkan penyesuaian hukum.</p>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded border border-indigo-200 uppercase tracking-wider font-mono shrink-0">
                  Konsultan Bersertifikasi Perpres 12/2021
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-5 overflow-y-auto max-h-[380px] bg-slate-50/20 divide-y divide-slate-100/50">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 text-xs ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Avatar for bot */}
                      {msg.role === "assistant" && (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold font-mono text-[11px] shrink-0 border border-indigo-200 shadow-xs">
                          PP
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] rounded-2xl p-4 shadow-2xs whitespace-pre-wrap leading-relaxed ${
                          msg.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : "bg-white text-slate-800 rounded-tl-none border border-slate-200"
                        }`}
                      >
                        <div className="font-sans">
                          {msg.content}
                        </div>
                        <span
                          className={`block text-[9px] mt-2 text-right ${
                            msg.role === "user" ? "text-indigo-200" : "text-slate-400"
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Avatar for user */}
                      {msg.role === "user" && (
                        <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0 shadow-xs">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing Loader */}
                  {isSendingChat && (
                    <div className="flex gap-3 text-xs justify-start">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[11px] shrink-0 border border-indigo-200 animate-pulse">
                        PP
                      </div>
                      <div className="bg-white text-slate-800 rounded-2xl rounded-tl-none p-4 shadow-2xs border border-slate-200">
                        <div className="flex items-center gap-1 py-1.5 px-1">
                          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                          <span className="h-2 w-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Prompt Suggester Section */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Saran Isu Diskusi Cepat:</span>
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickQuestionClick(q)}
                      className="text-[10px] bg-white border border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20 text-slate-700 font-medium py-1 px-2.5 rounded-lg transition-all shadow-2xs cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Input Form */}
              <div className="p-3 border-t border-slate-200 bg-white shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Contoh: Bagaimana bila dalam negosiasi langsung harga tetap di atas HPS?"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendChatMessage();
                    }}
                    className="flex-1 text-xs border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => sendChatMessage()}
                    disabled={isSendingChat || !userInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer disabled:bg-slate-300 disabled:text-slate-500"
                  >
                    Kirim Pertanyaan
                  </button>
                </div>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* App Footer */}
      <footer className="mt-auto bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 divide-y divide-slate-800">
          <p className="pb-3">
            Sipengadaan — Dirancang dengan cermat untuk membantu Pejabat Pengadaan Barang Jasa Indonesia.
          </p>
          <p className="pt-3 text-[10px] text-slate-500 leading-normal">
            Segala rancangan dokumen, draf analisis HPS, keputusan pajak, dan saran diskusi AI merupakan referensi awal penunjang kerja dan tidak menganulir legalitas formal peninjauan manual Pejabat Pembuat Komitmen (KPA/PPK) dan aturan daerah.
          </p>
        </div>
      </footer>
    </div>
  );
}

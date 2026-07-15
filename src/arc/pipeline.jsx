/* global React, window */
/* PH03 — Pipeline lưu trữ theo PHIÊN giao dịch (dùng dữ liệu phiên dùng chung)
   - Số hóa & đẩy CMC: phiên "Chờ số hóa & đẩy CMC" (waitAttach) → gán CCV nếu thiếu
       → scan & tiền xử lý → CHỈ khi file VB/HS đã sẵn sàng mới đẩy CMC → "Hoàn thành" (done)
   - Không còn bước "Chốt số công chứng" tách riêng: nghiệp vụ hiện yêu cầu CMC chỉ nhận
     dữ liệu kèm theo file đã scan — không thể đẩy metadata trước rồi đính file sau.
   Dùng CHUNG một store với các tab khác nên thao tác ở đây phản ánh ngay nơi khác. */
const { useState: usePL, useEffect: useEffPL } = React;

/* ---- Nguồn dữ liệu dùng CHUNG (window.VAStore) — không còn _arcRows riêng ---- */
function useArcRows() {
  const all = window.VAStore.useHoSoStore();
  return all.filter((r) => r.status === "waitAttach");
}

/* ====================================================================
   Drawer: số hóa & đẩy CMC (gộp cả bước xác nhận CCV ký trước khi quét)
   Không còn "chốt số" tách riêng — Đẩy CMC chỉ khả dụng SAU khi đủ file.
   ==================================================================== */
function ScanDrawer({ row, onClose, onComplete }) {
  const L = window.LucideReact;
  const { Button, Select } = window.FSICheckinDesignSystem_019df8;
  const C = window.ARCCover;
  const hasCCV = !!row.ccvId;
  const [ccvList, setCcvList] = usePL([]);
  const [ccvId, setCcvId] = usePL(row.ccvId || "");
  const [pages, setPages] = usePL(0);
  const [proc, setProc] = usePL(0);        // 0 idle · 1..4 = số bước đã xong
  const [scanning, setScanning] = usePL(false);
  const [cover, setCover] = usePL(false);
  const [pushing, setPushing] = usePL(false);
  const [err, setErr] = usePL("");

  useEffPL(() => { window.VAApi.nhanVien.list("CCV").then(setCcvList).catch(() => setCcvList([])); }, []);
  const ccvHoTen = hasCCV ? row.notary.replace(/^CCV /, "") : (ccvList.find((c) => c.id === ccvId) || {}).hoTen;

  const fmtMB = (n) => n.toFixed(1).replace(".", ",") + " MB";
  const rawMB = pages * 1.85;
  const compMB = Math.min(9.6, rawMB * 0.33 + 1.1);
  const vbName = C.autoName(row.ccNumber, "VB");
  const hsName = C.autoName(row.ccNumber, "HS");

  const startScan = () => {
    if (scanning || !ccvId) return;
    setScanning(true);
    setProc(0);
    setPages(6 + Math.floor(Math.random() * 12));
    [1, 2, 3, 4].forEach((s, i) => setTimeout(() => {
      setProc(s);
      if (s === 4) setScanning(false);
    }, 680 * (i + 1)));
  };

  const ready = proc >= 4;
  const canPush = ready && !!ccvId;
  const finish = async () => {
    setPushing(true);
    setErr("");
    try {
      await window.VAApi.hoSo.fileScan(row.hoSoId, { loaiFile: "VB", tenFile: vbName, dungLuongKb: Math.round(compMB * 1024), doPhanGiaiDpi: 200 });
      await window.VAApi.hoSo.fileScan(row.hoSoId, { loaiFile: "HS", tenFile: hsName, dungLuongKb: Math.round(compMB * 1024 * 0.6), doPhanGiaiDpi: 200 });
      await window.VAApi.hoSo.finalize(row.hoSoId, { ccvId });
      onComplete(row.hoSoId, pages, ccvHoTen);
    } catch (e) {
      setPushing(false);
      setErr(e.message || "Đẩy CMC thất bại, vui lòng thử lại");
    }
  };
  const steps = [
    { n: 1, icon: "Crop", title: "Tiền xử lý Scan",
      desc: "Nhận diện trang · cắt viền · xoay thẳng · ép phần cứng máy scan về 200 DPI" },
    { n: 2, icon: "FileArchive", title: "Nén PDF đạt chuẩn",
      desc: <>Dung lượng <b style={{ textDecoration: "line-through", color: "var(--text-tertiary)" }}>{fmtMB(rawMB)}</b> → <b style={{ color: "var(--text-success)" }}>{fmtMB(compMB)}</b> · mỗi file dưới chuẩn 10MB</> },
    { n: 3, icon: "Tag", title: "Đặt tên chuẩn (Auto-Naming)",
      desc: <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, lineHeight: 1.6 }}>{vbName} <span style={{ fontFamily: "var(--font-sans)", color: "var(--text-tertiary)" }}>· Hợp đồng</span><br />{hsName} <span style={{ fontFamily: "var(--font-sans)", color: "var(--text-tertiary)" }}>· Giấy tờ</span></span> },
    { n: 4, icon: "GitMerge", title: "Ghép nối CMC (Auto-Merging)",
      desc: <>Tự nhận diện file <b>VB</b> từ máy scan → đẩy lên hồ sơ <b style={{ fontFamily: "var(--font-mono)" }}>{row.id}</b> trên CMC</> },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.32)" }} />
      <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 580, maxWidth: "94%", background: "var(--bg-surface)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", animation: "vaSlideIn .2s var(--ease-standard)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid var(--border-default)", flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-muted)", display: "grid", placeItems: "center" }}><L.ScanLine size={17} color="var(--accent)" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14.5, fontWeight: 600 }}>Số hóa &amp; đẩy CMC · {row.customer}</div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{row.id} · {row.ccNumber}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
          {/* Xác nhận CCV ký — bắt buộc trước khi được phép quét */}
          <div style={{ padding: 18, borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}><L.PenLine size={15} color="var(--text-secondary)" /> Công chứng viên ký</div>
            {hasCCV ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "var(--bg-success)", border: "1px solid var(--border-success)", borderRadius: "var(--radius-md)" }}>
                <L.UserCheck size={15} color="var(--text-success)" />
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>CCV phụ trách: <b style={{ color: "var(--text-primary)" }}>{ccvHoTen}</b></span>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, fontSize: 12.5, color: "var(--text-warning)" }}>
                  <L.AlertTriangle size={14} /> Phiên chưa gán công chứng viên — chọn CCV trước khi quét (bắt buộc để đẩy CMC).
                </div>
                <Select placeholder="Chọn công chứng viên ký" options={ccvList.map((c) => ({ value: c.id, label: c.hoTen }))} value={ccvId} onChange={(v) => setCcvId(typeof v === "string" ? v : v.target.value)} />
              </>
            )}
          </div>

          {/* Quét tài liệu */}
          <div style={{ padding: 18, background: "var(--bg-overlay)", borderBottom: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 142, height: 190, background: pages > 0 ? "#fff" : "var(--bg-inset)", border: "1px solid var(--border-default)", borderRadius: 6, boxShadow: "var(--shadow-sm)", flexShrink: 0, padding: "16px 14px", display: "flex", flexDirection: "column", gap: 6, position: "relative", overflow: "hidden" }}>
                {pages > 0 ? <>
                  <div style={{ height: 8, width: "70%", background: "var(--border-default)", borderRadius: 2, margin: "0 auto 6px" }} />
                  {[...Array(8)].map((_, i) => <div key={i} style={{ height: 4, width: (i % 3 === 0 ? "60%" : "100%"), background: "var(--border-subtle)", borderRadius: 2 }} />)}
                  <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end" }}><div style={{ width: 34, height: 34, borderRadius: "50%", border: "1.5px dashed var(--accent-border)" }} /></div>
                  {scanning && <div style={{ position: "absolute", left: 0, right: 0, height: 28, background: "linear-gradient(180deg, transparent, color-mix(in srgb, var(--accent) 30%, transparent))", animation: "vaScan 1.1s ease-in-out infinite" }} />}
                </> : <div style={{ margin: "auto", textAlign: "center", color: "var(--text-tertiary)" }}><L.FileScan size={28} /><div style={{ fontSize: 11.5, marginTop: 6 }}>Chưa có trang</div></div>}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                <Button variant="secondary" size="sm" icon={scanning ? L.Loader : L.ScanLine} disabled={scanning || !ccvId} onClick={startScan}>{scanning ? "Đang quét & xử lý…" : pages > 0 ? "Quét lại" : "Quét tài liệu"}</Button>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>PDF/A · 200 DPI · {pages} trang đã quét{!ccvId && " · cần gán CCV trước"}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", borderRadius: "var(--radius-md)", background: "var(--bg-info)", border: "1px solid var(--border-info)", marginTop: "auto" }}>
                  <L.Sparkles size={14} color="var(--text-info)" />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>Tiền xử lý, đặt tên &amp; ghép nối CMC chạy tự động sau khi quét.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tự động hóa số hóa */}
          <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <L.Workflow size={15} color="var(--text-secondary)" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Tự động hóa số hóa</span>
              <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>· chạy ngay sau khi quét</span>
            </div>

            {pages === 0 ? (
              <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "26px 12px", color: "var(--text-tertiary)", background: "var(--bg-overlay)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-md)" }}>
                <L.ScanLine size={22} style={{ marginBottom: 8 }} />
                <div style={{ fontSize: 12.5 }}>Quét tài liệu để bắt đầu chuỗi xử lý tự động.</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {steps.map((st) => {
                  const Icon = L[st.icon];
                  const isDone = proc >= st.n;
                  const isNow = scanning && proc === st.n - 1;
                  return (
                    <div key={st.n} style={{ display: "flex", gap: 11, padding: "11px 13px", borderRadius: "var(--radius-md)", border: "1px solid " + (isDone ? "var(--border-success)" : "var(--border-subtle)"), background: isDone ? "var(--bg-success)" : "var(--bg-overlay)", opacity: isDone || isNow ? 1 : 0.55, transition: "opacity .3s, background .3s, border-color .3s" }}>
                      <span style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, display: "grid", placeItems: "center", background: isDone ? "var(--text-success)" : "var(--bg-inset)", color: isDone ? "#fff" : "var(--text-tertiary)", transition: "background .3s" }}>
                        {isDone ? <L.Check size={16} /> : isNow ? <L.Loader size={15} style={{ animation: "vaSpin 1s linear infinite" }} /> : <Icon size={15} />}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{st.title}</span>
                          <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: "var(--accent-hover)", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-full)", padding: "2px 7px" }}>Tự động</span>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 3, lineHeight: 1.5 }}>{st.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* In bìa lưu trữ tự động */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", borderRadius: "var(--radius-md)", border: "1px solid " + (ready ? "var(--accent-border)" : "var(--border-subtle)"), background: ready ? "var(--accent-muted)" : "var(--bg-overlay)", opacity: ready ? 1 : 0.55, transition: "opacity .3s" }}>
              <span style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, display: "grid", placeItems: "center", background: "var(--bg-surface)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}><L.BookCopy size={17} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>In bìa lưu trữ tự động</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2, lineHeight: 1.45 }}>In màu theo năm · tự điền Bên A, loại hồ sơ, số CC &amp; ngày công chứng để kẹp vào hồ sơ.</div>
              </div>
              <Button variant="secondary" size="sm" icon={L.Printer} disabled={!ready} onClick={() => setCover(true)}>Xem &amp; in bìa</Button>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border-default)", padding: "14px 18px", flexShrink: 0 }}>
          {err && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--text-danger)", background: "var(--bg-danger)", border: "1px solid var(--border-danger)", borderRadius: "var(--radius-md)", padding: "8px 11px", marginBottom: 10 }}>
              <L.AlertCircle size={14} /> {err}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Button variant="secondary" onClick={onClose} disabled={pushing}>Hủy</Button>
            <Button variant="primary" icon={pushing ? L.Loader : L.CloudUpload} fullWidth disabled={!canPush || pushing} onClick={finish}>
              {pushing ? "Đang đẩy CMC (kèm file)…" : "Hoàn tất số hóa & đẩy CMC"}
            </Button>
          </div>
        </div>
      </div>

      {cover && <C.CoverModal row={row} onClose={() => setCover(false)} />}
    </div>
  );
}

/* ====================================================================
   TAB: Số hóa & đẩy CMC
   Duy nhất một bước cho toàn bộ phiên đã cấp số: gán CCV (nếu thiếu) → quét →
   tiền xử lý/đặt tên/ghép nối → CHỈ khi đủ file mới đẩy CMC → Hoàn thành.
   ==================================================================== */
function ScanScreen() {
  const L = window.LucideReact;
  const { Button, StatCard, Toast, Badge } = window.FSICheckinDesignSystem_019df8;
  const VS = window.VASessions;
  const rows = useArcRows();
  const [sel, setSel] = usePL(null);
  const [toast, setToast] = usePL(null);

  const queue = rows.filter((r) => r.status === "waitAttach")
    .sort((a, b) => (VS.daysOverdue(b.date)) - (VS.daysOverdue(a.date)));

  // Gọi sau khi ScanDrawer đã đẩy CMC thật thành công (fileScan x2 + finalize) —
  // chỉ còn việc cập nhật lạc quan để MỌI màn hình đang mở (vd Luồng tổng quan) thấy ngay.
  const onComplete = (hoSoId, pages, ccvHoTen) => {
    const target = rows.find((r) => r.hoSoId === hoSoId);
    window.VAStore.patchLocal(hoSoId, { status: "done", notary: (target && target.notary) || "CCV " + ccvHoTen, photos: pages, completedAt: VS.vaNow(), updatedAt: VS.vaNow() });
    setSel(null);
    setToast({ tone: "success", title: "Đã số hóa & đẩy CMC", message: (target ? target.id : "") + " · " + pages + " trang kèm dữ liệu đã đẩy CMC thành công — hồ sơ chuyển sang Hoàn thành." });
    setTimeout(() => setToast(null), 3800);
  };

  const th = { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)", whiteSpace: "nowrap" };
  const td = { padding: "12px 14px", fontSize: 13, color: "var(--text-secondary)", verticalAlign: "middle" };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 20 }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Số hóa &amp; đẩy CMC</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "2px 0 0" }}>Phiên đã thu phí &amp; cấp số · gán CCV ký, quét bản giấy rồi đẩy CMC ngay khi file đã sẵn sàng — không tách rời thành 2 bước</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          <StatCard label="Chờ số hóa & đẩy CMC" value={String(queue.length)} icon={L.ScanLine} />
          <StatCard label="Đã đẩy CMC hôm nay" value={"52"} icon={L.CloudUpload} />
          <StatCard label="Quá hạn nộp lưu" value={"3"} icon={L.AlertTriangle} danger />
        </div>

        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 8 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Hàng chờ số hóa &amp; đẩy CMC</h2>
            <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>· {queue.length} hồ sơ · đẩy từ bước Thu ngân cấp số</span>
          </div>
          {queue.length === 0 ? (
            <div style={{ display: "grid", placeItems: "center", textAlign: "center", padding: "44px 12px", color: "var(--text-tertiary)", background: "var(--bg-surface)", border: "1px dashed var(--border-default)", borderRadius: "var(--radius-lg)" }}>
              <L.CheckCircle2 size={26} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 13.5 }}>Không còn hồ sơ nào chờ số hóa. Tất cả đã đẩy CMC.</div>
            </div>
          ) : (
            <div style={{ border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--bg-surface)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: "var(--bg-elevated)", borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Số CC", "Mã phiên", "Khách hàng", "Biểu mẫu", "CCV ký", "Trạng thái", ""].map((h, i) => <th key={i} style={th}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {queue.map((r, ri) => {
                    const over = VS.daysOverdue(r.date) > 0;
                    const noCcv = !r.notary;
                    return (
                      <tr key={r.id} onClick={() => setSel(r)} style={{ cursor: "pointer", borderBottom: ri < queue.length - 1 ? "1px solid var(--border-subtle)" : "none", borderLeft: over ? "3px solid var(--color-warning)" : "3px solid transparent", background: over ? "var(--bg-warning)" : "transparent" }}
                        onMouseEnter={(e) => { if (!over) e.currentTarget.style.background = "var(--bg-overlay)"; }}
                        onMouseLeave={(e) => { if (!over) e.currentTarget.style.background = "transparent"; }}>
                        <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent-hover)" }}>{r.ccNumber || "—"}</td>
                        <td style={{ ...td, fontFamily: "var(--font-mono)", fontSize: 12.5, color: "var(--text-primary)" }}>{r.id}</td>
                        <td style={td}><span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{r.customer}</span></td>
                        <td style={{ ...td, fontSize: 12.5 }}>{r.types.join(", ")}</td>
                        <td style={td}>{r.notary ? r.notary.replace(/^CCV /, "") : <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--text-warning)", fontSize: 12.5 }}><L.UserPlus size={13} /> Chọn CCV</span>}</td>
                        <td style={td}>{noCcv ? <Badge tone="warning" dot>Chờ gán CCV</Badge> : <Badge tone="info" dot>Chờ số hóa</Badge>}</td>
                        <td style={{ ...td, textAlign: "right", whiteSpace: "nowrap" }}>
                          <Button variant={noCcv ? "secondary" : "primary"} size="sm" icon={L.ScanLine} onClick={(e) => { e.stopPropagation(); setSel(r); }}>Số hóa &amp; đẩy CMC</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {sel && <ScanDrawer row={sel} onClose={() => setSel(null)} onComplete={onComplete} />}
      {toast && (
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 80, animation: "vaPop .18s var(--ease-standard)" }}>
          <Toast tone={toast.tone} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}

window.ARCPipeline = { ScanScreen };

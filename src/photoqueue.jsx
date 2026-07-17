/* global React, window */
/* Hàng chờ ảnh — CCV chụp ảnh cùng khách bằng camera cố định tại quầy; TKNV/CCV
   in A4 để đính kèm hồ sơ. Trước đây chụp = màu ngẫu nhiên, không gắn hồ sơ nào
   (chỉ có tên khách hàng gõ tay) — giờ bắt chọn ĐÚNG hồ sơ trước khi chụp, dùng
   camera thật (window.VACapture.DesktopCameraCapture), và tải lên thật thành
   FileScan(ANH_CHUP_HIEN_TRUONG) gắn hoSoId — để bước "In & chuyển" của đúng hồ
   sơ đó lấy được ảnh này nếu đã đính kèm. */
const { useState: usePQ } = React;

function pqNow() {
  const d = new Date(); const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function PhotoThumb({ hue, imageUrl, size }) {
  const L = window.LucideReact;
  if (imageUrl) {
    return <div style={{ width: "100%", height: size || 150, borderRadius: "var(--radius-md)", overflow: "hidden" }}><img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>;
  }
  return (
    <div style={{ width: "100%", height: size || 150, borderRadius: "var(--radius-md)", overflow: "hidden", position: "relative", background: `linear-gradient(135deg, hsl(${hue} 32% 82%), hsl(${hue} 28% 64%))`, display: "grid", placeItems: "center" }}>
      <div style={{ display: "flex", gap: -8 }}>
        <L.User size={size ? size / 3 : 46} color={`hsl(${hue} 40% 38%)`} style={{ marginRight: -6 }} />
        <L.User size={size ? size / 3.6 : 38} color={`hsl(${hue} 40% 30%)`} style={{ alignSelf: "flex-end" }} />
      </div>
    </div>
  );
}

/* Modal xem trước in A4 */
function PrintPreview({ photos, onClose, onPrint }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,28,26,.42)" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 520, maxWidth: "94%", maxHeight: "90%", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-xl)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 16px", borderBottom: "1px solid var(--border-default)" }}>
          <L.Printer size={17} color="var(--accent)" />
          <div style={{ flex: 1, fontSize: 14.5, fontWeight: 600 }}>Xem trước in A4 · {photos.length} ảnh</div>
          <button type="button" onClick={onClose} style={{ width: 30, height: 30, border: "none", background: "transparent", borderRadius: 7, cursor: "pointer", display: "grid", placeItems: "center", color: "var(--text-tertiary)" }}><L.X size={18} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", minHeight: 0, padding: 18, background: "var(--bg-overlay)", display: "flex", flexDirection: "column", gap: 16 }}>
          {photos.map((p) => (
            <div key={p.id} style={{ background: "#fff", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-sm)", borderRadius: 4, padding: "26px 30px", margin: "0 auto", width: "100%", maxWidth: 360 }}>
              <div style={{ textAlign: "center", borderBottom: "1px solid var(--border-default)", paddingBottom: 8, marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".02em" }}>VĂN PHÒNG CÔNG CHỨNG VIỆT AN</div>
                <div style={{ fontSize: 10.5, color: "var(--text-tertiary)" }}>Ảnh công chứng viên &amp; khách hàng — đính kèm hồ sơ</div>
              </div>
              <PhotoThumb hue={p.hue} imageUrl={p.imageUrl} size={210} />
              <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 3, fontFamily: "var(--font-mono)" }}>
                <div>Thời gian: {p.time}</div>
                <div>CCV: {p.ccv}</div>
                <div>Hồ sơ: {p.maPhien || "—"}</div>
                <div>Khách hàng: {p.customer || "—"}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, padding: "13px 16px", borderTop: "1px solid var(--border-default)" }}>
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button variant="primary" icon={L.Printer} fullWidth onClick={onPrint}>In {photos.length} khổ A4</Button>
        </div>
      </div>
    </div>
  );
}

/* Chọn đúng hồ sơ trước khi chụp — gõ mã phiên/tên khách để lọc trong danh
   sách hồ sơ đang có (window.VAStore, cùng nguồn với Luồng tổng quan). */
function HoSoPicker({ sel, onSelect }) {
  const L = window.LucideReact;
  const rows = window.VAStore.useHoSoStore();
  const [q, setQ] = usePQ("");
  const query = q.trim().toLowerCase();
  const matches = query.length < 1 ? [] : rows.filter((r) =>
    r.id.toLowerCase().includes(query) || (r.customer || "").toLowerCase().includes(query)
  ).slice(0, 8);

  if (sel) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-md)" }}>
        <L.FileSignature size={16} color="var(--accent)" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)" }}>{sel.id}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{sel.customer || "Chưa có tên khách"}</div>
        </div>
        <button type="button" onClick={() => onSelect(null)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", display: "grid", placeItems: "center", width: 26, height: 26 }}>
          <L.X size={14} />
        </button>
      </div>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <L.Search size={14} color="var(--text-tertiary)" style={{ position: "absolute", left: 10 }} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nhập mã phiên hoặc tên khách hàng để chọn hồ sơ…"
          style={{ width: "100%", fontFamily: "var(--font-sans)", fontSize: 13, color: "var(--text-primary)", background: "var(--bg-inset)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "8px 10px 8px 30px", outline: "none" }} />
      </div>
      {matches.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 180, overflowY: "auto" }}>
          {matches.map((r) => (
            <button key={r.hoSoId} type="button" onClick={() => { onSelect(r); setQ(""); }} style={{
              display: "flex", alignItems: "center", gap: 8, textAlign: "left", padding: "7px 9px", borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)", background: "var(--bg-surface)", cursor: "pointer", fontFamily: "var(--font-sans)",
            }}>
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 600 }}>{r.id}</span>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>{r.customer || "—"}</span>
            </button>
          ))}
        </div>
      )}
      {query.length > 0 && matches.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--text-tertiary)", padding: "4px 2px" }}>Không tìm thấy hồ sơ khớp “{q.trim()}”.</div>
      )}
    </div>
  );
}

function PhotoQueueScreen({ role }) {
  const L = window.LucideReact;
  const D = window.VA_DATA;
  const { Button, Toast } = window.FSICheckinDesignSystem_019df8;
  const { DesktopCameraCapture } = window.VACapture;
  const isCcv = role === "ccv";
  const me = isCcv ? "CCV Nguyễn Quốc Việt" : "Trần Thị Mỹ Linh";

  const [photos, setPhotos] = usePQ(() => D.capturedPhotos.map((p) => ({ ...p })));
  const [hoSoSel, setHoSoSel] = usePQ(null); // hồ sơ đã chọn để gắn ảnh
  const [shot, setShot] = usePQ(null);       // { file } — ảnh vừa chụp, chờ xác nhận
  const [uploading, setUploading] = usePQ(false);
  const [sel, setSel] = usePQ({});
  const [preview, setPreview] = usePQ(null); // mảng ảnh đang xem trước in
  const [toast, setToast] = usePQ(null);

  const confirm = async () => {
    if (!shot || !hoSoSel || uploading) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("loaiFile", "ANH_CHUP_HIEN_TRUONG");
      fd.append("file", shot.file);
      const row = await window.VAApi.hoSo.fileScan(hoSoSel.hoSoId, fd);
      setPhotos((ps) => [{
        id: row.id, time: pqNow(), ccv: "CCV Nguyễn Quốc Việt",
        customer: hoSoSel.customer, maPhien: hoSoSel.id,
        imageUrl: window.VAApi.apiBase + row.duongDan,
      }, ...ps]);
      setShot(null);
      setToast({ title: "Đã lưu ảnh", message: "Ảnh đã đính kèm vào hồ sơ " + hoSoSel.id + "." });
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setToast({ title: "Không tải được ảnh", message: e.message || "Không rõ nguyên nhân", tone: "danger" });
      setTimeout(() => setToast(null), 3500);
    } finally {
      setUploading(false);
    }
  };

  const selected = photos.filter((p) => sel[p.id]);
  const toggleSel = (id) => setSel((s) => ({ ...s, [id]: !s[id] }));
  const doPrint = () => { setPreview(null); setSel({}); setToast({ title: "Đã gửi lệnh in", message: "Ảnh đang được in ra khổ A4." }); setTimeout(() => setToast(null), 3000); };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 24 }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>Hàng chờ ảnh</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "3px 0 0" }}>Ảnh công chứng viên chụp cùng khách hàng · gắn vào đúng hồ sơ · in khổ A4 để đính kèm thêm nếu cần</p>
        </div>

        {/* Khu vực chụp ảnh — chỉ CCV */}
        {isCcv && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,360px) 1fr", gap: 18, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: 18, alignItems: "start" }}>
            {/* Viewfinder */}
            <div>
              {shot ? (
                <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", aspectRatio: "4 / 3" }}>
                  <img src={shot.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ) : (
                <DesktopCameraCapture onCapture={(file) => setShot({ file, previewUrl: URL.createObjectURL(file) })} />
              )}
            </div>
            {/* Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: "stretch" }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{shot ? "Xác nhận ảnh vừa chụp" : "Chọn hồ sơ để chụp ảnh"}</div>
              <HoSoPicker sel={hoSoSel} onSelect={setHoSoSel} />
              {!shot ? (
                <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", margin: 0, lineHeight: 1.5 }}>
                  {hoSoSel ? "Camera đã thiết lập tại quầy — bấm \"Bật camera\" rồi \"Chụp\" để ghi lại khoảnh khắc CCV cùng khách hàng, sẽ đính kèm ngay vào hồ sơ đã chọn." : "Chọn 1 hồ sơ ở trên trước khi bật camera — ảnh sẽ được đính kèm đúng vào hồ sơ đó."}
                </p>
              ) : (
                <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                  <Button variant="secondary" icon={L.RotateCcw} disabled={uploading} onClick={() => setShot(null)}>Chụp lại</Button>
                  <Button variant="primary" icon={L.Check} fullWidth disabled={uploading || !hoSoSel} onClick={confirm}>{uploading ? "Đang tải…" : "Xác nhận"}</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Danh sách ảnh */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Ảnh đã chụp</h2>
            <span style={{ fontSize: 12.5, color: "var(--text-tertiary)" }}>· {photos.length} ảnh</span>
            {selected.length > 0 && (
              <Button variant="primary" size="sm" icon={L.Printer} style={{ marginLeft: "auto" }} onClick={() => setPreview(selected)}>In {selected.length} ảnh đã chọn</Button>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
            {photos.map((p) => {
              const on = !!sel[p.id];
              return (
                <div key={p.id} style={{ border: "1px solid " + (on ? "var(--accent)" : "var(--border-default)"), borderRadius: "var(--radius-lg)", overflow: "hidden", background: "var(--bg-surface)", boxShadow: on ? "var(--shadow-xs)" : "none" }}>
                  <div style={{ position: "relative" }}>
                    <PhotoThumb hue={p.hue} imageUrl={p.imageUrl} />
                    <button type="button" onClick={() => toggleSel(p.id)} title="Chọn để in" style={{ position: "absolute", top: 8, left: 8, width: 24, height: 24, borderRadius: 6, border: "1.5px solid " + (on ? "var(--accent)" : "rgba(255,255,255,.85)"), background: on ? "var(--accent)" : "rgba(255,255,255,.55)", display: "grid", placeItems: "center", cursor: "pointer" }}>
                      {on && <L.Check size={14} color="#fff" />}
                    </button>
                  </div>
                  <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-tertiary)" }}>
                      <L.Clock size={12} /> <span style={{ fontFamily: "var(--font-mono)" }}>{p.time}</span>
                    </div>
                    {p.maPhien && (
                      <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>
                        Hồ sơ: <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>{p.maPhien}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                      <span style={{ color: "var(--text-tertiary)" }}>Khách: </span>
                      {p.customer ? <b style={{ fontWeight: 600 }}>{p.customer}</b> : <span style={{ color: "var(--text-disabled)", fontStyle: "italic" }}>chưa nhập</span>}
                    </div>
                    <Button variant="secondary" size="sm" icon={L.Printer} fullWidth onClick={() => setPreview([p])}>In&nbsp;A4</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {preview && <PrintPreview photos={preview} onClose={() => setPreview(null)} onPrint={doPrint} />}
      {toast && (
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 90 }}>
          <Toast tone={toast.tone || "success"} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}

window.PhotoQueueScreen = PhotoQueueScreen;

/* global React, window */
/* Hàng chờ ảnh — CCV chụp ảnh cùng khách; TKNV/CCV in A4 để đính kèm hồ sơ */
const { useState: usePQ } = React;

function pqNow() {
  const d = new Date(); const p = (n) => String(n).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function PhotoThumb({ hue, size }) {
  const L = window.LucideReact;
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
              <PhotoThumb hue={p.hue} size={210} />
              <div style={{ marginTop: 12, fontSize: 11.5, color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: 3, fontFamily: "var(--font-mono)" }}>
                <div>Thời gian: {p.time}</div>
                <div>CCV: {p.ccv}</div>
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

function PhotoQueueScreen({ role }) {
  const L = window.LucideReact;
  const D = window.VA_DATA;
  const { Button, Input, Avatar, Toast } = window.FSICheckinDesignSystem_019df8;
  const isCcv = role === "ccv";
  const me = isCcv ? "CCV Nguyễn Quốc Việt" : "Trần Thị Mỹ Linh";

  const [photos, setPhotos] = usePQ(() => D.capturedPhotos.map((p) => ({ ...p })));
  const [shot, setShot] = usePQ(null);      // ảnh vừa chụp, chờ xác nhận
  const [name, setName] = usePQ("");
  const [sel, setSel] = usePQ({});
  const [preview, setPreview] = usePQ(null); // mảng ảnh đang xem trước in
  const [toast, setToast] = usePQ(null);

  const capture = () => setShot({ hue: Math.floor(Math.random() * 360) });
  const confirm = () => {
    setPhotos((ps) => [{ id: "ph-" + Date.now(), time: pqNow(), ccv: "CCV Nguyễn Quốc Việt", customer: name.trim(), hue: shot.hue }, ...ps]);
    setShot(null); setName("");
    setToast({ title: "Đã lưu ảnh", message: "Ảnh đã thêm vào hàng chờ ảnh." });
    setTimeout(() => setToast(null), 3000);
  };
  const selected = photos.filter((p) => sel[p.id]);
  const toggleSel = (id) => setSel((s) => ({ ...s, [id]: !s[id] }));
  const doPrint = () => { setPreview(null); setSel({}); setToast({ title: "Đã gửi lệnh in", message: "Ảnh đang được in ra khổ A4." }); setTimeout(() => setToast(null), 3000); };

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: 24 }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <h1 style={{ fontSize: 19, fontWeight: 700, margin: 0 }}>Hàng chờ ảnh</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "3px 0 0" }}>Ảnh công chứng viên chụp cùng khách hàng · in khổ A4 để đính kèm hồ sơ</p>
        </div>

        {/* Khu vực chụp ảnh — chỉ CCV */}
        {isCcv && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,360px) 1fr", gap: 18, background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", padding: 18, alignItems: "start" }}>
            {/* Viewfinder */}
            <div>
              <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", aspectRatio: "4 / 3", background: shot ? "transparent" : "linear-gradient(135deg, #2a2d34, #14161b)", display: "grid", placeItems: "center" }}>
                {shot ? <PhotoThumb hue={shot.hue} size={260} /> : (
                  <div style={{ textAlign: "center", color: "rgba(255,255,255,.7)" }}>
                    <L.Video size={30} style={{ marginBottom: 6 }} />
                    <div style={{ fontSize: 12.5 }}>Khung hình camera trực tiếp</div>
                  </div>
                )}
                <span style={{ position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(22,163,74,.92)", borderRadius: "var(--radius-full)", padding: "3px 9px" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} /> Camera đã kết nối
                </span>
              </div>
            </div>
            {/* Controls */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, alignSelf: "stretch" }}>
              {!shot ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Chụp ảnh công chứng viên &amp; khách hàng</div>
                  <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", margin: 0, lineHeight: 1.5 }}>Camera đã được thiết lập tại quầy. Bấm “Chụp ảnh” để ghi lại khoảnh khắc CCV cùng khách hàng phục vụ đính kèm hồ sơ.</p>
                  <Button variant="primary" size="lg" icon={L.Camera} onClick={capture}>Chụp ảnh</Button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Xác nhận ảnh vừa chụp</div>
                  <Input label="Tên khách hàng (có thể để trống)" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên khách hàng…" />
                  <div style={{ display: "flex", gap: 10, marginTop: 2 }}>
                    <Button variant="secondary" icon={L.RotateCcw} onClick={() => { setShot(null); setName(""); }}>Chụp lại</Button>
                    <Button variant="primary" icon={L.Check} fullWidth onClick={confirm}>Xác nhận</Button>
                  </div>
                </>
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
                    <PhotoThumb hue={p.hue} />
                    <button type="button" onClick={() => toggleSel(p.id)} title="Chọn để in" style={{ position: "absolute", top: 8, left: 8, width: 24, height: 24, borderRadius: 6, border: "1.5px solid " + (on ? "var(--accent)" : "rgba(255,255,255,.85)"), background: on ? "var(--accent)" : "rgba(255,255,255,.55)", display: "grid", placeItems: "center", cursor: "pointer" }}>
                      {on && <L.Check size={14} color="#fff" />}
                    </button>
                  </div>
                  <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-tertiary)" }}>
                      <L.Clock size={12} /> <span style={{ fontFamily: "var(--font-mono)" }}>{p.time}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <Avatar name={p.ccv} size={22} />
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.ccv}</span>
                    </div>
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
          <Toast tone="success" title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}

window.PhotoQueueScreen = PhotoQueueScreen;

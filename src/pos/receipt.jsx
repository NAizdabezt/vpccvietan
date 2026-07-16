/* global React, window */
/* Phiếu thu theo PHIÊN — mỗi hồ sơ có số CC + phí riêng; nợ tiền thu ⇒ thực thu 0; TT tiền mặt/chuyển khoản (không QR) */
const { useState: useStateR } = React;

function FieldSection({ icon, title, children, hint }) {
  const L = window.LucideReact;
  const Icon = L[icon];
  return (
    <div style={{ borderTop: "1px solid var(--border-subtle)", padding: "14px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Icon size={15} color="var(--text-secondary)" />
        <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
        {hint && <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--text-tertiary)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SegPay({ value, onChange }) {
  const opts = [{ id: "cash", label: "Tiền mặt", icon: "Banknote" }, { id: "transfer", label: "Chuyển khoản", icon: "ArrowLeftRight" }];
  const L = window.LucideReact;
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {opts.map((o) => {
        const on = value === o.id; const Icon = L[o.icon];
        return (
          <button key={o.id} type="button" onClick={() => onChange(o.id)} style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "10px", borderRadius: "var(--radius-lg)", cursor: "pointer", fontFamily: "var(--font-sans)",
            fontSize: 13, fontWeight: on ? 600 : 500,
            border: "1px solid " + (on ? "var(--accent)" : "var(--border-default)"),
            background: on ? "var(--accent-muted)" : "var(--bg-surface)",
            color: on ? "var(--accent-hover)" : "var(--text-secondary)",
          }}><Icon size={16} /> {o.label}</button>
        );
      })}
    </div>
  );
}

/* Một thẻ hồ sơ trong phiên — số CC + phí + công nợ riêng.
   hint = { nam, next, lastUsed, missing } thật từ server (GET /so-cc-hint);
   book = tiền tố hiển thị theo loại hồ sơ (0036/CT/SY). CHỈ để hiển thị/gợi ý
   — /cap-so ở server vẫn tự chọn số cuối cùng bằng transaction chống trùng
   riêng, số hiện ở đây có thể lệch nếu người khác vừa cấp số trước đó. */
function FileCard({ index, file, onChange, hint, book }) {
  const L = window.LucideReact;
  const { fmtVND, fullSoCC } = window.POSFmt;
  const { Checkbox } = window.FSICheckinDesignSystem_019df8;

  const soCC = file.soCC;
  const fee = file.fee;
  const feeEdited = file._feeEdited;

  // Smart hint trạng thái số CC
  let numState;
  if (!soCC) numState = { tone: "muted", icon: "Hash", text: "Chưa cấp số" };
  else if (hint.missing.includes(soCC)) numState = { tone: "info", icon: "ArrowDownToLine", text: "Lấp số thiếu" };
  else if (soCC <= hint.lastUsed) numState = { tone: "danger", icon: "Lock", text: "Số đã cấp — khóa cứng" };
  else numState = { tone: "success", icon: "Check", text: "Số khả dụng" };
  const toneVar = { muted: "--text-tertiary", info: "--text-info", danger: "--text-danger", success: "--text-success" }[numState.tone];
  const SIcon = L[numState.icon];
  const locked = numState.tone === "danger";

  const fieldStyle = { width: "100%", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "8px 11px", fontFamily: "var(--font-mono)", fontSize: 14, background: "var(--bg-inset)", color: "var(--text-primary)", outline: "none" };
  const labelStyle = { fontSize: 10.5, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600, marginBottom: 5, display: "block" };

  return (
    <div style={{ border: "1px solid " + (file.debtFile || file.debtMoney ? "var(--border-danger)" : "var(--border-default)"), background: file.debtFile || file.debtMoney ? "var(--bg-danger)" : "var(--bg-elevated)", borderRadius: "var(--radius-lg)", padding: 14, marginBottom: 10 }}>
      {/* Tên dịch vụ */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: "var(--accent-muted)", color: "var(--accent-hover)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{index + 1}</div>
        <div style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{file.service}</div>
        {file.status === "paid" && <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-success)", display: "inline-flex", alignItems: "center", gap: 3 }}><L.CheckCircle2 size={12} /> Đã thu</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Số CC */}
        <div>
          <label style={labelStyle}>Cấp số công chứng</label>
          <input type="number" value={soCC || ""} placeholder="—"
            onChange={(e) => onChange({ soCC: e.target.value ? parseInt(e.target.value, 10) : null })}
            style={{ ...fieldStyle, borderColor: locked ? "var(--color-danger)" : "var(--border-default)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 11, fontWeight: 500, color: `var(${toneVar})` }}>
            <SIcon size={11} /> {soCC ? <span style={{ fontFamily: "var(--font-mono)" }}>{fullSoCC(soCC, book, hint.nam)}</span> : numState.text}
          </div>
        </div>
        {/* Phí */}
        <div>
          <label style={labelStyle}>Phí thu</label>
          <div style={{ position: "relative" }}>
            <input type="text" value={fee.toLocaleString("vi-VN")}
              onChange={(e) => onChange({ fee: parseInt(e.target.value.replace(/\D/g, "") || 0, 10), _feeEdited: true })}
              style={{ ...fieldStyle, fontWeight: 600, paddingRight: 26 }} />
            <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)", fontFamily: "var(--font-mono)", fontSize: 13 }}>₫</span>
          </div>
          <div style={{ marginTop: 5, fontSize: 11, color: "var(--text-tertiary)" }}>{feeEdited ? "Đã chỉnh tay" : "Theo loại HĐ"}</div>
        </div>
      </div>

      {/* Công nợ riêng từng hồ sơ */}
      <div style={{ display: "flex", gap: 22, marginTop: 13, paddingTop: 12, borderTop: "1px dashed var(--border-default)" }}>
        <Checkbox label="Nợ hồ sơ" checked={file.debtFile} onChange={(v) => onChange({ debtFile: v })} />
        <Checkbox label="Nợ tiền thu" checked={file.debtMoney} onChange={(v) => onChange({ debtMoney: v })} />
        {file.debtMoney && (
          <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 600, color: "var(--text-danger)" }}>
            <L.AlertTriangle size={12} /> Thực thu = 0₫
          </span>
        )}
      </div>
    </div>
  );
}

function ReceiptForm({ row, hint, onClose, onConfirm }) {
  const L = window.LucideReact;
  const { fmtVND, creatorName, fullSoCC } = window.POSFmt;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  // Tiền tố hiển thị theo loại hồ sơ — khớp đúng /cap-so ở server (0036=HOP_DONG,
  // CT=CHUNG_THUC, SY=SAO_Y); chỉ để hiện Smart Hint, không quyết định số thật.
  const book = { HOP_DONG: "0036", CHUNG_THUC: "CT", SAO_Y: "SY" }[row.loaiHoSo] || "0036";

  // Khởi tạo state các hồ sơ; tự gán số CC kế tiếp cho hồ sơ chưa có
  const [files, setFiles] = useStateR(() => {
    let n = hint.next;
    return row.files.map((f) => {
      const soCC = f.soCC != null ? f.soCC : n++;
      return { ...f, soCC, _feeEdited: false };
    });
  });
  const [pay, setPay] = useStateR("cash");
  const [txn, setTxn] = useStateR("");

  const setFile = (i, patch) => setFiles(files.map((f, idx) => idx === i ? { ...f, ...patch } : f));

  // Thực thu: hồ sơ nợ tiền thu ⇒ 0₫
  const tongPhi = files.reduce((a, f) => a + (f.fee || 0), 0);
  const thucThu = files.reduce((a, f) => a + (f.debtMoney ? 0 : (f.fee || 0)), 0);
  const debtCount = files.filter((f) => f.debtMoney).length;
  const anyLocked = files.some((f) => f.soCC && f.soCC <= hint.lastUsed && !hint.missing.includes(f.soCC) && f.status !== "paid");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 20px 8px", minHeight: 0 }}>
        {/* Tóm tắt phiên */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", padding: "12px 0 2px" }}>
          {[["Mã phiên", row.sid, true], ["Người soạn", creatorName(row.creator)], ["Khách hàng", row.khach], ["Địa chỉ", row.addr]].map(([k, v, mono]) => (
            <div key={k}>
              <div style={{ fontSize: 10.5, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: ".04em", fontWeight: 600 }}>{k}</div>
              <div style={{ fontSize: 13.5, fontWeight: 500, fontFamily: mono ? "var(--font-mono)" : "inherit" }}>{v}</div>
            </div>
          ))}
        </div>

        {/* Danh sách hồ sơ */}
        <FieldSection icon="Files" title="Hồ sơ trong phiên" hint={"Quyển " + book + "/" + hint.nam + " · " + files.length + " hồ sơ"}>
          {files.map((f, i) => <FileCard key={f.id} index={i} file={f} onChange={(p) => setFile(i, p)} hint={hint} book={book} />)}
          {hint.missing.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, flexWrap: "wrap", fontSize: 11.5 }}>
              <span style={{ color: "var(--text-tertiary)" }}>Số thiếu cần ưu tiên lấp:</span>
              {hint.missing.map((m) => (
                <span key={m} style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--text-danger)", background: "var(--bg-danger)", border: "1px solid var(--border-danger)", borderRadius: "var(--radius-full)", padding: "1px 9px" }}>{m}</span>
              ))}
            </div>
          )}
        </FieldSection>

        {/* Hình thức thanh toán — tiền mặt / chuyển khoản (không QR) */}
        <FieldSection icon="Wallet" title="Hình thức thanh toán">
          <SegPay value={pay} onChange={setPay} />
          {pay === "transfer" && (
            <input placeholder="Mã giao dịch / nội dung chuyển khoản (tùy chọn)" value={txn} onChange={(e) => setTxn(e.target.value)}
              style={{ width: "100%", marginTop: 10, border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", padding: "9px 11px", fontSize: 13, background: "var(--bg-inset)", outline: "none", fontFamily: "var(--font-mono)", color: "var(--text-primary)" }} />
          )}
        </FieldSection>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border-default)", padding: "14px 20px", background: "var(--bg-surface)" }}>
        {debtCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: "var(--text-tertiary)" }}>Tổng phí ({files.length} hồ sơ)</span>
            <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-tertiary)", textDecoration: debtCount ? "none" : "none" }}>{fmtVND(tongPhi)}</span>
          </div>
        )}
        {debtCount > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, fontSize: 11.5, fontWeight: 500, color: "var(--text-danger)" }}>
            <L.AlertTriangle size={12} /> {debtCount} hồ sơ ghi nợ tiền thu — không tính vào thực thu, bôi đỏ trên hàng chờ.
          </div>
        )}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Thực thu</span>
          <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "var(--font-mono)", color: thucThu === 0 ? "var(--text-danger)" : "var(--text-primary)" }}>{fmtVND(thucThu)}</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Button variant="secondary" onClick={onClose}>Lưu nháp</Button>
          <Button variant="primary" icon={L.Printer} fullWidth disabled={anyLocked}
            onClick={() => {
              if (onConfirm) onConfirm({ soCC: files[0] && files[0].soCC ? fullSoCC(files[0].soCC, book, hint.nam) : null, thucThu, files, pay });
              else onClose();
            }}>Xác nhận thu tiền & In phơi</Button>
        </div>
      </div>
    </div>
  );
}

window.POSReceipt = { ReceiptForm };

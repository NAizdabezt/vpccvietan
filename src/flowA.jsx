/* global React, window */
/* Luồng soạn thảo hồ sơ — stepper 5 bước, dùng chung cho CCV & TKNV */
const { useState: useStateA } = React;

const VA_STEPS = [
  { id: 0, label: "Khởi tạo phiên", icon: "FolderPlus" },
  { id: 1, label: "Bóc tách giấy tờ", icon: "ScanLine" },
  { id: 2, label: "Tra cứu ngăn chặn", icon: "ShieldCheck" },
  { id: 3, label: "Soạn thảo", icon: "PenLine" },
  { id: 4, label: "In & chuyển", icon: "Printer" },
];

function Stepper({ step, setStep, maxReached }) {
  const L = window.LucideReact;
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "14px 4px" }}>
      {VA_STEPS.map((s, i) => {
        const Icon = L[s.icon];
        const done = i < step, on = i === step;
        const reachable = i <= maxReached;
        const color = on ? "var(--accent)" : done ? "var(--text-success)" : "var(--text-tertiary)";
        return (
          <React.Fragment key={s.id}>
            <button type="button" disabled={!reachable} onClick={() => reachable && setStep(i)} style={{
              display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent",
              cursor: reachable ? "pointer" : "not-allowed", padding: 0, fontFamily: "var(--font-sans)", opacity: reachable ? 1 : .55,
            }}>
              <span style={{
                width: 28, height: 28, borderRadius: "50%", display: "grid", placeItems: "center",
                background: on ? "var(--accent)" : done ? "var(--bg-success)" : "var(--bg-inset)",
                color: on ? "#fff" : done ? "var(--text-success)" : "var(--text-tertiary)",
                border: on ? "none" : "1px solid " + (done ? "var(--border-success)" : "var(--border-default)"), flexShrink: 0,
              }}>{done ? <L.Check size={15} /> : <Icon size={14} />}</span>
              <span style={{ fontSize: 13, fontWeight: on ? 600 : 500, color }}>{s.label}</span>
            </button>
            {i < VA_STEPS.length - 1 && <span style={{ flex: 1, height: 2, margin: "0 12px", borderRadius: 1, background: i < step ? "var(--border-success)" : "var(--border-subtle)" }} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function Panel({ title, desc, action, children, pad = 16, style }) {
  return (
    <section style={{ background: "var(--bg-surface)", border: "1px solid var(--border-default)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", minHeight: 0, ...style }}>
      {title && (
        <header style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{title}</h3>
            {desc && <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-tertiary)" }}>{desc}</p>}
          </div>
          {action}
        </header>
      )}
      <div style={{ padding: pad, display: "flex", flexDirection: "column", gap: 12, minHeight: 0, flex: 1 }}>{children}</div>
    </section>
  );
}

function FlowA({ density, session, onExit, onStatus, onMeta, mode, role, currentNv }) {
  const L = window.LucideReact;
  const D = window.VA_DATA;
  const P = window.VAPieces;
  const { Input, Button, StatCard } = window.FSICheckinDesignSystem_019df8;
  const { DraftWorkspace } = window.VAEditor;
  const VS = window.VASessions;
  // Người soạn mặc định = người đang trong phiên (tài khoản đang đăng nhập thật —
  // KHÔNG dùng VA_PROFILES mock, tài khoản mới tạo không có trong bảng đó).
  const meProfile = VS.profileForNv(currentNv) || VS.VA_PROFILES[role === "ccv" ? "viet.nq" : "linh.tt"];
  const meName = (role === "ccv" ? "CCV " : "") + meProfile.name;
  const drafterOf = (name) => name === meName ? VS.getIdent(meProfile) : VS.identForName(name);
  const [drafter, setDrafter] = useStateA(() => ({ name: meName, ident: VS.getIdent(meProfile) }));
  const setDrafterByName = (name) => setDrafter({ name, ident: drafterOf(name) });
  const compact = density === "compact";
  const ro = mode === "view";
  const seeded = mode !== "new";

  // Biểu mẫu thật từ DB (thay cho window.VATemplates giả lập) — cần id là UUID
  // thật để gửi lên hoSo.create. Kho biểu mẫu tùy chỉnh (Template Manager,
  // localStorage) dùng làm nguồn dự phòng trong lúc chờ tải xong / lỗi mạng.
  const [realTpls, setRealTpls] = useStateA([]);
  React.useEffect(() => {
    window.VAApi.bieuMau.list()
      .then((rows) => setRealTpls(rows.map((r) => ({
        id: r.id, tid: r.id, name: r.ten, group: r.nhom,
        kind: window.VATemplateModel.nhomToKind(r.nhom),
      }))))
      .catch((e) => console.error("Không tải được danh sách biểu mẫu:", e));
  }, []);
  const TPLS = realTpls.length ? realTpls : ((window.VATemplates && window.VATemplates.list()) || D.templates);

  const initPicked = (seeded && session && session.types && session.types.length)
    ? session.types.map((nm) => { const t = TPLS.find((x) => x.name === nm) || { id: nm, name: nm, group: "" }; return { id: t.id, tid: t.id, name: t.name, group: t.group, kind: t.kind }; })
    : [{ id: "t1", tid: "t1", name: "HĐ Chuyển nhượng QSDĐ", group: "Bất động sản", kind: "land" }];

  const [step, setStep] = useStateA(0);
  const [maxReached, setMaxReached] = useStateA(seeded ? 4 : 0);
  const [customer, setCustomer] = useStateA(session && session.customer ? session.customer : "");
  const [picked, setPicked] = useStateA(initPicked);
  const [hoSoId, setHoSoId] = useStateA(session && session.hoSoId ? session.hoSoId : null);
  const [saving, setSaving] = useStateA(false);
  const [ocr, setOcr] = useStateA(() => D.ocrDocs.map((d) => ({ ...d, fields: d.fields.map((f) => ({ ...f })) })));
  const [scanned, setScanned] = useStateA(seeded);
  const [checks, setChecks] = useStateA(() => seeded ? D.ocrDocs.reduce((a, d) => { a[d.id] = true; return a; }, {}) : {});
  const [shots, setShots] = useStateA(() => seeded ? [{ id: "shot-seed", label: "Ảnh tra cứu 1", hue: 200 }] : []);
  const [printCfgs, setPrintCfgs] = useStateA({});
  // Nội dung Quill đã soạn cho phiên NÀY, theo từng biểu mẫu — { [bieuMauId]: html }.
  // Khác tầng với BieuMau.noiDung (nội dung mẫu dùng chung); lưu vào HoSo.noiDungDaSoan.
  const [draftHtml, setDraftHtml] = useStateA({});
  const [query, setQuery] = useStateA(session && session.customer ? session.customer : "");
  const [reusedFrom, setReusedFrom] = useStateA(null);
  const [toast, setToast] = useStateA(null);

  const go = (n) => { const v = Math.max(0, Math.min(4, n)); setStep(v); setMaxReached((m) => Math.max(m, v)); };

  const reuseRecord = (r) => {
    if (ro) return;
    setCustomer(r.customer);
    setQuery(r.customer);
    setReusedFrom(r);
    const tpl = TPLS.find((x) => x.name === r.type);
    if (tpl && !picked.find((p) => p.id === tpl.id)) setPicked((p) => [...p, { id: tpl.id, tid: tpl.id, name: tpl.name, group: tpl.group, kind: tpl.kind }]);
    setToast({ title: "Đã nạp thông tin khách cũ", message: r.customer + " — từ hồ sơ " + r.id + (tpl ? " · đã thêm biểu mẫu “" + tpl.name + "”" : "") });
  };

  React.useEffect(() => { if (onMeta) onMeta({ customer: customer, types: picked.map((p) => p.name) }); }, [customer, picked]);

  // Mở lại phiên đã có hồ sơ (kể cả phiên vừa tạo trong lượt này) -> nạp lại
  // nội dung Quill đã lưu trước đó cho hồ sơ này, để bước Soạn thảo không sinh
  // lại từ đầu và mất nội dung đã gõ/auto-fill trong lượt mở trước.
  React.useEffect(() => {
    if (!hoSoId) return;
    window.VAApi.hoSo.get(hoSoId)
      .then((row) => setDraftHtml(row.noiDungDaSoan || {}))
      .catch(() => {});
  }, [hoSoId]);

  // Khi danh sách biểu mẫu thật tải xong, đối chiếu lại theo tên để thay id giả
  // lập ban đầu (vd "t1" — dùng làm mặc định lúc TPLS chưa tải xong) bằng UUID
  // thật, tránh gửi id không hợp lệ lên hoSo.create.
  React.useEffect(() => {
    if (!realTpls.length) return;
    setPicked((arr) => arr.map((p) => {
      const match = realTpls.find((t) => t.name === p.name);
      return match ? { ...p, id: match.id, tid: match.id, group: match.group, kind: match.kind } : p;
    }));
  }, [realTpls]);

  const setField = (docId, fi, val) => setOcr((arr) => arr.map((d) => d.id === docId ? { ...d, fields: d.fields.map((f, i) => i === fi ? { ...f, value: val } : f) } : d));
  const addTemplate = (tid) => { const t = TPLS.find((x) => x.id === tid); if (t && !picked.find((p) => p.id === tid)) setPicked((p) => [...p, { id: tid, tid, name: t.name, group: t.group, kind: t.kind }]); };
  const togglePick = (t) => { if (ro) return; setPicked((p) => p.find((x) => x.id === t.id) ? p.filter((x) => x.id !== t.id) : [...p, { id: t.id, tid: t.id, name: t.name, group: t.group, kind: t.kind }]); };
  const addShot = () => setShots((s) => [...s, { id: "shot-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7), label: "Ảnh tra cứu " + (s.length + 1), hue: [200, 150, 30, 280][s.length % 4] }]);
  const allChecked = ocr.every((d) => checks[d.id]);

  const canNext = step === 0 ? (customer.trim() && picked.length > 0) : step === 2 ? (allChecked && shots.length > 0) : true;
  const addOptions = TPLS.filter((t) => !picked.find((p) => p.id === t.id));

  // Tạo hồ sơ thật trên server nếu phiên chưa có (chỉ gọi 1 lần — các lần sau
  // trả thẳng hoSoId đã lưu). loaiHoSo hardcode HOP_DONG vì mọi biểu mẫu builtin
  // hiện có đều là dạng hợp đồng, UI chưa có lựa chọn Chứng thực/Sao y.
  const ensureHoSo = async () => {
    if (hoSoId) return hoSoId;
    const kh = await window.VAApi.khachHang.create({ hoTen: customer.trim() });
    const row = await window.VAApi.hoSo.create({
      loaiHoSo: "HOP_DONG",
      khachHangId: kh.id,
      bieuMauIds: picked.map((p) => p.id),
    });
    setHoSoId(row.id);
    if (onMeta) onMeta({ hoSoId: row.id, id: row.maPhien });
    window.VAStore.refresh();
    return row.id;
  };

  const goNext = async () => {
    if (step !== 0) { go(step + 1); return; }
    setSaving(true);
    try {
      await ensureHoSo();
      go(1);
    } catch (e) {
      setToast({ tone: "danger", title: "Không tạo được hồ sơ", message: e.message || "Không rõ nguyên nhân" });
    } finally {
      setSaving(false);
    }
  };

  // Đẩy nội dung Quill hiện tại (draftHtml) lên backend — dùng chung cho "Lưu
  // nháp" và "In hợp đồng" (in luôn dùng bản mới nhất, không phải bản đã lưu cũ).
  const flushNoiDung = async (id) => {
    if (Object.keys(draftHtml).length) await window.VAApi.hoSo.saveNoiDung(id, draftHtml);
  };

  const saveDraft = async () => {
    const ready = customer.trim() && picked.length > 0;
    if (!ready) {
      setToast({ title: "Đã lưu nháp", message: "Phiên " + session.id + " được lưu ở trạng thái nháp." });
      if (onStatus) onStatus("draft");
      return;
    }
    setSaving(true);
    try {
      const id = await ensureHoSo();
      await flushNoiDung(id);
      setToast({ title: "Đã lưu nháp", message: "Phiên " + session.id + " được lưu ở trạng thái nháp." });
      if (onStatus) onStatus("draft");
    } catch (e) {
      setToast({ tone: "danger", title: "Không lưu được nháp", message: e.message || "Không rõ nguyên nhân" });
    } finally {
      setSaving(false);
    }
  };

  // In hợp đồng thật (WYSIWYG) — lưu nội dung mới nhất trước rồi mới in, để bản
  // in luôn khớp đúng những gì đang hiển thị trong Quill lúc bấm nút.
  const printNow = async () => {
    try {
      if (hoSoId) await flushNoiDung(hoSoId);
    } catch (e) { /* không chặn in nếu lưu lỗi — vẫn in được bản đang có trên màn hình */ }
    window.print();
  };

  const finishDraft = async () => {
    setSaving(true);
    try {
      const id = await ensureHoSo();
      await window.VAApi.hoSo.chuyenTrangThai(id, "CHO_THU_NGAN");
      window.VAStore.patchLocal(id, { status: "waitNumberPay", updatedAt: VS.vaNow() });
      setToast({ title: "Đã gửi lệnh in", message: "Hồ sơ chuyển sang Thu ngân — chờ cấp số CC & thu phí." });
      setTimeout(() => { onExit && onExit(); }, 1100);
    } catch (e) {
      setToast({ tone: "danger", title: "Không chuyển được sang Thu ngân", message: e.message || "Không rõ nguyên nhân" });
    } finally {
      setSaving(false);
    }
  };

  let body;
  if (step === 0) {
    const { ReturningSearch } = window.VALookup;
    body = (
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,0.82fr)", gap: 16, maxWidth: 1180, width: "100%", margin: "0 auto", alignItems: "start" }}>
        <Panel title="Khởi tạo phiên giao dịch" desc="Nhập tên khách hàng và chọn biểu mẫu — hệ thống tự sinh Mã phiên giao dịch.">
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--accent-muted)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius-md)" }}>
            <L.Hash size={16} color="var(--accent)" />
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>Mã phiên: <b style={{ fontFamily: "var(--font-mono)", color: "var(--accent-hover)" }}>{session.id}</b></span>
            <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--text-tertiary)" }}>{session.createdAt || D.session.createdAt}</span>
          </div>
          <Input label="Tên khách hàng" value={customer} disabled={ro} onChange={(e) => { setCustomer(e.target.value); setQuery(e.target.value); }} placeholder="Nhập họ tên khách hàng…" />
          {reusedFrom && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-info)", padding: "8px 11px", background: "var(--bg-info)", border: "1px solid var(--border-info)", borderRadius: "var(--radius-md)" }}>
              <L.UserCheck size={14} style={{ flexShrink: 0 }} /> Khách cũ — nạp từ hồ sơ <b style={{ fontFamily: "var(--font-mono)" }}>{reusedFrom.id}</b> ({reusedFrom.type}, {reusedFrom.date}).
            </div>
          )}
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              Biểu mẫu soạn thảo <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-tertiary)" }}>· chọn một hoặc nhiều · đã chọn {picked.length}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {TPLS.map((tpl) => {
                const on = !!picked.find((p) => p.id === tpl.id);
                return (
                  <button key={tpl.id} type="button" onClick={() => togglePick(tpl)} style={{
                    border: "1px solid " + (on ? "var(--accent)" : "var(--border-default)"), textAlign: "left",
                    background: on ? "var(--accent-muted)" : "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                    padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontFamily: "var(--font-sans)",
                  }}>
                    <span style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, display: "grid", placeItems: "center", border: "1.5px solid " + (on ? "var(--accent)" : "var(--border-strong)"), background: on ? "var(--accent)" : "transparent" }}>
                      {on && <L.Check size={13} color="#fff" />}
                    </span>
                    <L.FileText size={18} color={on ? "var(--accent)" : "var(--text-tertiary)"} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: on ? "var(--accent-hover)" : "var(--text-primary)" }}>{tpl.name}</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{tpl.group}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </Panel>
        <ReturningSearch query={query} setQuery={setQuery} onReuse={reuseRecord} />
      </div>
    );
  } else if (step === 1) {
    const activeImg = scanned ? D.scanImages[0].id : null;
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 0 }}>
        <P.ScanBar connected={scanned} readOnly={ro} onConnect={() => setScanned(true)} onUpload={() => setScanned(true)} />
        {!scanned ? (
          <div style={{ flex: 1, display: "grid", placeItems: "center", border: "1.5px dashed var(--border-default)", borderRadius: "var(--radius-lg)", background: "var(--bg-surface)", minHeight: 280 }}>
            <div style={{ textAlign: "center", color: "var(--text-tertiary)" }}>
              <L.ScanLine size={30} style={{ marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>Chưa có tài liệu</div>
              <div style={{ fontSize: 12.5, marginTop: 2 }}>Kết nối máy scan hoặc tải ảnh từ hệ thống để bắt đầu bóc tách OCR.</div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, minHeight: 0 }}>
            <Panel title="Ảnh đã OCR" desc={D.scanImages.length + " ảnh"} pad={10} style={{ minHeight: 0 }}>
              <div style={{ overflowY: "auto", minHeight: 0 }}>
                <P.ScanGallery images={D.scanImages} activeId={activeImg} onSelect={() => {}} />
              </div>
            </Panel>
            <Panel title="Tài liệu OCR đã bóc tách" desc={ocr.length + " tài liệu · sửa trực tiếp các trường nếu sai"} pad={12} style={{ minHeight: 0 }}>
              <div style={{ overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {ocr.map((doc, i) => <P.EditableDoc key={doc.id} doc={doc} onField={setField} readOnly={ro} defaultOpen={i === 0} />)}
              </div>
            </Panel>
          </div>
        )}
      </div>
    );
  } else if (step === 2) {
    body = (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start", minHeight: 0 }}>
        <Panel title="Đối chiếu tài liệu" desc={"Tích xác nhận đã kiểm tra · " + Object.values(checks).filter(Boolean).length + "/" + ocr.length} pad={0}>
          <div>
            {ocr.map((doc) => <P.CheckDocRow key={doc.id} doc={doc} checked={!!checks[doc.id]} onToggle={() => { if (!ro) setChecks((c) => ({ ...c, [doc.id]: !c[doc.id] })); }} />)}
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--text-tertiary)", padding: "12px 14px" }}>
            <L.Info size={14} style={{ marginTop: 1, flexShrink: 0 }} />
            Kiểm tra mã QR sổ đỏ, cà vẹt xe và các giấy tờ khác trước khi đính kèm ảnh tra cứu.
          </div>
        </Panel>
        <Panel title="Ảnh chụp tra cứu ngăn chặn" desc="Tải ảnh kết quả tra cứu để đính kèm hồ sơ">
          <P.UploadZone files={shots} readOnly={ro} onAdd={addShot} onRemove={(id) => setShots((s) => s.filter((x) => x.id !== id))}
            label="Tải ảnh chụp màn hình tra cứu" hint="Kết quả tra cứu ngăn chặn QSDĐ, toà án, đăng kiểm…" />
          {shots.length === 0 && !ro && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-warning)", padding: "8px 10px", background: "var(--bg-warning)", border: "1px solid var(--border-warning)", borderRadius: "var(--radius-md)" }}>
              <L.AlertTriangle size={14} /> Cần đính kèm ít nhất 1 ảnh tra cứu để tiếp tục.
            </div>
          )}
        </Panel>
      </div>
    );
  } else if (step === 3) {
    body = <DraftWorkspace tabs={picked} ocrDocs={ocr} compact={compact} addOptions={addOptions} onAddTemplate={addTemplate} readOnly={ro} drafter={drafter}
      savedHtml={draftHtml} onContentChange={(tabId, html) => setDraftHtml((m) => ({ ...m, [tabId]: html }))} />;
  } else {
    body = (
      <window.VAPrintStep
        picked={picked} scanImages={D.scanImages} shots={shots}
        cfgs={printCfgs} setCfgs={setPrintCfgs} ro={ro} saving={saving}
        drafter={drafter} setDrafterByName={setDrafterByName} drafterOptions={VS.VA_DRAFTERS} meName={meName}
        onPrint={finishDraft} draftHtml={draftHtml} onPrintNow={printNow}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, padding: "0 24px 16px" }}>
      {mode !== "new" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 0 -2px", padding: "8px 12px", borderRadius: "var(--radius-md)", fontSize: 12.5, fontWeight: 500, background: ro ? "var(--bg-overlay)" : "var(--bg-info)", border: "1px solid " + (ro ? "var(--border-default)" : "var(--border-info)"), color: ro ? "var(--text-secondary)" : "var(--text-info)" }}>
          {ro ? <L.Eye size={15} /> : <L.Pencil size={15} />}
          {ro ? "Chế độ chỉ xem — phiên đang chờ chốt số công chứng, không thể chỉnh sửa." : "Đang mở để chỉnh sửa — bấm vào các bước trên để sửa giấy tờ, biểu mẫu hoặc in lại."}
        </div>
      )}
      <Stepper step={step} setStep={go} maxReached={maxReached} />
      <div style={{ flex: 1, minHeight: 0, overflow: step === 3 ? "hidden" : "auto", display: "flex", flexDirection: "column" }}>{body}</div>
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14 }}>
        <Button variant="ghost" icon={L.ArrowLeft} onClick={() => step === 0 ? (onExit && onExit()) : go(step - 1)}>{step === 0 ? "Về tổng quan" : "Quay lại"}</Button>
        <div style={{ display: "flex", gap: 10 }}>
          {ro
            ? <Button variant="secondary" onClick={() => onExit && onExit()}>Đóng</Button>
            : <>
                <Button variant="secondary" disabled={saving} onClick={saveDraft}>Lưu nháp</Button>
                {step < 4 && <Button variant="primary" icon={L.ArrowRight} disabled={!canNext || saving} onClick={goNext}>Tiếp tục</Button>}
              </>}
        </div>
      </div>
      {toast && (
        <div style={{ position: "fixed", right: 24, bottom: 24, zIndex: 90 }}>
          <window.FSICheckinDesignSystem_019df8.Toast tone={toast.tone || "success"} title={toast.title} message={toast.message} onClose={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}

function Stepper2({ icon, label, value, onChange, badge, disabled }) {
  const L = window.LucideReact;
  const Icon = L[icon];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: disabled ? .6 : 1 }}>
      <Icon size={16} color="var(--text-tertiary)" />
      <span style={{ flex: 1, fontSize: 13 }}>{label}</span>
      {badge && <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-warning)", border: "1px solid var(--border-warning)", borderRadius: 4, padding: "1px 5px", letterSpacing: ".04em" }}>{badge}</span>}
      <div style={{ display: "flex", alignItems: "center", border: "1px solid var(--border-default)", borderRadius: 7, overflow: "hidden" }}>
        <button type="button" disabled={disabled} onClick={() => !disabled && onChange(Math.max(0, value - 1))} style={qtyBtn}>–</button>
        <span style={{ width: 30, textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 13.5, borderLeft: "1px solid var(--border-subtle)", borderRight: "1px solid var(--border-subtle)", padding: "5px 0" }}>{value}</span>
        <button type="button" disabled={disabled} onClick={() => !disabled && onChange(value + 1)} style={qtyBtn}>+</button>
      </div>
    </div>
  );
}
const qtyBtn = { width: 28, textAlign: "center", border: "none", background: "transparent", cursor: "pointer", fontSize: 16, color: "var(--text-secondary)", fontFamily: "var(--font-sans)" };

const LAYOUT_OPTS = [
  { v: "combine", label: "Ghép", icon: "LayoutGrid", hint: "tiết kiệm" },
  { v: "single", label: "1/trang", icon: "File", hint: "" },
  { v: "off", label: "Không in", icon: "Ban", hint: "" },
];
function AttachGroupRow({ type, count, hue, layout, sheets, disabled, onChange }) {
  const L = window.LucideReact;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", background: "var(--bg-surface)", flexWrap: "wrap" }}>
      <span style={{ width: 30, height: 30, borderRadius: 7, flexShrink: 0, display: "grid", placeItems: "center", background: `linear-gradient(135deg, hsl(${hue} 38% 90%), hsl(${hue} 30% 78%))` }}>
        <L.Files size={15} color={`hsl(${hue} 42% 42%)`} />
      </span>
      <div style={{ minWidth: 90, flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{type}</div>
        <div style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{count} ảnh · {sheets} khổ A4</div>
      </div>
      <div style={{ display: "flex", border: "1px solid var(--border-default)", borderRadius: 7, overflow: "hidden" }}>
        {LAYOUT_OPTS.map((o, i) => {
          const on = layout === o.v;
          const Ico = L[o.icon];
          return (
            <button key={o.v} type="button" disabled={disabled} onClick={() => !disabled && onChange(o.v)} title={o.hint}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 9px", border: "none", borderLeft: i ? "1px solid var(--border-subtle)" : "none", cursor: disabled ? "default" : "pointer", fontFamily: "var(--font-sans)", fontSize: 11.5, fontWeight: on ? 600 : 500, color: on ? "var(--accent)" : "var(--text-tertiary)", background: on ? "var(--accent-muted)" : "transparent" }}>
              <Ico size={12} /> {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToggleRow({ icon, label, on, onToggle }) {
  const L = window.LucideReact;
  const Icon = L[icon];
  return (
    <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--border-default)", borderRadius: "var(--radius-md)", cursor: "pointer", background: on ? "var(--accent-muted)" : "var(--bg-surface)" }}>
      <Icon size={16} color={on ? "var(--accent)" : "var(--text-tertiary)"} />
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: on ? "var(--accent-hover)" : "var(--text-primary)" }}>{label}</span>
      <span style={{ width: 36, height: 20, borderRadius: 10, background: on ? "var(--accent)" : "var(--border-strong)", position: "relative", transition: "background .15s", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 2, left: on ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
      </span>
    </div>
  );
}

function Sum({ label, v }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{v} bản</span>
    </div>
  );
}

window.FlowA = FlowA;
window.VAPanel = Panel;

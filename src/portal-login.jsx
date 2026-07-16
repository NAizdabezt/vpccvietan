/* global React, window */
/* Trang đăng nhập chung — xác thực thật qua API (server/), định tuyến theo
   vai_tro trả về từ JWT. Không còn "?role=" giả danh trên URL. */
const { useState: useStatePL } = React;

// Ưu tiên trang đích khi 1 tài khoản có nhiều vai trò cùng lúc.
const DEST_BY_ROLE = [
  { vaiTro: "QTHT", dest: "Quản trị hệ thống.html" },
  { vaiTro: "LANH_DAO", dest: "Quản trị - Dashboard.html" },
  { vaiTro: "THU_NGAN", dest: "Thu ngân.html" },
  { vaiTro: "KE_TOAN", dest: "Kế toán.html" },
  { vaiTro: "LUU_TRU", dest: "Lưu trữ - Số hóa.html" },
  { vaiTro: "CCV", dest: "index.html" },
  { vaiTro: "TKNV", dest: "index.html" },
];
function destFor(vaiTroArr) {
  const found = DEST_BY_ROLE.find((d) => (vaiTroArr || []).includes(d.vaiTro));
  return found ? found.dest : "index.html";
}

// Chỉ để tiện điền nhanh lúc demo — KHÔNG còn dùng để xác thực, form vẫn phải
// gọi API thật và server mới là nơi quyết định đúng/sai.
const DEMO_ACCOUNTS = [
  { label: "Quản trị viên", desc: "Thiết kế luồng & phân quyền", icon: "Settings", user: "can.nv" },
  { label: "Lãnh đạo", desc: "Dashboard điều hành & doanh thu", icon: "LineChart", user: "gd.vpcc" },
  { label: "Công chứng viên", desc: "Ký & cấp số công chứng", icon: "FileSignature", user: "viet.nq" },
  { label: "Thư ký nghiệp vụ", desc: "Soạn thảo & tiếp nhận", icon: "PenLine", user: "linh.tt" },
  { label: "Thu ngân", desc: "Thu phí & phiếu thu", icon: "Wallet", user: "ha.ptt" },
  { label: "Kế toán", desc: "Đối soát & hóa đơn", icon: "Calculator", user: "ke.dv" },
  { label: "Lưu trữ", desc: "Số hóa & liên thông CMC", icon: "Archive", user: "tuan.hm" },
];
const DEMO_PW = "Vietan@2026";

function PortalLogin() {
  const L = window.LucideReact;
  const { Button, Input, Checkbox } = window.FSICheckinDesignSystem_019df8;
  const [user, setUser] = useStatePL("");
  const [pw, setPw] = useStatePL("");
  const [show, setShow] = useStatePL(false);
  const [err, setErr] = useStatePL("");
  const [busy, setBusy] = useStatePL(false);
  // REQ-050: lần đăng nhập đầu (lastLogin null trước đó) — bắt đổi mật khẩu mặc
  // định ngay tại đây trước khi cho vào phân hệ, chưa cần trang riêng.
  const [mustChange, setMustChange] = useStatePL(null); // null | { vaiTro }
  const [newPw, setNewPw] = useStatePL("");
  const [newPw2, setNewPw2] = useStatePL("");

  const fill = (acc) => { setUser(acc.user); setPw(DEMO_PW); setErr(""); };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr("");
    try {
      const { nhanVien, mustChangePassword } = await window.VAApi.login(user.trim(), pw);
      if (mustChangePassword) {
        setMustChange({ vaiTro: nhanVien.vaiTro });
      } else {
        window.location.href = encodeURI(destFor(nhanVien.vaiTro));
      }
    } catch (e2) {
      setErr(e2.message || "Tên đăng nhập hoặc mật khẩu không đúng.");
    } finally {
      setBusy(false);
    }
  };

  const submitNewPassword = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (newPw.length < 6) { setErr("Mật khẩu mới phải có ít nhất 6 ký tự."); return; }
    if (newPw !== newPw2) { setErr("Xác nhận mật khẩu không khớp."); return; }
    setBusy(true);
    setErr("");
    try {
      await window.VAApi.doiMatKhau(pw, newPw);
      window.location.href = encodeURI(destFor(mustChange.vaiTro));
    } catch (e2) {
      setErr(e2.message || "Không đổi được mật khẩu.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,460px) minmax(0,1fr)", height: "100%", fontFamily: "var(--font-sans)" }}>
      {/* Brand panel */}
      <div style={{
        position: "relative", overflow: "hidden", color: "#fff", padding: "44px 40px",
        display: "flex", flexDirection: "column",
        background: "radial-gradient(620px 380px at 16% 12%, rgba(46,49,146,.55), transparent 60%), radial-gradient(560px 420px at 92% 96%, rgba(37,99,235,.40), transparent 58%), var(--fsi-ink)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "8px 12px", display: "inline-flex" }}>
            <img src="assets/logo-fsi.png" alt="FSI" style={{ height: 28, width: "auto" }} />
          </div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Công chứng số</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,.62)" }}>VPCC Việt An</div>
          </div>
        </div>

        <div style={{ marginTop: "auto", marginBottom: "auto", paddingTop: 36 }}>
          <h1 style={{ fontSize: 27, fontWeight: 700, lineHeight: 1.25, margin: 0, letterSpacing: "-.01em" }}>
            Nền tảng nghiệp vụ<br />công chứng một cửa
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,.66)", margin: "14px 0 28px", lineHeight: 1.6, maxWidth: 340 }}>
            Một tài khoản duy nhất — hệ thống tự định tuyến bạn vào đúng phân hệ theo phân quyền.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[{ icon: "ScanLine", t: "Bóc tách OCR đa tài liệu & VNeID" },
              { icon: "ShieldCheck", t: "Tra cứu ngăn chặn tự động" },
              { icon: "Workflow", t: "Định tuyến liên thông một cửa" }].map((f) => {
              const Icon = L[f.icon];
              return (
                <div key={f.t} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13.5, color: "rgba(255,255,255,.86)" }}>
                  <span style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(255,255,255,.10)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    <Icon size={16} />
                  </span>
                  {f.t}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ fontSize: 11.5, color: "rgba(255,255,255,.45)" }}>
          Chuyển đổi số để thành công · © 2026 FSI Việt Nam
        </div>
      </div>

      {/* Form */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", padding: 24, overflowY: "auto" }}>
        {mustChange ? (
          <form onSubmit={submitNewPassword} style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Đổi mật khẩu lần đầu</h2>
              <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "4px 0 0" }}>Đây là lần đăng nhập đầu tiên — vui lòng đặt mật khẩu mới trước khi tiếp tục.</p>
            </div>

            <Input label="Mật khẩu mới" type={show ? "text" : "password"} placeholder="Ít nhất 6 ký tự" value={newPw} disabled={busy}
              onChange={(e) => { setNewPw(e.target.value); setErr(""); }}
              trailing={
                <button type="button" onClick={() => setShow(!show)} aria-label="Hiện mật khẩu" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", display: "grid", placeItems: "center", padding: 0 }}>
                  {show ? <L.EyeOff size={16} /> : <L.Eye size={16} />}
                </button>
              } />
            <Input label="Nhập lại mật khẩu mới" type={show ? "text" : "password"} placeholder="Nhập lại để xác nhận" value={newPw2} disabled={busy}
              onChange={(e) => { setNewPw2(e.target.value); setErr(""); }} />

            {err ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--danger, #d92d20)", background: "var(--danger-muted, rgba(217,45,32,.08))", border: "1px solid var(--danger, #d92d20)", borderRadius: "var(--radius-md)", padding: "9px 12px" }}>
                <L.AlertCircle size={16} /> {err}
              </div>
            ) : null}

            <Button variant="primary" size="lg" fullWidth type="submit" icon={busy ? L.Loader : L.ShieldCheck} disabled={busy}>
              {busy ? "Đang cập nhật…" : "Đổi mật khẩu & tiếp tục"}
            </Button>
          </form>
        ) : (
          <form onSubmit={submit} style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Đăng nhập</h2>
              <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "4px 0 0" }}>Nhập tài khoản nghiệp vụ của bạn để bắt đầu phiên làm việc.</p>
            </div>

            <Input label="Tên đăng nhập" placeholder="vd: linh.tt" value={user} disabled={busy} onChange={(e) => { setUser(e.target.value); setErr(""); }} />
            <Input
              label="Mật khẩu" type={show ? "text" : "password"} placeholder="••••••••" value={pw} disabled={busy} onChange={(e) => { setPw(e.target.value); setErr(""); }}
              trailing={
                <button type="button" onClick={() => setShow(!show)} aria-label="Hiện mật khẩu" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", display: "grid", placeItems: "center", padding: 0 }}>
                  {show ? <L.EyeOff size={16} /> : <L.Eye size={16} />}
                </button>
              }
            />

            {err ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--danger, #d92d20)", background: "var(--danger-muted, rgba(217,45,32,.08))", border: "1px solid var(--danger, #d92d20)", borderRadius: "var(--radius-md)", padding: "9px 12px" }}>
                <L.AlertCircle size={16} /> {err}
              </div>
            ) : null}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Checkbox label="Ghi nhớ đăng nhập" defaultChecked />
              <a style={{ fontSize: 13, color: "var(--accent)", cursor: "pointer", fontWeight: 500 }}>Quên mật khẩu?</a>
            </div>

            <Button variant="primary" size="lg" fullWidth type="submit" icon={busy ? L.Loader : L.LogIn} disabled={busy}>
              {busy ? "Đang xác thực…" : "Đăng nhập"}
            </Button>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--text-tertiary)", marginBottom: 8 }}>Tài khoản demo — điền nhanh</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {DEMO_ACCOUNTS.map((acc) => (
                  <button key={acc.user} type="button" onClick={() => fill(acc)} title={acc.desc} style={{
                    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: "var(--radius-full)",
                    border: "1px solid var(--border-default)", background: "var(--bg-surface)", color: "var(--text-secondary)",
                    fontSize: 12, cursor: "pointer",
                  }}>
                    {L[acc.icon] ? React.createElement(L[acc.icon], { size: 12 }) : null} {acc.label}
                  </button>
                ))}
              </div>
            </div>

            <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center", margin: 0 }}>
              Cần hỗ trợ tài khoản? Liên hệ quản trị viên văn phòng.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

window.PortalLogin = PortalLogin;

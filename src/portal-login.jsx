/* global React, window */
/* Trang đăng nhập chung — một form, định tuyến theo tài khoản */
const { useState: useStatePL } = React;

const DEMO_PW = "vietan@2026";

const PORTAL_ACCOUNTS = [
  { id: "admin",   label: "Quản trị viên",     desc: "Thiết kế luồng & phân quyền",      icon: "Settings",      user: "admin.va",  dest: "Quản trị hệ thống.html",    q: "admin" },
  { id: "leader",  label: "Lãnh đạo",          desc: "Dashboard điều hành & doanh thu",  icon: "LineChart",     user: "huy.dq",    dest: "Quản trị - Dashboard.html", q: "leader" },
  { id: "ccv",     label: "Công chứng viên",   desc: "Ký & cấp số công chứng",           icon: "FileSignature", user: "viet.nq",   dest: "index.html",                q: "ccv" },
  { id: "tknv",    label: "Thư ký nghiệp vụ",  desc: "Soạn thảo & tiếp nhận",            icon: "PenLine",       user: "linh.tt",   dest: "index.html",                q: "tknv" },
  { id: "cashier", label: "Thu ngân",          desc: "Thu phí & phiếu thu",              icon: "Wallet",        user: "hoa.nt",    dest: "Thu ngân.html",             q: "cashier" },
  { id: "acct",    label: "Kế toán",           desc: "Đối soát & hóa đơn",               icon: "Calculator",    user: "mai.lt",    dest: "Kế toán.html",              q: "acct" },
  { id: "luutru",  label: "Lưu trữ",           desc: "Số hóa & liên thông CMC",          icon: "Archive",       user: "tuan.hm",   dest: "Lưu trữ - Số hóa.html",     q: "luutru" },
];

function PortalLogin() {
  const L = window.LucideReact;
  const { Button, Input, Checkbox } = window.FSICheckinDesignSystem_019df8;
  const [user, setUser] = useStatePL("");
  const [pw, setPw] = useStatePL("");
  const [show, setShow] = useStatePL(false);
  const [err, setErr] = useStatePL("");

  const fill = (acc) => { setUser(acc.user); setPw(DEMO_PW); setErr(""); };

  const submit = (e) => {
    e.preventDefault();
    const acc = PORTAL_ACCOUNTS.find((a) => a.user.toLowerCase() === user.trim().toLowerCase());
    if (!acc || pw !== DEMO_PW) {
      setErr("Tên đăng nhập hoặc mật khẩu không đúng.");
      return;
    }
    window.location.href = encodeURI(acc.dest) + "?role=" + acc.q;
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
        <form onSubmit={submit} style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Đăng nhập</h2>
            <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "4px 0 0" }}>Nhập tài khoản nghiệp vụ của bạn để bắt đầu phiên làm việc.</p>
          </div>

          <Input label="Tên đăng nhập" placeholder="vd: linh.tt" value={user} onChange={(e) => { setUser(e.target.value); setErr(""); }} />
          <Input
            label="Mật khẩu" type={show ? "text" : "password"} placeholder="••••••••" value={pw} onChange={(e) => { setPw(e.target.value); setErr(""); }}
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

          <Button variant="primary" size="lg" fullWidth type="submit" icon={L.LogIn}>
            Đăng nhập
          </Button>

          <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center", margin: 0 }}>
            Cần hỗ trợ tài khoản? Liên hệ quản trị viên văn phòng.
          </p>
        </form>
      </div>
    </div>
  );
}

window.PortalLogin = PortalLogin;

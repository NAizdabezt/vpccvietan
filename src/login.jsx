/* global React, window */
/* Màn đăng nhập — VPCC Việt An (brand panel theo FSI Design System) */
const { useState: useStateL } = React;

function Login({ onLogin }) {
  const L = window.LucideReact;
  const { Button, Input, Checkbox } = window.FSICheckinDesignSystem_019df8;
  const [user, setUser] = useStateL("linh.tt");
  const [pw, setPw] = useStateL("••••••••");
  const [show, setShow] = useStateL(false);

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
            Soạn thảo, bóc tách OCR, tra cứu ngăn chặn và liên thông xuyên suốt các khâu trong một phiên giao dịch.
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-base)", padding: 24 }}>
        <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} style={{ width: "100%", maxWidth: 364, display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Đăng nhập</h2>
            <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", margin: "4px 0 0" }}>Chào mừng trở lại — đăng nhập để bắt đầu phiên làm việc.</p>
          </div>

          <Input label="Tên đăng nhập" value={user} onChange={(e) => setUser(e.target.value)} placeholder="Tên tài khoản" />
          <Input
            label="Mật khẩu" type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)}
            placeholder="Mật khẩu"
            trailing={
              <button type="button" onClick={() => setShow(!show)} aria-label="Hiện mật khẩu" style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-tertiary)", display: "grid", placeItems: "center", padding: 0 }}>
                {show ? <L.EyeOff size={16} /> : <L.Eye size={16} />}
              </button>
            }
          />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Checkbox label="Ghi nhớ đăng nhập" defaultChecked />
            <a style={{ fontSize: 13, color: "var(--accent)", cursor: "pointer", fontWeight: 500 }}>Quên mật khẩu?</a>
          </div>

          <Button variant="primary" size="lg" fullWidth type="submit">Đăng nhập</Button>

          <p style={{ fontSize: 12, color: "var(--text-tertiary)", textAlign: "center", margin: 0 }}>
            Cần hỗ trợ tài khoản? Liên hệ quản trị viên văn phòng.
          </p>
        </form>
      </div>
    </div>
  );
}

window.Login = Login;

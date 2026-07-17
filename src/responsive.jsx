/* global React, window */
/* Responsive dùng chung cho mọi phân hệ. Toàn bộ UI style inline (không dùng
   class) nên media query CSS không đè được — thay bằng hook viewport + render
   có điều kiện:
   - useViewport(): "mobile" (<640) | "tablet" (<1024) | "desktop"
   - SidebarShell: desktop giữ sidebar cố định; màn hẹp thu thành nút menu nổi
     (góc trên trái) mở drawer trượt — bấm 1 mục điều hướng là tự đóng.
   Quy ước dùng ở các màn: vp !== "desktop" → xếp chồng các grid 2 cột chính,
   bảng rộng bọc overflowX auto. */

function useViewport() {
  const bucket = (w) => (w < 640 ? "mobile" : w < 1024 ? "tablet" : "desktop");
  const [vp, setVp] = React.useState(() => bucket(window.innerWidth));
  React.useEffect(() => {
    let t = null;
    const on = () => { clearTimeout(t); t = setTimeout(() => setVp(bucket(window.innerWidth)), 80); };
    window.addEventListener("resize", on);
    return () => { clearTimeout(t); window.removeEventListener("resize", on); };
  }, []);
  return vp;
}

function SidebarShell({ children }) {
  const L = window.LucideReact;
  const vp = useViewport();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => { if (vp === "desktop" && open) setOpen(false); }, [vp]);
  if (vp === "desktop") return children;
  return (
    <>
      <button type="button" aria-label="Mở menu" onClick={() => setOpen(true)} style={{
        position: "fixed", top: 10, left: 12, zIndex: 70, width: 38, height: 38,
        borderRadius: "var(--radius-md)", border: "1px solid var(--border-default)",
        background: "var(--bg-surface)", color: "var(--text-secondary)",
        display: "grid", placeItems: "center", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,.10)",
      }}><L.Menu size={18} /></button>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(15,23,42,.45)", display: "flex" }}>
          <div
            onClick={(e) => e.stopPropagation()}
            onClickCapture={(e) => { if (e.target.closest("a")) setOpen(false); }}
            style={{ height: "100%", display: "flex", boxShadow: "0 10px 30px rgba(0,0,0,.28)" }}
          >
            {children}
          </div>
        </div>
      )}
    </>
  );
}

/* Topbar các phân hệ: chừa chỗ cho nút menu nổi khi sidebar đã thu gọn. */
function topbarPad(vp) {
  return vp === "desktop" ? "0 20px" : "0 14px 0 60px";
}

window.VAUi = { useViewport, SidebarShell, topbarPad };

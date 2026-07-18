/* global React, window */
/* Chụp ảnh THẬT dùng chung cho các màn cần đính kèm ảnh — thay cho các mock
   trước đây (màu ngẫu nhiên/UploadZone không có ảnh thật). Có 2 kiểu:
   - MobileCameraPicker: input file "capture=environment" — mở thẳng camera
     SAU của điện thoại qua bộ chọn ảnh gốc của hệ điều hành. Đơn giản, không
     cần xin quyền getUserMedia, chạy ổn định trên mọi trình duyệt di động.
   - DesktopCameraCapture: getUserMedia thật + <video> xem trực tiếp + nút
     "Chụp" vẽ khung hình hiện tại vào canvas ẩn rồi xuất ra File — dùng cho
     camera cố định gắn máy tính (CCV chụp ảnh tại quầy). */
const { useState: useCap, useRef: useRefCap, useEffect: useEffCap } = React;

function MobileCameraPicker({ onCapture, label, icon, disabled, size, variant }) {
  const L = window.LucideReact;
  const Icon = icon || L.Camera;
  // iOS Safari ÂM THẦM bỏ qua input.click() gọi gián tiếp lên <input type=file>
  // đang display:none (không lỗi console nào — đúng triệu chứng "bấm không có
  // gì xảy ra" trên iPhone). Cách chống lỗi chuẩn: <label> bọc input thật để
  // HỆ ĐIỀU HÀNH tự mở camera khi chạm (kích hoạt native, không qua JS), và
  // giấu input bằng absolute+opacity thay vì display:none.
  const sizes = {
    sm: { padding: "6px 12px", fontSize: 13, gap: 6, icon: 14 },
    md: { padding: "9px 16px", fontSize: 14, gap: 8, icon: 16 },
  };
  const s = sizes[size] || sizes.sm;
  const isPrimary = variant === "primary";
  return (
    <label style={{
      position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: s.gap,
      padding: s.padding, fontSize: s.fontSize, fontWeight: 500, fontFamily: "var(--font-sans)",
      borderRadius: "var(--radius-md)", cursor: disabled ? "default" : "pointer", whiteSpace: "nowrap",
      border: "1px solid " + (isPrimary ? "var(--accent)" : "var(--border-default)"),
      background: isPrimary ? "var(--accent)" : "var(--bg-surface)",
      color: isPrimary ? "#fff" : "var(--text-primary)",
      boxShadow: "var(--shadow-xs)", opacity: disabled ? .6 : 1, overflow: "hidden",
    }}>
      <input type="file" accept="image/*" capture="environment" disabled={disabled}
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
        onChange={(e) => {
          const f = e.target.files && e.target.files[0];
          e.target.value = ""; // cho phép chụp lại cùng 1 "file" nhiều lần liên tiếp
          if (f) onCapture(f);
        }} />
      <Icon size={s.icon} />
      {label || "Chụp ảnh"}
    </label>
  );
}

function DesktopCameraCapture({ onCapture }) {
  const L = window.LucideReact;
  const { Button } = window.FSICheckinDesignSystem_019df8;
  const videoRef = useRefCap(null);
  const [stream, setStream] = useCap(null);
  const [error, setError] = useCap("");
  const [starting, setStarting] = useCap(false);

  const start = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Trình duyệt này không hỗ trợ truy cập camera.");
      return;
    }
    setStarting(true); setError("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 960 } } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (e) {
      setError(
        e.name === "NotAllowedError" ? "Bạn chưa cấp quyền dùng camera cho trình duyệt."
        : e.name === "NotFoundError" ? "Không tìm thấy camera nào được kết nối."
        : "Không thể mở camera: " + (e.message || e.name)
      );
    } finally {
      setStarting(false);
    }
  };

  // Tắt camera khi rời màn hoặc đổi stream — tránh giữ đèn camera sáng ngầm.
  useEffCap(() => () => { if (stream) stream.getTracks().forEach((t) => t.stop()); }, [stream]);

  const capture = () => {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth; canvas.height = v.videoHeight;
    canvas.getContext("2d").drawImage(v, 0, 0);
    canvas.toBlob((blob) => {
      if (blob) onCapture(new File([blob], "chup-" + Date.now() + ".jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.88);
  };

  return (
    <div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", aspectRatio: "4 / 3", background: "linear-gradient(135deg, #2a2d34, #14161b)", display: "grid", placeItems: "center" }}>
      {stream ? (
        <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : error ? (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,.75)", padding: 16 }}>
          <L.VideoOff size={26} style={{ marginBottom: 6 }} />
          <div style={{ fontSize: 12.5, marginBottom: 10, maxWidth: 240 }}>{error}</div>
          <Button variant="secondary" size="sm" onClick={start}>Thử lại</Button>
        </div>
      ) : (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,.7)" }}>
          <L.Video size={30} style={{ marginBottom: 8 }} />
          <div style={{ fontSize: 12.5, marginBottom: 10 }}>Camera chưa bật</div>
          <Button variant="primary" size="sm" icon={L.Camera} disabled={starting} onClick={start}>{starting ? "Đang mở…" : "Bật camera"}</Button>
        </div>
      )}
      {stream && (
        <span style={{ position: "absolute", top: 10, left: 10, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(22,163,74,.92)", borderRadius: "var(--radius-full)", padding: "3px 9px" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} /> Camera đã kết nối
        </span>
      )}
      {stream && (
        <button type="button" onClick={capture} aria-label="Chụp ảnh" style={{
          position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)",
          width: 56, height: 56, borderRadius: "50%", border: "3px solid rgba(255,255,255,.85)",
          background: "#fff", cursor: "pointer", display: "grid", placeItems: "center",
        }}>
          <L.Camera size={22} color="#111" />
        </button>
      )}
    </div>
  );
}

window.VACapture = { MobileCameraPicker, DesktopCameraCapture };

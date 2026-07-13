/* @ds-bundle: {"format":3,"namespace":"FSICheckinDesignSystem_019df8","components":[{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"Avatar","sourcePath":"components/data-display/Avatar.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"Card","sourcePath":"components/data-display/Card.jsx"},{"name":"StatCard","sourcePath":"components/data-display/StatCard.jsx"},{"name":"Dialog","sourcePath":"components/feedback/Dialog.jsx"},{"name":"Toast","sourcePath":"components/feedback/Toast.jsx"},{"name":"Tooltip","sourcePath":"components/feedback/Tooltip.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"Table","sourcePath":"components/tables/Table.jsx"}],"sourceHashes":{"assets/lucide-react-shim.js":"3813103a702c","components/buttons/Button.jsx":"a88b932f60c0","components/buttons/IconButton.jsx":"1cf7fe46eeb7","components/data-display/Avatar.jsx":"963530af27a2","components/data-display/Badge.jsx":"89d5dfd5091a","components/data-display/Card.jsx":"d6b94ef082d4","components/data-display/StatCard.jsx":"f258eeda0f13","components/feedback/Dialog.jsx":"6b59b0c26a2f","components/feedback/Toast.jsx":"0e5357dea458","components/feedback/Tooltip.jsx":"9d4b794b7d01","components/forms/Checkbox.jsx":"7deca4e9f575","components/forms/Input.jsx":"0688a2ed5e1a","components/forms/Select.jsx":"1441106892f3","components/forms/Switch.jsx":"6698008045b3","components/navigation/Tabs.jsx":"87316379b58e","components/tables/Table.jsx":"7586a2693c49","ui_kits/fsi-checkin/AppShell.jsx":"3bb578437e30","ui_kits/fsi-checkin/Approvals.jsx":"8f9a8262263c","ui_kits/fsi-checkin/Attendance.jsx":"f29079381519","ui_kits/fsi-checkin/Dashboard.jsx":"0400b772487f","ui_kits/fsi-checkin/Login.jsx":"3384e8f71767","ui_kits/fsi-checkin/MobileCheckin.jsx":"090ee1a8524f","ui_kits/fsi-checkin/Payroll.jsx":"2d54b6e9d2cc","ui_kits/fsi-checkin/SiteManagement.jsx":"c692e3726e40","ui_kits/fsi-checkin/Users.jsx":"04698454fee4"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FSICheckinDesignSystem_019df8 = window.FSICheckinDesignSystem_019df8 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// assets/lucide-react-shim.js
try { (() => {
/* FSI Checkin DS — Lucide → React shim.
   The lucide-react UMD build does not expose icon components on the global,
   so we build them from the vanilla `lucide` UMD (window.lucide), which ships
   icon node data. Load order: React → lucide(vanilla) → this file.
   Exposes window.LucideReact.<IconName> as React components with the usual
   { size, color, strokeWidth, style, className } props. */
(function () {
  if (typeof React === "undefined" || typeof window.lucide === "undefined") {
    console.warn("[lucide-shim] React or window.lucide not found");
    window.LucideReact = window.LucideReact || {};
    return;
  }
  function buildChildren(nodes) {
    return (nodes || []).map(function (child, i) {
      var tag = child[0];
      var attrs = child[1] || {};
      var kids = child[2];
      var props = Object.assign({
        key: i
      }, attrs);
      return React.createElement(tag, props, kids ? buildChildren(kids) : undefined);
    });
  }
  function makeIcon(node, name) {
    function Icon(props) {
      props = props || {};
      var size = props.size == null ? 24 : props.size;
      var stroke = props.color || "currentColor";
      var sw = props.strokeWidth == null ? 2 : props.strokeWidth;
      var svgChildren = node[2] || [];
      return React.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        width: size,
        height: size,
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: stroke,
        strokeWidth: sw,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        style: props.style,
        className: props.className,
        "aria-hidden": "true"
      }, buildChildren(svgChildren));
    }
    Icon.displayName = name;
    return Icon;
  }
  var src = window.lucide.icons || window.lucide;
  var out = {};
  Object.keys(src).forEach(function (name) {
    var node = src[name];
    if (Array.isArray(node)) out[name] = makeIcon(node, name);
  });
  window.LucideReact = out;
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "assets/lucide-react-shim.js", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
/**
 * FSI Checkin — Button
 * Enterprise-blue primary action with secondary / ghost / danger variants.
 * Soft 8px radius, subtle press-shrink, optional leading icon + loading spinner.
 */
function Button({
  children,
  variant = "primary",
  size = "md",
  icon: Icon = null,
  loading = false,
  disabled = false,
  fullWidth = false,
  type = "button",
  onClick,
  style = {}
}) {
  const sizes = {
    sm: {
      padding: "6px 12px",
      fontSize: 13,
      gap: 6,
      iconSize: 14
    },
    md: {
      padding: "9px 16px",
      fontSize: 14,
      gap: 8,
      iconSize: 16
    },
    lg: {
      padding: "11px 20px",
      fontSize: 15,
      gap: 8,
      iconSize: 18
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary: {
      background: "var(--accent)",
      color: "#fff",
      border: "1px solid var(--accent)",
      boxShadow: "var(--shadow-accent)"
    },
    secondary: {
      background: "var(--bg-surface)",
      color: "var(--text-primary)",
      border: "1px solid var(--border-default)",
      boxShadow: "var(--shadow-xs)"
    },
    ghost: {
      background: "transparent",
      color: "var(--text-secondary)",
      border: "1px solid transparent",
      boxShadow: "none"
    },
    danger: {
      background: "var(--color-danger)",
      color: "#fff",
      border: "1px solid var(--color-danger)",
      boxShadow: "none"
    }
  };
  const v = variants[variant] || variants.primary;
  const isDisabled = disabled || loading;
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const hoverBg = {
    primary: "var(--accent-hover)",
    secondary: "var(--bg-overlay)",
    ghost: "var(--bg-overlay)",
    danger: "#b91c1c"
  }[variant];
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    onClick: onClick,
    disabled: isDisabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      width: fullWidth ? "100%" : "auto",
      padding: s.padding,
      fontSize: s.fontSize,
      fontWeight: 500,
      fontFamily: "var(--font-sans)",
      lineHeight: 1,
      borderRadius: "var(--radius-lg)",
      cursor: isDisabled ? "not-allowed" : "pointer",
      opacity: isDisabled ? 0.6 : 1,
      transition: "background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)",
      transform: active && !isDisabled ? "scale(var(--press-scale))" : "scale(1)",
      ...v,
      background: hover && !isDisabled ? hoverBg : v.background,
      ...style
    }
  }, loading && /*#__PURE__*/React.createElement("span", {
    style: {
      width: s.iconSize,
      height: s.iconSize,
      border: "2px solid rgba(255,255,255,0.35)",
      borderTopColor: variant === "secondary" || variant === "ghost" ? "var(--text-secondary)" : "#fff",
      borderRadius: "50%",
      display: "inline-block",
      animation: "fsi-spin 0.6s linear infinite"
    }
  }), !loading && Icon && /*#__PURE__*/React.createElement(Icon, {
    size: s.iconSize,
    strokeWidth: 2
  }), children, /*#__PURE__*/React.createElement("style", null, `@keyframes fsi-spin{to{transform:rotate(360deg)}}`));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
/**
 * FSI Checkin — IconButton
 * Square, borderless icon trigger for toolbars/topbar (bell, menu, more).
 * Hover paints a soft overlay fill; used at 28–32px hit targets.
 */
function IconButton({
  icon: Icon,
  size = "md",
  active = false,
  badge = null,
  "aria-label": ariaLabel,
  onClick,
  style = {}
}) {
  const sizes = {
    sm: {
      box: 28,
      icon: 16
    },
    md: {
      box: 32,
      icon: 18
    },
    lg: {
      box: 38,
      icon: 20
    }
  };
  const s = sizes[size] || sizes.md;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": ariaLabel,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: "relative",
      width: s.box,
      height: s.box,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-md)",
      border: "none",
      cursor: "pointer",
      background: active ? "var(--accent-muted)" : hover ? "var(--bg-overlay)" : "transparent",
      color: active ? "var(--accent)" : "var(--text-secondary)",
      transition: "background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)",
      ...style
    }
  }, Icon && /*#__PURE__*/React.createElement(Icon, {
    size: s.icon,
    strokeWidth: 2
  }), badge != null && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -2,
      right: -2,
      minWidth: 16,
      height: 16,
      padding: "0 4px",
      background: "var(--color-danger)",
      color: "#fff",
      fontSize: 10,
      fontWeight: 600,
      fontFamily: "var(--font-sans)",
      borderRadius: "var(--radius-full)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, badge));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Avatar.jsx
try { (() => {
/**
 * FSI Checkin — Avatar
 * Circular initials badge in accent-muted, the app's default identity chip.
 * Falls back to an image when `src` is provided.
 */
function Avatar({
  name = "",
  src = null,
  size = 28,
  tone = "accent",
  style = {}
}) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const tones = {
    accent: {
      bg: "var(--accent-muted)",
      fg: "var(--accent)"
    },
    neutral: {
      bg: "var(--bg-overlay)",
      fg: "var(--text-secondary)"
    },
    success: {
      bg: "var(--bg-success)",
      fg: "var(--text-success)"
    }
  };
  const t = tones[tone] || tones.accent;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      flexShrink: 0,
      borderRadius: "50%",
      background: t.bg,
      color: t.fg,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      fontFamily: "var(--font-sans)",
      fontWeight: 600,
      fontSize: Math.round(size * 0.4),
      ...style
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: name,
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : initial);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
/**
 * FSI Checkin — Badge
 * Small status pill used everywhere: attendance status, leave state,
 * priority, counts. Tone maps to the semantic color triads.
 */
function Badge({
  children,
  tone = "neutral",
  dot = false,
  size = "md",
  style = {}
}) {
  const tones = {
    neutral: {
      bg: "var(--bg-overlay)",
      fg: "var(--text-secondary)"
    },
    accent: {
      bg: "var(--accent-muted)",
      fg: "var(--accent-hover)"
    },
    success: {
      bg: "var(--bg-success)",
      fg: "var(--text-success)"
    },
    warning: {
      bg: "var(--bg-warning)",
      fg: "var(--text-warning)"
    },
    danger: {
      bg: "var(--bg-danger)",
      fg: "var(--text-danger)"
    },
    info: {
      bg: "var(--bg-info)",
      fg: "var(--text-info)"
    }
  };
  const t = tones[tone] || tones.neutral;
  const sizes = {
    sm: {
      fontSize: 11,
      padding: "1px 7px"
    },
    md: {
      fontSize: 12,
      padding: "2px 9px"
    }
  };
  const s = sizes[size] || sizes.md;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      background: t.bg,
      color: t.fg,
      fontFamily: "var(--font-sans)",
      fontWeight: 600,
      fontSize: s.fontSize,
      lineHeight: 1.4,
      padding: s.padding,
      borderRadius: "var(--radius-full)",
      whiteSpace: "nowrap",
      ...style
    }
  }, dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "50%",
      background: "currentColor"
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Card.jsx
try { (() => {
/**
 * FSI Checkin — Card
 * The fundamental surface: white, hairline border, 8px radius. Optional
 * header row (title + action) separated by a divider. Body padding default.
 */
function Card({
  title,
  action,
  children,
  padded = true,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, (title || action) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "11px 16px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 14,
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, title), action), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: padded ? 16 : 0
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Card.jsx", error: String((e && e.message) || e) }); }

// components/data-display/StatCard.jsx
try { (() => {
/**
 * FSI Checkin — StatCard
 * The dashboard KPI tile: UPPERCASE tracked eyebrow, big 28px metric,
 * top-right icon, optional sub-label. `danger` recolors for alerts.
 */
function StatCard({
  label,
  value,
  icon: Icon = null,
  sub,
  danger = false,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      padding: 16,
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      fontWeight: 500,
      color: "var(--text-tertiary)"
    }
  }, label), Icon && /*#__PURE__*/React.createElement(Icon, {
    size: 16,
    strokeWidth: 2,
    color: danger ? "var(--color-danger)" : "var(--text-tertiary)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      fontWeight: 600,
      lineHeight: 1.1,
      color: danger ? "var(--color-danger)" : "var(--text-primary)"
    }
  }, value), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: "var(--text-tertiary)",
      marginTop: 4
    }
  }, sub));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/StatCard.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Dialog.jsx
try { (() => {
/**
 * FSI Checkin — Dialog
 * Centered modal over a dim scrim. Header (title + close), body, and an
 * optional footer action row. Used for confirmations, approve/reject, forms.
 */
function Dialog({
  open,
  title,
  children,
  footer = null,
  onClose,
  width = 440
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    onClick: e => {
      if (e.target === e.currentTarget) onClose && onClose();
    },
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 100,
      background: "rgba(28,28,26,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: width,
      background: "var(--bg-surface)",
      borderRadius: "var(--radius-xl)",
      boxShadow: "var(--shadow-xl)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      maxHeight: "85vh"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontSize: 15,
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, title), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "\u0110\xF3ng",
    style: {
      width: 28,
      height: 28,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "none",
      background: "transparent",
      borderRadius: "var(--radius-md)",
      cursor: "pointer",
      color: "var(--text-tertiary)"
    },
    onMouseEnter: e => e.currentTarget.style.background = "var(--bg-overlay)",
    onMouseLeave: e => e.currentTarget.style.background = "transparent"
  }, /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6L6 18M6 6l12 12"
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 18,
      overflowY: "auto",
      fontSize: 14,
      color: "var(--text-secondary)",
      lineHeight: 1.5
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 8,
      padding: "12px 18px",
      borderTop: "1px solid var(--border-subtle)",
      background: "var(--bg-elevated)"
    }
  }, footer)));
}
Object.assign(__ds_scope, { Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Toast.jsx
try { (() => {
/**
 * FSI Checkin — Toast
 * Inline notification chip (success / error / info / warning) with a leading
 * icon and message. In the app these stack top-right (sonner); here it's a
 * presentational unit you can drop anywhere.
 */
function Toast({
  tone = "success",
  title,
  message,
  onClose,
  style = {}
}) {
  const map = {
    success: {
      bg: "var(--bg-success)",
      border: "var(--border-success)",
      fg: "var(--text-success)",
      path: "M20 6L9 17l-5-5"
    },
    danger: {
      bg: "var(--bg-danger)",
      border: "var(--border-danger)",
      fg: "var(--text-danger)",
      path: "M18 6L6 18M6 6l12 12"
    },
    warning: {
      bg: "var(--bg-warning)",
      border: "var(--border-warning)",
      fg: "var(--text-warning)",
      path: "M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"
    },
    info: {
      bg: "var(--bg-info)",
      border: "var(--border-info)",
      fg: "var(--text-info)",
      path: "M12 16v-4m0-4h.01"
    }
  };
  const t = map[tone] || map.success;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      background: t.bg,
      border: `1px solid ${t.border}`,
      borderRadius: "var(--radius-lg)",
      padding: "11px 13px",
      boxShadow: "var(--shadow-md)",
      minWidth: 280,
      maxWidth: 380,
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: t.fg,
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      flexShrink: 0,
      marginTop: 1
    }
  }, tone === "info" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10"
  }), /*#__PURE__*/React.createElement("path", {
    d: t.path
  })) : /*#__PURE__*/React.createElement("path", {
    d: t.path
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: 13,
      fontWeight: 600,
      color: t.fg
    }
  }, title), message && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: title ? "2px 0 0" : 0,
      fontSize: 13,
      color: "var(--text-secondary)"
    }
  }, message)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "\u0110\xF3ng",
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "var(--text-tertiary)",
      padding: 0,
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M18 6L6 18M6 6l12 12"
  }))));
}
Object.assign(__ds_scope, { Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Toast.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Tooltip.jsx
try { (() => {
/**
 * FSI Checkin — Tooltip
 * Dark hover label on ink. Wraps any element; appears on hover/focus above
 * (default) or below the trigger. Keep copy to a few words.
 */
function Tooltip({
  label,
  children,
  placement = "top",
  style = {}
}) {
  const [show, setShow] = React.useState(false);
  const pos = placement === "bottom" ? {
    top: "calc(100% + 6px)",
    left: "50%",
    transform: "translateX(-50%)"
  } : {
    bottom: "calc(100% + 6px)",
    left: "50%",
    transform: "translateX(-50%)"
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "inline-flex",
      ...style
    },
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false),
    onFocus: () => setShow(true),
    onBlur: () => setShow(false)
  }, children, show && /*#__PURE__*/React.createElement("span", {
    role: "tooltip",
    style: {
      position: "absolute",
      ...pos,
      zIndex: 80,
      background: "var(--fsi-ink)",
      color: "#fff",
      fontFamily: "var(--font-sans)",
      fontSize: 12,
      fontWeight: 500,
      lineHeight: 1.3,
      padding: "5px 9px",
      borderRadius: "var(--radius-md)",
      whiteSpace: "nowrap",
      boxShadow: "var(--shadow-md)",
      pointerEvents: "none"
    }
  }, label));
}
Object.assign(__ds_scope, { Tooltip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Tooltip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
/**
 * FSI Checkin — Checkbox
 * Compact square checkbox in the accent color with a label. Used for
 * "remember me", multi-select rows, filter lists.
 */
function Checkbox({
  label,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  style = {}
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const on = isControlled ? checked : internal;
  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(v => !v);
    onChange && onChange(!on);
  };
  return /*#__PURE__*/React.createElement("label", {
    onClick: toggle,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 8,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      fontFamily: "var(--font-sans)",
      userSelect: "none",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 16,
      height: 16,
      flexShrink: 0,
      borderRadius: "var(--radius-sm)",
      border: `1.5px solid ${on ? "var(--accent)" : "var(--border-strong)"}`,
      background: on ? "var(--accent)" : "var(--bg-surface)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background var(--dur-fast), border-color var(--dur-fast)"
    }
  }, on && /*#__PURE__*/React.createElement("svg", {
    width: "10",
    height: "10",
    viewBox: "0 0 12 12",
    fill: "none"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M2.5 6.2l2.2 2.3L9.5 3.5",
    stroke: "#fff",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)"
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
/**
 * FSI Checkin — Input
 * Text field with the app's inset-well style: muted background that turns
 * white on focus with an accent ring. Supports label, error, and a trailing
 * action slot (e.g. the password eye toggle).
 */
function Input({
  label,
  type = "text",
  placeholder,
  value,
  defaultValue,
  error,
  disabled = false,
  trailing = null,
  onChange,
  style = {}
}) {
  const [focused, setFocused] = React.useState(false);
  const showError = !!error;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: type,
    placeholder: placeholder,
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    style: {
      width: "100%",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      color: "var(--text-primary)",
      background: disabled ? "var(--bg-overlay)" : focused ? "#fff" : "var(--bg-inset)",
      border: `1px solid ${showError ? "var(--color-danger)" : focused ? "var(--accent)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-lg)",
      padding: trailing ? "9px 38px 9px 14px" : "9px 14px",
      outline: "none",
      boxShadow: focused && !showError ? "var(--ring-accent)" : "none",
      transition: "background var(--dur-fast), border-color var(--dur-fast), box-shadow var(--dur-fast)",
      cursor: disabled ? "not-allowed" : "text"
    }
  }), trailing && /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: 12,
      display: "flex",
      color: "var(--text-tertiary)"
    }
  }, trailing)), showError && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--color-danger)"
    }
  }, error));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
/**
 * FSI Checkin — Select
 * Lightweight dropdown select matching the Input inset-well style. Custom
 * popover (not native) so it looks consistent across browsers. Used for
 * filters (phòng ban, tháng, trạng thái) and form fields.
 */
function Select({
  label,
  options = [],
  value,
  defaultValue,
  placeholder = "Chọn…",
  onChange,
  disabled = false,
  style = {}
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? null);
  const current = isControlled ? value : internal;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    function h(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const selected = options.find(o => (typeof o === "string" ? o : o.value) === current);
  const labelOf = o => typeof o === "string" ? o : o.label;
  const valueOf = o => typeof o === "string" ? o : o.value;
  const pick = o => {
    const v = valueOf(o);
    if (!isControlled) setInternal(v);
    onChange && onChange(v);
    setOpen(false);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6,
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      fontWeight: 500,
      color: "var(--text-secondary)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: disabled,
    onClick: () => setOpen(v => !v),
    style: {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      textAlign: "left",
      color: selected ? "var(--text-primary)" : "var(--text-tertiary)",
      background: disabled ? "var(--bg-overlay)" : open ? "#fff" : "var(--bg-inset)",
      border: `1px solid ${open ? "var(--accent)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-lg)",
      padding: "9px 12px",
      cursor: disabled ? "not-allowed" : "pointer",
      boxShadow: open ? "var(--ring-accent)" : "none",
      transition: "background var(--dur-fast), border-color var(--dur-fast), box-shadow var(--dur-fast)"
    }
  }, /*#__PURE__*/React.createElement("span", null, selected ? labelOf(selected) : placeholder), /*#__PURE__*/React.createElement("svg", {
    width: "14",
    height: "14",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--text-tertiary)",
    strokeWidth: "2.5",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    style: {
      transform: open ? "rotate(180deg)" : "none",
      transition: "transform var(--dur-fast)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M6 9l6 6 6-6"
  }))), open && /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      zIndex: 50,
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)",
      padding: 4,
      maxHeight: 240,
      overflowY: "auto"
    }
  }, options.map(o => {
    const v = valueOf(o);
    const on = v === current;
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      type: "button",
      onClick: () => pick(o),
      style: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        textAlign: "left",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        color: on ? "var(--accent)" : "var(--text-secondary)",
        background: on ? "var(--accent-muted)" : "transparent",
        border: "none",
        borderRadius: "var(--radius-md)",
        padding: "8px 10px",
        cursor: "pointer"
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.background = "var(--bg-overlay)";
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.background = "transparent";
      }
    }, labelOf(o), on && /*#__PURE__*/React.createElement("svg", {
      width: "14",
      height: "14",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2.5",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M20 6L9 17l-5-5"
    })));
  }))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
/**
 * FSI Checkin — Switch
 * Pill toggle for binary settings (notifications, GPS enforcement).
 * Accent track when on, grey when off.
 */
function Switch({
  checked,
  defaultChecked,
  disabled = false,
  label,
  onChange,
  style = {}
}) {
  const isControlled = checked !== undefined;
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const on = isControlled ? checked : internal;
  const toggle = () => {
    if (disabled) return;
    if (!isControlled) setInternal(v => !v);
    onChange && onChange(!on);
  };
  const sw = /*#__PURE__*/React.createElement("span", {
    onClick: toggle,
    style: {
      width: 36,
      height: 20,
      flexShrink: 0,
      borderRadius: "var(--radius-full)",
      background: on ? "var(--accent)" : "var(--border-strong)",
      position: "relative",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background var(--dur-normal) var(--ease-standard)",
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 2,
      left: on ? 18 : 2,
      width: 16,
      height: 16,
      borderRadius: "50%",
      background: "#fff",
      boxShadow: "var(--shadow-sm)",
      transition: "left var(--dur-normal) var(--ease-standard)"
    }
  }));
  if (!label) return /*#__PURE__*/React.createElement("span", {
    style: style
  }, sw);
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, sw, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)"
    }
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/**
 * FSI Checkin — Tabs
 * Underline tab bar for switching views within a screen (e.g. Duyệt phép /
 * Duyệt OT, or profile sections). Active tab gets accent text + underline.
 */
function Tabs({
  tabs = [],
  value,
  defaultValue,
  onChange,
  style = {}
}) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue ?? (tabs[0] && tabs[0].id));
  const active = isControlled ? value : internal;
  const select = id => {
    if (!isControlled) setInternal(id);
    onChange && onChange(id);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 4,
      borderBottom: "1px solid var(--border-subtle)",
      fontFamily: "var(--font-sans)",
      ...style
    }
  }, tabs.map(t => {
    const on = t.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: () => select(t.id),
      style: {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "9px 12px",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        fontSize: 14,
        fontWeight: on ? 600 : 500,
        color: on ? "var(--accent)" : "var(--text-tertiary)",
        transition: "color var(--dur-fast)"
      }
    }, t.label, t.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        fontWeight: 600,
        padding: "1px 7px",
        borderRadius: "var(--radius-full)",
        background: on ? "var(--accent-muted)" : "var(--bg-overlay)",
        color: on ? "var(--accent-hover)" : "var(--text-tertiary)"
      }
    }, t.count), /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -1,
        height: 2,
        borderRadius: "2px 2px 0 0",
        background: on ? "var(--accent)" : "transparent"
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/tables/Table.jsx
try { (() => {
/**
 * FSI Checkin — Table
 * Enterprise data table (Fiori/Carbon flavour): sticky uppercase header,
 * hairline row dividers, hover highlight, optional row click. Columns are
 * config objects; cells can render custom content.
 */
function Table({
  columns = [],
  rows = [],
  keyField = "id",
  onRowClick = null,
  dense = false,
  emptyText = "Không có dữ liệu"
}) {
  const [hover, setHover] = React.useState(null);
  const pad = dense ? "7px 12px" : "11px 14px";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      background: "var(--bg-surface)",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "var(--bg-elevated)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      padding: pad,
      textAlign: c.align || "left",
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      color: "var(--text-tertiary)",
      whiteSpace: "nowrap",
      width: c.width
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 && /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length,
    style: {
      padding: "32px 14px",
      textAlign: "center",
      fontSize: 14,
      color: "var(--text-tertiary)"
    }
  }, emptyText)), rows.map((row, ri) => {
    const k = row[keyField] ?? ri;
    return /*#__PURE__*/React.createElement("tr", {
      key: k,
      onClick: onRowClick ? () => onRowClick(row) : undefined,
      onMouseEnter: () => setHover(k),
      onMouseLeave: () => setHover(null),
      style: {
        borderBottom: ri < rows.length - 1 ? "1px solid var(--border-subtle)" : "none",
        cursor: onRowClick ? "pointer" : "default",
        background: hover === k && onRowClick ? "var(--bg-overlay)" : "transparent",
        transition: "background var(--dur-fast)"
      }
    }, columns.map(c => /*#__PURE__*/React.createElement("td", {
      key: c.key,
      style: {
        padding: pad,
        textAlign: c.align || "left",
        fontSize: 13,
        color: "var(--text-secondary)",
        whiteSpace: c.wrap ? "normal" : "nowrap",
        fontVariantNumeric: c.numeric ? "tabular-nums" : "normal",
        fontFamily: c.mono ? "var(--font-mono)" : "inherit"
      }
    }, c.render ? c.render(row[c.key], row) : row[c.key])));
  })))));
}
Object.assign(__ds_scope, { Table });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/tables/Table.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fsi-checkin/AppShell.jsx
try { (() => {
/* global React */
const NAV = [{
  id: "dashboard",
  label: "Tổng quan",
  icon: "LayoutDashboard"
}, {
  id: "checkin",
  label: "Chấm công",
  icon: "CheckSquare"
}, {
  id: "attendance",
  label: "Bảng công",
  icon: "Calendar"
}, {
  id: "leave",
  label: "Nghỉ phép",
  icon: "Umbrella"
}, {
  id: "approvals",
  label: "Duyệt phép",
  icon: "ClipboardCheck"
}, {
  id: "payroll",
  label: "Bảng lương",
  icon: "Wallet"
}, {
  id: "users",
  label: "Nhân sự",
  icon: "Users"
}, {
  id: "sites",
  label: "Sites & GPS",
  icon: "MapPin"
}];
const PAGE_LABELS = {
  dashboard: "Tổng quan",
  checkin: "Chấm công",
  attendance: "Bảng công",
  leave: "Nghỉ phép",
  approvals: "Duyệt phép",
  payroll: "Bảng lương",
  users: "Nhân sự",
  sites: "Sites & GPS"
};
function Sidebar({
  active,
  onNavigate
}) {
  const L = window.LucideReact;
  return /*#__PURE__*/React.createElement("aside", {
    style: {
      width: "var(--sidebar-width)",
      flexShrink: 0,
      background: "var(--bg-sidebar)",
      borderRight: "1px solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "var(--topbar-height)",
      display: "flex",
      alignItems: "center",
      padding: "0 16px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-fsi.png",
    alt: "FSI",
    style: {
      height: 30,
      width: "auto"
    }
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      flex: 1,
      padding: 8,
      display: "flex",
      flexDirection: "column",
      gap: 2,
      overflowY: "auto"
    }
  }, NAV.map(item => {
    const Icon = L[item.icon];
    const on = active === item.id;
    return /*#__PURE__*/React.createElement("a", {
      key: item.id,
      onClick: () => onNavigate(item.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 12px",
        borderRadius: "var(--radius-md)",
        fontSize: 14,
        cursor: "pointer",
        fontWeight: on ? 500 : 400,
        color: on ? "var(--accent)" : "var(--text-tertiary)",
        background: on ? "var(--accent-muted)" : "transparent",
        transition: "background var(--dur-fast), color var(--dur-fast)"
      },
      onMouseEnter: e => {
        if (!on) {
          e.currentTarget.style.background = "var(--bg-overlay)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }
      },
      onMouseLeave: e => {
        if (!on) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-tertiary)";
        }
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      size: 16,
      strokeWidth: 2
    }), /*#__PURE__*/React.createElement("span", null, item.label));
  })));
}
function Topbar({
  active,
  onLogout
}) {
  const {
    IconButton,
    Avatar
  } = window.FSICheckinDesignSystem_019df8;
  const {
    Bell,
    ChevronDown
  } = window.LucideReact;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: "var(--topbar-height)",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      borderBottom: "1px solid var(--border-subtle)",
      background: "var(--bg-base)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-tertiary)"
    }
  }, "FSI Checkin"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-tertiary)",
      margin: "0 6px"
    }
  }, "/"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-primary)",
      fontWeight: 500
    }
  }, PAGE_LABELS[active])), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: Bell,
    badge: 3,
    "aria-label": "Th\xF4ng b\xE1o"
  }), /*#__PURE__*/React.createElement("div", {
    onClick: onLogout,
    title: "\u0110\u0103ng xu\u1EA5t",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "6px 8px",
      borderRadius: "var(--radius-md)",
      cursor: "pointer"
    },
    onMouseEnter: e => e.currentTarget.style.background = "var(--bg-overlay)",
    onMouseLeave: e => e.currentTarget.style.background = "transparent"
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: "HR FSI",
    size: 26
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: "var(--text-secondary)"
    }
  }, "Ph\xF2ng Nh\xE2n s\u1EF1"), /*#__PURE__*/React.createElement(ChevronDown, {
    size: 14,
    color: "var(--text-tertiary)"
  }))));
}
function AppShell({
  active,
  onNavigate,
  onLogout,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100%",
      background: "var(--bg-base)",
      color: "var(--text-primary)",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement(Sidebar, {
    active: active,
    onNavigate: onNavigate
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Topbar, {
    active: active,
    onLogout: onLogout
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: 24
    }
  }, children)));
}
window.AppShell = AppShell;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fsi-checkin/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fsi-checkin/Approvals.jsx
try { (() => {
/* global React */
function Approvals() {
  const {
    Tabs,
    Badge,
    Button,
    Avatar,
    Dialog
  } = window.FSICheckinDesignSystem_019df8;
  const {
    useState
  } = React;
  const leaveReqs = [{
    id: "L1",
    name: "Nguyễn Văn An",
    dept: "Kỹ thuật",
    type: "Nghỉ phép năm",
    range: "10/06 → 12/06",
    days: 3,
    reason: "Về quê có việc gia đình.",
    at: "2 giờ trước"
  }, {
    id: "L2",
    name: "Trần Thị Bích",
    dept: "Nhân sự",
    type: "Nghỉ ốm",
    range: "08/06",
    days: 1,
    reason: "Khám bệnh định kỳ, có giấy bác sĩ.",
    at: "5 giờ trước"
  }, {
    id: "L3",
    name: "Phạm Minh Dũng",
    dept: "Kinh doanh",
    type: "Nghỉ phép năm",
    range: "15/06 → 16/06",
    days: 2,
    reason: "Việc cá nhân.",
    at: "Hôm qua"
  }, {
    id: "L4",
    name: "Vũ Thuỳ Linh",
    dept: "Kế toán",
    type: "Nghỉ không lương",
    range: "20/06",
    days: 1,
    reason: "Giải quyết thủ tục cá nhân.",
    at: "Hôm qua"
  }];
  const otReqs = [{
    id: "O1",
    name: "Lê Hoàng Cường",
    dept: "Kỹ thuật",
    type: "Tăng ca dự án",
    range: "07/06 · 18:00–21:00",
    days: "3h",
    reason: "Hoàn thành bàn giao module triển khai.",
    at: "1 giờ trước"
  }, {
    id: "O2",
    name: "Đỗ Quang Huy",
    dept: "Triển khai",
    type: "Tăng ca cuối tuần",
    range: "08/06 · 08:00–12:00",
    days: "4h",
    reason: "Lắp đặt thiết bị tại site khách hàng.",
    at: "3 giờ trước"
  }];
  const [tab, setTab] = useState("leave");
  const list = tab === "leave" ? leaveReqs : otReqs;
  const [selId, setSelId] = useState(list[0].id);
  const sel = list.find(r => r.id === selId) || list[0];
  const [dialog, setDialog] = useState(null); // {action}

  const onTab = id => {
    setTab(id);
    const l = id === "leave" ? leaveReqs : otReqs;
    setSelId(l[0].id);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--content-max)",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      margin: 0
    }
  }, "Duy\u1EC7t \u0111\u1EC1 ngh\u1ECB"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--text-tertiary)",
      marginTop: 2
    }
  }, "Ngh\u1EC9 ph\xE9p & t\u0103ng ca \u0111ang ch\u1EDD b\u1EA1n x\u1EED l\xFD")), /*#__PURE__*/React.createElement(Tabs, {
    tabs: [{
      id: "leave",
      label: "Nghỉ phép",
      count: leaveReqs.length
    }, {
      id: "ot",
      label: "Tăng ca OT",
      count: otReqs.length
    }],
    value: tab,
    onChange: onTab
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) minmax(0,1.2fr)",
      gap: 16,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden"
    }
  }, list.map((r, i) => {
    const on = r.id === selId;
    return /*#__PURE__*/React.createElement("div", {
      key: r.id,
      onClick: () => setSelId(r.id),
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 14px",
        cursor: "pointer",
        borderBottom: i < list.length - 1 ? "1px solid var(--border-subtle)" : "none",
        borderLeft: `3px solid ${on ? "var(--accent)" : "transparent"}`,
        background: on ? "var(--accent-muted)" : "transparent",
        transition: "background var(--dur-fast)"
      },
      onMouseEnter: e => {
        if (!on) e.currentTarget.style.background = "var(--bg-overlay)";
      },
      onMouseLeave: e => {
        if (!on) e.currentTarget.style.background = "transparent";
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: r.name,
      size: 36
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 14,
        fontWeight: 500,
        margin: 0,
        color: "var(--text-primary)"
      }
    }, r.name), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 12,
        color: "var(--text-tertiary)",
        margin: "1px 0 0",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, r.type, " \xB7 ", r.range)), /*#__PURE__*/React.createElement(Badge, {
      tone: "warning"
    }, "Ch\u1EDD"));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      paddingBottom: 16,
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: sel.name,
    size: 44
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      fontWeight: 600,
      margin: 0
    }
  }, sel.name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--text-tertiary)",
      margin: "2px 0 0"
    }
  }, sel.dept, " \xB7 ", sel.at)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: "auto"
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "warning",
    dot: true
  }, "\u0110ang ch\u1EDD"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 16,
      padding: "16px 0",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "Lo\u1EA1i \u0111\u1EC1 ngh\u1ECB",
    value: sel.type
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Th\u1EDDi gian",
    value: sel.range
  }), /*#__PURE__*/React.createElement(Field, {
    label: "S\u1ED1 ng\xE0y / gi\u1EDD",
    value: String(sel.days),
    mono: true
  }), /*#__PURE__*/React.createElement(Field, {
    label: "Tr\u1EA1ng th\xE1i",
    value: "Ch\u1EDD qu\u1EA3n l\xFD duy\u1EC7t"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "16px 0 20px"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "var(--text-tertiary)",
      margin: "0 0 6px",
      fontWeight: 600
    }
  }, "L\xFD do"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--text-secondary)",
      margin: 0,
      lineHeight: 1.5
    }
  }, sel.reason)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "danger",
    onClick: () => setDialog("reject")
  }, "T\u1EEB ch\u1ED1i"), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    onClick: () => setDialog("approve")
  }, "Duy\u1EC7t")))), /*#__PURE__*/React.createElement(Dialog, {
    open: !!dialog,
    title: dialog === "approve" ? "Xác nhận duyệt" : "Xác nhận từ chối",
    onClose: () => setDialog(null),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      onClick: () => setDialog(null)
    }, "H\u1EE7y"), /*#__PURE__*/React.createElement(Button, {
      variant: dialog === "approve" ? "primary" : "danger",
      onClick: () => setDialog(null)
    }, dialog === "approve" ? "Duyệt" : "Từ chối"))
  }, dialog === "approve" ? "Duyệt" : "Từ chối", " \u0111\u1EC1 ngh\u1ECB c\u1EE7a ", /*#__PURE__*/React.createElement("b", null, sel.name), " (", sel.type, " \xB7 ", sel.range, ")?"));
}
function Field({
  label,
  value,
  mono
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: "0.06em",
      color: "var(--text-tertiary)",
      margin: "0 0 4px",
      fontWeight: 600
    }
  }, label), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--text-primary)",
      margin: 0,
      fontFamily: mono ? "var(--font-mono)" : "inherit"
    }
  }, value));
}
window.Approvals = Approvals;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fsi-checkin/Approvals.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fsi-checkin/Attendance.jsx
try { (() => {
/* global React */
function Attendance() {
  const {
    Badge,
    Avatar,
    IconButton,
    Button
  } = window.FSICheckinDesignSystem_019df8;
  const {
    Search,
    ChevronLeft,
    ChevronRight,
    Download
  } = window.LucideReact;
  const days = Array.from({
    length: 14
  }, (_, i) => i + 1);
  // code: X = đi làm, P = phép, O = OT, "" = chưa, "-" = cuối tuần
  const rows = [{
    name: "Nguyễn Văn An",
    dept: "Kỹ thuật",
    codes: "XXXXX--XXXXX--"
  }, {
    name: "Trần Thị Bích",
    dept: "Nhân sự",
    codes: "XXXPX--XXXXX--"
  }, {
    name: "Lê Hoàng Cường",
    dept: "Kỹ thuật",
    codes: "XXXXO--XXOXX--"
  }, {
    name: "Phạm Minh Dũng",
    dept: "Kinh doanh",
    codes: "XXXXX--XXPPX--"
  }, {
    name: "Vũ Thuỳ Linh",
    dept: "Kế toán",
    codes: "XXXXX--XXXXO--"
  }, {
    name: "Đỗ Quang Huy",
    dept: "Triển khai",
    codes: "XPXXX--XXXXX--"
  }];
  const cellFor = ch => {
    if (ch === "-") return {
      bg: "transparent",
      fg: "var(--text-disabled)",
      label: "·"
    };
    if (ch === "X") return {
      bg: "var(--code-x-bg)",
      fg: "var(--code-x-text)",
      label: "X"
    };
    if (ch === "P") return {
      bg: "var(--code-p-bg)",
      fg: "var(--code-p-text)",
      label: "P"
    };
    if (ch === "O") return {
      bg: "var(--code-o-bg)",
      fg: "var(--code-o-text)",
      label: "O"
    };
    return {
      bg: "var(--bg-inset)",
      fg: "var(--text-disabled)",
      label: ""
    };
  };
  const isWeekend = d => d % 7 === 6 || d % 7 === 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--content-max)",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      margin: 0
    }
  }, "B\u1EA3ng ch\u1EA5m c\xF4ng"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--text-tertiary)",
      marginTop: 2
    }
  }, "Th\xE1ng 6 / 2026 \xB7 48 nh\xE2n vi\xEAn")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 4,
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      padding: "4px 6px"
    }
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: ChevronLeft,
    size: "sm",
    "aria-label": "Tr\u01B0\u1EDBc"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      padding: "0 4px"
    }
  }, "06 / 2026"), /*#__PURE__*/React.createElement(IconButton, {
    icon: ChevronRight,
    size: "sm",
    "aria-label": "Sau"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    icon: Download
  }, "Xu\u1EA5t Excel"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 280
    }
  }, /*#__PURE__*/React.createElement(Search, {
    size: 15,
    color: "var(--text-tertiary)",
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)"
    }
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "T\xECm nh\xE2n vi\xEAn\u2026",
    style: {
      width: "100%",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      padding: "8px 12px 8px 34px",
      background: "var(--bg-inset)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      outline: "none",
      boxSizing: "border-box"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Legend, {
    swatch: "var(--code-x-bg)",
    fg: "var(--code-x-text)",
    code: "X",
    label: "\u0110i l\xE0m"
  }), /*#__PURE__*/React.createElement(Legend, {
    swatch: "var(--code-p-bg)",
    fg: "var(--code-p-text)",
    code: "P",
    label: "Ngh\u1EC9 ph\xE9p"
  }), /*#__PURE__*/React.createElement(Legend, {
    swatch: "var(--code-o-bg)",
    fg: "var(--code-o-text)",
    code: "O",
    label: "T\u0103ng ca"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      borderCollapse: "collapse",
      width: "100%",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", {
    style: {
      background: "var(--bg-elevated)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      textAlign: "left",
      paddingLeft: 16,
      minWidth: 220,
      position: "sticky",
      left: 0,
      background: "var(--bg-elevated)"
    }
  }, "Nh\xE2n vi\xEAn"), days.map(d => /*#__PURE__*/React.createElement("th", {
    key: d,
    style: {
      ...th,
      color: isWeekend(d) ? "var(--text-disabled)" : "var(--text-tertiary)"
    }
  }, String(d).padStart(2, "0"))), /*#__PURE__*/React.createElement("th", {
    style: {
      ...th,
      paddingRight: 16
    }
  }, "C\xF4ng"))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, ri) => {
    const total = r.codes.split("").filter(c => c === "X" || c === "O").length;
    return /*#__PURE__*/React.createElement("tr", {
      key: r.name,
      style: {
        borderBottom: ri < rows.length - 1 ? "1px solid var(--border-subtle)" : "none"
      }
    }, /*#__PURE__*/React.createElement("td", {
      style: {
        padding: "8px 16px",
        position: "sticky",
        left: 0,
        background: "var(--bg-surface)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: r.name,
      size: 28
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 13,
        fontWeight: 500,
        margin: 0,
        whiteSpace: "nowrap"
      }
    }, r.name), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 11,
        color: "var(--text-tertiary)",
        margin: 0
      }
    }, r.dept)))), r.codes.split("").map((ch, di) => {
      const c = cellFor(ch);
      return /*#__PURE__*/React.createElement("td", {
        key: di,
        style: {
          textAlign: "center",
          padding: "6px 0"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "inline-flex",
          width: 24,
          height: 24,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--radius-sm)",
          background: c.bg,
          color: c.fg,
          fontSize: 12,
          fontWeight: 600
        }
      }, c.label));
    }), /*#__PURE__*/React.createElement("td", {
      style: {
        textAlign: "center",
        paddingRight: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "var(--font-mono)"
      }
    }, total)));
  }))))));
}
const th = {
  padding: "9px 4px",
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "var(--text-tertiary)",
  textAlign: "center",
  whiteSpace: "nowrap"
};
function Legend({
  swatch,
  fg,
  code,
  label
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      width: 20,
      height: 20,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-sm)",
      background: swatch,
      color: fg,
      fontSize: 11,
      fontWeight: 700
    }
  }, code), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-secondary)"
    }
  }, label));
}
window.Attendance = Attendance;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fsi-checkin/Attendance.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fsi-checkin/Dashboard.jsx
try { (() => {
/* global React */
function Dashboard({
  onNavigate
}) {
  const {
    StatCard,
    Card,
    Badge,
    Avatar
  } = window.FSICheckinDesignSystem_019df8;
  const {
    Users,
    Clock,
    Calendar,
    AlertTriangle
  } = window.LucideReact;
  const checkins = [{
    name: "Nguyễn Văn An",
    time: "08:02",
    status: "out"
  }, {
    name: "Trần Thị Bích",
    time: "08:14",
    status: "working"
  }, {
    name: "Lê Hoàng Cường",
    time: "08:21",
    status: "working"
  }, {
    name: "Phạm Minh Dũng",
    time: "08:35",
    status: "out"
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--content-max)",
      display: "flex",
      flexDirection: "column",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      margin: 0
    }
  }, "T\u1ED5ng quan"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--text-tertiary)",
      marginTop: 2
    }
  }, "Th\u1EE9 B\u1EA3y, 07 th\xE1ng 6, 2026")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "\u0110i l\xE0m h\xF4m nay",
    value: 48,
    icon: Users,
    sub: "ng\u01B0\u1EDDi \u0111\xE3 check-in"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "OT \u0111ang ch\u1EDD",
    value: 6,
    icon: Clock,
    sub: "\u0111\u1EC1 ngh\u1ECB OT"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Ph\xE9p \u0111ang ch\u1EDD",
    value: 4,
    icon: Calendar,
    sub: "\u0111\u01A1n xin ph\xE9p"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "GPS alerts",
    value: 3,
    icon: AlertTriangle,
    danger: true,
    sub: "check-in \u0111\xE1ng ng\u1EDD"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Check-in h\xF4m nay",
    padded: false,
    action: /*#__PURE__*/React.createElement("a", {
      onClick: () => onNavigate("attendance"),
      style: {
        fontSize: 12,
        color: "var(--accent)",
        textDecoration: "none",
        cursor: "pointer"
      }
    }, "Xem t\u1EA5t c\u1EA3")
  }, checkins.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: c.name,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "10px 16px",
      borderBottom: i < checkins.length - 1 ? "1px solid var(--border-subtle)" : "none"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: c.name
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      fontWeight: 500,
      margin: 0
    }
  }, c.name), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 12,
      color: "var(--text-tertiary)",
      margin: 0,
      fontFamily: "var(--font-mono)"
    }
  }, c.time))), /*#__PURE__*/React.createElement(Badge, {
    tone: c.status === "out" ? "success" : "warning",
    dot: true
  }, c.status === "out" ? "Đã ra" : "Đang làm")))), /*#__PURE__*/React.createElement(Card, {
    title: "Thao t\xE1c nhanh"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(QuickAction, {
    icon: Calendar,
    label: "Duy\u1EC7t ph\xE9p \u0111ang ch\u1EDD",
    count: 4,
    onClick: () => onNavigate("approvals")
  }), /*#__PURE__*/React.createElement(QuickAction, {
    icon: Clock,
    label: "Duy\u1EC7t OT \u0111ang ch\u1EDD",
    count: 6,
    onClick: () => onNavigate("approvals")
  }), /*#__PURE__*/React.createElement(QuickAction, {
    icon: Calendar,
    label: "Xem b\u1EA3ng ch\u1EA5m c\xF4ng",
    onClick: () => onNavigate("attendance")
  })))));
}
function QuickAction({
  icon: Icon,
  label,
  count,
  onClick
}) {
  const {
    Badge
  } = window.FSICheckinDesignSystem_019df8;
  return /*#__PURE__*/React.createElement("a", {
    onClick: onClick,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 16px",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      cursor: "pointer",
      transition: "background var(--dur-fast)"
    },
    onMouseEnter: e => e.currentTarget.style.background = "var(--bg-overlay)",
    onMouseLeave: e => e.currentTarget.style.background = "var(--bg-elevated)"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    size: 16,
    color: "var(--accent)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14
    }
  }, label)), count != null && /*#__PURE__*/React.createElement(Badge, {
    tone: "warning"
  }, count));
}
window.Dashboard = Dashboard;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fsi-checkin/Dashboard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fsi-checkin/Login.jsx
try { (() => {
/* global React */
const {
  useState
} = React;
function Login({
  onLogin
}) {
  const {
    Input,
    Button,
    Checkbox
  } = window.FSICheckinDesignSystem_019df8;
  const {
    Eye,
    EyeOff
  } = window.LucideReact;
  const [showPw, setShowPw] = useState(false);
  const [pw, setPw] = useState("123456");
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100%",
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "42%",
      flexShrink: 0,
      padding: 40,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      background: "var(--fsi-ink)",
      backgroundImage: "radial-gradient(circle at 20% 50%, rgba(37,99,235,0.15) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.03) 0%, transparent 50%)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignSelf: "flex-start",
      background: "#fff",
      borderRadius: "var(--radius-lg)",
      padding: "12px 18px",
      boxShadow: "var(--shadow-md)"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-fsi.png",
    alt: "FSI",
    style: {
      height: 40,
      width: "auto",
      display: "block"
    }
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      color: "#fff",
      fontSize: 26,
      fontWeight: 600,
      lineHeight: 1.3,
      margin: 0
    }
  }, "Qu\u1EA3n l\xFD ch\u1EA5m c\xF4ng", /*#__PURE__*/React.createElement("br", null), "th\xF4ng minh"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,0.5)",
      fontSize: 14,
      lineHeight: 1.6,
      marginTop: 12,
      maxWidth: 320
    }
  }, "H\u1EC7 th\u1ED1ng ch\u1EA5m c\xF4ng GPS, qu\u1EA3n l\xFD nh\xE2n s\u1EF1 v\xE0 hi\u1EC7u su\u1EA5t to\xE0n di\u1EC7n cho doanh nghi\u1EC7p.")), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "rgba(255,255,255,0.2)",
      fontSize: 12,
      margin: 0
    }
  }, "FSI Vietnam \xA9 2026")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#fff",
      padding: "48px 24px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: 360
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 32
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 20,
      fontWeight: 600,
      color: "var(--text-primary)",
      margin: 0
    }
  }, "Ch\xE0o m\u1EEBng tr\u1EDF l\u1EA1i"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--text-tertiary)",
      marginTop: 4
    }
  }, "\u0110\u0103ng nh\u1EADp v\xE0o FSI Checkin")), /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onLogin();
    },
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    type: "email",
    defaultValue: "hr@fsivietnam.com.vn",
    placeholder: "ten@fsivietnam.com.vn"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "M\u1EADt kh\u1EA9u",
    type: showPw ? "text" : "password",
    value: pw,
    onChange: e => setPw(e.target.value),
    trailing: /*#__PURE__*/React.createElement("span", {
      style: {
        cursor: "pointer",
        display: "flex"
      },
      onClick: () => setShowPw(v => !v)
    }, showPw ? /*#__PURE__*/React.createElement(EyeOff, {
      size: 16
    }) : /*#__PURE__*/React.createElement(Eye, {
      size: 16
    }))
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Ghi nh\u1EDB \u0111\u0103ng nh\u1EADp",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    fullWidth: true,
    type: "submit"
  }, "\u0110\u0103ng nh\u1EADp"))))));
}
window.Login = Login;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fsi-checkin/Login.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fsi-checkin/MobileCheckin.jsx
try { (() => {
/* global React */
function MobileCheckin() {
  const {
    Badge
  } = window.FSICheckinDesignSystem_019df8;
  const Stat = ({
    icon,
    val,
    lbl
  }) => /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-surface)",
      border: "1px solid var(--border-subtle)",
      borderRadius: 16,
      padding: 12,
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      boxShadow: "var(--shadow-xs)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16
    }
  }, icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 18,
      fontWeight: 700,
      lineHeight: 1
    }
  }, val), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      color: "var(--text-tertiary)",
      lineHeight: 1.2
    }
  }, lbl));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--text-tertiary)",
      margin: 0,
      textAlign: "center",
      maxWidth: 360
    }
  }, "M\xE0n h\xECnh ch\u1EA5m c\xF4ng l\xE0 m\u1ED9t PWA ch\u1EA1y tr\xEAn \u0111i\u1EC7n tho\u1EA1i c\u1EE7a nh\xE2n vi\xEAn & CTV."), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 360,
      borderRadius: 40,
      padding: 10,
      background: "#0c1018",
      boxShadow: "var(--shadow-xl)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      borderRadius: 30,
      overflow: "hidden",
      background: "var(--bg-base)",
      height: 720,
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 38,
      background: "var(--bg-base)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 22px",
      fontSize: 12,
      fontWeight: 600,
      color: "var(--text-primary)"
    }
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", {
    style: {
      letterSpacing: 1
    }
  }, "\u25CF \u25CF \u25CF")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: "auto",
      padding: 14,
      display: "flex",
      flexDirection: "column",
      gap: 14,
      fontFamily: "var(--font-sans)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: "var(--text-secondary)"
    }
  }, "Th\u1EE9 B\u1EA3y, 07/06"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 600
    }
  }, "Nguy\u1EC5n V\u0103n An")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-surface)",
      borderRadius: 18,
      border: "1px solid var(--border-subtle)",
      boxShadow: "var(--shadow-sm)",
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 18
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      color: "var(--text-tertiary)"
    }
  }, "Ch\u1EA5m c\xF4ng h\xF4m nay"), /*#__PURE__*/React.createElement(Badge, {
    tone: "success"
  }, "\u0110ang l\xE0m vi\u1EC7c")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      background: "var(--bg-base)",
      border: "1px solid var(--border-default)",
      borderRadius: 14,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20
    }
  }, "\uD83C\uDFE2"), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      fontWeight: 600,
      margin: 0
    }
  }, "FSI Tower \u2014 C\u1EA7u Gi\u1EA5y"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: "var(--text-tertiary)",
      margin: 0,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap"
    }
  }, "17 Duy T\xE2n, C\u1EA7u Gi\u1EA5y, H\xE0 N\u1ED9i"))), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 6px",
      borderRadius: 8,
      background: "var(--bg-success)",
      color: "var(--text-success)"
    }
  }, "32m")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr auto 1fr",
      alignItems: "center",
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "var(--text-tertiary)",
      display: "block"
    }
  }, "V\xE0o ca"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 28,
      fontWeight: 500,
      lineHeight: 1
    }
  }, "08:02")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-tertiary)"
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: 10,
      background: "var(--bg-success)",
      color: "var(--text-success)"
    }
  }, "5h 12m")), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.04em",
      color: "var(--text-tertiary)",
      display: "block"
    }
  }, "Ra ca"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: 28,
      fontWeight: 500,
      lineHeight: 1,
      color: "var(--text-tertiary)"
    }
  }, "\u2013:\u2013"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      color: "var(--text-tertiary)"
    }
  }, "Ca l\xE0m vi\u1EC7c \xB7 8h"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      fontWeight: 600,
      color: "var(--text-secondary)"
    }
  }, "65%")), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5,
      background: "var(--border-subtle)",
      borderRadius: 999,
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "100%",
      width: "65%",
      borderRadius: 999,
      background: "linear-gradient(90deg,#0D7A45,#34A768)"
    }
  })))), /*#__PURE__*/React.createElement(ActionRow, {
    icon: "\u2713",
    title: "Ch\u1EA5m v\xE0o ca",
    sub: "08:02 \xB7 FSI Tower",
    tone: "success"
  }), /*#__PURE__*/React.createElement(ActionRow, {
    icon: "\uD83D\uDCF7",
    title: "Ch\u1EA5m ra ca",
    sub: "Ch\u1EE5p \u1EA3nh \xB7 \u0111\u1ECBnh v\u1ECB",
    tone: "danger",
    arrow: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    icon: "\uD83D\uDCC5",
    val: "18",
    lbl: "C\xF4ng/th\xE1ng"
  }), /*#__PURE__*/React.createElement(Stat, {
    icon: "\u23F1",
    val: "6h",
    lbl: "OT th\xE1ng"
  }), /*#__PURE__*/React.createElement(Stat, {
    icon: "\uD83D\uDD25",
    val: "9 ng\xE0y",
    lbl: "Li\xEAn ti\u1EBFp"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 12,
      background: "var(--accent-muted)",
      border: "1px solid var(--accent-border)",
      borderRadius: 16,
      padding: "12px 14px"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 20
    }
  }, "\uD83E\uDD1D"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--text-secondary)",
      margin: 0,
      lineHeight: 1.4
    }
  }, "C\u1EA3m \u01A1n b\u1EA1n \u0111\xE3 \u0111\u1ED3ng h\xE0nh c\xF9ng ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--accent)"
    }
  }, "FSI"), " \u0111\u01B0\u1EE3c ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: "var(--text-primary)"
    }
  }, "412 ng\xE0y")))))));
}
function ActionRow({
  icon,
  title,
  sub,
  tone,
  arrow
}) {
  const iconBg = tone === "success" ? "var(--bg-success)" : tone === "danger" ? "var(--bg-danger)" : "var(--accent-muted)";
  const arrowColor = tone === "danger" ? "var(--color-danger)" : "var(--accent)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: 14,
      borderRadius: 18,
      border: "1px solid var(--border-default)",
      background: "var(--bg-surface)",
      boxShadow: "var(--shadow-xs)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 20,
      background: iconBg,
      flexShrink: 0
    }
  }, icon), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 15,
      fontWeight: 700,
      margin: 0
    }
  }, title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 11,
      color: tone === "success" ? "var(--text-success)" : "var(--text-tertiary)",
      margin: "2px 0 0"
    }
  }, sub)), arrow && /*#__PURE__*/React.createElement("span", {
    style: {
      color: arrowColor,
      fontSize: 18
    }
  }, "\u2192"));
}
window.MobileCheckin = MobileCheckin;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fsi-checkin/MobileCheckin.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fsi-checkin/Payroll.jsx
try { (() => {
/* global React */
function Payroll() {
  const {
    Table,
    Badge,
    Avatar,
    Button,
    Select,
    StatCard
  } = window.FSICheckinDesignSystem_019df8;
  const {
    Download,
    Wallet,
    Users,
    Clock
  } = window.LucideReact;
  const vnd = n => n.toLocaleString("vi-VN") + "₫";
  const rows = [{
    id: 1,
    name: "Nguyễn Văn An",
    dept: "Kỹ thuật",
    days: 22,
    ot: 6,
    base: 18000000,
    total: 19850000,
    status: "Đã chốt"
  }, {
    id: 2,
    name: "Trần Thị Bích",
    dept: "Nhân sự",
    days: 20,
    ot: 0,
    base: 15000000,
    total: 14200000,
    status: "Đã chốt"
  }, {
    id: 3,
    name: "Lê Hoàng Cường",
    dept: "Kỹ thuật",
    days: 22,
    ot: 12,
    base: 20000000,
    total: 23800000,
    status: "Nháp"
  }, {
    id: 4,
    name: "Phạm Minh Dũng",
    dept: "Kinh doanh",
    days: 21,
    ot: 4,
    base: 16000000,
    total: 17100000,
    status: "Nháp"
  }, {
    id: 5,
    name: "Vũ Thuỳ Linh",
    dept: "Kế toán",
    days: 22,
    ot: 8,
    base: 17000000,
    total: 19200000,
    status: "Đã chốt"
  }];
  const columns = [{
    key: "name",
    label: "Nhân viên",
    render: (v, r) => /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 9
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: v,
      size: 28
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontWeight: 500,
        color: "var(--text-primary)"
      }
    }, v), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--text-tertiary)"
      }
    }, r.dept)))
  }, {
    key: "days",
    label: "Công",
    align: "center",
    mono: true,
    numeric: true
  }, {
    key: "ot",
    label: "OT (h)",
    align: "center",
    mono: true,
    numeric: true,
    render: v => v > 0 ? /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--code-o-text)",
        fontWeight: 600
      }
    }, v) : /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-disabled)"
      }
    }, "0")
  }, {
    key: "base",
    label: "Lương cơ bản",
    align: "right",
    mono: true,
    numeric: true,
    render: v => vnd(v)
  }, {
    key: "total",
    label: "Thực nhận",
    align: "right",
    mono: true,
    numeric: true,
    render: v => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 600,
        color: "var(--text-primary)"
      }
    }, vnd(v))
  }, {
    key: "status",
    label: "Trạng thái",
    align: "center",
    render: v => /*#__PURE__*/React.createElement(Badge, {
      tone: v === "Đã chốt" ? "success" : "neutral"
    }, v)
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--content-max)",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      margin: 0
    }
  }, "B\u1EA3ng l\u01B0\u01A1ng"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--text-tertiary)",
      marginTop: 2
    }
  }, "K\u1EF3 l\u01B0\u01A1ng th\xE1ng 6 / 2026")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: Download
  }, "Xu\u1EA5t b\u1EA3ng l\u01B0\u01A1ng")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "T\u1ED5ng qu\u1EF9 l\u01B0\u01A1ng",
    value: "94,15 tr\u20AB",
    icon: Wallet,
    sub: "k\u1EF3 th\xE1ng 6"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Nh\xE2n vi\xEAn",
    value: 48,
    icon: Users,
    sub: "trong k\u1EF3 l\u01B0\u01A1ng"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "T\u1ED5ng gi\u1EDD OT",
    value: "312h",
    icon: Clock,
    sub: "\u0111\xE3 duy\u1EC7t"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement(Select, {
    placeholder: "T\u1EA5t c\u1EA3 ph\xF2ng ban",
    options: ["Tất cả phòng ban", "Kỹ thuật", "Nhân sự", "Kinh doanh", "Kế toán"],
    defaultValue: "T\u1EA5t c\u1EA3 ph\xF2ng ban",
    style: {
      width: 220
    }
  }), /*#__PURE__*/React.createElement(Select, {
    placeholder: "Tr\u1EA1ng th\xE1i",
    options: ["Tất cả", "Đã chốt", "Nháp"],
    defaultValue: "T\u1EA5t c\u1EA3",
    style: {
      width: 160
    }
  })), /*#__PURE__*/React.createElement(Table, {
    columns: columns,
    rows: rows
  }));
}
window.Payroll = Payroll;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fsi-checkin/Payroll.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fsi-checkin/SiteManagement.jsx
try { (() => {
/* global React */
function SiteManagement() {
  const {
    Badge,
    Avatar,
    Button,
    Switch,
    Select,
    IconButton,
    Tooltip
  } = window.FSICheckinDesignSystem_019df8;
  const {
    MapPin,
    Navigation,
    Pencil,
    Plus,
    Building2,
    Users
  } = window.LucideReact;
  const {
    useState
  } = React;
  const sites = [{
    id: "S1",
    name: "FSI Tower — Cầu Giấy",
    project: "Trụ sở chính",
    addr: "17 Duy Tân, Cầu Giấy, Hà Nội",
    lat: "21.02851",
    lng: "105.78219",
    radius: 200,
    ctv: 32,
    active: true
  }, {
    id: "S2",
    name: "Kho vận Long Biên",
    project: "DA Logistics 2026",
    addr: "Số 5 Ngọc Lâm, Long Biên, Hà Nội",
    lat: "21.04412",
    lng: "105.87033",
    radius: 150,
    ctv: 18,
    active: true
  }, {
    id: "S3",
    name: "Chi nhánh Đà Nẵng",
    project: "Mở rộng miền Trung",
    addr: "92 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    lat: "16.06061",
    lng: "108.21042",
    radius: 300,
    ctv: 11,
    active: true
  }, {
    id: "S4",
    name: "Site triển khai Bắc Ninh",
    project: "DA Nhà máy A",
    addr: "KCN Quế Võ, Bắc Ninh",
    lat: "21.16842",
    lng: "106.06731",
    radius: 500,
    ctv: 6,
    active: false
  }];
  const [selId, setSelId] = useState("S1");
  const s = sites.find(x => x.id === selId);
  const checkins = [{
    name: "Nguyễn Văn An",
    time: "08:02",
    risk: "ok"
  }, {
    name: "Trần Thị Bích",
    time: "08:14",
    risk: "ok"
  }, {
    name: "Lê Hoàng Cường",
    time: "08:33",
    risk: "warn"
  }, {
    name: "Phạm Minh Dũng",
    time: "08:51",
    risk: "danger"
  }];
  const riskBadge = {
    ok: /*#__PURE__*/React.createElement(Badge, {
      tone: "success",
      dot: true
    }, "Trong ph\u1EA1m vi"),
    warn: /*#__PURE__*/React.createElement(Badge, {
      tone: "warning",
      dot: true
    }, "GPS y\u1EBFu"),
    danger: /*#__PURE__*/React.createElement(Badge, {
      tone: "danger",
      dot: true
    }, "Ngo\xE0i ph\u1EA1m vi")
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--content-max)",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      margin: 0
    }
  }, "Sites & GPS"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--text-tertiary)",
      marginTop: 2
    }
  }, "Qu\u1EA3n l\xFD \u0111\u1ECBa \u0111i\u1EC3m ch\u1EA5m c\xF4ng & b\xE1n k\xEDnh \u0111\u1ECBnh v\u1ECB")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: Plus
  }, "Th\xEAm site")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "minmax(0,1fr) minmax(0,1.45fr)",
      gap: 16,
      alignItems: "start"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10
    }
  }, sites.map(site => {
    const on = site.id === selId;
    return /*#__PURE__*/React.createElement("div", {
      key: site.id,
      onClick: () => setSelId(site.id),
      style: {
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: 14,
        background: "var(--bg-surface)",
        border: `1px solid ${on ? "var(--accent)" : "var(--border-default)"}`,
        borderRadius: "var(--radius-lg)",
        cursor: "pointer",
        boxShadow: on ? "var(--ring-accent)" : "none",
        transition: "border-color var(--dur-fast), box-shadow var(--dur-fast)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 38,
        height: 38,
        borderRadius: "var(--radius-lg)",
        background: "var(--accent-muted)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement(MapPin, {
      size: 18,
      color: "var(--accent)"
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 14,
        fontWeight: 600,
        margin: 0,
        color: "var(--text-primary)"
      }
    }, site.name), !site.active && /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      size: "sm"
    }, "T\u1EA1m d\u1EEBng")), /*#__PURE__*/React.createElement("p", {
      style: {
        fontSize: 12,
        color: "var(--text-tertiary)",
        margin: "2px 0 8px"
      }
    }, site.project), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 12,
        color: "var(--text-secondary)"
      }
    }, /*#__PURE__*/React.createElement(Users, {
      size: 13,
      color: "var(--text-tertiary)"
    }), /*#__PURE__*/React.createElement("b", {
      style: {
        color: "var(--text-primary)"
      }
    }, site.ctv), " CTV"), /*#__PURE__*/React.createElement(Badge, {
      tone: "accent",
      size: "sm"
    }, site.radius, "m"))));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      background: "var(--bg-surface)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "13px 16px",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Building2, {
    size: 16,
    color: "var(--text-tertiary)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      fontWeight: 600,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    }
  }, s.name), s.active ? /*#__PURE__*/React.createElement(Badge, {
    tone: "success",
    dot: true
  }, "Ho\u1EA1t \u0111\u1ED9ng") : /*#__PURE__*/React.createElement(Badge, {
    tone: "neutral",
    dot: true
  }, "T\u1EA1m d\u1EEBng")), /*#__PURE__*/React.createElement(Tooltip, {
    label: "S\u1EEDa site"
  }, /*#__PURE__*/React.createElement(IconButton, {
    icon: Pencil,
    size: "sm",
    "aria-label": "S\u1EEDa"
  }))), /*#__PURE__*/React.createElement(Geofence, {
    radius: s.radius
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 16,
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "\u0110\u1ECBa ch\u1EC9",
    value: s.addr
  }), /*#__PURE__*/React.createElement(Field, {
    label: "To\u1EA1 \u0111\u1ED9 (lat, lng)",
    value: `${s.lat}, ${s.lng}`,
    mono: true
  }), /*#__PURE__*/React.createElement(Field, {
    label: "D\u1EF1 \xE1n",
    value: s.project
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: fLabel
  }, "B\xE1n k\xEDnh geofence"), /*#__PURE__*/React.createElement(Select, {
    options: ["100m", "150m", "200m", "300m", "500m"],
    value: `${s.radius}m`,
    onChange: () => {}
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 10,
      padding: "14px 0",
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Switch, {
    label: "B\u1EAFt bu\u1ED9c check-in trong b\xE1n k\xEDnh",
    defaultChecked: true
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Cho ph\xE9p d\xF9ng v\u1ECB tr\xED c\u1ED1 \u0111\u1ECBnh (c\xF3 ghi log)"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      ...fLabel,
      margin: 0
    }
  }, "Check-in g\u1EA7n \u0111\xE2y"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      fontSize: 12,
      color: "var(--text-tertiary)"
    }
  }, /*#__PURE__*/React.createElement(Navigation, {
    size: 12
  }), " H\xF4m nay")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 6
    }
  }, checkins.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.name,
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
      padding: "8px 10px",
      background: "var(--bg-elevated)",
      border: "1px solid var(--border-subtle)",
      borderRadius: "var(--radius-md)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: 9,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    name: c.name,
    size: 26
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      fontWeight: 500,
      whiteSpace: "nowrap"
    }
  }, c.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: "var(--text-tertiary)",
      fontFamily: "var(--font-mono)"
    }
  }, c.time)), riskBadge[c.risk]))))))));
}
function Geofence({
  radius
}) {
  // visual circle scales a little with radius (capped) — purely illustrative
  const px = Math.min(168, 96 + radius * 0.18);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      height: 220,
      background: "#eef1f4",
      backgroundImage: "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
      backgroundSize: "32px 32px",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      inset: 0,
      opacity: 0.5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: "38%",
      left: 0,
      right: 0,
      height: 10,
      background: "#fff"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "absolute",
      top: 0,
      bottom: 0,
      left: "58%",
      width: 10,
      background: "#fff"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: px,
      height: px,
      borderRadius: "50%",
      background: "rgba(37,99,235,0.12)",
      border: "2px solid var(--accent)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: -10,
      background: "var(--accent)",
      color: "#fff",
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: "var(--radius-full)",
      fontFamily: "var(--font-sans)",
      whiteSpace: "nowrap"
    }
  }, radius, "m"), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 14,
      height: 14,
      borderRadius: "50%",
      background: "var(--accent)",
      border: "3px solid #fff",
      boxShadow: "var(--shadow-md)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "32%",
      left: "44%",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--color-success)",
      border: "2px solid #fff"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "60%",
      left: "62%",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--color-success)",
      border: "2px solid #fff"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: "78%",
      left: "24%",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "var(--color-danger)",
      border: "2px solid #fff"
    }
  }));
}
const fLabel = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--text-tertiary)",
  margin: "0 0 6px",
  fontWeight: 600
};
function Field({
  label,
  value,
  mono
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: fLabel
  }, label), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: "var(--text-primary)",
      margin: 0,
      fontFamily: mono ? "var(--font-mono)" : "inherit",
      lineHeight: 1.4
    }
  }, value));
}
window.SiteManagement = SiteManagement;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fsi-checkin/SiteManagement.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fsi-checkin/Users.jsx
try { (() => {
/* global React */
function Users() {
  const {
    Table,
    Badge,
    Avatar,
    Button,
    Select,
    IconButton,
    Tooltip
  } = window.FSICheckinDesignSystem_019df8;
  const {
    Search,
    Plus,
    Pencil,
    MoreHorizontal
  } = window.LucideReact;
  const roleTone = {
    ADMIN: "danger",
    HR: "accent",
    LEADER: "info",
    EMPLOYEE: "neutral",
    CTV: "warning"
  };
  const roleLabel = {
    ADMIN: "Quản trị",
    HR: "Nhân sự",
    LEADER: "Trưởng nhóm",
    EMPLOYEE: "Nhân viên",
    CTV: "CTV"
  };
  const rows = [{
    id: 1,
    name: "Nguyễn Văn An",
    email: "an.nv@fsivietnam.com.vn",
    dept: "Kỹ thuật",
    role: "LEADER",
    active: true
  }, {
    id: 2,
    name: "Trần Thị Bích",
    email: "bich.tt@fsivietnam.com.vn",
    dept: "Nhân sự",
    role: "HR",
    active: true
  }, {
    id: 3,
    name: "Lê Hoàng Cường",
    email: "cuong.lh@fsivietnam.com.vn",
    dept: "Kỹ thuật",
    role: "EMPLOYEE",
    active: true
  }, {
    id: 4,
    name: "Phạm Minh Dũng",
    email: "dung.pm@fsivietnam.com.vn",
    dept: "Kinh doanh",
    role: "EMPLOYEE",
    active: false
  }, {
    id: 5,
    name: "Vũ Thuỳ Linh",
    email: "linh.vt@fsivietnam.com.vn",
    dept: "Kế toán",
    role: "ADMIN",
    active: true
  }, {
    id: 6,
    name: "Đỗ Quang Huy",
    email: "huy.dq@fsivietnam.com.vn",
    dept: "Triển khai",
    role: "CTV",
    active: true
  }];
  const columns = [{
    key: "name",
    label: "Họ tên",
    render: (v, r) => /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Avatar, {
      name: v,
      size: 30
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontWeight: 500,
        color: "var(--text-primary)"
      }
    }, v), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11,
        color: "var(--text-tertiary)"
      }
    }, r.email)))
  }, {
    key: "dept",
    label: "Phòng ban"
  }, {
    key: "role",
    label: "Vai trò",
    render: v => /*#__PURE__*/React.createElement(Badge, {
      tone: roleTone[v] || "neutral"
    }, roleLabel[v] || v)
  }, {
    key: "active",
    label: "Trạng thái",
    align: "center",
    render: v => v ? /*#__PURE__*/React.createElement(Badge, {
      tone: "success",
      dot: true
    }, "Ho\u1EA1t \u0111\u1ED9ng") : /*#__PURE__*/React.createElement(Badge, {
      tone: "neutral",
      dot: true
    }, "Ng\u1EEBng")
  }, {
    key: "id",
    label: "",
    align: "right",
    render: () => /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        gap: 2,
        justifyContent: "flex-end"
      }
    }, /*#__PURE__*/React.createElement(Tooltip, {
      label: "S\u1EEDa"
    }, /*#__PURE__*/React.createElement(IconButton, {
      icon: Pencil,
      size: "sm",
      "aria-label": "S\u1EEDa"
    })), /*#__PURE__*/React.createElement(IconButton, {
      icon: MoreHorizontal,
      size: "sm",
      "aria-label": "Th\xEAm"
    }))
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--content-max)",
      display: "flex",
      flexDirection: "column",
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 18,
      fontWeight: 600,
      margin: 0
    }
  }, "Nh\xE2n s\u1EF1"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: "var(--text-tertiary)",
      marginTop: 2
    }
  }, "48 nh\xE2n vi\xEAn \xB7 6 ph\xF2ng ban")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    icon: Plus
  }, "Th\xEAm nh\xE2n vi\xEAn")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: 10,
      flexWrap: "wrap",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      width: 280
    }
  }, /*#__PURE__*/React.createElement(Search, {
    size: 15,
    color: "var(--text-tertiary)",
    style: {
      position: "absolute",
      left: 12,
      top: "50%",
      transform: "translateY(-50%)"
    }
  }), /*#__PURE__*/React.createElement("input", {
    placeholder: "T\xECm theo t\xEAn ho\u1EB7c email\u2026",
    style: {
      width: "100%",
      fontFamily: "var(--font-sans)",
      fontSize: 14,
      padding: "9px 12px 9px 34px",
      background: "var(--bg-inset)",
      border: "1px solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      outline: "none",
      boxSizing: "border-box"
    }
  })), /*#__PURE__*/React.createElement(Select, {
    placeholder: "Ph\xF2ng ban",
    options: ["Tất cả phòng ban", "Kỹ thuật", "Nhân sự", "Kinh doanh", "Kế toán", "Triển khai"],
    defaultValue: "T\u1EA5t c\u1EA3 ph\xF2ng ban",
    style: {
      width: 200
    }
  }), /*#__PURE__*/React.createElement(Select, {
    placeholder: "Vai tr\xF2",
    options: ["Tất cả vai trò", "Quản trị", "Nhân sự", "Trưởng nhóm", "Nhân viên", "CTV"],
    defaultValue: "T\u1EA5t c\u1EA3 vai tr\xF2",
    style: {
      width: 170
    }
  })), /*#__PURE__*/React.createElement(Table, {
    columns: columns,
    rows: rows
  }));
}
window.Users = Users;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fsi-checkin/Users.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.StatCard = __ds_scope.StatCard;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.Tooltip = __ds_scope.Tooltip;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Table = __ds_scope.Table;

})();

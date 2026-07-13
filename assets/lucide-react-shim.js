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
      var props = Object.assign({ key: i }, attrs);
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
      return React.createElement(
        "svg",
        {
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
          "aria-hidden": "true",
        },
        buildChildren(svgChildren)
      );
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

/* @ds-bundle: {"format":4,"namespace":"KrishiMitraDesignSystem_e4a29d","components":[{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"BarChart","sourcePath":"components/data/BarChart.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"PriceChart","sourcePath":"components/data/PriceChart.jsx"},{"name":"Sparkline","sourcePath":"components/data/Sparkline.jsx"},{"name":"Stepper","sourcePath":"components/data/Stepper.jsx"},{"name":"Timeline","sourcePath":"components/data/Timeline.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Badge","sourcePath":"components/feedback/Badge.jsx"},{"name":"BottomSheet","sourcePath":"components/feedback/BottomSheet.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"OfflineBar","sourcePath":"components/feedback/OfflineBar.jsx"},{"name":"Skeleton","sourcePath":"components/feedback/Skeleton.jsx"},{"name":"StateView","sourcePath":"components/feedback/StateView.jsx"},{"name":"TrustBadge","sourcePath":"components/feedback/TrustBadge.jsx"},{"name":"Button","sourcePath":"components/forms/Button.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"IconButton","sourcePath":"components/forms/IconButton.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"SearchField","sourcePath":"components/forms/SearchField.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"BottomNav","sourcePath":"components/navigation/BottomNav.jsx"},{"name":"SegmentedControl","sourcePath":"components/navigation/SegmentedControl.jsx"},{"name":"Sidebar","sourcePath":"components/navigation/Sidebar.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"},{"name":"TopNav","sourcePath":"components/navigation/TopNav.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"ListingCard","sourcePath":"components/surfaces/ListingCard.jsx"},{"name":"MetaRow","sourcePath":"components/surfaces/MetaRow.jsx"},{"name":"StatCard","sourcePath":"components/surfaces/StatCard.jsx"}],"sourceHashes":{"components/core/Icon.jsx":"2a2f4a1ff0d8","components/data/BarChart.jsx":"651bbd8c076b","components/data/DataTable.jsx":"1ca8f47bdbc8","components/data/PriceChart.jsx":"1073f51f1f64","components/data/Sparkline.jsx":"5e9ebb516263","components/data/Stepper.jsx":"0b65961188de","components/data/Timeline.jsx":"a6e7e0f413d2","components/feedback/Alert.jsx":"cb85f7d48c6b","components/feedback/Badge.jsx":"32f8b97e460f","components/feedback/BottomSheet.jsx":"f57e1ccdb68a","components/feedback/Modal.jsx":"2cf31bf6e81e","components/feedback/OfflineBar.jsx":"d5c821ce6d19","components/feedback/Skeleton.jsx":"628b1b8d4994","components/feedback/StateView.jsx":"72b364f89b2e","components/feedback/TrustBadge.jsx":"4b85fbbcbd69","components/forms/Button.jsx":"889f06d6d9be","components/forms/Checkbox.jsx":"998804d505fc","components/forms/IconButton.jsx":"1171ed6bfbcb","components/forms/Input.jsx":"4076e103c172","components/forms/Radio.jsx":"85889979bb8a","components/forms/SearchField.jsx":"10268cb965a7","components/forms/Select.jsx":"48c112896d07","components/forms/Switch.jsx":"b42059130a93","components/forms/Textarea.jsx":"241dc774d4bd","components/navigation/BottomNav.jsx":"b66445e37f74","components/navigation/SegmentedControl.jsx":"2ec76f491192","components/navigation/Sidebar.jsx":"c3781dcb9a05","components/navigation/Tabs.jsx":"0bc0df16d614","components/navigation/TopNav.jsx":"80ad217b582e","components/surfaces/Card.jsx":"76fb0be9689d","components/surfaces/ListingCard.jsx":"fa90e57272f2","components/surfaces/MetaRow.jsx":"27d221c621e8","components/surfaces/StatCard.jsx":"7e4af75e93df","ui_kits/admin_console/DisputesScreen.jsx":"d28f8a76eefb","ui_kits/admin_console/PriceSourcesScreen.jsx":"cc45c1c2dec1","ui_kits/admin_console/VerificationScreen.jsx":"fcea525fd225","ui_kits/admin_console/data.js":"3064efad60c2","ui_kits/buyer_console/EscrowScreen.jsx":"7de58a9537c0","ui_kits/buyer_console/LotDetailScreen.jsx":"db42c912767d","ui_kits/buyer_console/MarketplaceScreen.jsx":"4cc90f42778b","ui_kits/buyer_console/data.js":"7bcad845c6fd","ui_kits/farmer_app/HomeScreen.jsx":"d21749e8faae","ui_kits/farmer_app/OrdersScreen.jsx":"d0e849047aff","ui_kits/farmer_app/PricesScreen.jsx":"b215a7471f1d","ui_kits/farmer_app/SellScreen.jsx":"bceaa344fcac","ui_kits/farmer_app/data.js":"d0bb8de91d4f","ui_kits/fpo_console/AggregationScreen.jsx":"8ac1e077f0cc","ui_kits/fpo_console/MembersScreen.jsx":"7af8fb8ca8ca","ui_kits/fpo_console/PayoutsScreen.jsx":"4311954b2a9b","ui_kits/fpo_console/data.js":"f5f318bb2adb"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.KrishiMitraDesignSystem_e4a29d = window.KrishiMitraDesignSystem_e4a29d || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/* Krishi Mitra uses the Lucide icon set (2px stroke, rounded caps) loaded from CDN.
   Host pages must include:
   <script src="https://unpkg.com/lucide@0.544.0/dist/umd/lucide.min.js"></script> */
function Icon({
  name,
  size = 20,
  color = "currentColor",
  strokeWidth = 2,
  style,
  ...rest
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const el = ref.current;
    if (!el || !window.lucide) return;
    el.innerHTML = "";
    const i = document.createElement("i");
    i.setAttribute("data-lucide", name);
    el.appendChild(i);
    window.lucide.createIcons({
      nameAttr: "data-lucide",
      attrs: {
        width: size,
        height: size,
        stroke: color,
        "stroke-width": strokeWidth
      },
      root: el
    });
  }, [name, size, color, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", _extends({
    ref: ref,
    "aria-hidden": "true",
    style: {
      display: "inline-flex",
      width: size,
      height: size,
      flex: "0 0 auto",
      color,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/data/BarChart.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function BarChart({
  data = [],
  height = 200,
  color = "var(--viz-1)",
  valueFormat = v => v,
  horizontal = false,
  style,
  ...rest
}) {
  const max = Math.max(...data.map(d => d.value), 1);
  if (horizontal) {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
        ...style
      }
    }, rest), data.map(d => /*#__PURE__*/React.createElement("div", {
      key: d.label,
      style: {
        display: "grid",
        gridTemplateColumns: "104px 1fr 72px",
        alignItems: "center",
        gap: "var(--space-5)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-secondary)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }
    }, d.label), /*#__PURE__*/React.createElement("span", {
      style: {
        height: 10,
        background: "var(--surface-sunken)",
        borderRadius: "var(--radius-pill)",
        overflow: "hidden"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        width: `${d.value / max * 100}%`,
        height: "100%",
        background: d.color || color,
        borderRadius: "var(--radius-pill)",
        transition: "width var(--dur-slow) var(--ease-out)"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        fontWeight: "var(--fw-semibold)",
        textAlign: "right",
        fontVariantNumeric: "tabular-nums"
      }
    }, valueFormat(d.value)))));
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: "var(--space-5)",
      height,
      ...style
    }
  }, rest), data.map(d => /*#__PURE__*/React.createElement("div", {
    key: d.label,
    style: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-4)",
      height: "100%",
      justifyContent: "flex-end"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-3xs)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-secondary)",
      fontVariantNumeric: "tabular-nums"
    }
  }, valueFormat(d.value)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: "100%",
      maxWidth: 44,
      height: `${d.value / max * 78}%`,
      background: d.color || color,
      borderRadius: "var(--radius-xs) var(--radius-xs) 0 0",
      transition: "height var(--dur-slow) var(--ease-out)"
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-3xs)",
      color: "var(--text-muted)",
      whiteSpace: "nowrap"
    }
  }, d.label))));
}
Object.assign(__ds_scope, { BarChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/BarChart.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function DataTable({
  columns = [],
  rows = [],
  caption,
  onRowClick,
  dense = false,
  footer,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(-1);
  const pad = dense ? "var(--space-5) var(--space-6)" : "var(--space-6) var(--space-7)";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--surface-card)",
      border: "var(--border-hairline) solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      overflow: "hidden",
      ...style
    }
  }, rest), caption && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-6) var(--space-7)",
      borderBottom: "var(--border-hairline) solid var(--border-subtle)",
      fontSize: "var(--text-sm)",
      fontWeight: "var(--fw-semibold)"
    }
  }, caption), /*#__PURE__*/React.createElement("div", {
    style: {
      overflowX: "auto"
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "var(--text-sm)"
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    scope: "col",
    style: {
      padding: pad,
      textAlign: c.align || "left",
      background: "var(--surface-sunken)",
      borderBottom: "var(--border-hairline) solid var(--border-default)",
      fontSize: "var(--text-3xs)",
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-caps)",
      textTransform: "uppercase",
      color: "var(--text-muted)",
      whiteSpace: "nowrap"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)"
    }
  }, c.label, c.sortable && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevrons-up-down",
    size: 12
  })))))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r.id || i,
    onClick: () => onRowClick && onRowClick(r),
    onMouseEnter: () => setHover(i),
    onMouseLeave: () => setHover(-1),
    style: {
      background: hover === i && onRowClick ? "var(--surface-brand-soft)" : "transparent",
      cursor: onRowClick ? "pointer" : "default",
      transition: "background var(--dur-fast) var(--ease-standard)"
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      padding: pad,
      textAlign: c.align || "left",
      borderBottom: i === rows.length - 1 ? "none" : "var(--border-hairline) solid var(--border-subtle)",
      color: "var(--text-primary)",
      whiteSpace: c.wrap ? "normal" : "nowrap",
      fontVariantNumeric: c.numeric ? "tabular-nums lining-nums" : "normal",
      fontWeight: c.numeric ? "var(--fw-semibold)" : "var(--fw-regular)"
    }
  }, c.render ? c.render(r) : r[c.key]))))))), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-5) var(--space-7)",
      borderTop: "var(--border-hairline) solid var(--border-subtle)",
      background: "var(--surface-sunken)",
      fontSize: "var(--text-2xs)",
      color: "var(--text-secondary)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "var(--space-6)"
    }
  }, footer));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/PriceChart.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function path(points, w, h, min, max, smooth) {
  const span = max - min || 1;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const xy = points.map((p, i) => [i * step, h - (p - min) / span * h]);
  if (!smooth) return "M" + xy.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ");
  let d = `M${xy[0][0]} ${xy[0][1]}`;
  for (let i = 1; i < xy.length; i++) {
    const [x0, y0] = xy[i - 1],
      [x1, y1] = xy[i],
      cx = (x0 + x1) / 2;
    d += ` C${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`;
  }
  return d;
}
function PriceChart({
  series = [],
  labels = [],
  height = 200,
  color = "var(--viz-1)",
  area = true,
  msp,
  valueFormat = v => v,
  gridLines = 4,
  style,
  ...rest
}) {
  const w = 560;
  const all = series.concat(msp != null ? [msp] : []);
  const min = Math.min(...all) * 0.985,
    max = Math.max(...all) * 1.015;
  const d = path(series, w, height, min, max, true);
  const y = v => height - (v - min) / (max - min || 1) * height;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width: "100%",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    viewBox: `0 0 ${w} ${height}`,
    width: "100%",
    height: height,
    preserveAspectRatio: "none",
    role: "img",
    "aria-label": "Price trend"
  }, Array.from({
    length: gridLines + 1
  }, (_, i) => /*#__PURE__*/React.createElement("line", {
    key: i,
    x1: "0",
    x2: w,
    y1: height / gridLines * i,
    y2: height / gridLines * i,
    stroke: "var(--viz-grid)",
    strokeWidth: "1"
  })), msp != null && /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("line", {
    x1: "0",
    x2: w,
    y1: y(msp),
    y2: y(msp),
    stroke: "var(--amber-600)",
    strokeWidth: "1.5",
    strokeDasharray: "6 5"
  }), /*#__PURE__*/React.createElement("text", {
    x: "6",
    y: y(msp) - 6,
    fill: "var(--amber-800)",
    fontSize: "11",
    fontFamily: "var(--font-core)",
    fontWeight: "600"
  }, "MSP ", valueFormat(msp))), area && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: "km-area",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: color,
    stopOpacity: "0.18"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: color,
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("path", {
    d: `${d} L ${w} ${height} L 0 ${height} Z`,
    fill: "url(#km-area)"
  })), /*#__PURE__*/React.createElement("path", {
    d: d,
    fill: "none",
    stroke: color,
    strokeWidth: "2.5",
    strokeLinejoin: "round",
    strokeLinecap: "round",
    vectorEffect: "non-scaling-stroke"
  }), series.length > 0 && /*#__PURE__*/React.createElement("circle", {
    cx: w,
    cy: y(series[series.length - 1]),
    r: "4",
    fill: color,
    stroke: "var(--white)",
    strokeWidth: "2"
  })), labels.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "var(--space-4)",
      fontSize: "var(--text-3xs)",
      color: "var(--text-muted)",
      fontVariantNumeric: "tabular-nums"
    }
  }, labels.map((l, i) => /*#__PURE__*/React.createElement("span", {
    key: i
  }, l))));
}
Object.assign(__ds_scope, { PriceChart });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/PriceChart.jsx", error: String((e && e.message) || e) }); }

// components/data/Sparkline.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Sparkline({
  series = [],
  width = 84,
  height = 28,
  direction = "flat",
  style,
  ...rest
}) {
  const min = Math.min(...series),
    max = Math.max(...series),
    span = max - min || 1;
  const step = series.length > 1 ? width / (series.length - 1) : width;
  const d = "M" + series.map((v, i) => `${(i * step).toFixed(1)} ${(height - (v - min) / span * height).toFixed(1)}`).join(" L ");
  const color = direction === "up" ? "var(--price-up)" : direction === "down" ? "var(--price-down)" : "var(--price-flat)";
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: width,
    height: height,
    viewBox: `0 0 ${width} ${height}`,
    style: {
      display: "block",
      overflow: "visible",
      ...style
    },
    "aria-hidden": "true"
  }, rest), /*#__PURE__*/React.createElement("path", {
    d: d,
    fill: "none",
    stroke: color,
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }));
}
Object.assign(__ds_scope, { Sparkline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Sparkline.jsx", error: String((e && e.message) || e) }); }

// components/data/Stepper.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Stepper({
  steps = [],
  current = 0,
  orientation = "horizontal",
  style,
  ...rest
}) {
  if (orientation === "vertical") {
    return /*#__PURE__*/React.createElement("ol", _extends({
      style: {
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-6)",
        ...style
      }
    }, rest), steps.map((s, i) => {
      const done = i < current,
        active = i === current;
      return /*#__PURE__*/React.createElement("li", {
        key: s.label || i,
        style: {
          display: "flex",
          gap: "var(--space-5)",
          alignItems: "center"
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 30,
          height: 30,
          borderRadius: "var(--radius-pill)",
          flex: "0 0 auto",
          background: done ? "var(--green-600)" : active ? "var(--white)" : "var(--surface-sunken)",
          border: `var(--border-strong) solid ${done ? "var(--green-600)" : active ? "var(--green-600)" : "var(--border-default)"}`,
          color: done ? "var(--white)" : active ? "var(--text-brand)" : "var(--text-muted)",
          fontSize: "var(--text-xs)",
          fontWeight: "var(--fw-bold)",
          fontVariantNumeric: "tabular-nums"
        }
      }, done ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
        name: "check",
        size: 15,
        strokeWidth: 3
      }) : i + 1), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: "var(--text-sm)",
          fontWeight: active ? "var(--fw-semibold)" : "var(--fw-regular)",
          color: active ? "var(--text-primary)" : done ? "var(--text-secondary)" : "var(--text-muted)"
        }
      }, s.label));
    }));
  }
  return /*#__PURE__*/React.createElement("ol", _extends({
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      alignItems: "flex-start",
      ...style
    }
  }, rest), steps.map((s, i) => {
    const done = i < current,
      active = i === current,
      last = i === steps.length - 1;
    return /*#__PURE__*/React.createElement("li", {
      key: s.label || i,
      style: {
        display: "flex",
        alignItems: "flex-start",
        flex: last ? "0 0 auto" : 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-3)",
        width: 84
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 30,
        height: 30,
        borderRadius: "var(--radius-pill)",
        background: done ? "var(--green-600)" : active ? "var(--white)" : "var(--surface-sunken)",
        border: `var(--border-strong) solid ${done || active ? "var(--green-600)" : "var(--border-default)"}`,
        color: done ? "var(--white)" : active ? "var(--text-brand)" : "var(--text-muted)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--fw-bold)",
        fontVariantNumeric: "tabular-nums"
      }
    }, done ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 15,
      strokeWidth: 3
    }) : i + 1), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-2xs)",
        textAlign: "center",
        lineHeight: 1.3,
        fontWeight: active ? "var(--fw-semibold)" : "var(--fw-regular)",
        color: active ? "var(--text-primary)" : "var(--text-muted)"
      }
    }, s.label)), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 2,
        marginTop: 14,
        background: done ? "var(--green-400)" : "var(--border-default)"
      }
    }));
  }));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Stepper.jsx", error: String((e && e.message) || e) }); }

// components/data/Timeline.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const STATE = {
  done: {
    dot: "var(--green-600)",
    ring: "var(--green-100)",
    icon: "check"
  },
  current: {
    dot: "var(--amber-500)",
    ring: "var(--amber-100)",
    icon: "dot"
  },
  pending: {
    dot: "var(--ink-200)",
    ring: "var(--ink-050)",
    icon: null
  },
  failed: {
    dot: "var(--clay-600)",
    ring: "var(--clay-100)",
    icon: "x"
  }
};
function Timeline({
  items = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("ol", _extends({
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      ...style
    }
  }, rest), items.map((it, i) => {
    const s = STATE[it.state] || STATE.pending;
    const last = i === items.length - 1;
    return /*#__PURE__*/React.createElement("li", {
      key: it.id || i,
      style: {
        display: "grid",
        gridTemplateColumns: "28px 1fr",
        gap: "var(--space-6)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 28,
        height: 28,
        borderRadius: "var(--radius-pill)",
        background: s.ring,
        border: `var(--border-strong) solid ${s.dot}`,
        color: s.dot,
        flex: "0 0 auto"
      }
    }, s.icon === "check" && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "check",
      size: 15,
      strokeWidth: 3
    }), s.icon === "x" && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "x",
      size: 15,
      strokeWidth: 3
    }), s.icon === "dot" && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: "var(--radius-pill)",
        background: s.dot
      }
    })), !last && /*#__PURE__*/React.createElement("span", {
      style: {
        width: 2,
        flex: 1,
        minHeight: 22,
        background: it.state === "done" ? "var(--green-200)" : "var(--border-default)"
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: 2,
        paddingBottom: last ? 0 : "var(--space-7)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: "var(--space-5)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-sm)",
        fontWeight: "var(--fw-semibold)",
        color: it.state === "pending" ? "var(--text-muted)" : "var(--text-primary)"
      }
    }, it.title), it.time && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-2xs)",
        color: "var(--text-muted)",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap"
      }
    }, it.time)), it.description && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-xs)",
        color: "var(--text-secondary)"
      }
    }, it.description), it.meta && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-2xs)",
        color: "var(--text-muted)",
        marginTop: 2
      }
    }, it.meta)));
  }));
}
Object.assign(__ds_scope, { Timeline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Timeline.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  info: {
    bg: "var(--status-info-soft)",
    br: "var(--indigo-200)",
    fg: "var(--indigo-700)",
    icon: "info"
  },
  success: {
    bg: "var(--status-success-soft)",
    br: "var(--green-200)",
    fg: "var(--green-800)",
    icon: "check-circle-2"
  },
  warning: {
    bg: "var(--status-warning-soft)",
    br: "var(--amber-200)",
    fg: "var(--amber-800)",
    icon: "alert-triangle"
  },
  danger: {
    bg: "var(--status-danger-soft)",
    br: "var(--clay-200)",
    fg: "var(--clay-700)",
    icon: "alert-octagon"
  },
  offline: {
    bg: "var(--status-offline-soft)",
    br: "var(--ink-200)",
    fg: "var(--ink-700)",
    icon: "wifi-off"
  }
};
function Alert({
  title,
  children,
  tone = "info",
  action,
  onDismiss,
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.info;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: tone === "danger" ? "alert" : "status",
    style: {
      display: "flex",
      gap: "var(--space-5)",
      padding: "var(--space-6)",
      background: t.bg,
      border: `var(--border-hairline) solid ${t.br}`,
      borderRadius: "var(--radius-md)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.icon,
    size: 20,
    color: t.fg,
    style: {
      marginTop: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, title && /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: "var(--text-sm)",
      fontWeight: "var(--fw-semibold)",
      color: t.fg
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)",
      lineHeight: "var(--lh-normal)"
    }
  }, children), action && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "var(--space-3)"
    }
  }, action)), onDismiss && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onDismiss,
    "aria-label": "Dismiss",
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: t.fg,
      padding: 0,
      display: "flex",
      height: 20
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 18
  })));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    bg: "var(--ink-050)",
    fg: "var(--ink-600)",
    br: "var(--ink-150)"
  },
  success: {
    bg: "var(--status-success-soft)",
    fg: "var(--green-800)",
    br: "var(--green-200)"
  },
  warning: {
    bg: "var(--status-warning-soft)",
    fg: "var(--amber-800)",
    br: "var(--amber-200)"
  },
  danger: {
    bg: "var(--status-danger-soft)",
    fg: "var(--clay-700)",
    br: "var(--clay-200)"
  },
  info: {
    bg: "var(--status-info-soft)",
    fg: "var(--indigo-700)",
    br: "var(--indigo-200)"
  },
  offline: {
    bg: "var(--status-offline-soft)",
    fg: "var(--ink-600)",
    br: "var(--ink-200)"
  }
};
function Badge({
  label,
  tone = "neutral",
  icon,
  dot = false,
  size = "md",
  style,
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  const sm = size === "sm";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      padding: sm ? "2px var(--space-4)" : "var(--space-2) var(--space-5)",
      background: t.bg,
      color: t.fg,
      border: `var(--border-hairline) solid ${t.br}`,
      borderRadius: "var(--radius-pill)",
      fontSize: sm ? "var(--text-3xs)" : "var(--text-2xs)",
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-label)",
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 6,
      height: 6,
      borderRadius: "var(--radius-pill)",
      background: t.fg
    }
  }), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: sm ? 11 : 13
  }), label);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Badge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/BottomSheet.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function BottomSheet({
  open = true,
  title,
  subtitle,
  children,
  footer,
  onClose,
  style,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      position: "absolute",
      inset: 0,
      zIndex: 90,
      display: "flex",
      alignItems: "flex-end",
      background: "var(--surface-overlay)",
      animation: "km-fade var(--dur-base) var(--ease-standard)"
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    style: {
      width: "100%",
      maxHeight: "86%",
      display: "flex",
      flexDirection: "column",
      background: "var(--surface-card)",
      borderRadius: "var(--radius-sheet)",
      boxShadow: "var(--shadow-sheet)",
      animation: "km-sheet var(--dur-sheet) var(--ease-sheet)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      padding: "var(--space-4) 0 var(--space-2)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 44,
      height: 4,
      borderRadius: "var(--radius-pill)",
      background: "var(--ink-200)"
    }
  })), /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-6)",
      padding: "var(--space-5) var(--space-7) var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-md)"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)",
      marginTop: 2
    }
  }, subtitle)), onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "var(--text-muted)",
      padding: 0,
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 22
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 var(--space-7) var(--space-7)",
      overflowY: "auto"
    }
  }, children), footer && /*#__PURE__*/React.createElement("footer", {
    style: {
      padding: "var(--space-6) var(--space-7)",
      borderTop: "var(--border-hairline) solid var(--border-subtle)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, footer)), /*#__PURE__*/React.createElement("style", null, "@keyframes km-sheet{from{transform:translateY(100%)}to{transform:none}}@keyframes km-fade{from{opacity:0}to{opacity:1}}"));
}
Object.assign(__ds_scope, { BottomSheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/BottomSheet.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Modal({
  open = true,
  title,
  subtitle,
  children,
  footer,
  onClose,
  width = 520,
  style,
  ...rest
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "dialog",
    "aria-modal": "true",
    style: {
      position: "fixed",
      inset: 0,
      zIndex: 100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-8)",
      background: "var(--surface-overlay)",
      animation: "km-fade var(--dur-base) var(--ease-standard)"
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: width,
      maxHeight: "88vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--surface-card)",
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-lg)",
      overflow: "hidden",
      animation: "km-rise var(--dur-base) var(--ease-out)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-6)",
      padding: "var(--space-8) var(--space-8) var(--space-6)"
    }
  }, /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--text-lg)"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)",
      marginTop: 4
    }
  }, subtitle)), onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClose,
    "aria-label": "Close",
    style: {
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "var(--text-muted)",
      padding: 0,
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 22
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 var(--space-8) var(--space-8)",
      overflowY: "auto",
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)"
    }
  }, children), footer && /*#__PURE__*/React.createElement("footer", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "var(--space-5)",
      padding: "var(--space-6) var(--space-8)",
      borderTop: "var(--border-hairline) solid var(--border-subtle)",
      background: "var(--surface-sunken)"
    }
  }, footer)), /*#__PURE__*/React.createElement("style", null, "@keyframes km-fade{from{opacity:0}to{opacity:1}}@keyframes km-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}"));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/OfflineBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function OfflineBar({
  state = "offline",
  pending = 0,
  onRetry,
  style,
  ...rest
}) {
  const map = {
    offline: {
      bg: "var(--ink-700)",
      fg: "var(--white)",
      icon: "wifi-off",
      text: pending ? `Offline · ${pending} change${pending > 1 ? "s" : ""} saved on this device` : "Offline · showing last synced prices"
    },
    syncing: {
      bg: "var(--indigo-600)",
      fg: "var(--white)",
      icon: "refresh-cw",
      text: "Syncing…"
    },
    synced: {
      bg: "var(--green-600)",
      fg: "var(--white)",
      icon: "check",
      text: "All changes synced"
    }
  };
  const s = map[state] || map.offline;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "status",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-4)",
      minHeight: 36,
      padding: "var(--space-3) var(--space-6)",
      background: s.bg,
      color: s.fg,
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-label)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: s.icon,
    size: 14,
    style: state === "syncing" ? {
      animation: "km-spin 900ms linear infinite"
    } : undefined
  }), s.text, onRetry && state === "offline" && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onRetry,
    style: {
      marginLeft: "var(--space-3)",
      background: "rgba(255,255,255,.16)",
      color: s.fg,
      border: "none",
      borderRadius: "var(--radius-pill)",
      padding: "3px var(--space-5)",
      fontSize: "var(--text-3xs)",
      fontWeight: "var(--fw-semibold)",
      cursor: "pointer"
    }
  }, "Retry"), /*#__PURE__*/React.createElement("style", null, "@keyframes km-spin{to{transform:rotate(360deg)}}"));
}
Object.assign(__ds_scope, { OfflineBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/OfflineBar.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Skeleton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Skeleton({
  width = "100%",
  height = 16,
  radius = "var(--radius-sm)",
  lines = 1,
  style,
  ...rest
}) {
  const bar = i => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      display: "block",
      width: lines > 1 && i === lines - 1 ? "62%" : width,
      height,
      borderRadius: radius,
      background: "linear-gradient(90deg,var(--ink-050) 0%,var(--ink-100) 50%,var(--ink-050) 100%)",
      backgroundSize: "200% 100%",
      animation: "km-shimmer 1.4s var(--ease-standard) infinite"
    }
  });
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      ...style
    }
  }, rest), Array.from({
    length: lines
  }, (_, i) => bar(i)), /*#__PURE__*/React.createElement("style", null, "@keyframes km-shimmer{from{background-position:200% 0}to{background-position:-200% 0}}"));
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StateView.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const KINDS = {
  empty: {
    icon: "inbox",
    tone: "var(--text-muted)",
    bg: "var(--surface-sunken)",
    br: "var(--border-subtle)"
  },
  error: {
    icon: "alert-octagon",
    tone: "var(--clay-600)",
    bg: "var(--status-danger-soft)",
    br: "var(--clay-200)"
  },
  offline: {
    icon: "wifi-off",
    tone: "var(--ink-600)",
    bg: "var(--status-offline-soft)",
    br: "var(--ink-200)"
  },
  success: {
    icon: "check-circle-2",
    tone: "var(--green-600)",
    bg: "var(--status-success-soft)",
    br: "var(--green-200)"
  },
  search: {
    icon: "search-x",
    tone: "var(--text-muted)",
    bg: "var(--surface-sunken)",
    br: "var(--border-subtle)"
  }
};
function StateView({
  kind = "empty",
  title,
  description,
  action,
  secondaryAction,
  compact = false,
  style,
  ...rest
}) {
  const k = KINDS[kind] || KINDS.empty;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: "var(--space-5)",
      padding: compact ? "var(--space-8)" : "var(--space-11) var(--space-8)",
      background: "var(--surface-card)",
      border: "var(--border-hairline) dashed var(--border-default)",
      borderRadius: "var(--radius-lg)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 56,
      height: 56,
      borderRadius: "var(--radius-md)",
      background: k.bg,
      border: `var(--border-hairline) solid ${k.br}`
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: k.icon,
    size: 26,
    color: k.tone
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--text-md)"
    }
  }, title), description && /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-secondary)",
      maxWidth: 380,
      textWrap: "pretty"
    }
  }, description), (action || secondaryAction) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-5)",
      marginTop: "var(--space-3)",
      flexWrap: "wrap",
      justifyContent: "center"
    }
  }, action, secondaryAction));
}
Object.assign(__ds_scope, { StateView });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StateView.jsx", error: String((e && e.message) || e) }); }

// components/feedback/TrustBadge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TYPES = {
  "verified-buyer": {
    icon: "shield-check",
    label: "Verified Buyer",
    tone: "trust"
  },
  "verified-farmer": {
    icon: "user-check",
    label: "Verified Farmer",
    tone: "brand"
  },
  escrow: {
    icon: "lock",
    label: "Escrow Protected",
    tone: "trust"
  },
  fpo: {
    icon: "users",
    label: "FPO Backed",
    tone: "accent"
  },
  assayed: {
    icon: "flask-conical",
    label: "Lab Assayed",
    tone: "brand"
  },
  "price-source": {
    icon: "database",
    label: "Govt. Price Source",
    tone: "neutral"
  }
};
const TONES = {
  trust: {
    bg: "var(--surface-trust-soft)",
    fg: "var(--indigo-700)",
    br: "var(--indigo-200)"
  },
  brand: {
    bg: "var(--surface-brand-soft)",
    fg: "var(--green-800)",
    br: "var(--green-200)"
  },
  accent: {
    bg: "var(--surface-accent-soft)",
    fg: "var(--amber-800)",
    br: "var(--amber-200)"
  },
  neutral: {
    bg: "var(--ink-050)",
    fg: "var(--ink-600)",
    br: "var(--ink-150)"
  }
};
function TrustBadge({
  type,
  label,
  size = "md",
  style,
  ...rest
}) {
  const t = TYPES[type] || TYPES["verified-buyer"];
  const c = TONES[t.tone];
  const sm = size === "sm";
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)",
      padding: sm ? "3px var(--space-4)" : "var(--space-3) var(--space-5)",
      background: c.bg,
      color: c.fg,
      border: `var(--border-hairline) solid ${c.br}`,
      borderRadius: "var(--radius-sm)",
      fontSize: sm ? "var(--text-3xs)" : "var(--text-2xs)",
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-label)",
      whiteSpace: "nowrap",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: t.icon,
    size: sm ? 12 : 14
  }), label || t.label);
}
Object.assign(__ds_scope, { TrustBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/TrustBadge.jsx", error: String((e && e.message) || e) }); }

// components/forms/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    h: 36,
    px: "var(--space-6)",
    fs: "var(--text-xs)",
    icon: 16,
    gap: "var(--space-3)"
  },
  md: {
    h: 44,
    px: "var(--space-7)",
    fs: "var(--text-sm)",
    icon: 18,
    gap: "var(--space-4)"
  },
  lg: {
    h: 52,
    px: "var(--space-8)",
    fs: "var(--text-base)",
    icon: 20,
    gap: "var(--space-4)"
  },
  xl: {
    h: 56,
    px: "var(--space-9)",
    fs: "var(--text-md)",
    icon: 22,
    gap: "var(--space-5)"
  }
};
const VARIANTS = {
  primary: {
    bg: "var(--action-primary)",
    hover: "var(--action-primary-hover)",
    active: "var(--action-primary-active)",
    fg: "var(--action-primary-text)",
    border: "transparent",
    shadow: "var(--shadow-sm)"
  },
  accent: {
    bg: "var(--action-accent)",
    hover: "var(--action-accent-hover)",
    active: "var(--amber-700)",
    fg: "var(--action-accent-text)",
    border: "transparent",
    shadow: "var(--shadow-sm)"
  },
  secondary: {
    bg: "var(--action-secondary)",
    hover: "var(--action-secondary-hover)",
    active: "var(--ink-100)",
    fg: "var(--text-primary)",
    border: "var(--action-secondary-border)",
    shadow: "var(--shadow-xs)"
  },
  ghost: {
    bg: "transparent",
    hover: "var(--surface-brand-soft)",
    active: "var(--green-100)",
    fg: "var(--text-brand)",
    border: "transparent",
    shadow: "none"
  },
  danger: {
    bg: "var(--action-danger)",
    hover: "var(--clay-700)",
    active: "var(--clay-800)",
    fg: "var(--white)",
    border: "transparent",
    shadow: "var(--shadow-sm)"
  }
};
function Button({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth = false,
  loading = false,
  disabled = false,
  type = "button",
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const off = disabled || loading;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: off,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setPress(false);
    },
    onMouseDown: () => setPress(true),
    onMouseUp: () => setPress(false),
    style: {
      display: fullWidth ? "flex" : "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: s.gap,
      width: fullWidth ? "100%" : "auto",
      minHeight: s.h,
      padding: `0 ${s.px}`,
      fontFamily: "var(--font-core)",
      fontSize: s.fs,
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-tight)",
      lineHeight: 1,
      color: off ? "var(--action-disabled-text)" : v.fg,
      background: off ? "var(--action-disabled)" : press ? v.active : hover ? v.hover : v.bg,
      border: `var(--border-hairline) solid ${off ? "transparent" : v.border}`,
      borderRadius: "var(--radius-md)",
      boxShadow: off ? "none" : v.shadow,
      cursor: off ? "not-allowed" : "pointer",
      transform: press && !off ? "scale(var(--press-scale))" : "none",
      transition: "background var(--dur-fast) var(--ease-standard),transform var(--dur-instant) var(--ease-standard),box-shadow var(--dur-fast) var(--ease-standard)",
      ...style
    }
  }, rest), loading && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "loader-circle",
    size: s.icon,
    style: {
      animation: "km-spin 900ms linear infinite"
    }
  }), !loading && iconLeft && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: s.icon
  }), children, !loading && iconRight && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.icon
  }), /*#__PURE__*/React.createElement("style", null, "@keyframes km-spin{to{transform:rotate(360deg)}}"));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Button.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Checkbox({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "var(--space-5)",
      minHeight: "var(--tap-min)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? .55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 24,
      height: 24,
      marginTop: 2,
      flex: "0 0 auto",
      background: checked ? "var(--action-primary)" : "var(--white)",
      border: `var(--border-strong) solid ${checked ? "var(--action-primary)" : "var(--border-strong-color)"}`,
      borderRadius: "var(--radius-xs)",
      transition: "background var(--dur-fast) var(--ease-standard)"
    }
  }, checked && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 16,
    color: "var(--white)",
    strokeWidth: 3
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2,
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-base)",
      color: "var(--text-primary)"
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, description)));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    box: 36,
    icon: 18
  },
  md: {
    box: 44,
    icon: 20
  },
  lg: {
    box: 48,
    icon: 22
  }
};
function IconButton({
  icon,
  label,
  variant = "secondary",
  size = "md",
  disabled = false,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const solid = variant === "primary";
  const bare = variant === "ghost";
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: s.box,
      height: s.box,
      borderRadius: "var(--radius-md)",
      background: disabled ? "var(--action-disabled)" : solid ? hover ? "var(--action-primary-hover)" : "var(--action-primary)" : bare ? hover ? "var(--surface-sunken)" : "transparent" : hover ? "var(--action-secondary-hover)" : "var(--white)",
      color: disabled ? "var(--action-disabled-text)" : solid ? "var(--white)" : "var(--text-secondary)",
      border: `var(--border-hairline) solid ${solid || bare ? "transparent" : "var(--border-default)"}`,
      boxShadow: solid ? "var(--shadow-sm)" : "none",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "background var(--dur-fast) var(--ease-standard)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.icon
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Input({
  label,
  hint,
  error,
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
  suffix,
  iconLeft,
  numeric = false,
  required = false,
  disabled = false,
  size = "lg",
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useId();
  const inputId = id || uid;
  const h = size === "md" ? "var(--field-height-desktop)" : "var(--field-height)";
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-secondary)",
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase"
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-danger)"
    }
  }, " *")), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      minHeight: h,
      padding: "0 var(--space-6)",
      background: disabled ? "var(--surface-sunken)" : "var(--white)",
      border: `${error ? "var(--border-strong)" : "var(--border-hairline)"} solid ${error ? "var(--border-danger)" : focus ? "var(--border-brand)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      boxShadow: focus ? error ? "var(--ring-focus-danger)" : "var(--ring-focus)" : "none",
      transition: "border-color var(--dur-fast) var(--ease-standard),box-shadow var(--dur-fast) var(--ease-standard)"
    }
  }, iconLeft && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: 18,
    color: "var(--text-muted)"
  }), prefix && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-md)",
      color: "var(--text-secondary)",
      fontWeight: "var(--fw-medium)"
    }
  }, prefix), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    inputMode: numeric ? "decimal" : undefined,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-core)",
      fontSize: numeric ? "var(--text-md)" : "var(--text-base)",
      fontWeight: numeric ? "var(--fw-semibold)" : "var(--fw-regular)",
      fontVariantNumeric: numeric ? "tabular-nums lining-nums" : "normal",
      color: "var(--text-primary)",
      padding: "var(--space-4) 0"
    }
  }, rest)), suffix && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: "var(--text-muted)",
      whiteSpace: "nowrap"
    }
  }, suffix)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      fontSize: "var(--text-xs)",
      color: error ? "var(--text-danger)" : "var(--text-muted)"
    }
  }, error && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "alert-circle",
    size: 14
  }), error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Radio({
  label,
  description,
  checked = false,
  onChange,
  name,
  value,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      gap: "var(--space-5)",
      minHeight: "var(--tap-min)",
      padding: "var(--space-5) var(--space-6)",
      background: checked ? "var(--surface-brand-soft)" : "var(--white)",
      border: `var(--border-hairline) solid ${checked ? "var(--border-brand)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? .55 : 1,
      transition: "background var(--dur-fast) var(--ease-standard)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    name: name,
    value: value,
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 22,
      height: 22,
      marginTop: 1,
      flex: "0 0 auto",
      borderRadius: "var(--radius-pill)",
      background: "var(--white)",
      border: `var(--border-strong) solid ${checked ? "var(--action-primary)" : "var(--border-strong-color)"}`
    }
  }, checked && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 11,
      height: 11,
      borderRadius: "var(--radius-pill)",
      background: "var(--action-primary)"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-base)",
      fontWeight: "var(--fw-medium)",
      color: "var(--text-primary)"
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)"
    }
  }, description)));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SearchField({
  value,
  onChange,
  onClear,
  placeholder = "Search crops, mandis, buyers",
  size = "lg",
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      minHeight: size === "md" ? "var(--field-height-desktop)" : "var(--field-height)",
      padding: "0 var(--space-6)",
      background: "var(--white)",
      border: `var(--border-hairline) solid ${focus ? "var(--border-brand)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-pill)",
      boxShadow: focus ? "var(--ring-focus)" : "var(--shadow-xs)",
      transition: "border-color var(--dur-fast) var(--ease-standard)",
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "search",
    size: 18,
    color: "var(--text-muted)"
  }), /*#__PURE__*/React.createElement("input", _extends({
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    type: "search",
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: "none",
      outline: "none",
      background: "transparent",
      fontFamily: "var(--font-core)",
      fontSize: "var(--text-base)",
      color: "var(--text-primary)"
    }
  }, rest)), value ? /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onClear,
    "aria-label": "Clear search",
    style: {
      display: "flex",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      padding: 0,
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "x",
    size: 18
  })) : null);
}
Object.assign(__ds_scope, { SearchField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchField.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Select({
  label,
  hint,
  error,
  options = [],
  value,
  onChange,
  placeholder = "Select",
  disabled = false,
  size = "lg",
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useId();
  const sid = id || uid;
  const h = size === "md" ? "var(--field-height-desktop)" : "var(--field-height)";
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: sid,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-secondary)",
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase"
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: sid,
    value: value,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: "none",
      width: "100%",
      minHeight: h,
      padding: "0 var(--space-9) 0 var(--space-6)",
      fontFamily: "var(--font-core)",
      fontSize: "var(--text-base)",
      color: value ? "var(--text-primary)" : "var(--text-muted)",
      background: disabled ? "var(--surface-sunken)" : "var(--white)",
      border: `${error ? "var(--border-strong)" : "var(--border-hairline)"} solid ${error ? "var(--border-danger)" : focus ? "var(--border-brand)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      boxShadow: focus ? "var(--ring-focus)" : "none",
      outline: "none",
      cursor: disabled ? "not-allowed" : "pointer"
    }
  }, rest), /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => {
    const val = typeof o === "string" ? o : o.value;
    const lab = typeof o === "string" ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: val,
      value: val
    }, lab);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      right: "var(--space-6)",
      pointerEvents: "none",
      display: "flex"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 18,
    color: "var(--text-muted)"
  }))), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: error ? "var(--text-danger)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Switch({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-6)",
      minHeight: "var(--tap-min)",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? .55 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-base)",
      color: "var(--text-primary)"
    }
  }, label), description && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: "var(--text-muted)"
    }
  }, description)), /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch",
    checked: checked,
    onChange: onChange,
    disabled: disabled,
    style: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1
    }
  }, rest)), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "relative",
      width: 48,
      height: 28,
      flex: "0 0 auto",
      borderRadius: "var(--radius-pill)",
      background: checked ? "var(--action-primary)" : "var(--ink-200)",
      transition: "background var(--dur-base) var(--ease-standard)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 3,
      left: checked ? 23 : 3,
      width: 22,
      height: 22,
      borderRadius: "var(--radius-pill)",
      background: "var(--white)",
      boxShadow: "var(--shadow-sm)",
      transition: "left var(--dur-base) var(--ease-standard)"
    }
  })));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Textarea({
  label,
  hint,
  error,
  rows = 4,
  value,
  onChange,
  placeholder,
  disabled = false,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const uid = React.useId();
  const tid = id || uid;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: tid,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-secondary)",
      letterSpacing: "var(--ls-label)",
      textTransform: "uppercase"
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: tid,
    rows: rows,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      fontFamily: "var(--font-core)",
      fontSize: "var(--text-base)",
      lineHeight: "var(--lh-normal)",
      color: "var(--text-primary)",
      padding: "var(--space-5) var(--space-6)",
      resize: "vertical",
      background: disabled ? "var(--surface-sunken)" : "var(--white)",
      border: `${error ? "var(--border-strong)" : "var(--border-hairline)"} solid ${error ? "var(--border-danger)" : focus ? "var(--border-brand)" : "var(--border-default)"}`,
      borderRadius: "var(--radius-md)",
      boxShadow: focus ? "var(--ring-focus)" : "none",
      outline: "none"
    }
  }, rest)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: error ? "var(--text-danger)" : "var(--text-muted)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function BottomNav({
  items = [],
  activeItem,
  onSelect,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("nav", _extends({
    style: {
      display: "grid",
      gridTemplateColumns: `repeat(${items.length || 1},1fr)`,
      height: "var(--bottomnav-height)",
      background: "var(--surface-card)",
      borderTop: "var(--border-hairline) solid var(--border-default)",
      boxShadow: "0 -2px 10px rgba(18,23,27,.05)",
      ...style
    }
  }, rest), items.map(it => {
    const active = it.id === activeItem;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      onClick: () => onSelect && onSelect(it.id),
      "aria-current": active ? "page" : undefined,
      style: {
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        minHeight: "var(--tap-min)",
        border: "none",
        background: "transparent",
        color: active ? "var(--text-brand)" : "var(--text-muted)",
        cursor: "pointer",
        padding: 0
      }
    }, active && /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 0,
        width: 28,
        height: 3,
        borderRadius: "0 0 3px 3px",
        background: "var(--action-primary)"
      }
    }), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 22,
      strokeWidth: active ? 2.25 : 2
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-3xs)",
        fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)",
        letterSpacing: "var(--ls-label)"
      }
    }, it.label), it.badge ? /*#__PURE__*/React.createElement("span", {
      style: {
        position: "absolute",
        top: 8,
        right: "26%",
        minWidth: 16,
        height: 16,
        padding: "0 4px",
        borderRadius: "var(--radius-pill)",
        background: "var(--action-danger)",
        color: "var(--white)",
        fontSize: 10,
        fontWeight: "var(--fw-bold)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }
    }, it.badge) : null);
  }));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SegmentedControl.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function SegmentedControl({
  options = [],
  value,
  onChange,
  size = "md",
  fullWidth = true,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "group",
    style: {
      display: fullWidth ? "grid" : "inline-grid",
      gridTemplateColumns: `repeat(${options.length || 1},1fr)`,
      gap: 2,
      padding: 3,
      background: "var(--surface-sunken)",
      border: "var(--border-hairline) solid var(--border-default)",
      borderRadius: "var(--radius-md)",
      ...style
    }
  }, rest), options.map(o => {
    const val = typeof o === "string" ? o : o.value;
    const lab = typeof o === "string" ? o : o.label;
    const active = val === value;
    return /*#__PURE__*/React.createElement("button", {
      key: val,
      type: "button",
      onClick: () => onChange && onChange(val),
      style: {
        minHeight: size === "sm" ? 32 : 40,
        padding: "0 var(--space-6)",
        border: "none",
        borderRadius: "var(--radius-sm)",
        background: active ? "var(--white)" : "transparent",
        boxShadow: active ? "var(--shadow-xs)" : "none",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        fontSize: size === "sm" ? "var(--text-xs)" : "var(--text-sm)",
        fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)",
        cursor: "pointer",
        transition: "background var(--dur-fast) var(--ease-standard)"
      }
    }, lab);
  }));
}
Object.assign(__ds_scope, { SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Sidebar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Sidebar({
  sections = [],
  activeItem,
  onSelect,
  footer,
  collapsed = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("aside", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      width: collapsed ? "var(--sidebar-width-collapsed)" : "var(--sidebar-width)",
      flex: "0 0 auto",
      background: "var(--surface-card)",
      borderRight: "var(--border-hairline) solid var(--border-default)",
      padding: "var(--space-6) var(--space-5)",
      gap: "var(--space-8)",
      ...style
    }
  }, rest), sections.map((sec, si) => /*#__PURE__*/React.createElement("div", {
    key: sec.label || si,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)"
    }
  }, sec.label && !collapsed && /*#__PURE__*/React.createElement("span", {
    style: {
      padding: "0 var(--space-5) var(--space-3)",
      fontSize: "var(--text-3xs)",
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-caps)",
      textTransform: "uppercase",
      color: "var(--text-muted)"
    }
  }, sec.label), sec.items.map(it => {
    const active = it.id === activeItem;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      onClick: () => onSelect && onSelect(it.id),
      title: collapsed ? it.label : undefined,
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-5)",
        minHeight: 42,
        padding: collapsed ? "0" : "0 var(--space-5)",
        justifyContent: collapsed ? "center" : "flex-start",
        border: "none",
        borderRadius: "var(--radius-sm)",
        background: active ? "var(--surface-brand-soft)" : "transparent",
        color: active ? "var(--text-brand)" : "var(--text-secondary)",
        fontSize: "var(--text-sm)",
        fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)",
        textAlign: "left",
        cursor: "pointer",
        transition: "background var(--dur-fast) var(--ease-standard)"
      }
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 18
    }), !collapsed && /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, it.label), !collapsed && it.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-3xs)",
        fontWeight: "var(--fw-semibold)",
        fontVariantNumeric: "tabular-nums",
        color: active ? "var(--green-700)" : "var(--text-muted)",
        background: active ? "var(--green-100)" : "var(--surface-sunken)",
        borderRadius: "var(--radius-pill)",
        padding: "1px 7px"
      }
    }, it.count));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto"
    }
  }, footer));
}
Object.assign(__ds_scope, { Sidebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Sidebar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Tabs({
  items = [],
  activeItem,
  onSelect,
  fullWidth = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "tablist",
    style: {
      display: "flex",
      gap: "var(--space-7)",
      borderBottom: "var(--border-hairline) solid var(--border-default)",
      overflowX: "auto",
      ...style
    }
  }, rest), items.map(it => {
    const active = it.id === activeItem;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      role: "tab",
      "aria-selected": active,
      type: "button",
      onClick: () => onSelect && onSelect(it.id),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-4)",
        flex: fullWidth ? 1 : "0 0 auto",
        justifyContent: "center",
        minHeight: 44,
        padding: "0 var(--space-2)",
        border: "none",
        borderBottom: `2px solid ${active ? "var(--action-primary)" : "transparent"}`,
        marginBottom: -1,
        background: "transparent",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
        fontSize: "var(--text-sm)",
        fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)",
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "color var(--dur-fast) var(--ease-standard)"
      }
    }, it.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 16
    }), it.label, it.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--text-2xs)",
        color: "var(--text-muted)",
        fontVariantNumeric: "tabular-nums"
      }
    }, it.count));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/navigation/TopNav.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const ROLE = {
  farmer: "var(--role-farmer)",
  buyer: "var(--role-buyer)",
  fpo: "var(--role-fpo)",
  admin: "var(--role-admin)"
};
function TopNav({
  brand = "Krishi Mitra",
  role = "buyer",
  items = [],
  activeItem,
  onSelect,
  right,
  compact = false,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-8)",
      height: compact ? 56 : "var(--topnav-height)",
      padding: `0 ${compact ? "var(--space-6)" : "var(--space-9)"}`,
      background: "var(--surface-card)",
      borderBottom: "var(--border-hairline) solid var(--border-default)",
      boxShadow: "var(--shadow-xs)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 30,
      height: 30,
      borderRadius: "var(--radius-sm)",
      background: "var(--green-700)",
      color: "var(--white)",
      fontFamily: "var(--font-display)",
      fontSize: 15,
      fontWeight: "var(--fw-bold)"
    }
  }, "K"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-md)",
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-display)"
    }
  }, brand), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: "var(--space-3)",
      padding: "2px var(--space-4)",
      borderRadius: "var(--radius-xs)",
      background: "var(--surface-sunken)",
      border: `var(--border-hairline) solid var(--border-default)`,
      borderLeft: `3px solid ${ROLE[role]}`,
      fontSize: "var(--text-3xs)",
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-caps)",
      textTransform: "uppercase",
      color: "var(--text-secondary)"
    }
  }, role)), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      flex: 1,
      minWidth: 0
    }
  }, items.map(it => {
    const active = it.id === activeItem;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      type: "button",
      onClick: () => onSelect && onSelect(it.id),
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--space-4)",
        height: 38,
        padding: "0 var(--space-6)",
        border: "none",
        borderRadius: "var(--radius-sm)",
        background: active ? "var(--surface-brand-soft)" : "transparent",
        color: active ? "var(--text-brand)" : "var(--text-secondary)",
        fontSize: "var(--text-sm)",
        fontWeight: active ? "var(--fw-semibold)" : "var(--fw-medium)",
        cursor: "pointer",
        transition: "background var(--dur-fast) var(--ease-standard)"
      }
    }, it.icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: it.icon,
      size: 16
    }), it.label);
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-5)",
      flex: "0 0 auto"
    }
  }, right));
}
Object.assign(__ds_scope, { TopNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/TopNav.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const PADS = {
  sm: "var(--space-6)",
  md: "var(--space-7)",
  lg: "var(--space-8)"
};
function Card({
  title,
  subtitle,
  icon,
  action,
  footer,
  padding = "md",
  tone = "default",
  interactive = false,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const tones = {
    default: {
      bg: "var(--surface-card)",
      border: "var(--border-default)"
    },
    brand: {
      bg: "var(--surface-brand-soft)",
      border: "var(--green-200)"
    },
    accent: {
      bg: "var(--surface-accent-soft)",
      border: "var(--amber-200)"
    },
    trust: {
      bg: "var(--surface-trust-soft)",
      border: "var(--indigo-200)"
    },
    sunken: {
      bg: "var(--surface-sunken)",
      border: "var(--border-subtle)"
    },
    inverse: {
      bg: "var(--surface-inverse)",
      border: "transparent"
    }
  };
  const t = tones[tone] || tones.default;
  const inv = tone === "inverse";
  return /*#__PURE__*/React.createElement("section", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      flexDirection: "column",
      background: t.bg,
      border: `var(--border-hairline) solid ${t.border}`,
      borderRadius: "var(--radius-lg)",
      boxShadow: interactive && hover ? "var(--shadow-md)" : "var(--shadow-sm)",
      transform: interactive && hover ? "translateY(-1px)" : "none",
      transition: "box-shadow var(--dur-base) var(--ease-standard),transform var(--dur-base) var(--ease-standard)",
      cursor: interactive ? "pointer" : "default",
      overflow: "hidden",
      ...style
    }
  }, rest), (title || action) && /*#__PURE__*/React.createElement("header", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-6)",
      padding: `${PADS[padding]} ${PADS[padding]} 0`
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      gap: "var(--space-5)",
      alignItems: "flex-start"
    }
  }, icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 36,
      height: 36,
      borderRadius: "var(--radius-sm)",
      background: inv ? "rgba(255,255,255,.1)" : "var(--surface-brand-soft)",
      color: inv ? "var(--green-300)" : "var(--text-brand)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--text-md)",
      color: inv ? "var(--text-inverse)" : "var(--text-primary)"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-xs)",
      color: inv ? "var(--green-200)" : "var(--text-secondary)"
    }
  }, subtitle))), action), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: PADS[padding],
      color: inv ? "var(--text-inverse)" : "inherit"
    }
  }, children), footer && /*#__PURE__*/React.createElement("footer", {
    style: {
      padding: `var(--space-5) ${PADS[padding]}`,
      borderTop: "var(--border-hairline) solid var(--border-subtle)",
      background: inv ? "transparent" : "var(--surface-sunken)",
      fontSize: "var(--text-xs)",
      color: inv ? "var(--green-200)" : "var(--text-secondary)"
    }
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/ListingCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ListingCard({
  crop,
  variety,
  quantity,
  grade,
  price,
  priceUnit = "/ quintal",
  location,
  distance,
  status,
  trust = [],
  thumbnail,
  action,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("article", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      gap: "var(--space-6)",
      padding: "var(--space-6)",
      background: "var(--surface-card)",
      border: "var(--border-hairline) solid var(--border-default)",
      borderRadius: "var(--radius-lg)",
      boxShadow: hover ? "var(--shadow-md)" : "var(--shadow-sm)",
      transform: hover ? "translateY(-1px)" : "none",
      transition: "box-shadow var(--dur-base) var(--ease-standard),transform var(--dur-base) var(--ease-standard)",
      cursor: onClick ? "pointer" : "default",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 64,
      height: 64,
      flex: "0 0 auto",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      background: "var(--surface-brand-soft)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "var(--border-hairline) solid var(--green-200)"
    }
  }, thumbnail ? /*#__PURE__*/React.createElement("img", {
    src: thumbnail,
    alt: "",
    style: {
      width: "100%",
      height: "100%",
      objectFit: "cover"
    }
  }) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "wheat",
    size: 26,
    color: "var(--green-600)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--text-md)",
      letterSpacing: "var(--ls-tight)"
    }
  }, crop, variety && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-secondary)",
      fontWeight: "var(--fw-regular)"
    }
  }, " \xB7 ", variety)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "var(--space-5)",
      marginTop: 2,
      fontSize: "var(--text-xs)",
      color: "var(--text-secondary)"
    }
  }, quantity && /*#__PURE__*/React.createElement("span", {
    style: {
      fontVariantNumeric: "tabular-nums"
    }
  }, quantity), grade && /*#__PURE__*/React.createElement("span", null, "Grade ", grade), location && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map-pin",
    size: 12,
    color: "var(--text-muted)"
  }), location, distance ? ` · ${distance}` : ""))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "right",
      flex: "0 0 auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: "var(--text-xl)",
      fontWeight: "var(--fw-semibold)",
      fontVariantNumeric: "tabular-nums",
      letterSpacing: "var(--ls-display)"
    }
  }, price), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: "var(--text-2xs)",
      color: "var(--text-muted)"
    }
  }, priceUnit))), (trust.length || status || action) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-5)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-4)",
      flexWrap: "wrap"
    }
  }, status && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    label: status.label,
    tone: status.tone
  }), trust.map(t => /*#__PURE__*/React.createElement(__ds_scope.TrustBadge, {
    key: t,
    type: t,
    size: "sm"
  }))), action)));
}
Object.assign(__ds_scope, { ListingCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/ListingCard.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/MetaRow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function MetaRow({
  source,
  updated,
  note,
  align = "left",
  style,
  ...rest
}) {
  const item = (icon, strong, rest2) => /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 13,
    color: "var(--text-muted)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-muted)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: "var(--fw-semibold)",
      color: "var(--text-secondary)"
    }
  }, strong), rest2 ? " " + rest2 : ""));
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "var(--space-6)",
      justifyContent: align === "right" ? "flex-end" : "space-between" === align ? "space-between" : "flex-start",
      fontSize: "var(--text-2xs)",
      ...style
    }
  }, rest), source && item("database", "Source:", source), updated && item("clock", "Updated:", updated), note && item("info", note, ""));
}
Object.assign(__ds_scope, { MetaRow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/MetaRow.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/StatCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function StatCard({
  label,
  value,
  unit,
  delta,
  deltaDirection = "flat",
  caption,
  icon,
  tone = "default",
  size = "md",
  style,
  ...rest
}) {
  const dirColor = {
    up: "var(--price-up)",
    down: "var(--price-down)",
    flat: "var(--price-flat)"
  }[deltaDirection];
  const glyph = {
    up: "▲",
    down: "▼",
    flat: "—"
  }[deltaDirection];
  const valueSize = size === "lg" ? "var(--text-4xl)" : size === "sm" ? "var(--text-xl)" : "var(--text-3xl)";
  const tones = {
    default: "var(--surface-card)",
    brand: "var(--surface-brand-soft)",
    accent: "var(--surface-accent-soft)",
    inverse: "var(--surface-inverse)"
  };
  const inv = tone === "inverse";
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      padding: "var(--space-7)",
      background: tones[tone] || tones.default,
      border: `var(--border-hairline) solid ${inv ? "transparent" : "var(--border-default)"}`,
      borderRadius: "var(--radius-lg)",
      boxShadow: "var(--shadow-sm)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-2xs)",
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-caps)",
      textTransform: "uppercase",
      color: inv ? "var(--green-300)" : "var(--text-muted)"
    }
  }, label), icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 18,
    color: inv ? "var(--green-300)" : "var(--text-muted)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-display)",
      fontSize: valueSize,
      fontWeight: "var(--fw-semibold)",
      letterSpacing: "var(--ls-display)",
      lineHeight: "var(--lh-tight)",
      fontVariantNumeric: "tabular-nums lining-nums",
      color: inv ? "var(--text-inverse)" : "var(--text-primary)"
    }
  }, value), unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--text-sm)",
      color: inv ? "var(--green-200)" : "var(--text-secondary)"
    }
  }, unit)), (delta || caption) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      fontSize: "var(--text-xs)"
    }
  }, delta && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--space-2)",
      color: dirColor,
      fontWeight: "var(--fw-semibold)",
      fontVariantNumeric: "tabular-nums"
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      fontSize: 10
    }
  }, glyph), delta), caption && /*#__PURE__*/React.createElement("span", {
    style: {
      color: inv ? "var(--green-200)" : "var(--text-muted)"
    }
  }, caption)));
}
Object.assign(__ds_scope, { StatCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/StatCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin_console/DisputesScreen.jsx
try { (() => {
function DisputesScreen() {
  const {
    StatCard,
    DataTable,
    Badge,
    Button,
    Card,
    Timeline,
    MetaRow,
    Tabs,
    StateView,
    Textarea,
    Alert,
    TrustBadge
  } = window.KrishiMitraDesignSystem_e4a29d;
  const d = window.ADMIN_DATA;
  const [tab, setTab] = React.useState("open");
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30
    }
  }, "Disputes"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, "Escrow releases frozen pending resolution \xB7 SLA 72 hours")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Open",
    value: "3",
    caption: "1 past SLA",
    icon: "alert-octagon"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Value frozen",
    value: "\u20B92.12L",
    tone: "accent",
    icon: "lock"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Resolved (30d)",
    value: "41",
    delta: "94% within SLA",
    deltaDirection: "up",
    icon: "check-circle-2"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Dispute rate",
    value: "0.9%",
    delta: "0.2%",
    deltaDirection: "down",
    caption: "of settled lots"
  })), /*#__PURE__*/React.createElement(Tabs, {
    activeItem: tab,
    onSelect: setTab,
    items: [{
      id: "open",
      label: "Open",
      count: 3
    }, {
      id: "resolved",
      label: "Resolved",
      count: 41
    }, {
      id: "escalated",
      label: "Escalated"
    }]
  }), tab === "escalated" ? /*#__PURE__*/React.createElement(StateView, {
    kind: "empty",
    title: "Nothing escalated",
    description: "Disputes unresolved after 72 hours are escalated to the trade desk automatically.",
    compact: true
  }) : /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    columns: [{
      key: "id",
      label: "Dispute"
    }, {
      key: "lot",
      label: "Lot"
    }, {
      key: "parties",
      label: "Parties",
      wrap: true
    }, {
      key: "amount",
      label: "Frozen",
      numeric: true,
      align: "right"
    }, {
      key: "reason",
      label: "Reason",
      wrap: true
    }, {
      key: "age",
      label: "Age",
      align: "right"
    }, {
      key: "state",
      label: "State",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        label: r.state,
        tone: r.tone,
        size: "sm",
        dot: true
      })
    }, {
      key: "act",
      label: "",
      align: "right",
      render: () => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary"
      }, "Open")
    }],
    rows: d.disputes,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "3 of 44 disputes"), /*#__PURE__*/React.createElement(MetaRow, {
      source: "Escrow ledger + gate records",
      updated: "4 min ago",
      align: "right"
    }))
  }), /*#__PURE__*/React.createElement(Alert, {
    tone: "danger",
    title: "D-2210 is 2 days old \xB7 SLA breach in 24 hours"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.2fr 1fr',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "D-2210 \xB7 lot KM-48120",
    subtitle: "S. Deshmukh \u2194 Shree Agro \xB7 \u20B91,25,640 frozen",
    icon: "alert-octagon",
    padding: "md",
    footer: /*#__PURE__*/React.createElement(MetaRow, {
      source: "Gate weighbridge \xB7 Akola",
      updated: "12 Aug, 8:40 AM",
      note: "Ticket WB-77120"
    })
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      title: "Escrow funded",
      description: "₹1,25,640",
      time: "10 Aug",
      state: "done"
    }, {
      title: "Gate weighment recorded",
      description: "38.2 quintal against 40.0 declared",
      time: "12 Aug, 8:40 AM",
      state: "done"
    }, {
      title: "Farmer contested weighbridge reading",
      description: "Requested re-weigh",
      time: "12 Aug, 9:55 AM",
      state: "done"
    }, {
      title: "Re-weigh scheduled",
      description: "Independent bridge, Akola APMC",
      time: "15 Aug",
      state: "current"
    }, {
      title: "Decision and release",
      state: "pending"
    }]
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Resolution",
    icon: "gavel",
    padding: "md"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Textarea, {
    label: "Findings",
    rows: 4,
    placeholder: "Recorded in the escrow ledger and sent to both parties"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    fullWidth: true
  }, "Release 38.2 qtl value"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md",
    fullWidth: true
  }, "Hold for re-weigh")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(TrustBadge, {
    type: "escrow",
    size: "sm"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "assayed",
    size: "sm"
  }))))));
}
Object.assign(window, {
  DisputesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin_console/DisputesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin_console/PriceSourcesScreen.jsx
try { (() => {
function PriceSourcesScreen() {
  const {
    StatCard,
    DataTable,
    Badge,
    Button,
    Card,
    MetaRow,
    PriceChart,
    Switch,
    Alert,
    Timeline
  } = window.KrishiMitraDesignSystem_e4a29d;
  const d = window.ADMIN_DATA;
  const [auto, setAuto] = React.useState(true);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30
    }
  }, "Price sources"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, "Every price shown in the product traces to one of these feeds")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Active feeds",
    value: "5",
    caption: "1 failing",
    icon: "database"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Mandis covered",
    value: "1,412",
    delta: "18",
    deltaDirection: "up",
    icon: "map-pin"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Median latency",
    value: "18",
    unit: "min",
    delta: "3 min",
    deltaDirection: "down",
    icon: "clock"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Stale quotes",
    value: "2.1%",
    delta: "0.4%",
    deltaDirection: "up",
    icon: "alert-triangle"
  })), /*#__PURE__*/React.createElement(Alert, {
    tone: "danger",
    title: "State board feed \xB7 MH has not returned data since yesterday 5:10 PM",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary"
    }, "Open runbook")
  }, "Maharashtra quotes are falling back to Agmarknet. Farmer screens show the fallback source in the provenance line."), /*#__PURE__*/React.createElement(DataTable, {
    caption: "Feed health",
    columns: [{
      key: "name",
      label: "Source"
    }, {
      key: "scope",
      label: "Scope",
      wrap: true
    }, {
      key: "latency",
      label: "Latency",
      align: "right"
    }, {
      key: "health",
      label: "Health",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        label: r.health,
        tone: r.tone,
        size: "sm",
        dot: true
      })
    }, {
      key: "updated",
      label: "Last update"
    }, {
      key: "act",
      label: "",
      align: "right",
      render: () => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary"
      }, "Configure")
    }],
    rows: d.sources,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "5 sources"), /*#__PURE__*/React.createElement(MetaRow, {
      source: "Feed monitor",
      updated: "30 s ago",
      align: "right"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Agmarknet \xB7 wheat, Nashik",
    subtitle: "Published series as farmers see it",
    icon: "trending-up",
    padding: "md",
    footer: /*#__PURE__*/React.createElement(MetaRow, {
      source: "Agmarknet",
      updated: "Today, 6:40 AM"
    })
  }, /*#__PURE__*/React.createElement(PriceChart, {
    series: [2310, 2350, 2402, 2388, 2455, 2485],
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    msp: 2275,
    valueFormat: v => "₹" + v,
    height: 180
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Publication rules",
    icon: "settings",
    padding: "md"
  }, /*#__PURE__*/React.createElement(Switch, {
    label: "Auto-fallback to Agmarknet",
    description: "When a state feed is stale over 6 hours",
    checked: auto,
    onChange: () => setAuto(!auto)
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Show MSP on every crop chart",
    description: "Where a CACP price exists",
    checked: true,
    onChange: () => {}
  }), /*#__PURE__*/React.createElement(Switch, {
    label: "Hold quotes older than 24 hours",
    description: "Farmer screens show the offline state instead",
    checked: true,
    onChange: () => {}
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Recent changes",
    icon: "file-text",
    padding: "md"
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      title: "MH feed marked failing",
      time: "Today, 6:05 AM",
      state: "failed"
    }, {
      title: "Fallback to Agmarknet applied",
      description: "Automatic · 412 mandis",
      time: "Today, 6:06 AM",
      state: "done"
    }, {
      title: "MSP table updated for Rabi 2026",
      time: "01 Jun",
      state: "done"
    }]
  })))));
}
Object.assign(window, {
  PriceSourcesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin_console/PriceSourcesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin_console/VerificationScreen.jsx
try { (() => {
function VerificationScreen() {
  const {
    StatCard,
    DataTable,
    Badge,
    Button,
    Card,
    Modal,
    Textarea,
    MetaRow,
    Tabs,
    TrustBadge,
    Stepper,
    Alert
  } = window.KrishiMitraDesignSystem_e4a29d;
  const d = window.ADMIN_DATA;
  const [open, setOpen] = React.useState(null);
  const [tab, setTab] = React.useState("pending");
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30
    }
  }, "Verification queue"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, "Farmer KYC and buyer onboarding \xB7 38 pending, P95 age 7.4 hours")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Pending",
    value: "38",
    delta: "12 today",
    deltaDirection: "up",
    icon: "user-check"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Approved (7d)",
    value: "286",
    delta: "4%",
    deltaDirection: "up",
    icon: "shield-check"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Rejected (7d)",
    value: "19",
    caption: "6.2% of decided",
    icon: "x-circle"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "High risk flags",
    value: "3",
    caption: "manual review",
    icon: "alert-triangle"
  })), /*#__PURE__*/React.createElement(Alert, {
    tone: "warning",
    title: "One submission has a name mismatch against bank records",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      onClick: () => setOpen(d.kyc[3])
    }, "Review M-1044")
  }), /*#__PURE__*/React.createElement(Tabs, {
    activeItem: tab,
    onSelect: setTab,
    items: [{
      id: "pending",
      label: "Pending",
      count: 38
    }, {
      id: "approved",
      label: "Approved"
    }, {
      id: "rejected",
      label: "Rejected",
      count: 19
    }]
  }), /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    onRowClick: r => setOpen(r),
    columns: [{
      key: "id",
      label: "ID"
    }, {
      key: "name",
      label: "Applicant"
    }, {
      key: "type",
      label: "Type"
    }, {
      key: "docs",
      label: "Documents",
      wrap: true
    }, {
      key: "submitted",
      label: "Submitted"
    }, {
      key: "risk",
      label: "Risk",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        label: r.risk,
        tone: r.risk === "High" ? "danger" : r.risk === "Medium" ? "warning" : "neutral",
        size: "sm"
      })
    }, {
      key: "state",
      label: "State",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        label: r.state,
        tone: r.tone,
        size: "sm",
        dot: true
      })
    }, {
      key: "act",
      label: "",
      align: "right",
      render: r => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary",
        onClick: e => {
          e.stopPropagation();
          setOpen(r);
        }
      }, "Review")
    }],
    rows: d.kyc,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "4 of 38 submissions"), /*#__PURE__*/React.createElement(MetaRow, {
      source: "KYC service",
      updated: "1 min ago",
      align: "right"
    }))
  }), open && /*#__PURE__*/React.createElement(Modal, {
    width: 620,
    title: "Review " + open.id + " · " + open.name,
    subtitle: open.type + " · submitted " + open.submitted,
    onClose: () => setOpen(null),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setOpen(null)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "danger",
      onClick: () => setOpen(null)
    }, "Reject"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      iconLeft: "shield-check",
      onClick: () => setOpen(null)
    }, "Approve"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Stepper, {
    current: 2,
    steps: [{
      label: "Submitted"
    }, {
      label: "Auto checks"
    }, {
      label: "Manual review"
    }, {
      label: "Decision"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      fontSize: 13
    }
  }, [["Documents", open.docs], ["Risk score", open.risk], ["Aadhaar match", "Passed"], ["Bank name match", open.risk === "High" ? "Failed" : "Passed"], ["Land record", "Verified · 2.1 ha"], ["Duplicate check", "No match"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 12px',
      background: 'var(--surface-sunken)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600
    }
  }, v)))), /*#__PURE__*/React.createElement(Textarea, {
    label: "Decision note",
    rows: 3,
    placeholder: "Visible to the applicant",
    hint: "Shared with the applicant by SMS in their chosen language"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(TrustBadge, {
    type: "verified-farmer",
    size: "sm"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "price-source",
    size: "sm"
  })))));
}
Object.assign(window, {
  VerificationScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin_console/VerificationScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin_console/data.js
try { (() => {
window.ADMIN_DATA = {
  kyc: [{
    id: "M-1066",
    name: "A. Shinde",
    type: "Farmer",
    docs: "Aadhaar, land record",
    submitted: "14 Aug, 8:12 AM",
    risk: "Low",
    state: "Pending",
    tone: "warning"
  }, {
    id: "M-1058",
    name: "P. Kale",
    type: "Farmer",
    docs: "Aadhaar",
    submitted: "14 Aug, 7:40 AM",
    risk: "Medium",
    state: "Docs unclear",
    tone: "warning"
  }, {
    id: "B-0311",
    name: "Ganesh Foods Pvt Ltd",
    type: "Buyer",
    docs: "GST, PAN, bank",
    submitted: "13 Aug, 6:02 PM",
    risk: "Low",
    state: "Pending",
    tone: "warning"
  }, {
    id: "M-1044",
    name: "S. Gaikwad",
    type: "Farmer",
    docs: "Aadhaar, bank",
    submitted: "13 Aug, 2:15 PM",
    risk: "High",
    state: "Name mismatch",
    tone: "danger"
  }],
  sources: [{
    id: "agmarknet",
    name: "Agmarknet",
    scope: "All India · APMC daily",
    latency: "14 min",
    health: "Healthy",
    tone: "success",
    updated: "Today, 6:40 AM"
  }, {
    id: "enam",
    name: "eNAM",
    scope: "1,361 mandis",
    latency: "22 min",
    health: "Healthy",
    tone: "success",
    updated: "Today, 6:32 AM"
  }, {
    id: "msp",
    name: "MSP schedule (CACP)",
    scope: "23 crops · seasonal",
    latency: "—",
    health: "Static",
    tone: "neutral",
    updated: "01 Jun, 2026"
  }, {
    id: "fpo",
    name: "FPO desk entries",
    scope: "48 FPOs",
    latency: "Manual",
    health: "Degraded",
    tone: "warning",
    updated: "Today, 11:20 AM"
  }, {
    id: "mandi-scrape",
    name: "State board feed · MH",
    scope: "Maharashtra",
    latency: "—",
    health: "Failing",
    tone: "danger",
    updated: "Yesterday, 5:10 PM"
  }],
  disputes: [{
    id: "D-2210",
    lot: "KM-48120",
    parties: "S. Deshmukh ↔ Shree Agro",
    amount: "₹1,25,640",
    reason: "Weight mismatch 38.2 / 40.0 qtl",
    age: "2 days",
    state: "Open",
    tone: "danger"
  }, {
    id: "D-2204",
    lot: "KM-48096",
    parties: "Ambad Growers ↔ Ganesh Foods",
    amount: "₹86,400",
    reason: "Moisture above spec",
    age: "4 days",
    state: "Awaiting assay",
    tone: "warning"
  }, {
    id: "D-2188",
    lot: "KM-48061",
    parties: "K. Jadhav ↔ Shree Agro",
    amount: "₹64,900",
    reason: "Delivery delay",
    age: "9 days",
    state: "Resolved",
    tone: "success"
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin_console/data.js", error: String((e && e.message) || e) }); }

// ui_kits/buyer_console/EscrowScreen.jsx
try { (() => {
function EscrowScreen() {
  const {
    StatCard,
    DataTable,
    Badge,
    Button,
    Card,
    MetaRow,
    Timeline,
    StateView,
    Alert,
    Tabs
  } = window.KrishiMitraDesignSystem_e4a29d;
  const d = window.BUYER_DATA;
  const [tab, setTab] = React.useState("all");
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30
    }
  }, "Escrow & settlement"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, "Funds held against accepted lots, released on confirmed weighment")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Held",
    value: "\u20B94,18,600",
    caption: "3 orders",
    icon: "lock",
    tone: "accent"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Released (Aug)",
    value: "\u20B912,40,300",
    delta: "18 orders",
    deltaDirection: "up",
    icon: "indian-rupee"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Disputed",
    value: "\u20B91,25,640",
    caption: "1 order",
    icon: "alert-octagon"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Avg. release time",
    value: "19",
    unit: "hours",
    delta: "4 hours",
    deltaDirection: "down",
    caption: "after weighment"
  })), /*#__PURE__*/React.createElement(Alert, {
    tone: "danger",
    title: "Weight mismatch on ESC-9031",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary"
    }, "Open dispute")
  }, "Gate recorded 38.2 quintal against 40.0 quintal declared. Release is frozen until resolved."), /*#__PURE__*/React.createElement(Tabs, {
    activeItem: tab,
    onSelect: setTab,
    items: [{
      id: "all",
      label: "All",
      count: 24
    }, {
      id: "held",
      label: "Held",
      count: 3
    }, {
      id: "released",
      label: "Released"
    }, {
      id: "disputed",
      label: "Disputed",
      count: 1
    }]
  }), tab === "released" ? /*#__PURE__*/React.createElement(StateView, {
    kind: "search",
    title: "No released escrow this week",
    description: "Releases appear here within 24 hours of gate weighment.",
    compact: true
  }) : /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: "id",
      label: "Escrow ID"
    }, {
      key: "lot",
      label: "Lot"
    }, {
      key: "counterparty",
      label: "Seller"
    }, {
      key: "amount",
      label: "Amount",
      numeric: true,
      align: "right"
    }, {
      key: "state",
      label: "State",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        label: r.state,
        tone: r.tone,
        size: "sm",
        dot: true
      })
    }, {
      key: "due",
      label: "Next step",
      wrap: true
    }, {
      key: "act",
      label: "",
      align: "right",
      render: r => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: r.state === "Held" ? "primary" : "secondary"
      }, r.state === "Held" ? "Release" : "Ledger")
    }],
    rows: d.escrow,
    caption: "Escrow ledger",
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "3 of 24 entries"), /*#__PURE__*/React.createElement(MetaRow, {
      source: "Krishi Mitra escrow ledger",
      updated: "Today, 7:25 AM",
      align: "right"
    }))
  }), /*#__PURE__*/React.createElement(Card, {
    title: "ESC-9042 \xB7 Lot KM-48155",
    subtitle: "Ramesh Patil \xB7 \u20B978,560",
    icon: "lock",
    padding: "md",
    footer: /*#__PURE__*/React.createElement(MetaRow, {
      source: "Escrow ledger",
      updated: "Today, 7:25 AM",
      note: "UTR 6291840371"
    })
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      title: "Bid accepted",
      description: "₹2,455 / quintal · 32 quintal",
      time: "09 Aug, 11:02 AM",
      state: "done"
    }, {
      title: "Escrow funded",
      description: "₹78,560 debited from Shree Agro",
      time: "09 Aug, 11:40 AM",
      state: "done"
    }, {
      title: "Weighed at gate",
      description: "32.0 quintal · Grade A confirmed",
      time: "11 Aug, 7:25 AM",
      state: "current"
    }, {
      title: "Release to farmer",
      description: "Auto-release within 24 hours",
      state: "pending"
    }]
  })));
}
Object.assign(window, {
  EscrowScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/buyer_console/EscrowScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/buyer_console/LotDetailScreen.jsx
try { (() => {
function LotDetailScreen({
  onNavigate
}) {
  const {
    Card,
    StatCard,
    PriceChart,
    MetaRow,
    TrustBadge,
    Badge,
    Button,
    Modal,
    Input,
    Timeline,
    DataTable,
    Alert,
    Tabs
  } = window.KrishiMitraDesignSystem_e4a29d;
  const [bid, setBid] = React.useState(false);
  const [placed, setPlaced] = React.useState(false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("button", {
    onClick: () => onNavigate("lots"),
    style: {
      background: 'none',
      border: 'none',
      padding: 0,
      fontSize: 13,
      color: 'var(--text-brand)',
      cursor: 'pointer',
      fontWeight: 600
    }
  }, "\u2190 Open lots"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30,
      marginTop: 8
    }
  }, "Wheat \xB7 Lokwan ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 16,
      fontWeight: 400,
      color: 'var(--text-muted)'
    }
  }, "KM-48213")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    label: "Open",
    tone: "success",
    dot: true
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "verified-farmer"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "assayed"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "price-source"
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md",
    iconLeft: "bookmark"
  }, "Watch"), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "md",
    iconLeft: "gavel",
    onClick: () => setBid(true)
  }, "Place bid"))), placed && /*#__PURE__*/React.createElement(Alert, {
    tone: "info",
    title: "Bid placed \xB7 \u20B92,470 / quintal",
    onDismiss: () => setPlaced(false)
  }, "Ramesh Patil has 24 hours to accept. Escrow will be requested on acceptance."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Ask price",
    value: "\u20B92,485",
    unit: "/ qtl",
    delta: "\u20B965 \xB7 2.7%",
    deltaDirection: "up",
    caption: "vs yesterday"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Quantity",
    value: "40.0",
    unit: "quintal",
    caption: "Single lot, no split"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Lot value",
    value: "\u20B999,400",
    tone: "accent",
    icon: "indian-rupee"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Distance",
    value: "12",
    unit: "km",
    caption: "Nashik APMC gate",
    icon: "map-pin"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Price history \xB7 Nashik APMC",
    subtitle: "Wheat Lokwan, MSP reference shown",
    icon: "trending-up",
    padding: "md",
    footer: /*#__PURE__*/React.createElement(MetaRow, {
      source: "Agmarknet",
      updated: "Today, 6:40 AM"
    })
  }, /*#__PURE__*/React.createElement(PriceChart, {
    series: [2310, 2350, 2402, 2388, 2455, 2485],
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    msp: 2275,
    valueFormat: v => "₹" + v,
    height: 200
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Quality",
    subtitle: "Lab assayed 11 Aug",
    icon: "flask-conical",
    padding: "md"
  }, /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    columns: [{
      key: "k",
      label: "Parameter"
    }, {
      key: "v",
      label: "Value",
      numeric: true,
      align: "right"
    }, {
      key: "s",
      label: "Spec"
    }],
    rows: [{
      k: "Moisture",
      v: "11.2%",
      s: "≤ 12%"
    }, {
      k: "Foreign matter",
      v: "0.6%",
      s: "≤ 1%"
    }, {
      k: "Shrivelled",
      v: "1.8%",
      s: "≤ 3%"
    }, {
      k: "Grade",
      v: "A",
      s: "FAQ"
    }],
    style: {
      border: 'none',
      boxShadow: 'none'
    }
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Seller",
    subtitle: "Ramesh Patil \xB7 Ozar FPO member",
    icon: "user-check",
    padding: "md"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      lineHeight: 1.6
    }
  }, "18 completed sales \xB7 0 disputes \xB7 Aadhaar and bank verified")))), /*#__PURE__*/React.createElement(Card, {
    title: "Lot activity",
    icon: "clock",
    padding: "md"
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      title: "Lot listed",
      description: "40 quintal at ₹2,485 / quintal",
      time: "12 Aug, 9:10 AM",
      state: "done"
    }, {
      title: "Assay uploaded",
      description: "Grade A · moisture 11.2%",
      time: "12 Aug, 4:20 PM",
      state: "done"
    }, {
      title: "Bid ₹2,455 by Ganesh Foods",
      description: "Withdrawn after 40 minutes",
      time: "13 Aug, 8:05 AM",
      state: "done"
    }, {
      title: "Open for bids",
      description: "Closes 14 Aug, 6:00 PM",
      state: "current"
    }, {
      title: "Escrow funding",
      state: "pending"
    }]
  })), bid && /*#__PURE__*/React.createElement(Modal, {
    title: "Place bid \xB7 KM-48213",
    subtitle: "Wheat Lokwan \xB7 40 quintal \xB7 Nashik APMC",
    onClose: () => setBid(false),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setBid(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      iconLeft: "lock",
      onClick: () => {
        setBid(false);
        setPlaced(true);
      }
    }, "Place bid and reserve escrow"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Your bid",
    prefix: "\u20B9",
    suffix: "/ qtl",
    numeric: true,
    defaultValue: "2470",
    size: "md",
    hint: "Ask is \u20B92,485 \xB7 MSP \u20B92,275"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Quantity",
    suffix: "quintal",
    numeric: true,
    defaultValue: "40",
    size: "md",
    hint: "Full lot only"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      padding: '14px 16px',
      background: 'var(--surface-accent-soft)',
      border: '1px solid var(--amber-200)',
      borderRadius: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--amber-800)',
      fontWeight: 600
    }
  }, "Escrow to be funded on acceptance"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 24,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums'
    }
  }, "\u20B998,800")), /*#__PURE__*/React.createElement(Alert, {
    tone: "info",
    title: "Escrow Protected"
  }, "Funds are debited only when the farmer accepts, and released after gate weighment."))));
}
Object.assign(window, {
  LotDetailScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/buyer_console/LotDetailScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/buyer_console/MarketplaceScreen.jsx
try { (() => {
function MarketplaceScreen({
  onNavigate
}) {
  const {
    StatCard,
    DataTable,
    Badge,
    TrustBadge,
    Sparkline,
    Button,
    Tabs,
    Select,
    SegmentedControl,
    MetaRow,
    BarChart,
    Card
  } = window.KrishiMitraDesignSystem_e4a29d;
  const d = window.BUYER_DATA;
  const [tab, setTab] = React.useState("open");
  const [unit, setUnit] = React.useState("q");
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30
    }
  }, "Marketplace"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, "24 open lots within 120 km of Nashik \xB7 6 FPO-aggregated")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Select, {
    options: ["All crops", "Wheat", "Soybean", "Cotton", "Gram"],
    value: "All crops",
    onChange: () => {},
    size: "md",
    style: {
      width: 170
    }
  }), /*#__PURE__*/React.createElement(Select, {
    options: ["Within 120 km", "Within 60 km", "Any distance"],
    value: "Within 120 km",
    onChange: () => {},
    size: "md",
    style: {
      width: 190
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md",
    iconLeft: "sliders-horizontal"
  }, "Filters"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Open lots",
    value: "24",
    caption: "8 new today",
    icon: "package"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Avg. wheat ask",
    value: "\u20B92,512",
    unit: "/ qtl",
    delta: "\u20B938 \xB7 1.5%",
    deltaDirection: "up",
    icon: "trending-up"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Escrow held",
    value: "\u20B94.19L",
    caption: "3 orders",
    tone: "accent",
    icon: "lock"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Rejection rate",
    value: "1.4%",
    delta: "0.3%",
    deltaDirection: "down",
    caption: "last 30 days",
    icon: "alert-triangle"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement(Tabs, {
    activeItem: tab,
    onSelect: setTab,
    items: [{
      id: "open",
      label: "Open",
      count: 24
    }, {
      id: "bidding",
      label: "My bids",
      count: 6
    }, {
      id: "accepted",
      label: "Accepted",
      count: 4
    }, {
      id: "delivered",
      label: "Delivered"
    }]
  }), /*#__PURE__*/React.createElement(SegmentedControl, {
    options: [{
      label: "Quintal",
      value: "q"
    }, {
      label: "Tonne",
      value: "t"
    }],
    value: unit,
    onChange: setUnit,
    size: "sm",
    fullWidth: false
  })), /*#__PURE__*/React.createElement(DataTable, {
    dense: true,
    onRowClick: () => onNavigate("bids"),
    columns: [{
      key: "id",
      label: "Lot"
    }, {
      key: "crop",
      label: "Crop",
      wrap: true
    }, {
      key: "farmer",
      label: "Seller",
      render: r => /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }
      }, /*#__PURE__*/React.createElement("span", null, r.farmer), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'flex',
          gap: 4
        }
      }, r.trust.slice(0, 2).map(t => /*#__PURE__*/React.createElement(TrustBadge, {
        key: t,
        type: t,
        size: "sm"
      }))))
    }, {
      key: "mandi",
      label: "Mandi"
    }, {
      key: "qty",
      label: "Qty (qtl)",
      numeric: true,
      align: "right"
    }, {
      key: "ask",
      label: "Ask",
      numeric: true,
      align: "right",
      sortable: true
    }, {
      key: "trend",
      label: "7 day",
      render: r => /*#__PURE__*/React.createElement(Sparkline, {
        series: r.trend,
        direction: r.dir
      })
    }, {
      key: "status",
      label: "Status",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        label: r.status,
        tone: r.tone,
        size: "sm"
      })
    }, {
      key: "act",
      label: "",
      align: "right",
      render: r => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: r.status === "Open" ? "accent" : "secondary",
        onClick: e => {
          e.stopPropagation();
          onNavigate("bids");
        }
      }, r.status === "Open" ? "Place bid" : "View")
    }],
    rows: d.lots,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "Showing 5 of 24 lots"), /*#__PURE__*/React.createElement(MetaRow, {
      source: "Agmarknet + FPO desks",
      updated: "2 min ago",
      align: "right"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.4fr 1fr',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Arrivals by mandi",
    subtitle: "This week \xB7 quintal",
    icon: "chart-no-axes-column",
    padding: "md",
    footer: /*#__PURE__*/React.createElement(MetaRow, {
      source: "APMC arrivals feed",
      updated: "Today, 6:40 AM"
    })
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: [{
      label: "Nashik APMC",
      value: 1240
    }, {
      label: "Pimpalgaon",
      value: 860
    }, {
      label: "Latur",
      value: 640
    }, {
      label: "Jalna",
      value: 410
    }, {
      label: "Akola",
      value: 230
    }],
    horizontal: true,
    valueFormat: v => v.toLocaleString('en-IN')
  })), /*#__PURE__*/React.createElement(Card, {
    tone: "trust",
    title: "Escrow protects both sides",
    icon: "lock",
    padding: "md"
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      lineHeight: 1.5
    }
  }, "Funds are held by Krishi Mitra and released to the farmer only after weight and grade are confirmed at the delivery gate. Disputes freeze the release until resolved."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(TrustBadge, {
    type: "escrow"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "assayed"
  })))));
}
Object.assign(window, {
  MarketplaceScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/buyer_console/MarketplaceScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/buyer_console/data.js
try { (() => {
window.BUYER_DATA = {
  lots: [{
    id: "KM-48213",
    crop: "Wheat · Lokwan",
    farmer: "Ramesh Patil",
    fpo: "Ozar FPO",
    mandi: "Nashik APMC",
    qty: "40.0",
    ask: "₹2,485",
    trend: [2310, 2350, 2402, 2388, 2455, 2485],
    dir: "up",
    status: "Open",
    tone: "success",
    trust: ["verified-farmer", "assayed"]
  }, {
    id: "KM-48208",
    crop: "Soybean · JS-335",
    farmer: "Latur Kisan FPO",
    fpo: "Latur Kisan FPO",
    mandi: "Latur",
    qty: "180.0",
    ask: "₹4,120",
    trend: [4260, 4210, 4180, 4150, 4130, 4120],
    dir: "down",
    status: "Bidding",
    tone: "warning",
    trust: ["fpo"]
  }, {
    id: "KM-48191",
    crop: "Cotton · Shankar-6",
    farmer: "S. Deshmukh",
    fpo: "—",
    mandi: "Akola",
    qty: "12.5",
    ask: "₹7,340",
    trend: [7300, 7320, 7310, 7335, 7340, 7340],
    dir: "flat",
    status: "Open",
    tone: "success",
    trust: ["verified-farmer"]
  }, {
    id: "KM-48187",
    crop: "Gram · Vijay",
    farmer: "Ambad Growers",
    fpo: "Ambad Growers",
    mandi: "Jalna",
    qty: "64.0",
    ask: "₹5,410",
    trend: [5300, 5340, 5380, 5390, 5400, 5410],
    dir: "up",
    status: "Open",
    tone: "success",
    trust: ["fpo", "assayed"]
  }, {
    id: "KM-48160",
    crop: "Wheat · Sharbati",
    farmer: "K. Jadhav",
    fpo: "—",
    mandi: "Pimpalgaon",
    qty: "26.0",
    ask: "₹2,610",
    trend: [2560, 2580, 2590, 2600, 2605, 2610],
    dir: "up",
    status: "Accepted",
    tone: "info",
    trust: ["verified-farmer"]
  }],
  escrow: [{
    id: "ESC-9042",
    lot: "KM-48155",
    counterparty: "Ramesh Patil",
    amount: "₹78,560",
    state: "Held",
    tone: "info",
    due: "Release on weighment"
  }, {
    id: "ESC-9038",
    lot: "KM-48141",
    counterparty: "Latur Kisan FPO",
    amount: "₹2,14,400",
    state: "Released",
    tone: "success",
    due: "11 Aug"
  }, {
    id: "ESC-9031",
    lot: "KM-48120",
    counterparty: "S. Deshmukh",
    amount: "₹1,25,640",
    state: "Disputed",
    tone: "danger",
    due: "Weight mismatch"
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/buyer_console/data.js", error: String((e && e.message) || e) }); }

// ui_kits/farmer_app/HomeScreen.jsx
try { (() => {
function HomeScreen({
  onNavigate
}) {
  const {
    StatCard,
    Card,
    MetaRow,
    ListingCard,
    Button,
    TrustBadge,
    PriceChart,
    Badge,
    Alert
  } = window.KrishiMitraDesignSystem_e4a29d;
  const d = window.KM_DATA;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)'
    }
  }, "Namaste, ", d.farmer.name), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24,
      letterSpacing: '-0.02em',
      marginTop: 2
    }
  }, d.farmer.village)), /*#__PURE__*/React.createElement(Card, {
    tone: "inverse",
    padding: "md",
    style: {
      borderRadius: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'var(--green-300)',
      fontWeight: 600
    }
  }, d.price.crop, " \xB7 ", d.price.variety, " \xB7 ", d.price.mandi), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 8,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 44,
      fontWeight: 600,
      letterSpacing: '-.02em',
      fontVariantNumeric: 'tabular-nums',
      color: '#fff'
    }
  }, "\u20B9", d.price.value.toLocaleString('en-IN')), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--green-200)'
    }
  }, "/ quintal")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginTop: 6,
      fontSize: 13,
      color: 'var(--green-300)',
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u25B2 \u20B9", d.price.delta, " \xB7 ", d.price.pct), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--green-200)',
      fontWeight: 400
    }
  }, "vs yesterday")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14,
      background: 'rgba(255,255,255,.06)',
      borderRadius: 12,
      padding: '10px 12px'
    }
  }, /*#__PURE__*/React.createElement(PriceChart, {
    series: d.price.series,
    msp: d.price.msp,
    valueFormat: v => "₹" + v,
    height: 72,
    color: "var(--green-300)",
    gridLines: 2
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 12,
      fontSize: 11,
      color: 'var(--green-200)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Source: ", d.price.source), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, "Updated: ", d.price.updated))), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "xl",
    fullWidth: true,
    iconLeft: "circle-plus",
    onClick: () => onNavigate("sell")
  }, "Sell your crop"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Escrow protected",
    value: "\u20B978,560",
    caption: "1 order in transit",
    icon: "lock",
    size: "sm"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Paid this season",
    value: "\u20B93.4L",
    caption: "6 lots",
    icon: "indian-rupee",
    size: "sm"
  })), /*#__PURE__*/React.createElement(Alert, {
    tone: "warning",
    title: "Add your bank IFSC to receive payment",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary"
    }, "Add bank details")
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 18
    }
  }, "Your lots"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "sm",
    iconRight: "chevron-right",
    onClick: () => onNavigate("orders")
  }, "All orders")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, d.lots.map(l => /*#__PURE__*/React.createElement(ListingCard, {
    key: l.id,
    crop: l.crop,
    variety: l.variety,
    quantity: l.qty,
    grade: l.grade,
    price: l.price,
    location: d.price.mandi,
    status: l.status,
    trust: l.trust,
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: l.status.tone === "warning" ? "accent" : "secondary"
    }, l.status.tone === "warning" ? "View bid" : "Edit"),
    onClick: () => onNavigate("orders")
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      padding: '12px 0 4px'
    }
  }, /*#__PURE__*/React.createElement(TrustBadge, {
    type: "verified-farmer",
    size: "sm"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "escrow",
    size: "sm"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "price-source",
    size: "sm"
  })));
}
Object.assign(window, {
  HomeScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/farmer_app/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/farmer_app/OrdersScreen.jsx
try { (() => {
function OrdersScreen() {
  const {
    Tabs,
    Card,
    Timeline,
    Badge,
    TrustBadge,
    Button,
    MetaRow,
    StatCard,
    StateView
  } = window.KrishiMitraDesignSystem_e4a29d;
  const o = window.KM_DATA.order;
  const [tab, setTab] = React.useState("active");
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24
    }
  }, "Orders"), /*#__PURE__*/React.createElement(Tabs, {
    fullWidth: true,
    activeItem: tab,
    onSelect: setTab,
    items: [{
      id: "active",
      label: "Active",
      count: 2
    }, {
      id: "paid",
      label: "Paid",
      count: 6
    }, {
      id: "draft",
      label: "Drafts"
    }]
  }), tab !== "draft" ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    title: o.crop,
    subtitle: "Lot " + o.id + " · " + o.qty,
    icon: "wheat",
    action: /*#__PURE__*/React.createElement(Badge, {
      label: "In transit",
      tone: "info",
      dot: true
    }),
    footer: /*#__PURE__*/React.createElement(MetaRow, {
      source: "Escrow ledger",
      updated: "Today, 7:25 AM",
      note: o.utr
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Agreed rate",
    value: o.rate,
    unit: "/ qtl",
    size: "sm"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Held in escrow",
    value: o.total,
    tone: "accent",
    icon: "lock",
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(TrustBadge, {
    type: "verified-buyer",
    size: "sm"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "escrow",
    size: "sm"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "assayed",
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)',
      marginBottom: 14
    }
  }, "Buyer: ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-primary)'
    }
  }, o.buyer)), /*#__PURE__*/React.createElement(Timeline, {
    items: o.timeline
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 16
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "lg",
    fullWidth: true,
    iconLeft: "phone"
  }, "Call buyer"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    fullWidth: true,
    iconLeft: "file-text"
  }, "Receipt")))) : /*#__PURE__*/React.createElement(StateView, {
    kind: "empty",
    title: "No drafts",
    description: "Lots you start and do not finish are saved here, including when you are offline.",
    action: /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "lg"
    }, "List a lot")
  }));
}
Object.assign(window, {
  OrdersScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/farmer_app/OrdersScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/farmer_app/PricesScreen.jsx
try { (() => {
function PricesScreen() {
  const {
    Card,
    MetaRow,
    PriceChart,
    SegmentedControl,
    Sparkline,
    SearchField,
    Badge,
    StateView,
    Button
  } = window.KrishiMitraDesignSystem_e4a29d;
  const d = window.KM_DATA;
  const [range, setRange] = React.useState("1M");
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24
    }
  }, "Mandi prices"), /*#__PURE__*/React.createElement(SearchField, {
    value: "",
    onChange: () => {},
    placeholder: "Search crop or mandi"
  }), /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    footer: /*#__PURE__*/React.createElement(MetaRow, {
      source: d.price.source,
      updated: d.price.updated
    })
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 11,
      letterSpacing: '.08em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      fontWeight: 600
    }
  }, d.price.crop, " \xB7 ", d.price.variety), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 36,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-.02em',
      marginTop: 4
    }
  }, "\u20B92,485"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--price-up)',
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums'
    }
  }, "\u25B2 \u20B965 \xB7 2.7%")), /*#__PURE__*/React.createElement(Badge, {
    label: "MSP \u20B92,275",
    tone: "warning",
    icon: "landmark"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(PriceChart, {
    series: d.price.series,
    labels: d.price.labels,
    msp: d.price.msp,
    valueFormat: v => "₹" + v,
    height: 140
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(SegmentedControl, {
    options: ["7D", "1M", "3M", "1Y"],
    value: range,
    onChange: setRange,
    size: "sm"
  }))), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: 18
    }
  }, "Nearby mandis"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, d.nearby.map(m => /*#__PURE__*/React.createElement("div", {
    key: m.mandi,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '14px 16px',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 12,
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 15,
      fontWeight: 600
    }
  }, m.mandi), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--text-muted)'
    }
  }, m.km, " away")), /*#__PURE__*/React.createElement(Sparkline, {
    series: m.series,
    direction: m.dir
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 18,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums'
    }
  }, "\u20B9", m.price.toLocaleString('en-IN')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      color: m.dir === "up" ? 'var(--price-up)' : m.dir === "down" ? 'var(--price-down)' : 'var(--price-flat)'
    }
  }, m.dir === "up" ? "▲" : m.dir === "down" ? "▼" : "—", " ", m.delta))))), /*#__PURE__*/React.createElement(StateView, {
    compact: true,
    kind: "offline",
    title: "Prices are from your last sync",
    description: "Showing rates saved at 6:40 AM today. Connect to refresh.",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary"
    }, "Retry now")
  }));
}
Object.assign(window, {
  PricesScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/farmer_app/PricesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/farmer_app/SellScreen.jsx
try { (() => {
function SellScreen({
  onNavigate
}) {
  const {
    Stepper,
    Card,
    Input,
    Select,
    Radio,
    Checkbox,
    Button,
    BottomSheet,
    TrustBadge,
    Alert,
    MetaRow,
    Badge
  } = window.KrishiMitraDesignSystem_e4a29d;
  const d = window.KM_DATA;
  const [step, setStep] = React.useState(2);
  const [mode, setMode] = React.useState("escrow");
  const [assay, setAssay] = React.useState(true);
  const [sheet, setSheet] = React.useState(false);
  const [done, setDone] = React.useState(false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 24
    }
  }, "List a lot"), /*#__PURE__*/React.createElement(Stepper, {
    current: step,
    steps: [{
      label: "Crop"
    }, {
      label: "Quantity"
    }, {
      label: "Price"
    }, {
      label: "Review"
    }]
  }), /*#__PURE__*/React.createElement(Card, {
    padding: "md"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Crop",
    options: ["Wheat", "Soybean", "Cotton", "Gram"],
    value: "Wheat",
    onChange: () => {}
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Select, {
    label: "Variety",
    options: ["Lokwan", "Sharbati"],
    value: "Lokwan",
    onChange: () => {}
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Grade",
    options: ["A", "B", "C"],
    value: "A",
    onChange: () => {}
  })), /*#__PURE__*/React.createElement(Input, {
    label: "Quantity",
    suffix: "quintal",
    numeric: true,
    defaultValue: "40"
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Expected price",
    prefix: "\u20B9",
    suffix: "/ quintal",
    numeric: true,
    defaultValue: "2485",
    hint: "Today's Nashik APMC average is \u20B92,485. MSP is \u20B92,275."
  }))), /*#__PURE__*/React.createElement(Card, {
    padding: "md",
    title: "Payment",
    icon: "lock",
    subtitle: "How you want to be paid"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Radio, {
    name: "pay",
    label: "Escrow (recommended)",
    description: "Money held by Krishi Mitra until weight is confirmed at the gate",
    checked: mode === "escrow",
    onChange: () => setMode("escrow")
  }), /*#__PURE__*/React.createElement(Radio, {
    name: "pay",
    label: "Direct bank transfer",
    description: "Buyer pays you directly after delivery",
    checked: mode === "direct",
    onChange: () => setMode("direct")
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Lab assaying at mandi gate",
    description: "\u20B940 per lot \xB7 raises average realised price",
    checked: assay,
    onChange: () => setAssay(!assay)
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(TrustBadge, {
    type: "escrow",
    size: "sm"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "verified-buyer",
    size: "sm"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "assayed",
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      bottom: 0,
      background: 'var(--surface-canvas)',
      paddingTop: 12,
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--text-secondary)'
    }
  }, "Estimated value \xB7 40 qtl"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 24,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums'
    }
  }, "\u20B999,400")), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "xl",
    fullWidth: true,
    onClick: () => setSheet(true)
  }, "Review and list lot")), sheet && !done && /*#__PURE__*/React.createElement(BottomSheet, {
    title: "Confirm listing",
    subtitle: "Wheat \xB7 Lokwan \xB7 Grade A",
    onClose: () => setSheet(false),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      size: "xl",
      fullWidth: true,
      onClick: () => setDone(true)
    }, "Confirm and list"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "lg",
      fullWidth: true,
      onClick: () => setSheet(false)
    }, "Back"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      fontSize: 14
    }
  }, [["Quantity", "40.0 quintal"], ["Expected price", "₹2,485 / quintal"], ["Estimated value", "₹99,400"], ["Payment", "Escrow protected"], ["Assaying", "Yes · ₹40"]].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 12,
      paddingBottom: 8,
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-secondary)'
    }
  }, k), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums'
    }
  }, v))), /*#__PURE__*/React.createElement(Alert, {
    tone: "offline",
    title: "You are offline"
  }, "This lot is saved on your phone and will be listed automatically when the network returns."))), done && /*#__PURE__*/React.createElement(BottomSheet, {
    title: "Lot saved",
    subtitle: "KM-48221",
    onClose: () => {
      setDone(false);
      setSheet(false);
    },
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      size: "xl",
      fullWidth: true,
      onClick: () => onNavigate("orders")
    }, "Track this lot"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "lg",
      fullWidth: true,
      onClick: () => {
        setDone(false);
        setSheet(false);
      }
    }, "List another"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    label: "Queued offline \xB7 will list on sync",
    tone: "offline",
    dot: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--text-secondary)'
    }
  }, "Verified buyers within 60 km will be notified as soon as the lot goes live. You will get an SMS when the first bid arrives."), /*#__PURE__*/React.createElement(MetaRow, {
    source: "Agmarknet",
    updated: d.price.updated
  }))));
}
Object.assign(window, {
  SellScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/farmer_app/SellScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/farmer_app/data.js
try { (() => {
const KM_DATA = {
  farmer: {
    name: "Ramesh Patil",
    village: "Ozar, Nashik"
  },
  price: {
    crop: "Wheat",
    variety: "Lokwan",
    mandi: "Nashik APMC",
    value: 2485,
    delta: 65,
    pct: "2.7%",
    msp: 2275,
    series: [2310, 2350, 2402, 2388, 2455, 2485],
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    source: "Agmarknet",
    updated: "Today, 6:40 AM"
  },
  nearby: [{
    mandi: "Nashik APMC",
    price: 2485,
    dir: "up",
    delta: "+2.7%",
    km: "12 km",
    series: [2310, 2350, 2402, 2388, 2455, 2485]
  }, {
    mandi: "Pimpalgaon",
    price: 2440,
    dir: "up",
    delta: "+1.1%",
    km: "24 km",
    series: [2400, 2410, 2405, 2420, 2432, 2440]
  }, {
    mandi: "Lasalgaon",
    price: 2395,
    dir: "down",
    delta: "-0.6%",
    km: "31 km",
    series: [2430, 2420, 2415, 2402, 2398, 2395]
  }, {
    mandi: "Manmad",
    price: 2360,
    dir: "flat",
    delta: "0.0%",
    km: "48 km",
    series: [2360, 2358, 2362, 2360, 2359, 2360]
  }],
  lots: [{
    id: "KM-48213",
    crop: "Wheat",
    variety: "Lokwan",
    qty: "40 quintal",
    grade: "A",
    price: "₹2,485",
    buyer: "Shree Agro Traders",
    status: {
      label: "Bid received",
      tone: "warning"
    },
    trust: ["verified-buyer", "escrow"]
  }, {
    id: "KM-48196",
    crop: "Soybean",
    variety: "JS-335",
    qty: "18 quintal",
    grade: "B",
    price: "₹4,120",
    buyer: "—",
    status: {
      label: "Open",
      tone: "success"
    },
    trust: ["fpo"]
  }],
  order: {
    id: "KM-48155",
    crop: "Wheat · Lokwan",
    qty: "32 quintal",
    rate: "₹2,455",
    total: "₹78,560",
    buyer: "Ganesh Foods Pvt Ltd",
    utr: "UTR 6291840371",
    timeline: [{
      title: "Lot listed",
      time: "08 Aug, 9:10 AM",
      state: "done"
    }, {
      title: "Bid accepted",
      description: "₹2,455 / quintal",
      time: "09 Aug, 11:02 AM",
      state: "done"
    }, {
      title: "Escrow funded",
      description: "₹78,560 held by Krishi Mitra",
      time: "09 Aug, 11:40 AM",
      state: "done"
    }, {
      title: "Weighed at Nashik APMC gate",
      description: "32.0 quintal · Grade A confirmed",
      time: "11 Aug, 7:25 AM",
      state: "current"
    }, {
      title: "Payment released to bank",
      description: "Expected within 24 hours of weighment",
      state: "pending"
    }]
  }
};
window.KM_DATA = KM_DATA;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/farmer_app/data.js", error: String((e && e.message) || e) }); }

// ui_kits/fpo_console/AggregationScreen.jsx
try { (() => {
function AggregationScreen({
  onNavigate
}) {
  const {
    StatCard,
    Card,
    DataTable,
    Badge,
    Button,
    Stepper,
    MetaRow,
    BarChart,
    PriceChart,
    TrustBadge,
    Alert,
    Modal,
    Input,
    Select
  } = window.KrishiMitraDesignSystem_e4a29d;
  const d = window.FPO_DATA;
  const [publish, setPublish] = React.useState(false);
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30
    }
  }, "Wheat pool \xB7 Rabi 2026"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, "Pool WP-118 \xB7 closes 16 Aug, 6:00 PM \xB7 412 members eligible")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "md",
    iconLeft: "user-plus"
  }, "Add member lot"), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "md",
    iconLeft: "store",
    onClick: () => setPublish(true)
  }, "Publish collective lot"))), /*#__PURE__*/React.createElement(Card, {
    padding: "md"
  }, /*#__PURE__*/React.createElement(Stepper, {
    current: 2,
    steps: [{
      label: "Pool opened"
    }, {
      label: "Member lots collected"
    }, {
      label: "Assay & grading"
    }, {
      label: "Published to buyers"
    }, {
      label: "Payout"
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Pooled quantity",
    value: "137.5",
    unit: "quintal",
    delta: "18.0 qtl today",
    deltaDirection: "up",
    icon: "layers"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Members contributing",
    value: "24",
    caption: "of 412 eligible",
    icon: "users"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Indicative value",
    value: "\u20B93.42L",
    tone: "accent",
    icon: "indian-rupee",
    caption: "at \u20B92,485 / qtl"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Assay pending",
    value: "1",
    caption: "26.0 qtl held back",
    icon: "flask-conical"
  })), /*#__PURE__*/React.createElement(Alert, {
    tone: "warning",
    title: "One member lot failed assay",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary"
    }, "Notify A. Shinde")
  }, "31.0 quintal graded C against pool minimum of B. It has been excluded from the collective lot."), /*#__PURE__*/React.createElement(DataTable, {
    caption: "Member contributions",
    dense: true,
    columns: [{
      key: "member",
      label: "Member"
    }, {
      key: "village",
      label: "Village"
    }, {
      key: "qty",
      label: "Qty (qtl)",
      numeric: true,
      align: "right"
    }, {
      key: "grade",
      label: "Grade"
    }, {
      key: "assay",
      label: "Assay"
    }, {
      key: "status",
      label: "Status",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        label: r.status,
        tone: r.tone,
        size: "sm",
        dot: true
      })
    }, {
      key: "act",
      label: "",
      align: "right",
      render: () => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary"
      }, "Open")
    }],
    rows: d.pool,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "5 of 24 contributions"), /*#__PURE__*/React.createElement(MetaRow, {
      source: "FPO desk entry",
      updated: "Today, 11:20 AM",
      align: "right"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "Pool build-up",
    subtitle: "Quintal collected per day",
    icon: "chart-no-axes-column",
    padding: "md"
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: [{
      label: "09",
      value: 18
    }, {
      label: "10",
      value: 34
    }, {
      label: "11",
      value: 22
    }, {
      label: "12",
      value: 26
    }, {
      label: "13",
      value: 19
    }, {
      label: "14",
      value: 18.5
    }],
    valueFormat: v => v,
    height: 160
  })), /*#__PURE__*/React.createElement(Card, {
    title: "Reference price",
    subtitle: "Nashik APMC \xB7 wheat Lokwan",
    icon: "trending-up",
    padding: "md",
    footer: /*#__PURE__*/React.createElement(MetaRow, {
      source: "Agmarknet",
      updated: "Today, 6:40 AM"
    })
  }, /*#__PURE__*/React.createElement(PriceChart, {
    series: [2310, 2350, 2402, 2388, 2455, 2485],
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    msp: 2275,
    valueFormat: v => "₹" + v,
    height: 160
  }))), publish && /*#__PURE__*/React.createElement(Modal, {
    title: "Publish collective lot",
    subtitle: "Pool WP-118 \xB7 137.5 quintal \xB7 Grade A/B",
    onClose: () => setPublish(false),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setPublish(false)
    }, "Cancel"), /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      iconLeft: "store",
      onClick: () => {
        setPublish(false);
        onNavigate("payouts");
      }
    }, "Publish to verified buyers"))
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Ask price",
    prefix: "\u20B9",
    suffix: "/ qtl",
    numeric: true,
    defaultValue: "2485",
    size: "md",
    hint: "Mandi average \u20B92,485"
  }), /*#__PURE__*/React.createElement(Select, {
    label: "Delivery point",
    options: ["Nashik APMC gate", "FPO warehouse, Ozar"],
    value: "Nashik APMC gate",
    onChange: () => {},
    size: "md"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(TrustBadge, {
    type: "fpo"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "assayed"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "escrow"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 13,
      color: 'var(--text-secondary)'
    }
  }, "Payout to 24 members is calculated pro rata on assayed weight once escrow is released."))));
}
Object.assign(window, {
  AggregationScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fpo_console/AggregationScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fpo_console/MembersScreen.jsx
try { (() => {
function MembersScreen() {
  const {
    DataTable,
    Badge,
    Button,
    SearchField,
    Tabs,
    StatCard,
    MetaRow,
    StateView,
    TrustBadge
  } = window.KrishiMitraDesignSystem_e4a29d;
  const d = window.FPO_DATA;
  const [tab, setTab] = React.useState("all");
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30
    }
  }, "Member register"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, "412 members \xB7 38 villages \xB7 Ozar FPO")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(SearchField, {
    value: "",
    onChange: () => {},
    placeholder: "Search member",
    size: "md",
    style: {
      width: 260
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    iconLeft: "user-plus"
  }, "Add member"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Members",
    value: "412",
    delta: "9 this month",
    deltaDirection: "up",
    icon: "users"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "KYC complete",
    value: "94%",
    delta: "2%",
    deltaDirection: "up",
    icon: "shield-check"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Land pooled",
    value: "1,286",
    unit: "ha",
    icon: "map"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Paid this season",
    value: "\u20B91.42Cr",
    tone: "accent",
    icon: "indian-rupee"
  })), /*#__PURE__*/React.createElement(Tabs, {
    activeItem: tab,
    onSelect: setTab,
    items: [{
      id: "all",
      label: "All",
      count: 412
    }, {
      id: "pending",
      label: "KYC pending",
      count: 24
    }, {
      id: "inactive",
      label: "Inactive"
    }]
  }), tab === "inactive" ? /*#__PURE__*/React.createElement(StateView, {
    kind: "empty",
    title: "No inactive members",
    description: "Members with no sale in four seasons appear here.",
    compact: true
  }) : /*#__PURE__*/React.createElement(DataTable, {
    columns: [{
      key: "id",
      label: "ID"
    }, {
      key: "name",
      label: "Member"
    }, {
      key: "village",
      label: "Village"
    }, {
      key: "land",
      label: "Land",
      numeric: true,
      align: "right"
    }, {
      key: "kyc",
      label: "KYC",
      render: r => r.kyc === "Verified" ? /*#__PURE__*/React.createElement(TrustBadge, {
        type: "verified-farmer",
        size: "sm"
      }) : /*#__PURE__*/React.createElement(Badge, {
        label: r.kyc,
        tone: r.tone,
        size: "sm",
        dot: true
      })
    }, {
      key: "sales",
      label: "Sales",
      numeric: true,
      align: "right"
    }, {
      key: "paid",
      label: "Total paid",
      numeric: true,
      align: "right"
    }, {
      key: "act",
      label: "",
      align: "right",
      render: () => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: "secondary"
      }, "Profile")
    }],
    rows: d.members,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "4 of 412 members"), /*#__PURE__*/React.createElement(MetaRow, {
      source: "FPO register",
      updated: "Today, 9:05 AM",
      align: "right"
    }))
  }));
}
Object.assign(window, {
  MembersScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fpo_console/MembersScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fpo_console/PayoutsScreen.jsx
try { (() => {
function PayoutsScreen() {
  const {
    StatCard,
    DataTable,
    Badge,
    Button,
    Card,
    Timeline,
    MetaRow,
    BarChart,
    Alert,
    TrustBadge
  } = window.KrishiMitraDesignSystem_e4a29d;
  const d = window.FPO_DATA;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 30
    }
  }, "Payouts"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--text-secondary)',
      marginTop: 4
    }
  }, "Pro rata distribution to member accounts on assayed weight")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Ready to distribute",
    value: "\u20B92,14,400",
    caption: "14 members \xB7 PO-3391",
    tone: "accent",
    icon: "indian-rupee"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Awaiting escrow release",
    value: "\u20B91,71,800",
    caption: "9 members",
    icon: "lock"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Distributed (Aug)",
    value: "\u20B99,84,200",
    delta: "41 members",
    deltaDirection: "up",
    icon: "check-circle-2"
  })), /*#__PURE__*/React.createElement(Alert, {
    tone: "success",
    title: "Escrow released for lot KM-48141",
    action: /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "accent"
    }, "Distribute \u20B92,14,400")
  }, "Weighment confirmed at Nashik APMC gate. Funds are in the FPO settlement account."), /*#__PURE__*/React.createElement(DataTable, {
    caption: "Payout runs",
    columns: [{
      key: "id",
      label: "Run"
    }, {
      key: "lot",
      label: "Lot"
    }, {
      key: "members",
      label: "Beneficiaries"
    }, {
      key: "amount",
      label: "Amount",
      numeric: true,
      align: "right"
    }, {
      key: "state",
      label: "State",
      render: r => /*#__PURE__*/React.createElement(Badge, {
        label: r.state,
        tone: r.tone,
        size: "sm",
        dot: true
      })
    }, {
      key: "act",
      label: "",
      align: "right",
      render: r => /*#__PURE__*/React.createElement(Button, {
        size: "sm",
        variant: r.state === "Ready" ? "accent" : "secondary"
      }, r.state === "Ready" ? "Distribute" : "View")
    }],
    rows: d.payouts,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", null, "2 open runs"), /*#__PURE__*/React.createElement(MetaRow, {
      source: "Escrow ledger",
      updated: "Today, 7:25 AM",
      align: "right"
    }))
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement(Card, {
    title: "PO-3391 \xB7 lot KM-48141",
    subtitle: "14 members \xB7 \u20B92,14,400",
    icon: "indian-rupee",
    padding: "md",
    footer: /*#__PURE__*/React.createElement(MetaRow, {
      source: "Escrow ledger",
      updated: "Today, 7:25 AM",
      note: "UTR 6291840412"
    })
  }, /*#__PURE__*/React.createElement(Timeline, {
    items: [{
      title: "Collective lot sold",
      description: "87.4 quintal at ₹2,455",
      time: "09 Aug",
      state: "done"
    }, {
      title: "Gate weighment confirmed",
      description: "87.4 quintal · Grade A",
      time: "11 Aug",
      state: "done"
    }, {
      title: "Escrow released to FPO",
      description: "₹2,14,400",
      time: "Today, 7:25 AM",
      state: "done"
    }, {
      title: "Distribution to 14 member accounts",
      description: "Pro rata on assayed weight",
      state: "current"
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 14
    }
  }, /*#__PURE__*/React.createElement(TrustBadge, {
    type: "fpo",
    size: "sm"
  }), /*#__PURE__*/React.createElement(TrustBadge, {
    type: "escrow",
    size: "sm"
  }))), /*#__PURE__*/React.createElement(Card, {
    title: "Payouts by month",
    subtitle: "\u20B9 lakh",
    icon: "chart-no-axes-column",
    padding: "md"
  }, /*#__PURE__*/React.createElement(BarChart, {
    data: [{
      label: "Apr",
      value: 6.2
    }, {
      label: "May",
      value: 8.1
    }, {
      label: "Jun",
      value: 4.4
    }, {
      label: "Jul",
      value: 11.3
    }, {
      label: "Aug",
      value: 9.8
    }],
    valueFormat: v => "₹" + v + "L",
    height: 170
  }))));
}
Object.assign(window, {
  PayoutsScreen
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fpo_console/PayoutsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/fpo_console/data.js
try { (() => {
window.FPO_DATA = {
  pool: [{
    member: "Ramesh Patil",
    village: "Ozar",
    qty: "40.0",
    grade: "A",
    assay: "Done",
    status: "Pooled",
    tone: "success"
  }, {
    member: "Sunita Bhoir",
    village: "Ozar",
    qty: "22.5",
    grade: "A",
    assay: "Done",
    status: "Pooled",
    tone: "success"
  }, {
    member: "K. Jadhav",
    village: "Pimpalgaon",
    qty: "26.0",
    grade: "B",
    assay: "Pending",
    status: "Awaiting assay",
    tone: "warning"
  }, {
    member: "D. More",
    village: "Ozar",
    qty: "18.0",
    grade: "A",
    assay: "Done",
    status: "Pooled",
    tone: "success"
  }, {
    member: "A. Shinde",
    village: "Nandur",
    qty: "31.0",
    grade: "C",
    assay: "Failed",
    status: "Rejected",
    tone: "danger"
  }],
  members: [{
    id: "M-1042",
    name: "Ramesh Patil",
    village: "Ozar",
    land: "3.2 ha",
    kyc: "Verified",
    tone: "success",
    sales: "18",
    paid: "₹3,42,600"
  }, {
    id: "M-1043",
    name: "Sunita Bhoir",
    village: "Ozar",
    land: "1.8 ha",
    kyc: "Verified",
    tone: "success",
    sales: "11",
    paid: "₹1,86,400"
  }, {
    id: "M-1051",
    name: "K. Jadhav",
    village: "Pimpalgaon",
    land: "4.6 ha",
    kyc: "Bank pending",
    tone: "warning",
    sales: "9",
    paid: "₹2,10,900"
  }, {
    id: "M-1066",
    name: "A. Shinde",
    village: "Nandur",
    land: "2.1 ha",
    kyc: "Aadhaar pending",
    tone: "warning",
    sales: "2",
    paid: "₹34,800"
  }],
  payouts: [{
    id: "PO-3391",
    lot: "KM-48141",
    members: "14 members",
    amount: "₹2,14,400",
    state: "Ready",
    tone: "success"
  }, {
    id: "PO-3388",
    lot: "KM-48120",
    members: "9 members",
    amount: "₹1,71,800",
    state: "Awaiting escrow",
    tone: "info"
  }]
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/fpo_console/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.BarChart = __ds_scope.BarChart;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.PriceChart = __ds_scope.PriceChart;

__ds_ns.Sparkline = __ds_scope.Sparkline;

__ds_ns.Stepper = __ds_scope.Stepper;

__ds_ns.Timeline = __ds_scope.Timeline;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.BottomSheet = __ds_scope.BottomSheet;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.OfflineBar = __ds_scope.OfflineBar;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.StateView = __ds_scope.StateView;

__ds_ns.TrustBadge = __ds_scope.TrustBadge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.SearchField = __ds_scope.SearchField;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Sidebar = __ds_scope.Sidebar;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.TopNav = __ds_scope.TopNav;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.ListingCard = __ds_scope.ListingCard;

__ds_ns.MetaRow = __ds_scope.MetaRow;

__ds_ns.StatCard = __ds_scope.StatCard;

})();

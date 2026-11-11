#!/usr/bin/env python3
"""
One-shot design-token migration for Breakout Radar.

Rewrites legacy palette tokens (slate/indigo/emerald/amber + raw hex) into the
@theme tokens defined in src/index.css, normalises the sub-12px type scale to
`text-2xs`, and reports what changed.

Safe by construction: it only rewrites Tailwind colour-utility tokens
(prefix-[#hex] / prefix-slate-900 ...) and fixed px font sizes.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

# --------------------------------------------------------------------------
# hex (lowercase, no #) -> target token, per utility group
# group keys: bg, text, border, ring, fill, stroke, divide, gradient, misc
# value may be a tuple (token, keep_opacity_suffix)
# --------------------------------------------------------------------------
HEX = {
    "bg": {
        "ffffff": "surface", "f8fafc": "surface-subtle", "f1f5f9": "surface-sunken",
        "e2e8f0": "purple-100", "eef2ff": "brand-50", "fdf2f8": "purple-50",
        "ecfdf5": "success-50", "dcfce7": "success-50", "f0fdf4": "success-50",
        "fef3c7": "warning-50", "fffbeb": "warning-50", "eff6ff": "info-50",
        "261a66": "navy-700", "1a1348": "navy-800", "0b1530": "navy-900",
        "0f172a": "navy-900", "120c36": "navy-900",
        "ef5f18": "brand-500", "d95412": "brand-600", "ff8a3d": "brand-400",
        "ea580c": "brand-600", "c8f51f": "brand-500",
        "059669": "success-600", "047857": "success-700", "10b981": "success-600",
        "12b76a": "success-600", "d97706": "warning-600", "f59e0b": "warning-600",
        "2563eb": "info-600", "3b6cff": "info-600", "7155f5": "series-1",
        "7c5cff": "series-1", "824c97": "purple-500", "94a3b8": "purple-300",
        "cbd5e1": "purple-200", "5f6b8a": "navy-500", "dc2626": "danger-600",
        # platform / data-viz brand colours stay untouched
        "1db954": "1DB954", "ff0000": "FF0000", "fa243c": "FA243C",
        "ff5500": "FF5500", "38bdf8": "38BDF8", "ef4444": "EF4444",
        "f43f5e": "F43F5E",         "ba478f": "BA478F", "000000": "000000",
    },
    "text": {
        "261a66": "navy-700", "1a1348": "navy-800", "0f172a": "navy-900",
        "0b1530": "navy-900", "120c36": "navy-900", "334155": "navy-700",
        "312e81": "navy-700", "1e1b4b": "navy-700",
        "824c97": "purple-500", "673d77": "purple-700", "dfe9ff": "navy-100",
        "94a3b8": "purple-300", "cbd5e1": "purple-300", "5f6b8a": "navy-500",
        "ffffff": "white",
        "ef5f18": "brand-500", "d95412": "brand-600", "f0457a": "brand-600",
        "ea580c": "brand-600", "4338ca": "brand-700", "c8f51f": "brand-500",
        "ff8a3d": "brand-400",
        "059669": "success-600", "15803d": "success-700", "047857": "success-700",
        "065f46": "success-700", "10b981": "success-600", "12b76a": "success-600",
        "d97706": "warning-600", "b45309": "warning-700", "92400e": "warning-700",
        "f59e0b": "warning-600",
        "2563eb": "series-4", "7155f5": "series-1", "7c5cff": "series-1",
        "3b6cff": "info-600",
        "ef4444": "danger-600", "f43f5e": "danger-600", "dc2626": "danger-600",
        "0ea5e9": "info-600", "38bdf8": "info-600", "1db954": "success-600",
    },
    "border": {
        "824c97": "__BORDER_PURPLE__",
        "e2e8f0": "line", "f1f5f9": "line", "e5e9f3": "line",
        "cbd5e1": "line-strong",
        "261a66": "navy-700", "0b1530": "navy-700", "5f6b8a": "navy-500",
        "c7d2fe": "brand-100", "a7f3d0": "success-100", "fde68a": "warning-100",
        "ef5f18": "brand-500", "ff8a3d": "brand-400",
        "12b76a": "success-600", "10b981": "success-600", "059669": "success-600",
        "3b6cff": "info-600", "2563eb": "info-600", "7155f5": "series-1",
        "7c5cff": "series-1", "c8f51f": "brand-500", "d97706": "warning-600",
        "dc2626": "danger-600",
    },
    "ring": {
        "3b6cff": "info-600", "7c5cff": "series-1", "7155f5": "series-1",
        "c8f51f": "brand-500", "5f6b8a": "navy-500", "0b1530": "navy-700",
        "ef5f18": "brand-500", "824c97": "purple-500",
    },
    "fill": {"7155f5": "series-1", "ef5f18": "brand-500", "824c97": "purple-500"},
    "stroke": {"7155f5": "series-1", "ef5f18": "brand-500", "824c97": "purple-500"},
    "divide": {"f1f5f9": "line", "e2e8f0": "line"},
    "gradient": {"261a66": "navy-700", "1a1348": "navy-800", "ef5f18": "brand-500",
                 "7155f5": "series-1", "eef2ff": "brand-50"},
}

# Tailwind default-palette classes -> theme tokens, per group
TW = {
    "bg": {"slate-50": "surface-subtle", "slate-100": "purple-50", "slate-200": "purple-100",
           "slate-700": "navy-700", "slate-800": "navy-700", "slate-900": "navy-800",
           "indigo-600": "brand-500", "indigo-700": "brand-600",
           "emerald-50": "success-50", "emerald-600": "success-600", "emerald-700": "success-700",
           "amber-50": "warning-50", "amber-100": "warning-100", "amber-600": "warning-600",
           "blue-600": "info-600", "blue-700": "info-700"},
    "text": {"slate-300": "purple-300", "slate-400": "purple-300", "slate-500": "purple-500",
             "slate-600": "purple-700", "slate-700": "navy-700", "slate-800": "navy-700",
             "slate-900": "navy-700",
             "indigo-500": "brand-600", "indigo-600": "brand-600", "indigo-700": "brand-700",
             "indigo-800": "brand-700",
             "emerald-500": "success-600", "emerald-600": "success-600", "emerald-700": "success-700",
             "amber-500": "warning-600", "amber-600": "warning-600", "amber-700": "warning-700",
             "amber-800": "warning-700",
             "blue-500": "info-600", "blue-600": "info-600", "blue-700": "info-700"},
    "border": {"slate-100": "line", "slate-200": "line", "slate-300": "line-strong",
               "slate-700": "navy-500",
               "indigo-500": "brand-500", "indigo-600": "brand-500",
               "emerald-200": "success-100", "emerald-300": "success-100",
               "emerald-500": "success-600", "emerald-600": "success-600",
               "amber-300": "warning-100", "amber-500": "warning-600",
               "blue-500": "info-600", "blue-600": "info-600"},
    "ring": {"slate-200": "line", "slate-300": "line-strong",
             "indigo-600": "brand-500", "emerald-600": "success-600",
             "amber-600": "warning-600", "blue-600": "info-600"},
    "divide": {"slate-100": "line", "slate-200": "line", "slate-300": "line-strong"},
    "fill": {"emerald-600": "success-600", "blue-600": "info-600"},
    "stroke": {"emerald-600": "success-600", "blue-600": "info-600"},
}

PREFIXES = r"(?:(?:hover|focus|active|disabled|visited|group-hover|placeholder|first|last):)*"
UTILS = r"(?:bg|text|border|ring|fill|stroke|divide|from|to|via)"

# Tokens whose alpha is already baked in -> drop any /NN suffix
ALPHA_BAKED = {"line", "line-strong"}

SIZE_MAP = {
    "text-[8px]": "text-2xs",
    "text-[9px]": "text-2xs",
    "text-[10px]": "text-2xs",
    "text-[11px]": "text-2xs",
    "text-[14px]": "text-sm",
}

changes: dict[str, int] = {}


def bump(key: str, n: int = 1) -> None:
    changes[key] = changes.get(key, 0) + n


def resolve(util: str, hexval: str, opacity: str | None) -> str:
    """Return the full replacement token for `util-[#hex]`, or None if unknown.

    `util` is the literal utility (bg/text/border/from/to/via/...); the lookup
    table groups `from|to|via` under the shared `gradient` key.
    """
    logical = "gradient" if util in ("from", "to", "via") else util
    table = HEX.get(logical, {})
    token = table.get(hexval)
    if token is None:
        return None
    if token == "__BORDER_PURPLE__":
        # #824C97 borders encode their own alpha; collapse to the line tokens
        if opacity is not None:
            keep = int(opacity.lstrip("/")) >= 35
            bump(f"border-purple -> {'strong' if keep else 'base'}")
            return f"{util}-line-strong" if keep else f"{util}-line"
        return f"{util}-line-strong"
    if len(token) == 6 and all(c in "0123456789ABCDEF" for c in token):
        # preserve a third-party / data-viz colour verbatim
        return f"{util}-[#{token}]" + (opacity or "")
    if token in ALPHA_BAKED:
        return f"{util}-{token}"
    return f"{util}-{token}" + (opacity or "")


def hex_repl(match: re.Match) -> str:
    var = match.group("var")
    util, hexval, opacity = match.group("util"), match.group("hex"), match.group("op")
    resolved = resolve(util, hexval.lower(), opacity)
    if resolved is None:
        return match.group(0)
    if resolved != match.group(0):
        bump(f"{util}-[#{hexval.upper()}] -> {resolved}")
    return f"{var}{resolved}" if var else resolved


def tw_repl(match: re.Match) -> str:
    var, group, cls = match.group("var"), match.group("util"), match.group("cls")
    table = TW.get(group, {})
    key = cls
    # strip an optional /NN opacity suffix for lookup
    op = ""
    if "/" in cls:
        key, _, op = cls.partition("/")
        op = "/" + op
    target = table.get(key)
    if target is None:
        return match.group(0)
    if target in ALPHA_BAKED:
        out = f"{group}-{target}"
    else:
        out = f"{group}-{target}{op}"
    if out != cls:
        bump(f"{group}-{cls} -> {out}")
    return f"{var}{out}" if var else out


HEX_RE = re.compile(
    rf"(?P<var>{PREFIXES})(?P<util>{UTILS})-\[#(?P<hex>[0-9a-fA-F]{{6}})\](?P<op>/\d+)?"
)
TW_RE = re.compile(
    rf"(?P<var>{PREFIXES})(?P<util>{UTILS})-(?P<cls>(?:slate|indigo|emerald|amber|blue|red|green)-\d{{2,3}}(?:/\d+)?)"
)
SIZE_RE = re.compile(r"\btext-\[\d+px\]")


def process(path: Path) -> None:
    original = path.read_text(encoding="utf-8")
    text = original
    text = HEX_RE.sub(hex_repl, text)
    text = TW_RE.sub(tw_repl, text)
    for old, new in SIZE_MAP.items():
        n = text.count(old)
        if n:
            text = text.replace(old, new)
            bump(f"{old} -> {new}", n)
    if text != original:
        path.write_text(text, encoding="utf-8")
        bump(f"file:{path.relative_to(ROOT)}")


def main() -> int:
    files = sorted(SRC.rglob("*.tsx"))
    for f in files:
        process(f)
    total_files = sum(1 for k in changes if k.startswith("file:"))
    print(f"processed {len(files)} tsx files, modified {total_files}")
    for key in sorted(changes):
        print(f"  {changes[key]:5d}  {key}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

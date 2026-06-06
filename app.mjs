// app.mjs (type="module")
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-storage.js";

/* ----------------------------- Theme Data ----------------------------- */
const THEMES = {
  petal: { "--bg": "var(--rose-50)", "--surface": "var(--rose-50)", "--surface-2": "var(--pink-200)", "--border": "var(--mauve-200)", "--primary": "var(--periwinkle-400)", "--primary-soft": "var(--periwinkle-200)", "--accent": "var(--pink-500)", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(167,171,222,.45)", "--bg-spot-2": "rgba(255,165,214,.35)" },
  lavender: { "--bg": "#F6F2FF", "--surface": "#F6F2FF", "--surface-2": "#EDE4FF", "--border": "#D8CBF2", "--primary": "#A7ABDE", "--primary-soft": "#CED1F8", "--accent": "#D7A6FF", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(215,166,255,.32)", "--bg-spot-2": "rgba(167,171,222,.28)" },
  sky_sorbet: { "--bg": "#F2FBFF", "--surface": "#F2FBFF", "--surface-2": "#DFF3FF", "--border": "#C7E4F5", "--primary": "#7DB6FF", "--primary-soft": "#CFE4FF", "--accent": "#FFA5D6", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(125,182,255,.30)", "--bg-spot-2": "rgba(255,165,214,.24)" },
  peach_milk: { "--bg": "#FFF6F0", "--surface": "#FFF6F0", "--surface-2": "#FFE3D2", "--border": "#F2CDBB", "--primary": "#A7ABDE", "--primary-soft": "#CED1F8", "--accent": "#FFB38A", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(255,179,138,.34)", "--bg-spot-2": "rgba(167,171,222,.24)" },
  lemon_cream: { "--bg": "#FFFCEB", "--surface": "#FFFCEB", "--surface-2": "#FFF2B8", "--border": "#E9DFA2", "--primary": "#9AB6FF", "--primary-soft": "#D6E3FF", "--accent": "#FFC857", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(255,200,87,.32)", "--bg-spot-2": "rgba(154,182,255,.22)" },
  dusky_rose: { "--bg": "#141016", "--surface": "#19131C", "--surface-2": "#241A26", "--border": "rgba(255,255,255,.14)", "--primary": "#B7A6FF", "--primary-soft": "rgba(183,166,255,.35)", "--accent": "#FF8FBC", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(183,166,255,.22)", "--bg-spot-2": "rgba(255,143,188,.16)" },
  mauve_night: { "--bg": "#100F14", "--surface": "#15131A", "--surface-2": "#201B25", "--border": "rgba(255,255,255,.14)", "--primary": "#9FB6FF", "--primary-soft": "rgba(159,182,255,.35)", "--accent": "#D7A6FF", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(159,182,255,.18)", "--bg-spot-2": "rgba(215,166,255,.14)" },
  deep_sage: { "--bg": "#0F1412", "--surface": "#141A17", "--surface-2": "#1C2621", "--border": "rgba(255,255,255,.14)", "--primary": "#93D1B3", "--primary-soft": "rgba(147,209,179,.35)", "--accent": "#FF9BB7", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(147,209,179,.18)", "--bg-spot-2": "rgba(255,155,183,.12)" },
  blueberry_dusk: { "--bg": "#0D101A", "--surface": "#12172A", "--surface-2": "#1A2140", "--border": "rgba(255,255,255,.14)", "--primary": "#8EA2FF", "--primary-soft": "rgba(142,162,255,.35)", "--accent": "#8FE3FF", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(142,162,255,.20)", "--bg-spot-2": "rgba(143,227,255,.12)" },
  cocoa_lilac: { "--bg": "#141014", "--surface": "#1A141B", "--surface-2": "#261C28", "--border": "rgba(255,255,255,.14)", "--primary": "#E2B3FF", "--primary-soft": "rgba(226,179,255,.35)", "--accent": "#FFB38A", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(226,179,255,.18)", "--bg-spot-2": "rgba(255,179,138,.10)" },
  midnight: { "--bg": "#0F0D14", "--surface": "#14121A", "--surface-2": "#1C1824", "--border": "rgba(255,255,255,.14)", "--primary": "#8EA2FF", "--primary-soft": "rgba(142,162,255,.35)", "--accent": "#FFA5D6", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(142,162,255,.18)", "--bg-spot-2": "rgba(255,165,214,.12)" },
  strawberry_matcha: { "--bg": "#F7FFF6", "--surface": "#F7FFF6", "--surface-2": "#E8F7E6", "--border": "#CFE6CC", "--primary": "#7FBF9B", "--primary-soft": "#CFEBDD", "--accent": "#FF8FB8", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(127,191,155,.28)", "--bg-spot-2": "rgba(255,143,184,.22)" },
  blueberry_yogurt: { "--bg": "#F4F6FF", "--surface": "#F4F6FF", "--surface-2": "#E2E7FF", "--border": "#CAD3FF", "--primary": "#7F8CFF", "--primary-soft": "#C9D0FF", "--accent": "#FFA5D6", "--text": "#2B2B33", "--text-muted": "#5A5A6A", "--bg-spot-1": "rgba(127,140,255,.30)", "--bg-spot-2": "rgba(255,165,214,.20)" },
    cyberpunk_neo: {
    "--bg": "#050505",
    "--surface": "#0D0D0D",
    "--surface-2": "#FF007A", // Neon Pink
    "--border": "rgba(0, 243, 255, 0.3)", // Neon Teal
    "--primary": "#00F3FF",
    "--primary-soft": "rgba(0, 243, 255, 0.1)",
    "--accent": "#FF007A",
    "--text": "#E0E0E0",
    "--text-muted": "rgba(224, 224, 224, 0.5)",
    "animation": "glitch"
  },
  deep_sea_abyss: {
    "--bg": "#02080D",
    "--surface": "#04121A",
    "--surface-2": "#00FFC2", // Bio-Green
    "--border": "rgba(0, 255, 194, 0.15)",
    "--primary": "#00FFC2",
    "--primary-soft": "rgba(0, 255, 194, 0.05)",
    "--accent": "#0077B6", // Deep Water Blue
    "--text": "#CAF0F8",
    "--text-muted": "rgba(202, 240, 248, 0.4)",
    "animation": "plankton"
  },
  fairy_forest: {
    "--bg": "#0B120E",
    "--surface": "#141D17",
    "--surface-2": "#EAB308", // Glow Yellow
    "--border": "rgba(34, 197, 94, 0.2)",
    "--primary": "#22C55E", // Moss Green
    "--primary-soft": "rgba(34, 197, 94, 0.1)",
    "--accent": "#FEF08A",
    "--text": "#ECFDF5",
    "--text-muted": "rgba(236, 253, 245, 0.4)",
    "animation": "fireflies"
  },
  retro_handheld: {
    "--bg": "#E0E0E0", // Classic Gameboy Grey
    "--surface": "#F5F5F5",
    "--surface-2": "#A0A0A0", 
    "--border": "#4A4A4A",
    "--primary": "#4A4A4A", 
    "--primary-soft": "rgba(74, 74, 74, 0.1)",
    "--accent": "#FF0000", // Action Button Red
    "--text": "#1A1A1A",
    "--text-muted": "#4A4A4A",
    "animation": "pixels"
  },
    classic_desktop: {
    "--bg": "#008080", // That specific 90s Teal
    "--surface": "#C0C0C0", // Windows Grey
    "--surface-2": "#FFFFFF",
    "--border": "#000000",
    "--primary": "#000080", // Taskbar Blue
    "--primary-soft": "rgba(0, 0, 128, 0.1)",
    "--accent": "#C0C0C0",
    "--text": "#000000",
    "--text-muted": "#404040",
    "animation": "cursors"
  },
  farm_life: {
    "--bg": "#78B159", // Grass Green
    "--surface": "#F4EBD0", // Parchment
    "--surface-2": "#8B5A2B", // Wood Brown
    "--border": "#4D331F",
    "--primary": "#FF8C00", // Carrot Orange
    "--primary-soft": "rgba(255, 140, 0, 0.1)",
    "--accent": "#EE4B2B", 
    "--text": "#2D1B1B",
    "--text-muted": "#5C4033",
    "animation": "crops"
  },
  cozy_cafe: {
    "--bg": "#E6CCB2", // Latte
    "--surface": "#EDE0D4",
    "--surface-2": "#7F5539", // Espresso
    "--border": "#9C6644",
    "--primary": "#B08968", 
    "--primary-soft": "rgba(176, 137, 104, 0.1)",
    "--accent": "#DDB892",
    "--text": "#432818",
    "--text-muted": "#7F5539",
    "animation": "steam"
  },
  cosmic_starfall: { "--bg": "#0D0B1A", "--surface": "#16142E", "--surface-2": "#231F4D", "--border": "rgba(183,166,255,.14)", "--primary": "#B7A6FF", "--primary-soft": "rgba(183,166,255,.25)", "--accent": "#FFD700", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.75)", "--bg-spot-1": "rgba(130,100,255,0.2)", "--bg-spot-2": "rgba(50,200,255,0.1)" },
  autumn_forest: { "--bg": "#FFF9F2", "--surface": "#FCF3E8", "--surface-2": "#F5E6D3", "--border": "#DBC7B5", "--primary": "#A67B5B", "--primary-soft": "#E3D5C4", "--accent": "#D95D39", "--text": "#4A3728", "--text-muted": "#856D5B" },
  spring_blossom: { "--bg": "#FFF5F8", "--surface": "#FEF0F5", "--surface-2": "#FDE2E9", "--border": "#F9C8D9", "--primary": "#FFB7C5", "--primary-soft": "#FFE4E8", "--accent": "#FF69B4", "--text": "#5E3A44", "--text-muted": "#8A6B74" },
  summer_shimmer: { "--bg": "#F0FBFF", "--surface": "#E3F7FF", "--surface-2": "#D1F2FF", "--border": "#B6E9FF", "--primary": "#00A8E8", "--primary-soft": "#BCEBFF", "--accent": "#FFD700", "--text": "#1A465C", "--text-muted": "#4B758E" },
  midnight_snowfall: { "--bg": "#0B0E14", "--surface": "#12161F", "--surface-2": "#1A202C", "--border": "rgba(255,255,255,.08)", "--primary": "#A0C4FF", "--primary-soft": "rgba(160,196,255,.2)", "--accent": "#FFFFFF", "--text": "#E0E6ED", "--text-muted": "rgba(224,230,237,.6)", "--bg-spot-1": "rgba(100,150,255,0.1)", "--bg-spot-2": "rgba(255,255,255,0.05)" },
  golden_petal: { "--bg": "#FFFDF0", "--surface": "#FFFCDB", "--surface-2": "#FFF5AD", "--border": "#E6D695", "--primary": "#FFD700", "--primary-soft": "rgba(255, 215, 0, 0.3)", "--accent": "#DAA520", "--text": "#4A3F1F", "--text-muted": "#8B7D54", "--bg-spot-1": "rgba(255, 223, 0, 0.25)", "--bg-spot-2": "rgba(255, 255, 255, 0.5)" },
  six_paths_sage: { "--bg": "#FFFFFF", "--surface": "#FDFDFD", "--surface-2": "#1A1A1A", "--border": "#FFD700", "--primary": "#FFD700", "--primary-soft": "rgba(255, 215, 0, 0.2)", "--accent": "#000000", "--text": "#1A1A1A", "--text-muted": "#555555", "--bg-spot-1": "rgba(255, 215, 0, 0.1)" },
  uchiha_avenger: { "--bg": "#0A0A1F", "--surface": "#14142D", "--surface-2": "#6D28D9", "--border": "rgba(160, 233, 255, 0.2)", "--primary": "#A0E9FF", "--accent": "#EF4444", "--text": "#D1D5DB", "--text-muted": "rgba(209, 213, 219, 0.4)", "--bg-spot-1": "rgba(109, 40, 217, 0.2)" },
  hokage_dream: { "--bg": "#FFF7ED", "--surface": "#FFEDD5", "--surface-2": "#F97316", "--border": "rgba(59, 130, 246, 0.2)", "--primary": "#F97316", "--accent": "#3B82F6", "--text": "#431407", "--text-muted": "#7C2D12" },
  ninja_rivalry: { "--bg": "#0D0D1F", "--surface": "#16162D", "--surface-2": "#F97316", "--border": "rgba(59, 130, 246, 0.3)", "--primary": "#3B82F6", "--accent": "#EF4444", "--text": "#F2F0F7", "--text-muted": "rgba(242,240,247,.6)", "--bg-spot-1": "rgba(59, 130, 246, 0.2)", "--bg-spot-2": "rgba(249, 115, 22, 0.15)" },
  copy_ninja: { "--bg": "#1A1B26", "--surface": "#24283B", "--surface-2": "#414868", "--border": "rgba(160, 233, 255, 0.2)", "--primary": "#A0E9FF", "--accent": "#FF4C4C", "--text": "#C0CAF5", "--text-muted": "#565F89", "--bg-spot-1": "rgba(160, 233, 255, 0.1)", "--bg-spot-2": "rgba(255, 76, 76, 0.05)" },
  medical_kunoichi: { "--bg": "#FFF0F3", "--surface": "#FFE3E8", "--surface-2": "#FBCFE8", "--border": "rgba(16, 185, 129, 0.2)", "--primary": "#10B981", "--accent": "#F43F5E", "--text": "#4C0519", "--text-muted": "#9F1239" },
  shadow_possession: { "--bg": "#0A0B0D", "--surface": "#14171A", "--surface-2": "#2D3436", "--border": "rgba(46, 204, 113, 0.15)", "--primary": "#2ECC71", "--accent": "#000000", "--text": "#E0E0E0", "--text-muted": "rgba(224, 224, 224, 0.5)", "--bg-spot-1": "rgba(0, 0, 0, 0.8)" },
  mind_transfer: { "--bg": "#F5F3FF", "--surface": "#EDE9FE", "--surface-2": "#C4B5FD", "--border": "rgba(139, 92, 246, 0.2)", "--primary": "#8B5CF6", "--accent": "#10B981", "--text": "#4C1D95", "--text-muted": "#7C3AED" },
  butterfly_mode: { "--bg": "#2D0A0A", "--surface": "#3F1212", "--surface-2": "#1E3A8A", "--border": "rgba(59, 130, 246, 0.3)", "--primary": "#3B82F6", "--accent": "#FACC15", "--text": "#FEE2E2", "--text-muted": "rgba(254, 226, 226, 0.5)" },
  gallant_tale: { "--bg": "#F5E6D3", "--surface": "#FCF8F0", "--surface-2": "#8B0000", "--border": "rgba(139, 0, 0, 0.2)", "--primary": "#B45309", "--accent": "#FACC15", "--text": "#2D1B1B", "--text-muted": "#634832" },
  forbidden_lab: { "--bg": "#0D0B12", "--surface": "#16141F", "--surface-2": "#4B3F72", "--border": "rgba(220, 214, 247, 0.1)", "--primary": "#FFD700", "--accent": "#DCD6F7", "--text": "#DCD6F7", "--text-muted": "rgba(220, 214, 247, 0.5)", "--bg-spot-1": "rgba(75, 63, 114, 0.2)" },
  slug_princess: { "--bg": "#F0F9F6", "--surface": "#E6F2ED", "--surface-2": "#14B8A6", "--border": "rgba(20, 184, 166, 0.2)", "--primary": "#14B8A6", "--accent": "#B45309", "--text": "#0F4C3A", "--text-muted": "#3D7061", "--bg-spot-1": "rgba(20, 184, 166, 0.1)" },
    legendary_sannin: {
    "--bg": "#1E1B2E", // Deep Orochimaru Purple
    "--surface": "#2D2B4A",
    "--surface-2": "#B45309", // Jiraiya Red
    "--border": "rgba(20, 184, 166, 0.3)", // Tsunade Teal
    "--primary": "#14B8A6", 
    "--primary-soft": "rgba(20, 184, 166, 0.2)",
    "--accent": "#FACC15", 
    "--text": "#F2F0F7",
    "--text-muted": "rgba(242,240,247,.6)",
    "--bg-spot-1": "#1E1B2E", // Keep it dark
    "--bg-spot-2": "#1E1B2E", // Keep it dark
    "animation": "seals"
  },
  nine_tails_malice: { "--bg": "#0D0505", "--surface": "#1A0B0B", "--surface-2": "#4A0000", "--border": "rgba(255, 0, 0, 0.2)", "--primary": "#FF0000", "--accent": "#F97316", "--text": "#F2F0F7", "--text-muted": "rgba(242, 240, 247, 0.5)", "--bg-spot-1": "rgba(255, 0, 0, 0.15)" },
  akatsuki_cloud: { "--bg": "#0A0A0C", "--surface": "#121217", "--surface-2": "#3D0000", "--border": "rgba(255, 0, 0, 0.15)", "--primary": "#FF0000", "--accent": "#FFFFFF", "--text": "#E0E0E0", "--text-muted": "rgba(224, 224, 224, 0.5)" },
  hidan_ritual: { "--bg": "#080808", "--surface": "#121212", "--surface-2": "#4A0000", "--border": "rgba(255, 0, 0, 0.2)", "--primary": "#FF0000", "--accent": "#FFFFFF", "--text": "#E5E5E5", "--text-muted": "rgba(229, 229, 229, 0.5)", "--bg-spot-1": "rgba(74, 0, 0, 0.3)" },
  kakuzu_hearts: { "--bg": "#0F110D", "--surface": "#1A1D17", "--surface-2": "#3E4437", "--border": "rgba(255, 215, 0, 0.15)", "--primary": "#FFD700", "--accent": "#B22222", "--text": "#D1D5DB", "--text-muted": "rgba(209, 213, 223, 0.5)", "--bg-spot-1": "rgba(62, 68, 55, 0.2)" },
  art_explosion: { "--bg": "#FFFDF0", "--surface": "#FEF3C7", "--surface-2": "#FBBF24", "--border": "rgba(0, 168, 232, 0.2)", "--primary": "#00A8E8", "--accent": "#FF4500", "--text": "#451A03", "--text-muted": "#92400E" },
  ultimate_masterpiece: { "--bg": "#FFFFFF", "--surface": "#FAFAFA", "--surface-2": "#FFD700", "--border": "rgba(255, 215, 0, 0.3)", "--primary": "#FFD700", "--accent": "#000000", "--text": "#1A1A1A", "--text-muted": "#666666", "--bg-spot-1": "rgba(255, 255, 255, 1)" },
  eternal_beauty: { "--bg": "#0D0B0B", "--surface": "#1A1616", "--surface-2": "#4A0E0E", "--border": "rgba(168, 85, 247, 0.2)", "--primary": "#A855F7", "--accent": "#D2B48C", "--text": "#FEE2E2", "--text-muted": "rgba(254, 226, 226, 0.5)" },
  paper_angel: { "--bg": "#E0E7FF", "--surface": "#EEF2FF", "--surface-2": "#818CF8", "--border": "rgba(129, 140, 248, 0.2)", "--primary": "#6366F1", "--accent": "#4338CA", "--text": "#1E1B4B", "--text-muted": "#4338CA" },
  six_paths_pain: { "--bg": "#0D0D0F", "--surface": "#16161A", "--surface-2": "#4C1D95", "--border": "rgba(139, 92, 246, 0.2)", "--primary": "#8B5CF6", "--accent": "#FF4500", "--text": "#D1D5DB", "--text-muted": "rgba(209, 213, 219, 0.5)" },
  original_hope: { "--bg": "#F0F9FF", "--surface": "#E0F2FE", "--surface-2": "#F97316", "--border": "rgba(14, 165, 233, 0.2)", "--primary": "#0EA5E9", "--accent": "#FB923C", "--text": "#0C4A6E", "--text-muted": "#0369A1" },
  tobi_good_boy: { "--bg": "#FFF7ED", "--surface": "#FFEDD5", "--surface-2": "#FB923C", "--border": "rgba(34, 197, 94, 0.2)", "--primary": "#22C55E", "--accent": "#EA580C", "--text": "#431407", "--text-muted": "#7C2D12" },
  monster_mist: { "--bg": "#051622", "--surface": "#0B2435", "--surface-2": "#1A759F", "--border": "rgba(160, 233, 255, 0.2)", "--primary": "#52B69A", "--accent": "#184E77", "--text": "#D9EDF7", "--text-muted": "rgba(217, 237, 247, 0.5)" },
  stinky_aloe: { "--bg": "#0D110D", "--surface": "#1A1F1A", "--surface-2": "#4D7C0F", "--border": "rgba(255, 255, 255, 0.1)", "--primary": "#FFFFFF", "--accent": "#000000", "--text": "#E2E8F0", "--text-muted": "rgba(226, 232, 240, 0.4)", "--bg-spot-1": "rgba(77, 124, 15, 0.15)" },
  god_of_shinobi: { "--bg": "#E9F5DB", "--surface": "#CFE1B9", "--surface-2": "#718355", "--border": "#4F772D", "--primary": "#B56576", "--accent": "#31572C", "--text": "#132A13", "--text-muted": "#31572C", "--bg-spot-1": "rgba(49, 87, 44, 0.15)", "--bg-spot-2": "rgba(113, 131, 85, 0.2)" },
    tactical_suiton: {
    "--bg": "#050B1A", // Deep Abyss Blue
    "--surface": "#0A1426",
    "--surface-2": "#1E3A8A", 
    "--border": "rgba(100, 255, 218, 0.1)",
    "--primary": "#64FFDA", 
    "--primary-soft": "rgba(100, 255, 218, 0.1)",
    "--accent": "#F0F8FF", 
    "--text": "#CCD6F6",
    "--text-muted": "#8892B0",
    "--bg-spot-1": "#050B1A", // Force dark spot
    "--bg-spot-2": "#050B1A", // Force dark spot
    "animation": "bubbles"
  },
  ghost_uchiha: {
    "--bg": "#050505", // Eternal Night Black
    "--surface": "#0D0D0D",
    "--surface-2": "#3B1E54", // Susanoo Purple
    "--border": "rgba(255, 76, 76, 0.15)",
    "--primary": "#FF4C4C", 
    "--primary-soft": "rgba(255, 76, 76, 0.1)",
    "--accent": "#FACC15", 
    "--text": "#E2E8F0",
    "--text-muted": "rgba(226, 232, 240, 0.5)",
    "--bg-spot-1": "#050505", // Force dark spot
    "--bg-spot-2": "#050505", // Force dark spot
    "animation": "tomoe"
  },
  kamui_dimension: {
    "--bg": "#080808", // Void Black
    "--surface": "#121212",
    "--surface-2": "#F97316", // Obito Mask Orange
    "--border": "rgba(249, 115, 22, 0.2)",
    "--primary": "#F97316", 
    "--primary-soft": "rgba(249, 115, 22, 0.1)",
    "--accent": "#FF0000", 
    "--text": "#D1D5DB",
    "--text-muted": "rgba(209, 213, 219, 0.5)",
    "--bg-spot-1": "#080808", // Force dark spot
    "--bg-spot-2": "#080808", // Force dark spot
    "animation": "warps"
  },
  crow_illusion: {
    "--bg": "#08080A", // Uchiha Shadow
    "--surface": "#121217",
    "--surface-2": "#2D0A0A", // Crow Crimson
    "--border": "rgba(255, 0, 0, 0.1)",
    "--primary": "#FF3E3E", 
    "--primary-soft": "rgba(255, 62, 62, 0.1)",
    "--accent": "#4A4A4A", 
    "--text": "#E0E0E0",
    "--text-muted": "rgba(224, 224, 224, 0.5)",
    "--bg-spot-1": "#08080A", // Force dark
    "--bg-spot-2": "#08080A", // Force dark
    "animation": "feathers"
  },
  yellow_flash: {
    "--bg": "#FFFFFF", // Minato Cloak White
    "--surface": "#FFFDF0",
    "--surface-2": "#FFD700", // Flash Gold
    "--border": "rgba(0, 168, 232, 0.2)",
    "--primary": "#00A8E8", 
    "--primary-soft": "rgba(0, 168, 232, 0.1)",
    "--accent": "#FF4500", 
    "--text": "#1A1A1A",
    "--text-muted": "#555555",
    "--bg-spot-1": "rgba(255, 215, 0, 0.2)", // Golden Glow
    "--bg-spot-2": "rgba(255, 255, 255, 0.5)",
    "animation": "teleport"
  },
  lavender_pearl: {
    "--bg": "#F3E8FF", // Hyuga Lavender
    "--surface": "#FAF5FF",
    "--surface-2": "#E9D5FF",
    "--border": "rgba(168, 85, 247, 0.2)",
    "--primary": "#A855F7", 
    "--primary-soft": "rgba(168, 85, 247, 0.1)",
    "--accent": "#FFFFFF", 
    "--text": "#44337A",
    "--text-muted": "#6B46C1",
    "--bg-spot-1": "rgba(168, 85, 247, 0.15)", // Soft Lavender Glow
    "--bg-spot-2": "rgba(255, 255, 255, 0.4)",
    "animation": "pearls"
  },
  springtime_youth: {
    "--bg": "#0B1A0E", // Deep Jumpsuit Green
    "--surface": "#162B1A",
    "--surface-2": "#FFD700", // Gold energy
    "--border": "#FF4500", 
    "--primary": "#32CD32", 
    "--primary-soft": "rgba(50, 205, 50, 0.2)",
    "--accent": "#FF0000", 
    "--text": "#F2F0F7",
    "--text-muted": "rgba(242,240,247,.6)",
    "--bg-spot-1": "#0B1A0E", // Force dark
    "--bg-spot-2": "#0B1A0E", // Force dark
    "animation": "aura"
  },
  eternal_amaterasu: {
    "--bg": "#050505", // Absolute Black
    "--surface": "#0D0D0D",
    "--surface-2": "#1A1A1A",
    "--border": "rgba(138, 43, 226, 0.3)", // Violet heat border
    "--primary": "#000000", 
    "--primary-soft": "rgba(0, 0, 0, 0.8)",
    "--accent": "#8A2BE2", // Bright Violet highlight
    "--text": "#E0E0E0",
    "--text-muted": "rgba(224, 224, 224, 0.4)",
    "--bg-spot-1": "#050505", // Matching bg to keep it dark
    "--bg-spot-2": "#050505", // Matching bg to keep it dark
    "animation": "black_fire"
  },
  hidden_rain: {
    "--bg": "#111418", // Dark Stormy Grey
    "--surface": "#1B2026",
    "--surface-2": "#2C343D",
    "--border": "rgba(100, 149, 237, 0.2)",
    "--primary": "#6495ED", // Steel Blue
    "--primary-soft": "rgba(100, 149, 237, 0.1)",
    "--accent": "#87CEEB", // Sky Chakra
    "--text": "#D1D9E0",
    "--text-muted": "rgba(209, 217, 224, 0.5)",
    "--bg-spot-1": "#111418", // Keep it dark
    "--bg-spot-2": "#111418", // Keep it dark
    "animation": "rain"
  },
  kurama_sage: {
    "--bg": "#FFFBEB", // Pale Gold Cream
    "--surface": "#FEF3C7",
    "--surface-2": "#FDE68A",
    "--border": "rgba(245, 158, 11, 0.2)", 
    "--primary": "#F59E0B", // Golden Orange
    "--primary-soft": "rgba(245, 158, 11, 0.15)",
    "--accent": "#D97706", // Deep Amber
    "--text": "#451A03",
    "--text-muted": "#92400E",
    "--bg-spot-1": "rgba(255, 215, 0, 0.2)", // Golden Sun Glow
    "--bg-spot-2": "rgba(255, 255, 255, 0.5)",
    "animation": "embers"
  },
  hidden_sand: {
    "--bg": "#F5F5DC", // Light Beige Sand
    "--surface": "#EFEBD8",
    "--surface-2": "#D2B48C", // Tan
    "--border": "rgba(153, 27, 27, 0.15)", // Gourd Red tint
    "--primary": "#991B1B", // Desert Crimson
    "--primary-soft": "rgba(153, 27, 27, 0.1)",
    "--accent": "#B45309", // Warm Brown
    "--text": "#451A03",
    "--text-muted": "#78350F",
    "--bg-spot-1": "rgba(210, 180, 140, 0.2)", // Sandy Dust Glow
    "--bg-spot-2": "rgba(245, 245, 220, 0.4)",
    "animation": "sand"
  },
  desert_love: { "--bg": "#F2E8CF", "--surface": "#EAD7B1", "--surface-2": "#D4A373", "--border": "rgba(188, 71, 73, 0.2)", "--primary": "#BC4749", "--accent": "#6A994E", "--text": "#386641", "--text-muted": "#6A994E", "--bg-spot-1": "rgba(188, 71, 73, 0.05)", "--bg-spot-2": "rgba(255, 255, 255, 0.3)" },
    infinite_tsukuyomi: {
    "--bg": "#0D0000", // Deepest Crimson Black
    "--surface": "#1A0505",
    "--surface-2": "#7F1D1D", // Blood Moon Red
    "--border": "rgba(220, 38, 38, 0.3)",
    "--primary": "#DC2626", // Rinne-Sharingan Red
    "--primary-soft": "rgba(220, 38, 38, 0.1)",
    "--accent": "#FFFFFF", // Trapped Soul White
    "--text": "#FEE2E2",
    "--text-muted": "rgba(254, 226, 226, 0.5)",
    "--bg-spot-1": "rgba(220, 38, 38, 0.2)", // Red Moonlight
    "--bg-spot-2": "#0D0000",
    "animation": "dream_waves"
  },
    infinite_zen: {
    "--bg": "#FFFFFF", 
    "--surface": "rgba(255, 255, 255, 0.8)",
    "--surface-2": "#F3E8FF",
    "--border": "#FFD700",
    "--primary": "#A855F7", 
    "--primary-soft": "rgba(168, 85, 247, 0.2)",
    "--accent": "#00D2FF", 
    "--text": "#1A1A1A",
    "--text-muted": "#555555",
    "animation": "divine_aura"
  },
  infinite_void: {
    "--bg": "#0A0B14", // Deep Space Navy
    "--surface": "#121421",
    "--surface-2": "#00D2FF", // Limitless Blue
    "--border": "rgba(0, 210, 255, 0.2)",
    "--primary": "#00D2FF", 
    "--primary-soft": "rgba(0, 210, 255, 0.1)",
    "--accent": "#FFFFFF", // Six Eyes White
    "--text": "#E0E7FF",
    "--text-muted": "rgba(224, 231, 255, 0.5)",
    "--bg-spot-1": "rgba(0, 210, 255, 0.15)",
    "animation": "infinity"
  },
  malevolent_shrine: {
    "--bg": "#0D0000", // Shrine Shadow
    "--surface": "#1A0505",
    "--surface-2": "#FF003C", // Cursed Energy Red
    "--border": "rgba(255, 0, 60, 0.2)",
    "--primary": "#FF003C", 
    "--primary-soft": "rgba(255, 0, 60, 0.1)",
    "--accent": "#FACC15", // King of Curses Gold
    "--text": "#FFE4E6",
    "--text-muted": "rgba(255, 228, 230, 0.5)",
    "--bg-spot-1": "rgba(255, 0, 60, 0.15)",
    "animation": "slashes"
  },
    ten_shadows: {
    "--bg": "#05080A", // Shadow Abyss
    "--surface": "#0D1117",
    "--surface-2": "#1A202C", 
    "--border": "rgba(45, 55, 72, 0.3)",
    "--primary": "#4FD1C5", // Divine Dog Teal
    "--primary-soft": "rgba(79, 209, 197, 0.1)",
    "--accent": "#000000", // Shadow Black
    "--text": "#E2E8F0",
    "--text-muted": "rgba(226, 232, 240, 0.5)",
    "animation": "shikigami"
  },
  cursed_manipulation: {
    "--bg": "#121212", // Monk Robe Black
    "--surface": "#1E1E1E",
    "--surface-2": "#B7791F", // Robe Gold
    "--border": "rgba(183, 121, 31, 0.2)",
    "--primary": "#9F7AEA", // Spirit Purple
    "--primary-soft": "rgba(159, 122, 234, 0.1)",
    "--accent": "#ECC94B", 
    "--text": "#F7FAFC",
    "--text-muted": "rgba(247, 250, 252, 0.5)",
    "animation": "cursed_orbs"
  },
  death_painting: {
    "--bg": "#1A0505", // Blood Plum
    "--surface": "#2D0A0A",
    "--surface-2": "#742A2A", 
    "--border": "rgba(229, 62, 62, 0.2)",
    "--primary": "#E53E3E", // Piercing Blood Red
    "--primary-soft": "rgba(229, 62, 62, 0.1)",
    "--accent": "#FFFFFF", // Mask White
    "--text": "#FFF5F5",
    "--text-muted": "rgba(255, 245, 245, 0.5)",
    "animation": "blood_streaks"
  },
  divergent_fist: {
    "--bg": "#FFF5F7", // Itadori Pink
    "--surface": "#FFEDF1",
    "--surface-2": "#3182CE", // Cursed Energy Blue
    "--border": "rgba(49, 130, 206, 0.2)",
    "--primary": "#3182CE", 
    "--primary-soft": "rgba(49, 130, 206, 0.1)",
    "--accent": "#E53E3E", // Tiger Red
    "--text": "#2D3748",
    "--text-muted": "#718096",
    "animation": "impacts"
  },
  blood_brother: {
    "--bg": "#120A10", // Deepest Plum Black
    "--surface": "#1A0F17",
    "--surface-2": "#8B5CF6", // Lavender Markings
    "--border": "rgba(229, 62, 62, 0.2)",
    "--primary": "#E53E3E", // Blood Red
    "--primary-soft": "rgba(229, 62, 62, 0.15)",
    "--accent": "#F5E6D3", // Scarf Cream
    "--text": "#F5E6D3",
    "--text-muted": "rgba(245, 230, 211, 0.5)",
    "--bg-spot-1": "rgba(139, 92, 246, 0.1)", // Lavender Glow
    "animation": "supernova"
  },
  ratio_sorcerer: {
    "--bg": "#FAF7F0", // Clean Stationery White
    "--surface": "#F2EAD3",
    "--surface-2": "#3D5A80", // Nanami Tie Blue
    "--border": "rgba(61, 90, 128, 0.2)",
    "--primary": "#EE6C4D", // 7:3 Strike Orange
    "--primary-soft": "rgba(238, 108, 77, 0.1)",
    "--accent": "#98C1D9", // Clear Sky Blue
    "--text": "#293241", // Deep Professional Navy
    "--text-muted": "#3D5A80",
    "animation": "clock_ticks"
  },
  blue_spring: {
    "--bg": "#E0F2FE", // Nostalgic Sky Blue
    "--surface": "#F0F9FF",
    "--surface-2": "#BAE6FD", 
    "--border": "rgba(14, 165, 233, 0.2)",
    "--primary": "#0EA5E9", // Youthful Blue
    "--primary-soft": "rgba(14, 165, 233, 0.1)",
    "--accent": "#FFFFFF", // Summer Cloud White
    "--text": "#0369A1",
    "--text-muted": "#0EA5E9",
    "animation": "summer_clouds"
  },
  strongest_man: {
    "--bg": "#1A1A1A", // Whitebeard Coat Grey
    "--surface": "#262626",
    "--surface-2": "#B45309", // Captain's Mark Gold
    "--border": "rgba(255, 255, 255, 0.2)",
    "--primary": "#FFFFFF", // The Great Moustache White
    "--primary-soft": "rgba(255, 255, 255, 0.1)",
    "--accent": "#7C3AED", // Gura Gura Purple
    "--text": "#F9FAFB",
    "--text-muted": "#9CA3AF",
    "animation": "air_cracks"
  },
  surgeon_death: {
    "--bg": "#0D1117", // Law's Hoodie Navy
    "--surface": "#161B22",
    "--surface-2": "#FACC15", // Law's Hat Yellow
    "--border": "rgba(56, 189, 248, 0.3)", // Room Blue
    "--primary": "#38BDF8", // Gamma Knife Blue
    "--primary-soft": "rgba(56, 189, 248, 0.1)",
    "--accent": "#000000", // Heart Tattoo Black
    "--text": "#E2E8F0",
    "--text-muted": "rgba(226, 232, 240, 0.5)",
    "animation": "room_scan"
  },
  sun_god: {
    "--bg": "#FFFFFF", // Gear 5 White
    "--surface": "#F8FAFC",
    "--surface-2": "#DDD6FE", // Nika Purple
    "--border": "rgba(167, 139, 250, 0.2)",
    "--primary": "#C084FC", // Joyboy Purple
    "--primary-soft": "rgba(192, 132, 252, 0.1)",
    "--accent": "#FACC15", // Sun Gold
    "--text": "#1E293B",
    "--text-muted": "#64748B",
    "animation": "drum_beats"
  },
  silent_heart: {
    "--bg": "#FFF1F2", // Corazon Pink
    "--surface": "#FFE4E6",
    "--surface-2": "#111827", // Feather Coat Black
    "--border": "rgba(244, 63, 94, 0.2)",
    "--primary": "#F43F5E", // Love Red
    "--primary-soft": "rgba(244, 63, 94, 0.1)",
    "--accent": "#FB7185", 
    "--text": "#4C0519",
    "--text-muted": "#9F1239",
    "animation": "hearts"
  },
flower_archeologist: {
    "--bg": "#FAF5FF", // Robin Lilac
    "--surface": "#FFFFFF",
    "--surface-2": "#E9D5FF", 
    "--border": "rgba(107, 70, 193, 0.2)",
    "--primary": "#9F7AEA", 
    "--primary-soft": "rgba(159, 122, 234, 0.1)",
    "--accent": "#553C9A", 
    "--text": "#2D2159",
    "--text-muted": "#553C9A",
    "animation": "arms"
  },
  legendary_merchant: {
    "--bg": "#F0FAF0", // Urahara Hat Green
    "--surface": "#FFFFFF",
    "--surface-2": "#2D4F1E", // Darker Coat Green
    "--border": "rgba(45, 79, 30, 0.2)",
    "--primary": "#81C784", 
    "--primary-soft": "rgba(129, 199, 132, 0.1)",
    "--accent": "#388E3C", 
    "--text": "#1B3012",
    "--text-muted": "#4A7031",
    "animation": "fans"
  },
    celestial_sovereignty: {
    "--bg": "#020205", 
    "--surface": "#08080C",
    "--surface-2": "#1A1A2E",
    "--border": "#E2E8F0", // Silver
    "--primary": "#E2E8F0", 
    "--primary-soft": "rgba(226, 232, 240, 0.1)",
    "--accent": "#A855F7", // Dimensional Purple
    "--text": "#F8FAFC",
    "--text-muted": "rgba(248, 250, 252, 0.5)",
    "--bg-spot-1": "rgba(168, 85, 247, 0.1)",
    "animation": "star_shards"
  },
  omniscient_origin: {
    "--bg": "#020205", 
    "--surface": "rgba(10, 10, 20, 0.9)",
    "--surface-2": "#FFFFFF",
    "--border": "#00F3FF", // Neon Cyan
    "--primary": "#00F3FF", 
    "--primary-soft": "rgba(0, 243, 255, 0.1)",
    "--accent": "#FF007A", // Neon Pink
    "--text": "#FFFFFF",
    "--text-muted": "rgba(255, 255, 255, 0.6)",
    "animation": "dimensional_tears"
  },
    progress_pride: { "--bg": "#0D0D0D", "--surface": "#1A1A1A", "--surface-2": "#FFFFFF", "--border": "#FFD700", "--primary": "#FFD700", "--accent": "#6366F1", "--text": "#F8FAFC", "--text-muted": "rgba(248, 250, 252, 0.5)", "animation": "pride_rainbow" },
  lesbian_sunset: { "--bg": "#FFF5F2", "--surface": "#FFFDFB", "--surface-2": "#D62800", "--border": "#FF9BFB", "--primary": "#FF9BFB", "--accent": "#D62800", "--text": "#4A1A1A", "--text-muted": "#9F4D4D", "animation": "pride_sunset" },
  bisexual_galaxy: { "--bg": "#050510", "--surface": "#0F0F1F", "--surface-2": "#D60087", "--border": "#0063B1", "--primary": "#9B4F96", "--accent": "#D60087", "--text": "#F8FAFC", "--text-muted": "rgba(248, 250, 252, 0.5)", "animation": "pride_bi" },
  trans_serenity: { "--bg": "#F0F9FF", "--surface": "#FFFFFF", "--surface-2": "#F7A8B8", "--border": "#55CDFC", "--primary": "#55CDFC", "--accent": "#F7A8B8", "--text": "#1E3A8A", "--text-muted": "#60A5FA", "animation": "pride_trans" },
  gay_ocean: { 
    "--bg": "#F0FFF4", 
    "--surface": "#FFFFFF", 
    "--surface-2": "#078D70", 
    "--border": "rgba(38, 206, 170, 0.2)", 
    "--primary": "#26CEAA", 
    "--primary-soft": "rgba(38, 206, 170, 0.1)",
    "--accent": "#98E8C1", 
    "--text": "#0B3028", 
    "--text-muted": "#078D70", 
    "animation": "pride_gay" 
  },

};
/* ------------------- Helpers (Fixed & Balanced) ------------------- */
function applyVars(vars) {
  if (!vars) return;
  for (const [k, v] of Object.entries(vars)) {
    document.documentElement.style.setProperty(k, v);
  }
}

async function applyTheme(themeName) {
  // 1. XP Threshold Checks (Level 5, 10, 15, 20)
  if (["golden_petal", "six_paths_sage", "celestial_sovereignty", "infinite_zen"].includes(themeName)) {
    const wb = parseInt(localStorage.getItem("petal_whiteboard_count") || "0");
    const vs = parseInt(localStorage.getItem("petal_vision_count") || "0");
    const cp = parseInt(localStorage.getItem("petal_capsule_count") || "0");
    const wl = parseInt(localStorage.getItem("petal_well_count") || "0");
    const dj = parseInt(localStorage.getItem("petal_dojo_xp") || "0");
    const sm = parseInt(localStorage.getItem("petal_summon_xp") || "0");
    const entries = JSON.parse(localStorage.getItem("petal_entries_v1") || "[]");
    
    let totalXP = (entries.length * 50) + (wb * 20) + (vs * 30) + (cp * 100) + (wl * 30) + dj + sm;
    entries.forEach(e => {
       const words = (e.content || "").replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
       totalXP += words;
    });

    if (themeName === "golden_petal" && totalXP < 800) { themeName = "petal"; toast("Lvl 5 required!"); }
    if (themeName === "six_paths_sage" && totalXP < 1800) { themeName = "petal"; toast("Lvl 10 required!"); }
    if (themeName === "celestial_sovereignty" && totalXP < 3000) { themeName = "petal"; toast("Lvl 15 required!"); }
    if (themeName === "infinite_zen" && totalXP < 4000) { themeName = "petal"; toast("Lvl 20 required!"); }
  }

  // 2. Apply Basic Theme Colors
  const theme = THEMES[themeName] || THEMES.petal;
  applyVars(theme);
  localStorage.setItem("petal_theme", themeName);
  
  // 3. Notify other parts of the site
  document.dispatchEvent(new CustomEvent('themeChanged'));
} // <--- THIS BRACE WAS MISSING

function applySkin(skinName) {
  const notebook = document.getElementById("notebook");
  if (!notebook) return;
  
  // 1. Clear ALL possible skins (Standard + Animated)
  notebook.classList.remove(
    "skin-ruled", "skin-grid", "skin-dots", 
    "skin-dark-ruled", "skin-dark-grid", "skin-dark-dots",
    "skin-rainy-paper", "skin-glitch-paper", "skin-holo-paper"
  );

  // 2. Add the new one (convert underscores to dashes)
  const formattedName = String(skinName).replace("_", "-");
  notebook.classList.add(`skin-${formattedName}`);
  
  localStorage.setItem("petal_skin", skinName);
}

function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg; 
  t.classList.add("show");
  clearTimeout(toast._id); 
  toast._id = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ------------------- Firebase ------------------- */
(() => {
  const auth = window.firebaseAuth;
  if (!auth) return;
  onAuthStateChanged(auth, (user) => {
    const loginBtn = document.getElementById("authButton");
    const profBtn = document.getElementById("profileButton");
    const outBtn = document.getElementById("btnSignOut");
    if (user) {
      if (loginBtn) loginBtn.style.display = "none";
      if (profBtn) { profBtn.style.display = "inline-flex"; profBtn.textContent = user.displayName || "My Profile"; }
      if (outBtn) outBtn.style.display = "inline-flex";
    } else {
      setTimeout(() => {
        if (!auth.currentUser) {
          if (loginBtn) loginBtn.style.display = "inline-flex";
          if (profBtn) profBtn.style.display = "none";
          if (outBtn) outBtn.style.display = "none";
        }
      }, 2000);
    }
  });
  document.getElementById("btnSignOut")?.addEventListener("click", () => signOut(auth).then(() => location.reload()));
})();

/* ------------------- Journal (Balanced & Fixed) ------------------- */
(() => {
  const $ = (id) => document.getElementById(id);
  const STORAGE_KEY = "petal_entries_v1";
  let entries = [];
  let activeId = null;
  let activeTag = null;

  function getZenLevel() {
    const wb = Number(localStorage.getItem("petal_whiteboard_count")) || 0;
    const vs = Number(localStorage.getItem("petal_vision_count")) || 0;
    const cp = Number(localStorage.getItem("petal_capsule_count")) || 0;
    const wl = Number(localStorage.getItem("petal_well_count")) || 0;
    const dj = Number(localStorage.getItem("petal_dojo_xp")) || 0;
    const sm = Number(localStorage.getItem("petal_summon_xp")) || 0;
    let totalXP = (entries.length * 50) + (wb * 20) + (vs * 30) + (cp * 100) + (wl * 30) + dj + sm;
    entries.forEach(e => totalXP += (e.content || "").replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length);
    return Math.floor(totalXP / 200) + 1;
  }

  function checkUnlocks() {
    const lvl = getZenLevel();
    const owned = JSON.parse(localStorage.getItem("petal_owned_items") || "[]");
    console.log("Checking Unlocks for Level:", lvl);

    // 1. Theme Dropdown Unlocks (Levels 5 - 30)
    const optG = document.querySelector('option[value="golden_petal"]');
    if (optG) { optG.disabled = lvl < 5; optG.textContent = lvl >= 5 ? "✨ Golden Petal" : "🔒 Level 5"; }

    const opt10 = document.querySelector('option[value="six_paths_sage"]');
    if (opt10) { opt10.disabled = lvl < 10; opt10.textContent = lvl >= 10 ? "☀️ Six Paths" : "🔒 Level 10"; }

    const opt15 = document.querySelector('option[value="celestial_sovereignty"]');
    if (opt15) { opt15.disabled = lvl < 15; opt15.textContent = lvl >= 15 ? "🌌 Celestial" : "🔒 Level 15"; }

    const opt20 = document.querySelector('option[value="infinite_zen"]');
    if (opt20) { opt20.disabled = lvl < 20; opt20.textContent = lvl >= 20 ? "💎 Infinite Zen" : "🔒 Level 20"; }

    const opt30 = document.querySelector('option[value="omniscient_origin"]');
    if (opt30) { opt30.disabled = lvl < 30; opt30.textContent = lvl >= 30 ? "👁️ Omniscient Origin" : "🔒 Level 30"; }

    // 2. Stickers
    document.querySelectorAll(".level-5-reward").forEach(el => el.style.display = lvl >= 5 ? "inline-flex" : "none");

    // 3. UI Transformations (Rank Glows)
    document.querySelectorAll(".panel").forEach(p => {
      p.classList.remove("kage-aura", "celestial-border", "hologram-panel", "liquid-border");
      if (lvl >= 30) p.classList.add("liquid-border");
      else if (lvl >= 20) p.classList.add("hologram-panel");
      else if (lvl >= 15) p.classList.add("celestial-border");
      else if (lvl >= 10) p.classList.add("kage-aura");
    });

    // 4. Ninja Rank Text
    let rank = "Genin";
    if (lvl >= 5) rank = "Jonin";
    if (lvl >= 10) rank = "Kage";
    if (lvl >= 15) rank = "Celestial Sage";
    if (lvl >= 20) rank = "Transcendent One";
    if (lvl >= 30) rank = "Omniscient Sage 👁️";
    if ($("ninjaRank")) $("ninjaRank").textContent = `Rank: ${rank}`;

    // 5. SHOP ITEM UNLOCKS (Paper Skins) - DEFINED ONLY ONCE
    const shopSkins = [
      { id: "optRainy", shopId: "layout_rainy", name: "🌧️ Rainy Paper" },
      { id: "optGlitch", shopId: "layout_matrix", name: "👾 Glitch Paper" },
      { id: "optHolo", shopId: "layout_hologram", name: "💎 Holo Paper" }
    ];

    shopSkins.forEach(skin => {
      const el = $(skin.id);
      if (el) {
        if (owned.includes(skin.shopId)) {
          el.disabled = false;
          el.textContent = skin.name;
        } else {
          el.disabled = true;
          el.textContent = "🔒 Shop Item";
        }
      }
    });
  }

  function renderList() {
    const list = $("entryList"); if (!list) return;
    const q = ($("search")?.value || "").toLowerCase();
    const filtered = entries.filter(e => {
        const matchTag = activeTag ? (e.tags || []).includes(activeTag) : true;
        const matchSearch = ((e.title||"") + (e.content||"")).toLowerCase().includes(q);
        return matchTag && matchSearch;
    }).sort((a,b) => b.updatedAt - a.updatedAt);
    list.innerHTML = filtered.map(e => `<div class="entry-card" data-id="${e.id}"><h4>${e.title || '(Untitled)'}</h4><p>${e.date} • ${e.mood}</p></div>`).join('');
    list.querySelectorAll('.entry-card').forEach(card => card.onclick = () => {
        const e = entries.find(ent => ent.id === card.dataset.id);
        activeId = e.id; 
        if($("date")) $("date").value = e.date; 
        if($("mood")) $("mood").value = e.mood; 
        if($("title")) $("title").value = e.title; 
        if($("tagsInput")) $("tagsInput").value = (e.tags || []).join(', '); 
        if($("content")) $("content").innerHTML = e.content;
    });
    if ($("count")) $("count").textContent = filtered.length;
  }

  function renderTagChips() {
    const row = $("tagRow"); if (!row) return;
    const tags = new Set(["gratitude", "work", "health", "family"]);
    entries.forEach(e => e.tags && e.tags.forEach(t => tags.add(t.toLowerCase())));
    row.innerHTML = [...tags].sort().map(t => `<button class="chip tag ${activeTag === t ? 'active' : ''}" data-tag="${t}">${t}</button>`).join('');
    row.querySelectorAll('.chip.tag').forEach(btn => btn.onclick = () => { activeTag = activeTag === btn.dataset.tag ? null : btn.dataset.tag; renderTagChips(); renderList(); });
  }

   // 4. Save & Sync
  $("btnSave")?.addEventListener('click', async () => {
    const contentHtml = $("content").innerHTML || "";
    const titleText = $("title").value || "";
    const dateValue = $("date").value || new Date().toISOString().split('T')[0];

    const data = { 
      id: activeId || Date.now().toString(), 
      date: dateValue, 
      mood: $("mood").value, 
      title: titleText, 
      content: contentHtml, 
      tags: $("tagsInput").value.split(',').map(t => t.trim().toLowerCase()).filter(Boolean), 
      updatedAt: Date.now() 
    };

    // --- 1. TOKEN CALCULATION ---
    const wordCount = (data.content || "").replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    const tokensEarned = 5 + Math.floor(wordCount / 50);
    let totalTokens = (Number(localStorage.getItem("petal_tokens")) || 0) + tokensEarned;
    localStorage.setItem("petal_tokens", totalTokens);
    
    // --- 2. LOCAL SAVE ---
    if (!activeId) {
      entries.push(data); 
    } else {
      entries = entries.map(e => e.id === activeId ? data : e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    // --- 3. CLOUD SYNC (For Phone Support) ---
    if (window.firebaseAuth?.currentUser) {
      const db = window.firebaseDb;
      const uid = window.firebaseAuth.currentUser.uid;
      try {
        // Sync the journal entry
        await setDoc(doc(db, "entries", data.id), { ...data, userId: uid }, { merge: true });
        
        // Sync global stats (including the new tokens)
        const stats = {
          whiteboard: Number(localStorage.getItem("petal_whiteboard_count")) || 0,
          well: Number(localStorage.getItem("petal_well_count")) || 0,
          tokens: totalTokens,
          updatedAt: Date.now()
        };
        await setDoc(doc(db, "users", uid, "stats", "zen"), stats, { merge: true });
        console.log("Cloud Sync Successful");
      } catch (err) { 
        console.error("Cloud Sync Error:", err); 
      }
    }

    // --- 4. UI REFRESH ---
    renderList(); 
    renderTagChips(); 
    if (typeof checkUnlocks === "function") checkUnlocks(); 
    
    toast(`Saved! +${tokensEarned} Petal Tokens earned! 🪙`);

    // --- 5. DYNAMIC JUTSU SFX ---
    const equipped = localStorage.getItem("petal_equipped_sfx") || "default";
    let audioToPlay;

    if (equipped === "default") {
      audioToPlay = document.getElementById("saveSfx");
    } else {
      // Maps sfx_chidori -> assets/chidori.mp3
      const fileName = equipped.replace("sfx_", "");
      audioToPlay = new Audio(`assets/${fileName}.mp3`);
    }

    if (audioToPlay) {
      audioToPlay.currentTime = 0;
      audioToPlay.play().catch(e => console.log("Audio play blocked. Click anywhere on page first!"));
    }
  });


      /* ------------------- Delete Logic (Fixed) ------------------- */
  document.getElementById("btnDelete")?.addEventListener('click', () => {
    // 1. Check if an entry is actually selected
    if (!activeId) {
      alert("Please select an entry from the list first!");
      return;
    }

    // 2. Confirmation
    if (!confirm("Are you sure you want to delete this entry?")) return;

    // 3. Remove from the local array
    entries = entries.filter(e => e.id !== activeId);
    
    // 4. Save the updated list to browser memory
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));

    // 5. Update UI
    renderList();
    renderTagChips();
    if (typeof checkUnlocks === "function") checkUnlocks();
    
    // 6. Reset the editor screen
    activeId = null;
    if ($("date")) $("date").value = new Date().toISOString().split('T')[0];
    if ($("mood")) $("mood").value = "Calm";
    if ($("title")) $("title").value = "";
    if ($("content")) $("content").innerHTML = "";
    if ($("tagsInput")) $("tagsInput").value = "";

    toast("Deleted successfully.");

    // 7. DYNAMIC DELETE SFX
    const equippedDeleteSfx = localStorage.getItem("petal_equipped_delete_sfx") || "default";
    let deleteAudio;

    if (equippedDeleteSfx === "default") {
      deleteAudio = document.getElementById("deleteSfx");
    } else {
      // Maps sfx_chidori -> assets/chidori.mp3
      const file = equippedDeleteSfx.replace("sfx_", "");
      deleteAudio = new Audio(`assets/${file}.mp3`);
    }

    if (deleteAudio) {
      deleteAudio.currentTime = 0;
      deleteAudio.play().catch(e => console.log("Audio play blocked."));
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    try { entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { entries = []; }
    renderList(); renderTagChips(); checkUnlocks();
    $("search")?.addEventListener('input', renderList);
  });
})();

/* ------------------- Music & Spotify ------------------- */
(() => {
  const $ = (id) => document.getElementById(id);
  const tracks = ["assets/lofi.mp3", "assets/elevator.mp3", "assets/monty.mp3", "assets/intro.mp3"];
  let trackIdx = Number(localStorage.getItem("petal_track_index") || "0") % tracks.length;

  function renderSpotify(base) {
    const host = $("spotifyEmbed"); if (!host || !base) return;
    const darks = new Set(["midnight", "cosmic_starfall", "dusky_rose", "mauve_night", "deep_sage", "blueberry_dusk", "cocoa_lilac", "midnight_snowfall", "ninja_rivalry", "copy_ninja", "ghost_uchiha", "akatsuki_cloud", "hidden_rain", "legendary_sannin" , "springtime_youth" , "forbidden_lab" , "kamui_dimension" , "tactical_suiton" , "shadow_possession" , "butterfly_mode" , "hidan_ritual" , "kakuzu_hearts" , "eternal_beauty" , "monster_mist" , "stinky_aloe" , "uchiha_avenger" , "eternal_amaterasu" , "six_paths_pain", "ten_shadows", "cursed_manipulation", "death_painting", "blood_brother", "infinite_tsukuyomi"]);
    const theme = darks.has(localStorage.getItem("petal_theme")) ? "dark" : "light";
    host.innerHTML = `<iframe class="spotify-iframe" style="width:100%; height:352px; border:0; border-radius:16px;" src="${base}?theme=${theme}" loading="lazy"></iframe>`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const bgm = $("bgm"); if (!bgm) return;
    bgm.volume = Number(localStorage.getItem("petal_music_vol") || 0.35);
    bgm.src = tracks[trackIdx];
    $("btnMusic")?.addEventListener("click", () => { if (bgm.paused) bgm.play(); else bgm.pause(); $("btnMusic").textContent = bgm.paused ? "Play Music" : "Pause Music"; });
    $("btnNextTrack")?.addEventListener("click", () => { trackIdx = (trackIdx + 1) % tracks.length; bgm.src = tracks[trackIdx]; bgm.play(); localStorage.setItem("petal_track_index", trackIdx); });

    const saved = localStorage.getItem("petal_spotify_embed");
    if (saved) renderSpotify(saved);
    $("btnSetSpotify")?.addEventListener("click", () => {
        const match = $("spotifyUrl").value.match(/(?:playlist|album|track|show|episode)\/([a-zA-Z0-9]+)/);
        if (match) {
            let type = 'playlist';
            if ($("spotifyUrl").value.includes('track/')) type = 'track';
            const base = `https://open.spotify.com/embed/${type}/${match[1]}`;
            localStorage.setItem("petal_spotify_embed", base); renderSpotify(base);
        }
    });
    $("btnClearSpotify")?.addEventListener("click", () => { localStorage.removeItem("petal_spotify_embed"); $("spotifyEmbed").innerHTML = ""; });
  });

  document.addEventListener('themeChanged', () => { renderSpotify(localStorage.getItem("petal_spotify_embed")); });
})();

/* ------------------- Seasonal Animations (The Master Spawner) ------------------- */
(() => {
  const overlay = document.createElement("div");
  overlay.id = "animation-overlay";
  document.body.prepend(overlay);
  let animationInterval = null;

  function startAnimation(type) {
    if (animationInterval) clearInterval(animationInterval);
    overlay.innerHTML = "";
    if (!type) return;

    animationInterval = setInterval(() => {
      const p = document.createElement("div");
      const startX = Math.random() * window.innerWidth;
      
            // 1. BASIC SEASONS
      if (type === "meteors") { p.className = "meteor"; p.style.left = (startX + 400) + "px"; p.style.top = "-50px"; p.style.animationDuration = (Math.random() * 1 + 0.5) + "s"; }
      else if (type === "leaves") { p.className = "leaf"; p.style.left = startX + "px"; p.style.top = "-50px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; }
      else if (type === "blossoms") { p.className = "blossom"; p.style.left = startX + "px"; p.style.top = "-50px"; p.style.animationDuration = (Math.random() * 4 + 5) + "s"; }
      else if (type === "sunbeams") { p.className = "sunbeam"; p.style.left = startX + "px"; p.style.top = "-150px"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; }
      else if (type === "snow") { p.className = "snowflake"; p.style.left = startX + "px"; p.style.top = "-10px"; const size = Math.random() * 4 + 2 + "px"; p.style.width = size; p.style.height = size; p.style.animationDuration = (Math.random() * 3 + 5) + "s"; }
      
      // 2. NARUTO THEMES
      else if (type === "aura") { p.className = Math.random() > 0.3 ? "aura-flame" : "aura-flame aura-orange"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-100px"; p.style.animationDuration = (Math.random() * 1.5 + 1.5) + "s"; }
      else if (type === "teleport") { p.className = "flash-spark"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; const rot = Math.random() * 360; p.style.setProperty('--rot', `${rot}deg`); p.style.animationDuration = "0.25s"; }
      else if (type === "pearls") { p.className = "pearl"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; const s = Math.floor(Math.random() * 12 + 10) + "px"; p.style.width = s; p.style.height = s; p.style.animationDelay = (Math.random() * 5) + "s"; }
      else if (type === "sage_history") { const isL = Math.random() > 0.3; p.className = isL ? "sage-leaf" : "ink-blot"; p.style.left = Math.random() * 100 + "vw"; p.style.top = isL ? "-20px" : (Math.random() * 100 + "vh"); p.style.animationDuration = isL ? (Math.random() * 4 + 6) + "s" : "4s"; }
      else if (type === "snakes") { p.className = "snake-line"; p.style.left = "-50px"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = (Math.random() * 4 + 6) + "s"; } 
      else if (type === "tomoe") { p.className = "tomoe"; p.textContent = "©"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "4s"; } 
      else if (type === "warps") { p.className = "kamui-warp"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "3s"; } 
      else if (type === "black_fire") { p.className = "black-flame"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-20px"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; if (Math.random() > 0.5) p.style.transform = "scaleX(-1)"; }
      else if (type === "feathers") { p.className = "feather"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-30px"; p.style.animationDuration = (Math.random() * 4 + 5) + "s"; if (Math.random() > 0.5) p.style.transform = "scaleX(-1)"; } 
      else if (type === "truth_orbs") { p.className = "truth-orb"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDelay = (Math.random() * 5) + "s"; }
      else if (type === "hundred_seals") { p.className = "diamond-seal"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "4s"; } 
      else if (type === "malice") { p.className = "malice-orb"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-20px"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; if (Math.random() > 0.8) { p.style.background = "#F97316"; p.style.boxShadow = "0 0 20px 4px #F97316"; } } 
      else if (type === "wood_style") { if (Math.random() > 0.7) { p.className = "wood-vine"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-50px"; const rot = Math.random() * 360; p.style.setProperty('--rot', `${rot}deg`); p.style.animationDuration = (Math.random() * 2 + 4) + "s"; } else { p.className = "wood-petal"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-20px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; } }
      else if (type === "bubbles") { if (Math.random() > 0.6) { p.className = "water-ripple"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; } else { p.className = "water-drop"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-20px"; } p.style.animationDuration = "4s"; }
      else if (type === "spirals") { p.className = "uzumaki-spiral"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "5s"; } 
      else if (type === "bolts") { p.className = "chidori-bolt"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.transform = `rotate(${Math.random() * 360}deg)`; p.style.animationDuration = "0.3s"; }
      else if (type === "sharks") { p.className = "shark-fin"; p.style.left = "-40px"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; } 
      else if (type === "flytraps") { p.className = "flytrap-spike"; p.style.left = Math.random() * 100 + "vw"; const isT = Math.random() > 0.5; p.style[isT ? 'top' : 'bottom'] = "-10px"; if (isT) p.style.transform = "rotate(180deg)"; p.style.animationDuration = "3s"; }
      else if (type === "love_sand") { p.className = "love-kanji"; p.textContent = "愛"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-40px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; }
      else if (type === "shadows") { const edge = Math.random(); if (edge > 0.5) { p.style.bottom = "-50px"; p.style.left = Math.random() * 100 + "vw"; p.style.setProperty('--rot', `${(Math.random() * 40) - 20}deg`); } else { p.style.top = Math.random() * 100 + "vh"; p.style.left = edge > 0.25 ? "-50px" : "100vw"; p.style.setProperty('--rot', edge > 0.25 ? "90deg" : "-90deg"); } p.className = "shadow-tendril"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; }
      
      // RESTORED: AKATSUKI & AME TRIO
      else if (type === "jashin") { p.className = "jashin-seal"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.transform = `rotate(${Math.random() * 360}deg)`; p.style.animationDuration = "5s"; }
      else if (type === "clouds") { p.className = "red-cloud"; p.style.left = "-60px"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = (Math.random() * 10 + 15) + "s"; }
      else if (type === "threads") { p.className = "stitch-thread"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-70px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; }
      else if (type === "explosive_birds") { p.className = "clay-bird"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-20px"; p.style.animationDuration = "3s"; }
      else if (type === "puppet_strings") { p.className = "puppet-string"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "0"; }
      else if (type === "paper") { p.className = "paper-sheet"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-30px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; }
      else if (type === "gravity") { p.className = "gravity-ring"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; }
      else if (type === "tobi_swirl") { p.className = "tobi-spiral"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; }
      else if (type === "rain") { p.className = "rain-drop"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-20px"; p.style.animationDuration = (Math.random() * 0.4 + 0.6) + "s"; }
      else if (type === "seals") { const k = ["蝦", "蛞", "蛇"]; p.className = "kanji-seal"; p.textContent = k[Math.floor(Math.random() * k.length)]; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "5s"; }

      // 3. JJK THEMES
      else if (type === "infinity") { p.className = "infinity-ring"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "4s"; }
      else if (type === "slashes") { p.className = "sukuna-slash"; p.style.left = Math.random() * 80 + 10 + "vw"; p.style.top = Math.random() * 80 + 10 + "vh"; const rR = Math.random() * 360; p.style.setProperty('--rot', `${rR}deg`); p.style.animationDuration = "0.3s"; }
      else if (type === "shikigami") { p.className = "shadow-wolf"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "10vh"; }
      else if (type === "cursed_orbs") { p.className = "cursed-orb"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; }
      else if (type === "blood_streaks") { p.className = "blood-streak"; p.style.left = "-100px"; p.style.top = Math.random() * 100 + "vh"; p.style.transform = `rotate(${(Math.random() * 20) - 10}deg)`; }
      else if (type === "impacts") { p.className = "impact-ring"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; }
      else if (type === "supernova") { p.className = "blood-orb"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = "3s"; p.style.animationDelay = (Math.random() * 2) + "s"; }
      else if (type === "clock_ticks") { p.className = "clock-hand"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-20px"; p.style.animationDuration = (Math.random() * 2 + 4) + "s"; }
      else if (type === "summer_clouds") { p.className = "summer-cloud"; p.style.top = Math.random() * 40 + "vh"; p.style.left = "-150px"; p.style.width = (Math.random() * 100 + 100) + "px"; p.style.animationDuration = (Math.random() * 10 + 15) + "s"; }
      else if (type === "dimensional_tears") {
      p.className = "tear";
      p.style.left = Math.random() * 100 + "vw";
      p.style.top = Math.random() * 100 + "vh";
      p.style.animationDuration = "2s";
    }

      // 4. ONE PIECE THEMES
      else if (type === "air_cracks") { p.className = "air-crack"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.setProperty('--rot', `${Math.random() * 360}deg`); p.style.animationDuration = "0.4s"; }
      else if (type === "room_scan") { p.className = "room-circle"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; }
      else if (type === "drum_beats") { p.className = "drum-beat"; p.textContent = "DUM!"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; }
      else if (type === "hearts") { p.className = "snowflake"; p.style.backgroundColor = "#F43F5E"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-10px"; }
      
      // 5. VIBE THEMES
      else if (type === "glitch") { p.className = "glitch-box"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.backgroundColor = Math.random() > 0.5 ? "#FF007A" : "#00F3FF"; }
      else if (type === "plankton") { p.className = "plankton"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDelay = (Math.random() * 10) + "s"; }
      else if (type === "fireflies") { p.className = "firefly"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDelay = (Math.random() * 4) + "s"; }
      else if (type === "fans") { p.className = "paper-fan"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-20px"; p.style.animationDuration = (Math.random() * 4 + 6) + "s"; }
      else if (type === "arms") { p.className = "flower-arm"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; }
      else if (type === "pixels") { p.className = "pixel-heart"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; }
      else if (type === "cursors") { p.className = "pixel-cursor"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDelay = (Math.random() * 5) + "s"; }
      else if (type === "crops") { p.className = "pixel-crop"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-20px"; p.style.backgroundColor = Math.random() > 0.5 ? "#FF8C00" : "#78B159"; }
      else if (type === "steam") { p.className = "pixel-steam"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "10vh"; p.style.animationDuration = (Math.random() * 2 + 2) + "s"; }
      else if (type === "lightning") { p.className = "lightning"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "0"; p.style.animationDuration = "0.4s"; }
      else if (type === "paper") { p.className = "paper-sheet"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-30px"; p.style.animationDuration = (Math.random() * 3 + 4) + "s"; }
      else if (type === "star_shards") { p.className = "star-shard"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDelay = (Math.random() * 3) + "s"; } 
      else if (type === "dream_waves") { const isR = Math.random() > 0.4; if (isR) { p.className = "tsukuyomi-ripple"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; } else { p.className = "soul-cocoon"; p.style.left = Math.random() * 100 + "vw"; p.style.top = "-30px"; } } 
      else if (type === "divine_aura") { p.className = "zen-shard"; p.style.left = Math.random() * 100 + "vw"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDelay = (Math.random() * 5) + "s"; }
      else if (type === "embers") { p.className = "ember"; p.style.left = Math.random() * 100 + "vw"; p.style.bottom = "-20px"; p.style.animationDuration = (Math.random() * 2 + 3) + "s"; }
      else if (type === "sand") { p.className = "sand-grain"; p.style.left = "-10px"; p.style.top = Math.random() * 100 + "vh"; p.style.animationDuration = (Math.random() * 1 + 2) + "s"; }

            // --- PRIDE THEMES (Custom Movements) ---
      else if (type === "pride_rainbow") {
        p.className = "rainbow-trail";
        p.style.top = Math.random() * 100 + "vh";
        p.style.left = "-50px"; // Starts off-screen left
      }
      else if (type === "pride_sunset") {
        p.className = "sunset-ray";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-60px"; // Starts off-screen bottom
      }
      else if (type === "pride_gay") {
        p.className = "ocean-drop";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = "-20px"; // Starts off-screen top
      }
      else if (type === "pride_bi") {
        p.className = "bi-star";
        p.style.left = Math.random() * 100 + "vw";
        p.style.top = Math.random() * 100 + "vh"; // Appears anywhere
      }
      else if (type === "pride_trans") {
        p.className = "trans-bubble";
        p.style.left = Math.random() * 100 + "vw";
        p.style.bottom = "-20px"; // Drifts up from bottom
        const size = Math.random() * 15 + 10 + "px";
        p.style.width = size; p.style.height = size;
      }
      overlay.appendChild(p);
      setTimeout(() => p.remove(), 8000);
    }, (type === "teleport" || type === "bolts" || type === "slashes" || type === "air_cracks" || type === "glitch" || type === "lightning") ? 80 : 800);
  }

  document.addEventListener("themeChanged", () => {
    const theme = localStorage.getItem("petal_theme");
    const map = { 
      cosmic_starfall: "meteors", autumn_forest: "leaves", spring_blossom: "blossoms", summer_shimmer: "sunbeams", midnight_snowfall: "snow", 
      ninja_rivalry: "sparks", copy_ninja: "lightning", medical_kunoichi: "healing", legendary_sannin: "seals", desert_love: "love_sand", 
      god_of_shinobi: "wood_style", tactical_suiton: "bubbles", ghost_uchiha: "tomoe", crow_illusion: "feathers", yellow_flash: "teleport", 
      lavender_pearl: "pearls", gallant_tale: "sage_history", forbidden_lab: "snakes", slug_princess: "hundred_seals", nine_tails_malice: "malice", 
      springtime_youth: "aura", eternal_amaterasu: "black_fire", kamui_dimension: "warps", six_paths_sage: "truth_orbs", shadow_possession: "shadows", 
      mind_transfer: "mind_waves", butterfly_mode: "butterflies", hidan_ritual: "jashin", kakuzu_hearts: "threads", art_explosion: "explosive_birds", 
      eternal_beauty: "puppet_strings", paper_angel: "paper", six_paths_pain: "gravity", original_hope: "rain", tobi_good_boy: "tobi_swirl", 
      monster_mist: "sharks", stinky_aloe: "flytraps", ultimate_masterpiece: "c0_explosion", hokage_dream: "spirals", uchiha_avenger: "bolts",
      infinite_void: "infinity", malevolent_shrine: "slashes", ten_shadows: "shikigami", cursed_manipulation: "cursed_orbs", death_painting: "blood_streaks",
      divergent_fist: "impacts", blood_brother: "supernova", ratio_sorcerer: "clock_ticks", blue_spring: "summer_clouds", strongest_man: "air_cracks",
      surgeon_death: "room_scan", sun_god: "drum_beats", silent_heart: "hearts", legendary_merchant: "fans", flower_archeologist: "arms",
      retro_handheld: "pixels", classic_desktop: "cursors", farm_life: "crops", cozy_cafe: "steam", infinite_tsukuyomi: "dream_waves", 
      infinite_zen: "divine_aura", celestial_sovereignty: "star_shards", progress_pride: "pride_rainbow",
lesbian_sunset: "pride_sunset",
gay_ocean: "pride_gay",
bisexual_galaxy: "pride_bi",
trans_serenity: "pride_trans",

    };
    startAnimation(map[theme] || null);
  });
})();

/* ------------------- Stickers & Prompts Logic ------------------- */
  const promptsList = [
    // --- JJK / Sorcerer Prompts ---
    "Nanami says 'Overtime is a drag.' What is one task you need to finish *now* so you can truly rest?",
    "‘Are you the strongest because you’re you?’ What is one unique trait that defines you at your core?",
    "If you could use a Domain Expansion to create your perfect safe space, what would it look like?",
    "Choso lives for his brothers. Who are the people in your life that feel like 'family'?",
    "Like Megumi’s shadows, we all have parts we hide. What is one 'shadow' part of yourself you’re accepting?",
    "Nanami says being an adult is a series of little despairs. What was one small frustration today?",
    "Nobara never apologizes for being herself. What is one thing you love about your personality?",
    "Yuji fights to give people a 'proper death.' What does a 'proper life' look like to you right now?",
    "Geto struggled with the weight of his mission. Are you carrying a burden that isn't yours to bear?",
    "Recall a moment today where you felt like you were in the 'Zone' (Black Flash). What were you doing?",

    // --- Naruto / Founding Fathers Prompts ---
    "Hashirama built the Leaf from a dream. If you were starting a village today, what would be your first rule?",
    "Madara dreamed of a 'perfect' world. Describe your ideal dream world—what do you see?",
    "Tobirama was a master of tactics. What is the smartest decision you made for yourself today?",
    "If you were to plant a forest for the future, what 'seeds' of good habits are you planting right now?",
    "Itachi protected the village from the shadows. What is something kind you did today that no one saw?",
    "Obito felt lost in a 'world of lies.' What is one truth about yourself that you are holding onto?",
    "We all wear 'masks' like Tobi sometimes. What mask are you wearing today, and what happens when you take it off?",
    "Jiraiya believed in a world of understanding. Who did you try to understand a little better today?",
    "Tsunade says memories make us strong. Write down one memory that gives you strength when you're sad.",
    "Orochimaru sought knowledge. What is one piece of knowledge or a skill you want to keep forever?",
    "Gai Sensei says the 'Springtime of Youth' never ends! What made your heart beat faster with excitement today?",
    "Master Kakashi says those who abandon friends are scum. How did you show up for your circle today?",
    "Naruto never goes back on his word. What is one promise you made to yourself that you are keeping?",
    "Sakura mastered healing. What part of your heart or mind needs a little 'Healing Jutsu' tonight?",
    "Which Hidden Village matches your current mood? (Leaf, Sand, Cloud, etc.)",
    "‘A person grows up when they're able to overcome hardships.’ What is a hardship you are overcoming?",
    "If you were writing your own 'Gallant Tale,' what would the current chapter be titled?",
    "‘True art is an explosion!’ What was the most exciting or 'explosive' moment of your week?"
  ];

document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("promptCard");
  if (card) {
      card.textContent = localStorage.getItem("petal_prompt") || promptsList[0];
      document.getElementById("btnPrompt")?.addEventListener("click", () => {
          const next = promptsList[Math.floor(Math.random() * promptsList.length)];
          card.textContent = next; localStorage.setItem("petal_prompt", next);
      });
  }

  const picker = document.getElementById("imgPicker");
  document.getElementById("btnAddImage")?.addEventListener("click", () => picker?.click());
  picker?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0]; if (!file || !window.firebaseAuth?.currentUser) return;
    try { toast("Uploading..."); const path = `entry_images/${window.firebaseAuth.currentUser.uid}/${Date.now()}_image`; const fileRef = storageRef(window.firebaseStorage, path); await uploadBytes(fileRef, file, { contentType: file.type }); const url = await getDownloadURL(fileRef); const img = document.createElement("img"); img.src = url; img.className = "sticker"; document.getElementById("content").appendChild(img); toast("Added!"); } catch (err) { alert("Failed"); }
  });

  const ownedItems = JSON.parse(localStorage.getItem("petal_owned_items") || "[]");
  const sBar = document.querySelector(".sticker-panel");
  const sMap = { "sticker_kunai": { name: "Kunai", file: "kunai.gif" }, "sticker_curse": { name: "Cursed Mark", file: "cursedmark.gif" }, "sticker_joyboy": { name: "Sun God", file: "sungod.gif" }, "sticker_chibigojo": { name: "Chibi Gojo", file: "gojo_chibi.gif" }, "sticker_cukootoji": { name: "Cukoo Toji", file: "cukoo_toji.gif" }, };
  if (sBar) { ownedItems.forEach(id => { const i = sMap[id]; if (i && !document.querySelector(`[data-sticker="assets/${i.file}"]`)) { const b = document.createElement("button"); b.className = "chip"; b.type = "button"; b.dataset.sticker = `assets/${i.file}`; b.textContent = `✨ ${i.name}`; sBar.appendChild(b); } }); }
});

document.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-sticker]");
  if (btn) { const img = document.createElement("img"); img.src = btn.dataset.sticker; img.className = "sticker"; document.getElementById("content").appendChild(img); }
});

/* ------------------- Initial Setup ------------------- */
document.addEventListener("DOMContentLoaded", async () => {
  const theme = localStorage.getItem("petal_theme") || "petal";
  applyTheme(theme); applySkin(localStorage.getItem("petal_skin") || "ruled");
  if (document.getElementById("themeSelect")) document.getElementById("themeSelect").value = theme;
  if (document.getElementById("skinSelect")) document.getElementById("skinSelect").value = localStorage.getItem("petal_skin") || "ruled";
  document.getElementById("themeSelect") && (document.getElementById("themeSelect").onchange = (e) => applyTheme(e.target.value));
  document.getElementById("skinSelect") && (document.getElementById("skinSelect").onchange = (e) => applySkin(e.target.value));
});

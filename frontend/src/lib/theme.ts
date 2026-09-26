import type { ThemeConfig } from "antd";

/**
 * AntD theme mapped from DESIGN.md (Notion system) tokens.
 * Purple is reserved for the dominant CTA, navy for dark bands,
 * rectangles stay at 8px and cards at 12px.
 */
export const notionTheme: ThemeConfig = {
  token: {
    colorPrimary: "#5645d4",
    borderRadius: 8,
    fontFamily:
      'Inter, -apple-system, system-ui, "Segoe UI", Helvetica, Arial, sans-serif',
    colorText: "#1a1a1a",
    colorTextSecondary: "#5d5b54",
    colorBorder: "#e5e3df",
    colorBorderSecondary: "#ede9e4",
    colorBgLayout: "#f6f5f4",
    colorSuccess: "#1aae39",
    colorWarning: "#dd5b00",
    colorError: "#e03131",
    colorLink: "#0075de",
  },
  components: {
    Button: { borderRadius: 8 },
    Card: { borderRadiusLG: 12 },
    Input: { borderRadius: 8 },
    Select: { borderRadius: 8 },
    InputNumber: { borderRadius: 8 },
    Modal: { borderRadiusLG: 12 },
  },
};

import {
  Braces,
  CheckCircle2,
  FileJson2,
  Hash,
  Link2,
  Minimize2,
  Shield,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type ToolCategory = "JSON" | "ENCODING" | "SECURITY" | "GENERATORS";

export type Tool = {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  href: string;
  icon: LucideIcon;
};

export const toolCategories: ToolCategory[] = [
  "JSON",
  "ENCODING",
  "SECURITY",
  "GENERATORS",
];

export const tools: Tool[] = [
  {
    id: "json-formatter",
    name: "Formatter",
    description: "Format and validate JSON instantly.",
    category: "JSON",
    href: "/tools/json/formatter",
    icon: FileJson2,
  },
  {
    id: "json-validator",
    name: "Validator",
    description: "Check whether JSON is valid.",
    category: "JSON",
    href: "/tools/json/validator",
    icon: CheckCircle2,
  },
  {
    id: "json-minifier",
    name: "Minifier",
    description: "Minify JSON by removing whitespace.",
    category: "JSON",
    href: "/tools/json/minifier",
    icon: Minimize2,
  },
  {
    id: "encoding-base64",
    name: "Base64",
    description: "Encode or decode text using Base64.",
    category: "ENCODING",
    href: "/tools/encoding/base64",
    icon: Braces,
  },
  {
    id: "encoding-url",
    name: "URL",
    description: "Encode or decode URL text.",
    category: "ENCODING",
    href: "/tools/encoding/url",
    icon: Link2,
  },
  {
    id: "security-jwt",
    name: "JWT",
    description: "Decode and inspect JWT claims.",
    category: "SECURITY",
    href: "/tools/security/jwt",
    icon: Shield,
  },
  {
    id: "security-hash",
    name: "Hash",
    description: "Generate cryptographic hashes for text.",
    category: "SECURITY",
    href: "/tools/security/hash",
    icon: Hash,
  },
  {
    id: "generators-uuid",
    name: "UUID",
    description: "Generate a new UUID.",
    category: "GENERATORS",
    href: "/tools/generators/uuid",
    icon: Sparkles,
  },
];

export const defaultToolHref = "/tools/json/formatter";

export function getToolByHref(href: string): Tool | undefined {
  return tools.find((tool) => tool.href === href);
}

export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

export function getToolSearchLabel(tool: Tool): string {
  if (tool.category === "JSON") {
    return `JSON ${tool.name}`;
  }

  return tool.name;
}

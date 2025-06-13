import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import { InlineMath, BlockMath } from "react-katex"
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import "katex/dist/katex.min.css"
import type { Components } from "react-markdown"

declare module "react-markdown" {
  interface ComponentPropsWithoutRef<T> {
    value?: string
  }
}

type CustomComponents = Omit<Components, "code"> & {
  code: React.ComponentType<{ inline?: boolean; className?: string; children?: React.ReactNode } & BasicComponentProps>
  math: React.ComponentType<{ value: string }>
  inlineMath: React.ComponentType<{ value: string }>
}

interface CodeBlockProps {
  language: string
  value: string
}

function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="w-full overflow-hidden">
      <div className={cn(
        "bg-background flex items-center justify-between px-4 py-2",
        isCollapsed ? "" : "border-b"
      )}>
        <div className="flex items-center gap-2">
          <span className="h-full text-center text-sm">{language}</span>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:text-primary text-muted-foreground h-full"
          >
            {isCollapsed ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronUp className="size-4" />
            )}
          </button>
        </div>
        <button
          onClick={copyToClipboard}
          className="hover:text-primary text-muted-foreground"
        >
          {copied ? (
            <Check className="size-4" />
          ) : (
            <Copy className="size-4" />
          )}
        </button>
      </div>
      <div
        className={cn(
          "transition-all duration-200 ease-in-out",
          isCollapsed ? "max-h-0" : "max-h-fit"
        )}
      >
        <ScrollArea className="relative w-full text-lg">
          <div className="min-w-full p-2">
            <SyntaxHighlighter
              language={language}
              PreTag="div"
              customStyle={{
                margin: 0,
                background: "transparent",
                minWidth: "100%",
                width: "fit-content",
                whiteSpace: "pre",
              }}
            >
              {value}
            </SyntaxHighlighter>
          </div>
        </ScrollArea>
      </div>
    </Card>
  )
}

interface MarkdownPreviewProps {
  content: string
  currentWordIndex?: number
}

interface TextRendererProps {
  children: React.ReactNode
}

interface BasicComponentProps {
  children?: React.ReactNode
  [key: string]: any
}

export function MarkdownPreview({ content, currentWordIndex = -1 }: MarkdownPreviewProps) {
  const cleanContent = (text: string): string => {
    return text
      .replace(/^(\s*[-*+][ \t]*|\s*\d+\.[ \t]*)$/gm, "")
      .replace(/^(\s*[-*+][ \t]+)([ \t\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]|&nbsp;)*$/gm, "")
      .replace(/^(\s*\d+\.[ \t]+)([ \t\u00A0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000\uFEFF]|&nbsp;)*$/gm, "")
      .replace(/^(\s*[-*+][ \t]+)([^\S\r\n]|&[a-z0-9#]+;|[\u200B-\u200D\uFEFF])*$/gmi, "")
      .replace(/^(\s*\d+\.[ \t]+)([^\S\r\n]|&[a-z0-9#]+;|[\u200B-\u200D\uFEFF])*$/gmi, "")
      .replace(/\n{3,}/g, "\n\n")
  }
    
  const splitIntoTokens = (text: string) => {
    return text.match(/[a-zA-Z0-9"]+|[^\s\w"]+|\s+/g) || []
  }

  const getTextFromChildren = (children: React.ReactNode): string => {
    if (children === undefined || children === null) return ""
    if (typeof children === "string") return children
    if (typeof children === "number") return String(children)
    if (Array.isArray(children)) {
      return children.map(getTextFromChildren).join("")
    }
    return ""
  }

  const TextRenderer = ({ children }: TextRendererProps) => {
    const plainText = getTextFromChildren(children)
    const tokens = splitIntoTokens(plainText)
    let wordIndex = 0

    return (
      <>
        {tokens.map((token, index) => {
          const isWord = /[a-zA-Z0-9"]+/.test(token)
          const tokenIndex = isWord ? wordIndex++ : -1
          return (
            <span
              key={index}
              className={isWord && tokenIndex === currentWordIndex ? "bg-primary/20 text-primary rounded px-1 font-medium" : ""}
            >
              {token}
            </span>
          )
        })}
      </>
    )
  }

  const markdownComponents: CustomComponents = {
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      if (!inline && match && children) {
        return (
          <CodeBlock
            language={match[1]}
            value={String(children).replace(/\n$/, "")}
          />
        )
      }
      return (
        <code className={cn("bg-muted rounded-md", className)} {...props}>
          {children}
        </code>
      )
    },
    p: ({ children, ...props }) => (
      <p {...props}>
        <TextRenderer>{children}</TextRenderer>
      </p>
    ),
    li: ({ children, ...props }) => {
      const content = getTextFromChildren(children)
      if (!content || /^\s*$/.test(content)) {
        return null
      }
      
      return (
        <li {...props}>
          <TextRenderer>{children}</TextRenderer>
        </li>
      )
    },
    h1: ({ children, ...props }) => (
      <h1 {...props}>
        <TextRenderer>{children}</TextRenderer>
      </h1>
    ),
    h2: ({ children, ...props }) => (
      <h2 {...props}>
        <TextRenderer>{children}</TextRenderer>
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3 {...props}>
        <TextRenderer>{children}</TextRenderer>
      </h3>
    ),
    h4: ({ children, ...props }) => (
      <h4 {...props}>
        <TextRenderer>{children}</TextRenderer>
      </h4>
    ),
    h5: ({ children, ...props }) => (
      <h5 {...props}>
        <TextRenderer>{children}</TextRenderer>
      </h5>
    ),
    h6: ({ children, ...props }) => (
      <h6 {...props}>
        <TextRenderer>{children}</TextRenderer>
      </h6>
    ),
    a: ({ children, ...props }) => (
      <a {...props}>
        <TextRenderer>{children}</TextRenderer>
      </a>
    ),
    em: ({ children, ...props }) => (
      <em {...props}>
        <TextRenderer>{children}</TextRenderer>
      </em>
    ),
    strong: ({ children, ...props }) => (
      <strong {...props}>
        <TextRenderer>{children}</TextRenderer>
      </strong>
    ),
    table: ({ children }) => (
      <div className="my-4 w-full">
        <Table>{children}</Table>
      </div>
    ),
    thead: ({ children }) => <TableHeader>{children}</TableHeader>,
    tbody: ({ children }) => <TableBody>{children}</TableBody>,
    tr: ({ children }) => <TableRow>{children}</TableRow>,
    th: ({ children }) => <TableHead>{children}</TableHead>,
    td: ({ children }) => <TableCell>{children}</TableCell>,
    blockquote: ({ children }) => (
      <Alert className="my-4">
        <AlertDescription>
          <TextRenderer>{children}</TextRenderer>
        </AlertDescription>
      </Alert>
    ),
    math: ({ value }) => (
      <Card className="my-4 overflow-x-auto p-4">
        <BlockMath math={value} />
      </Card>
    ),
    inlineMath: ({ value }) => <InlineMath math={value} />,
  }

  const cleanedContent = cleanContent(content)

  return (
    <div className="prose prose-sm dark:prose-invert min-w-full [&_ol]:ml-2 [&_pre]:bg-transparent [&_pre]:p-0">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={markdownComponents}
      >
        {cleanedContent}
      </ReactMarkdown>
    </div>
  )
}

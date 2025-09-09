"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Using any type for Note to avoid schema mismatches
import dynamic from "next/dynamic";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink } from "lucide-react";

// Custom stylesheet for the markdown editor (same as in add-note.tsx)
const markdownStyles = `
.w-md-editor {
  box-shadow: none !important;
}

.w-md-editor-toolbar {
  border-radius: 0.375rem 0.375rem 0 0 !important;
}

.markdown-body {
  font-family: inherit !important;
  line-height: 1.6 !important;
}

.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4 {
  margin-top: 1.5rem !important;
  margin-bottom: 0.75rem !important;
  font-weight: 600 !important;
}

.markdown-body code {
  padding: 0.2em 0.4em !important;
  background-color: rgba(27, 31, 35, 0.05) !important;
  border-radius: 3px !important;
}

.markdown-body pre {
  padding: 1em !important;
  border-radius: 5px !important;
}

.markdown-body blockquote {
  padding: 0 1em !important;
  color: #6a737d !important;
  border-left: 0.25em solid #dfe2e5 !important;
}

/* Fix for bullet points and lists */
.markdown-body ul {
  list-style-type: disc !important;
  padding-left: 2em !important;
  margin: 1em 0 !important;
}

.markdown-body ol {
  list-style-type: decimal !important;
  padding-left: 2em !important;
  margin: 1em 0 !important;
}

.markdown-body li {
  display: list-item !important;
  margin: 0.25em 0 !important;
}

.markdown-body li > p {
  margin-top: 0 !important;
}

/* Ensure proper spacing for all elements */
.markdown-body p {
  margin: 1em 0 !important;
}

/* Fix for task lists */
.markdown-body input[type="checkbox"] {
  margin-right: 0.5em !important;
}
`;

// Create a type for Markdown Preview
type MarkdownProps = {
  source: string;
};

// Dynamically import the Markdown preview component to avoid SSR issues
const MarkdownPreview = dynamic<MarkdownProps>(
  () => import('@uiw/react-md-editor').then((mod) => {
    return mod.default.Markdown;
  }),
  { ssr: false }
);

interface NoteViewerProps {
  note: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  getCategoryInfo: (categoryId: number) => any;
}

export function NoteViewer({ note, isOpen, onOpenChange, getCategoryInfo }: NoteViewerProps) {
  if (!note) return null;
  
  const categoryInfo = getCategoryInfo(note.categoryId);
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col w-full max-w-screen-2xl max-h-[96vh] overflow-auto resize" style={{ resize: 'both', minWidth: '400px', minHeight: '300px' }}>
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-xl">{note.title}</DialogTitle>
            <Badge className={`w-fit text-xs ${categoryInfo.color}`}>
              {categoryInfo.label}
            </Badge>
          </div>
        </DialogHeader>
        
        <Separator className="my-1" />
        
        <ScrollArea className="flex-1 overflow-y-auto bg-background">
          <div className="p-2 bg-background">
            {/* Add the markdown styles */}
            <style jsx global>{markdownStyles}</style>
            
            <div className="markdown-container bg-background/80 rounded-2xl border border-gray-700 p-2" data-color-mode="dark">
              <div className="markdown-body bg-background/80 rounded-2xl p-1">
                <MarkdownPreview source={note.content} />
              </div>
            </div>
            
            {note.urls && note.urls.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium mb-2">Related Links</h3>
                <ul className="space-y-1">
                  {note.urls.map((url: string) => (
                    <li key={url} className="text-sm">
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {url.length > 50 ? url.substring(0, 50) + '...' : url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
              <p>Created: {note.created.toLocaleDateString()}</p>
              <p>Last Updated: {note.updated.toLocaleDateString()}</p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

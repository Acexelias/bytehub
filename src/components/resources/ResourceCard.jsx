import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Film, Link as LinkIcon, Clipboard, Check } from "lucide-react";
import { motion } from "framer-motion";

const categoryIcons = {
  cold_call_scripts: FileText,
  email_templates: FileText,
  sms_templates: FileText,
  objection_handling: FileText,
  agreements: FileText,
  training: Film,
  other: FileText
};

export default function ResourceCard({ resource }) {
  const [copied, setCopied] = useState(false);
  const Icon = categoryIcons[resource.category] || FileText;

  const handleCopy = () => {
    navigator.clipboard.writeText(resource.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(resource.video_url);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <Card className="bg-gray-900 border-gray-800 hover:border-purple-500/50 transition-all duration-200 h-full flex flex-col">
        {embedUrl && (
          <div className="aspect-video w-full">
            <iframe
              src={embedUrl}
              title={resource.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full rounded-t-lg"
            ></iframe>
          </div>
        )}
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-white">{resource.title}</CardTitle>
              <Badge variant="secondary" className="mt-1 bg-gray-700 text-gray-300 capitalize">
                {resource.category.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-4">{resource.description}</p>
            {resource.content && (
              <div className="relative p-4 bg-gray-800 rounded-lg mb-4 max-h-40 overflow-y-auto scrollbar-hide">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{resource.content}</pre>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopy}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Clipboard className="w-4 h-4" />}
                </Button>
              </div>
            )}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {resource.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="border-gray-700 text-gray-400">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4">
            {resource.file_url && (
              <a href={resource.file_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full border-gray-700 hover:border-purple-500 hover:bg-purple-500/10">
                  <FileText className="w-4 h-4 mr-2" />
                  View/Download PDF
                </Button>
              </a>
            )}
            {resource.video_url && !embedUrl && (
              <a href={resource.video_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full border-gray-700 hover:border-purple-500 hover:bg-purple-500/10">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Open Video Link
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
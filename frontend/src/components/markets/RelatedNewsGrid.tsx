"use client";
import React from "react";
import { NewsArticle } from "@/lib/marketsData";
import { Newspaper, ExternalLink, Clock } from "lucide-react";

interface RelatedNewsGridProps {
  articles: NewsArticle[];
  securityName: string;
}

export const RelatedNewsGrid: React.FC<RelatedNewsGridProps> = ({ articles, securityName }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-200">
        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <span className="w-1.5 h-4 bg-claude-orange rounded-full" />
          <span>Related News</span>
        </h2>
        <span className="text-xs text-gray-500 font-mono">
          Bloomberg Intelligence & Editorial Desk
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {articles.map((item, idx) => (
          <article
            key={item.id || idx}
            className="flex gap-4 group cursor-pointer border-b border-gray-100 pb-5 hover:bg-claude-amber/5 p-2 -m-2 rounded-xl transition-colors"
          >
            {/* Visual Thumbnail / News Icon Card */}
            <div className="w-24 sm:w-28 h-20 sm:h-24 bg-gradient-to-tr from-[#1f1914] to-[#3a281a] rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center border border-claude-amber/20 shadow-xs">
              <div className="absolute inset-0 bg-stone-900/30 flex items-center justify-center text-white/70 group-hover:scale-105 transition-transform duration-200">
                <Newspaper className="w-8 h-8 text-claude-amber" />
              </div>
              <div className="absolute bottom-1.5 left-1.5 text-[9px] font-bold uppercase tracking-wider text-white font-mono bg-claude-orange px-1.5 py-0.5 rounded shadow-xs">
                LIVE
              </div>
            </div>

            {/* Article Details */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-claude-orange hover:text-amber-700 transition-colors block mb-1">
                  {item.category}
                </span>
                <h3 className="font-bold text-sm sm:text-[14.5px] text-gray-950 group-hover:text-claude-orange leading-snug tracking-tight transition-colors line-clamp-3">
                  {item.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-gray-500 font-mono mt-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span>{item.timestamp}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

"use client";
import React from "react";
import { motion } from "framer-motion";

interface PixelAvatarProps {
  avatarKey: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}

export const PixelAvatar: React.FC<PixelAvatarProps> = ({ avatarKey, color = "#D97706", size = "md" }) => {
  const dimension = size === "sm" ? 36 : size === "lg" ? 72 : 52;

  // Custom Minecraft Pixel Character Renderers
  const renderPixelCharacter = () => {
    switch (avatarKey) {
      case "steve_miner":
        // Pickaxe & Miner Helmet
        return (
          <g>
            <rect x="6" y="4" width="20" height="8" fill="#D97706" />
            <rect x="8" y="12" width="16" height="12" fill="#F3D5B5" />
            <rect x="10" y="15" width="3" height="3" fill="#1E1915" />
            <rect x="19" y="15" width="3" height="3" fill="#1E1915" />
            <rect x="4" y="24" width="24" height="6" fill="#0284C7" />
            {/* Pickaxe */}
            <rect x="22" y="8" width="8" height="3" fill="#EAB308" />
            <rect x="24" y="11" width="3" height="12" fill="#78350F" />
          </g>
        );
      case "iron_golem":
        // Metallic Blocky Head & Vine
        return (
          <g>
            <rect x="6" y="4" width="20" height="20" fill="#E2E8F0" />
            <rect x="10" y="12" width="3" height="3" fill="#DC2626" />
            <rect x="19" y="12" width="3" height="3" fill="#DC2626" />
            <rect x="14" y="15" width="4" height="7" fill="#CBD5E1" />
            <rect x="8" y="6" width="3" height="6" fill="#059669" />
          </g>
        );
      case "redstone_sentinel":
        // Redstone Glowing Eye Helmet
        return (
          <g>
            <rect x="4" y="4" width="24" height="24" fill="#1E1915" />
            <rect x="6" y="12" width="20" height="4" fill="#EF4444" />
            <rect x="10" y="13" width="4" height="2" fill="#FEF08A" />
            <rect x="18" y="13" width="4" height="2" fill="#FEF08A" />
          </g>
        );
      case "alex_explorer":
        // Explorer Hat & Compass
        return (
          <g>
            <rect x="6" y="4" width="20" height="6" fill="#78350F" />
            <rect x="8" y="10" width="16" height="12" fill="#FCE7F3" />
            <rect x="6" y="22" width="20" height="8" fill="#059669" />
          </g>
        );
      case "witch_alchemist":
        // Pointy Hat & Purple Glowing Orbs
        return (
          <g>
            <polygon points="16,2 8,14 24,14" fill="#1E1915" />
            <rect x="4" y="14" width="24" height="3" fill="#8B5CF6" />
            <rect x="8" y="17" width="16" height="11" fill="#A855F7" />
          </g>
        );
      default:
        // Generic Minecraft Block Character
        return (
          <g>
            <rect x="4" y="4" width="24" height="24" fill={color} />
            <rect x="8" y="10" width="4" height="4" fill="#1E1915" />
            <rect x="20" y="10" width="4" height="4" fill="#1E1915" />
            <rect x="12" y="18" width="8" height="4" fill="#1E1915" />
          </g>
        );
    }
  };

  return (
    <motion.div
      className="relative inline-flex items-center justify-center p-1 bg-claude-cream border-2 border-mc-border shadow-pixel-sm"
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      whileHover={{ scale: 1.15, rotate: 3 }}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 32 32"
        className="shape-rendering-crisp"
      >
        {renderPixelCharacter()}
      </svg>
      {/* Redstone Status Particle */}
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-claude-amber border border-mc-border animate-ping" />
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-claude-amber border border-mc-border" />
    </motion.div>
  );
};

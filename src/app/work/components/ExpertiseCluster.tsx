'use client';

import { motion } from 'framer-motion';
import { EXPERTISE_CATEGORIES, ExpertiseCategory } from '../utils/skills';

interface NodePosition {
  id: string;
  x: number;
  y: number;
}

interface ExpertiseClusterProps {
  category: ExpertiseCategory;
  nodes: NodePosition[];
  isVisible?: boolean;
}

export function ExpertiseCluster({
  category,
  nodes,
  isVisible = true,
}: ExpertiseClusterProps) {
  if (nodes.length === 0 || !isVisible) return null;

  const categoryData = EXPERTISE_CATEGORIES.find((c) => c.id === category);
  if (!categoryData) return null;

  // Calculate bounding box for cluster
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  // Add padding
  const padding = 5;
  const clusterX = minX - padding;
  const clusterY = minY - padding;
  const clusterWidth = maxX - minX + padding * 2;
  const clusterHeight = maxY - minY + padding * 2;

  // Calculate center
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 0.1 : 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background region */}
      <motion.rect
        x={`${clusterX}%`}
        y={`${clusterY}%`}
        width={`${clusterWidth}%`}
        height={`${clusterHeight}%`}
        fill={categoryData.color}
        rx="2"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.05 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Border outline */}
      <motion.rect
        x={`${clusterX}%`}
        y={`${clusterY}%`}
        width={`${clusterWidth}%`}
        height={`${clusterHeight}%`}
        fill="none"
        stroke={categoryData.color}
        strokeWidth="1"
        strokeDasharray="4 4"
        rx="2"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Label */}
      {isVisible && (
        <motion.text
          x={`${centerX}%`}
          y={`${clusterY - 2}%`}
          fontSize="10"
          fill={categoryData.color}
          textAnchor="middle"
          fontFamily="monospace"
          fontWeight="bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.2 }}
        >
          {categoryData.name}
        </motion.text>
      )}
    </motion.g>
  );
}

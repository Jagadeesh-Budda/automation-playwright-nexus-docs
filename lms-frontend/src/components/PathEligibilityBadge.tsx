import React from 'react';
import { LearningPathBadge } from './LearningPathBadge';

interface Props {
  paths: string[];
}

export const PathEligibilityBadge = ({ paths }: Props) => {
  if (!paths || paths.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {paths.map((p) => (
        <LearningPathBadge key={p} path={p} />
      ))}
    </div>
  );
};

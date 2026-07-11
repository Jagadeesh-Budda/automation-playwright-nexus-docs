import React from 'react';
import JuniorShield from './JuniorShield';
import EngineerShield from './EngineerShield';
import ArchitectShield from './ArchitectShield';
import LegendShield from './LegendShield';

export default function RankEmblem({
  rankIndex,
  isActive = true,
  idSuffix = "default"
}: {
  rankIndex: number;
  isActive?: boolean;
  idSuffix?: string;
}) {
  switch (rankIndex) {
    case 0:
      return <JuniorShield isActive={isActive} idSuffix={idSuffix} />;
    case 1:
      return <EngineerShield isActive={isActive} idSuffix={idSuffix} />;
    case 2:
      return <ArchitectShield isActive={isActive} idSuffix={idSuffix} />;
    default:
      return <LegendShield isActive={isActive} idSuffix={idSuffix} />;
  }
}

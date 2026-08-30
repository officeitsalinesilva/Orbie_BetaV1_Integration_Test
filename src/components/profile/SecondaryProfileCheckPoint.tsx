import React from 'react';
import { CheckPointCalendarView } from '../checkpoint/CheckPointCalendarView';

interface Props {
  entity: {
    id: string;
    type: 'profile' | 'event';
    name: string;
    subLabel?: string;
  };
  isEnglish?: boolean;
}

export function SecondaryProfileCheckPoint({ entity, isEnglish = false }: Props) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <CheckPointCalendarView
        isEnglish={isEnglish}
        scopeEntity={{
          id: entity.id,
          name: entity.name,
          type: entity.type,
        }}
      />
    </div>
  );
}

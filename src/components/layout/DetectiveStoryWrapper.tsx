'use client';

import React from 'react';

interface DetectiveStoryWrapperProps {
  readonly children: React.ReactNode;
}

export default function DetectiveStoryWrapper({ children }: DetectiveStoryWrapperProps) {
  return <>{children}</>;
}

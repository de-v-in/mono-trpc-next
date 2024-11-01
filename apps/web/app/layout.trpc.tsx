'use client';

import type React from 'react';
import { type PropsWithChildren } from 'react';

import { trpc } from '@/utils/trpc';

const TRPCLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return <>{children}</>;
};

export default trpc.withTRPC(TRPCLayout) as typeof TRPCLayout;

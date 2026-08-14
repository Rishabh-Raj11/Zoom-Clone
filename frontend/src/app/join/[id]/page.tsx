'use client';

import React from 'react';
import { GreenRoom } from '@/components/lobby/GreenRoom';

export default function JoinMeetingPage({ params }: { params: { id: string } }) {
  return <GreenRoom meetingId={params.id} />;
}

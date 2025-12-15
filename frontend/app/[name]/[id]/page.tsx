"use client";

import { useRouter } from 'next/navigation';
import StudySession from "@/components/StudySession";

export default function SessionPage({ params }: { params: { name: string; id: string } }) {
    const router = useRouter();
    const sessionId = parseInt(params.id);

    const handleBack = () => {
        router.push('/');
    };

    return <StudySession sessionId={sessionId} onBack={handleBack} />;
}

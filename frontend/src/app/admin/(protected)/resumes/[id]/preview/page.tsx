import { AdminResumePreview } from "@/features/content/admin-resume-preview";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminResumePreview id={id} />; }

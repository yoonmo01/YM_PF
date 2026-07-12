import { AdminProjectEditor } from "@/features/content/admin-project-editor";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AdminProjectEditor id={id} />; }

import CollaborationPanel from "@/components/Collaboration/CollaborationPanel";

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function CollaborationPage({ params }: Props) {
  await params;
  return <CollaborationPanel />;
}

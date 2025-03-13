import Sidebar from '@/components/layout/side-nav';

export default async function ProtectedLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-4"> {/* Ajusta ml-64 según el ancho de tu sidebar */}
        {children}
      </main>
    </div>
  )
}
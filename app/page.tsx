import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-6xl font-bold mb-8">EstACE V2</h1>
      <p className="text-xl mb-8">Sistema de Estacionamiento</p>
      
      <Link href="/login">
        <button className="bg-black text-white px-8 py-3 text-lg font-semibold hover:bg-gray-800 transition">
          Ingresar al Sistema
        </button>
      </Link>
    </main>
  );
}
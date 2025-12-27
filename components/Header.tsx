import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b-2 border-black p-4 flex justify-between items-center bg-white text-black">
      <h1 className="text-xl font-bold">EstACE V2</h1>
      <nav>
        <Link href="/" className="mr-4 hover:underline">Inicio</Link>
        <Link 
            href="/login" 
            className="border-2 border-black px-4 py-1 hover:bg-black hover:text-white transition"
        >
            Login
        </Link>
      </nav>
    </header>
  );
}
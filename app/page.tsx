"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
<div className="relative mx-auto flex w-full h-screen flex-col items-center justify-center overflow-hidden bg-white dark:bg-black">      <Navbar />
      
      {/* Líneas de fondo decorativas */}
      <div className="absolute inset-y-0 left-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 h-full w-px bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px w-full bg-neutral-200/80 dark:bg-neutral-800/80">
        <div className="absolute mx-auto h-px w-40 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
      </div>

      <div className="px-4 py-10 md:py-20 relative z-10">
        {/* Titulo Animado */}
        <h1 className="mx-auto max-w-4xl text-center text-4xl font-bold text-slate-900 md:text-6xl lg:text-8xl dark:text-slate-100">
          {"EstACE V2"
            .split(" ")
            .map((word, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, filter: "blur(4px)", y: 10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.1,
                  ease: "easeInOut",
                }}
                className="mr-4 inline-block"
              >
                {word}
              </motion.span>
            ))}
        </h1>

        {/* Descripción */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="mx-auto max-w-xl py-6 text-center text-xl font-normal text-neutral-600 dark:text-neutral-400"
        >
          Sistema de Estacionamiento
        </motion.p>
      </div>
    </div>
  );
}

const Navbar = () => {
  return (
    <nav className="absolute top-0 w-full flex items-center justify-between border-b border-neutral-200 px-8 py-4 dark:border-neutral-800 bg-white/50 backdrop-blur-sm z-50">
      <div className="flex items-center gap-2">
        <div className="size-6 rounded-full bg-black" />
        <h1 className="text-xl font-bold text-black dark:text-white">EstACE V2</h1>
      </div>
      <Link href="/login">
        <button className="transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
          Login
        </button>
      </Link>
    </nav>
  );
};
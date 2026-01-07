import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray=900 mb-4">Liam O&apos;Brien</h1>
        <h2 className="text-3xl font-bold text-gray-600 mb-8">
          Solutions Architect &amp; Security Leader
        </h2>
        <p className="text-gray-500">
          Hard hat area. Currently building...
        </p>
      </div>
          <footer className="text-center py-8 text-gray-600 text-sm">
            <p>&copy; {new Date().getFullYear()} Liam O'Brien. All rights reserved.</p>
            <p className="mt-2">
              Site code available on{' '}
              <a href="https://github.com/darkhorse286/obrien-portfolio" className="text-blue-600 hover:underline">
                GitHub
              </a>
            </p>
          </footer>
    </main>

  );
}

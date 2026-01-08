import Link from 'next/link';

export default function Navigation() {
    return (
        <nav className="border-b border-gray-200 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo / Brand Name */}
                    <link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-600 transistion">
                        O'Brien & Son
                    </link>
                    {/* Navigation Links */}
                    <div className="flex gap-8">
                        <Link href="/about" className="text-gray-600 hover:text-gray-900 transition">
                            About
                        </Link>
                        <Link href="demonstrations" className="text-gray-600 hover:text-gray-900 transition">
                            Demonstrations
                        </Link>
                        <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </nav>

    );
}
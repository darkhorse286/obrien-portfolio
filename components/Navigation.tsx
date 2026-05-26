import Link from 'next/link';

export default function Navigation() {
    return (
        <nav className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <div className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo / Brand Name */}
                    <Link href="/" className="text-xl font-bold text-gray-900 dark:text-gray-100 hover:text-gray-600 dark:hover:text-gray-400 transition">
                        O'Brien & Son
                    </Link>
                    {/* Navigation Links */}
                    <div className="flex gap-8">
                        <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition">
                            About
                        </Link>
                        <Link href="demonstrations" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition">
                            Demonstrations
                        </Link>
                        <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </nav>

    );
}
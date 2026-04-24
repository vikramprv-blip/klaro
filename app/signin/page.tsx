export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-4 border rounded-2xl p-6">
        <h1 className="text-2xl font-semibold">Sign in to Klaro</h1>
        <p className="text-sm text-gray-600">
          Sign in will be connected through Supabase Auth next.
        </p>
        <a className="block w-full rounded-lg bg-black text-white py-2 text-center" href="/">
          Back to home
        </a>
      </div>
    </main>
  );
}

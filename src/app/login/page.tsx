import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            Admin Login
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

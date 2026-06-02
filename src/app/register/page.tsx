import Link from "next/link";
import { redirect } from "next/navigation";
import { checkDatabaseConnection, registerUser, type ActionState } from "@/actions/auth";
import { auth } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Register" };

const initialState: ActionState = { success: false };

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  const dbStatus = await checkDatabaseConnection();

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      {!dbStatus.ok && (
        <p
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          {dbStatus.message}
        </p>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Join LessonForge to build and share lesson plans.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm action={registerUser} initialState={initialState} />
          <p className="mt-4 text-center text-sm text-slate-600">
            Already registered?{" "}
            <Link href="/login" className="font-medium text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { useSearchParams } from "react-router-dom";
import SignInButton from "../components/SignInButton.jsx";

export default function Login() {
  const [params] = useSearchParams();
  const hadError = params.get("error");

  return (
    <main className="min-h-screen bg-ink text-parchment flex items-center justify-center px-6">
      <div className="text-center max-w-sm">
        <h1 className="font-display text-3xl mb-3">Sign in to Afterword</h1>
        <p className="text-parchment/60 mb-8 leading-relaxed">
          We'll ask for permission to send email through your Gmail account — only
          used for the messages you schedule here.
        </p>
        {hadError && (
          <p className="text-sm text-rust mb-4">
            Sign-in didn't go through. Please try again.
          </p>
        )}
        <SignInButton />
      </div>
    </main>
  );
}

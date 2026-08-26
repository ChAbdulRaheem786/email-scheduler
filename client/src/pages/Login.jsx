import { useSearchParams } from "react-router-dom";
import SignInButton from "../components/SignInButton.jsx";
import Footer from "../components/Footer.jsx";
import logo from "../assets/logo.png";

export default function Login() {
  const [params] = useSearchParams();
  const hadError = params.get("error");

  return (
    <main className="min-h-screen bg-ink text-parchment flex flex-col items-center justify-center px-6 py-16">
      <div className="text-center max-w-sm">
        <img src={logo} alt="Afterword" className="w-14 h-14 rounded-2xl mx-auto mb-6" />
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
        <p className="mt-6 text-xs text-parchment/40 leading-relaxed">
          By continuing you agree to our{" "}
          <a href="/terms" className="underline hover:text-parchment/70">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline hover:text-parchment/70">
            Privacy Policy
          </a>
          .
        </p>
      </div>
      <div className="mt-16">
        <Footer />
      </div>
    </main>
  );
}

"use client";

import { useSignUp } from "@clerk/nextjs";
import React from "react";
import Image from "next/image";

// Reusable OAuth button component
const OAuthButton = ({
  onClick,
  icon,
  label,
  isPrimary = false,
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isPrimary?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
      isPrimary
        ? "bg-[#212126] text-white hover:bg-[#313136]"
        : "bg-white text-black text-opacity-87 border border-black border-opacity-10 hover:bg-black hover:bg-opacity-[0.04]"
    }`}
  >
    {icon}
    {label}
  </button>
);

const FigmaIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.4285 21V15.8571H10.2857V21H15.4285Z" fill="#0ACF83"></path>
    <path d="M10.2857 9.42857C10.2857 12.3857 12.5714 14.6714 15.4285 14.6714V9.42857H10.2857Z" fill="#A259FF"></path>
    <path d="M5.14286 9.42857H10.2857V14.6714C10.2857 11.7143 7.99999 9.42857 5.14286 9.42857Z" fill="#F24E1E"></path>
    <path d="M5.14286 4.28571C8.1 4.28571 10.2857 6.57143 10.2857 9.42857H5.14286V4.28571Z" fill="#FF7262"></path>
    <path d="M15.4285 3C12.5714 3 10.2857 5.28571 10.2857 8.24286C10.2857 11.2 12.5714 13.4857 15.4285 13.4857C18.2857 13.4857 20.5714 11.2 20.5714 8.24286C20.5714 5.28571 18.2857 3 15.4285 3Z" fill="#1ABCFE"></path>
  </svg>
);

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_4013_2368)">
      <path d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.26H18.04C17.78 15.77 16.92 17.06 15.65 17.91V20.53H19.45C21.46 18.72 22.56 15.82 22.56 12.25Z" fill="#4285F4"></path>
      <path d="M12 23C15.24 23 17.95 21.92 19.45 20.53L15.65 17.91C14.59 18.62 13.39 19.04 12 19.04C9.12 19.04 6.67 17.14 5.8 14.7H1.87V17.41C3.79 20.73 7.59 23 12 23Z" fill="#34A853"></path>
      <path d="M5.8 14.7C5.58 14.07 5.45 13.4 5.45 12.7C5.45 12 5.58 11.33 5.8 10.7L1.87 7.99C0.970001 9.71 0.450001 11.64 0.450001 13.7C0.450001 15.76 0.970001 17.69 1.87 19.41L5.8 16.7V14.7Z" fill="#FBBC05"></path>
      <path d="M12 5.96C13.68 5.96 15.04 6.62 15.6 7.15L19.52 3.25C17.95 1.76 15.24 0.960001 12 0.960001C7.59 0.960001 3.79 3.27 1.87 6.59L5.8 9.3C6.67 6.86 9.12 5.96 12 5.96Z" fill="#EA4335"></path>
    </g>
    <defs>
      <clipPath id="clip0_4013_2368">
        <rect width="24" height="24" fill="white"></rect>
      </clipPath>
    </defs>
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.25 11.25H2V2H11.25V11.25Z" fill="#F25022"></path>
    <path d="M22 11.25H12.75V2H22V11.25Z" fill="#7FBA00"></path>
    <path d="M11.25 22H2V12.75H11.25V22Z" fill="#00A4EF"></path>
    <path d="M22 22H12.75V12.75H22V22Z" fill="#FFB900"></path>
  </svg>
);

export default function SignUpPage() {
  const { isLoaded, signUp } = useSignUp();

  const handleSignUp = async (strategy: "oauth_google" | "oauth_microsoft") => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: strategy,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/flow",
      });
    } catch (err: any) {
      console.error("SSO Error:", JSON.stringify(err, null, 2));
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0E0E13] bg-[url('/assets/bg-grid.svg')] bg-fixed flex flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Image src="/assets/weavy-logo.png" alt="Weavy Logo" width={140} height={24} />
      </div>

      <main className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 m-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-black text-opacity-87">Create an account</h1>
          <p className="text-black text-opacity-60 mt-2 text-sm">
             By clicking Log in with Figma, Google or Microsoft, you agree to Weavy’s{" "}
            <a href="#" className="text-[#6F42C1] hover:underline">Terms of Service</a> and{" "}
            <a href="#" className="text-[#6F42C1] hover:underline">Privacy Policy</a>.
          </p>
        </div>

        <div className="space-y-3">
          <OAuthButton onClick={() => handleSignUp("oauth_google")} icon={<FigmaIcon />} label="Continue with Figma" isPrimary />
           <div className="text-center text-xs text-black text-opacity-30">or</div>
          <OAuthButton onClick={() => handleSignUp("oauth_google")} icon={<GoogleIcon />} label="Continue with Google" />
          <OAuthButton onClick={() => handleSignUp("oauth_microsoft")} icon={<MicrosoftIcon />} label="Continue with Microsoft" />
        </div>
      </main>

      <footer className="absolute bottom-8 text-xs text-white text-opacity-40">
        © 2026 Weavy. All rights reserved.
      </footer>
    </div>
  );
}

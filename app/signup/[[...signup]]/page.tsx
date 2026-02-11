"use client";

import { useSignUp } from "@clerk/nextjs";
import React from "react";
import Image from "next/image";

// OAuth button component matching the archived HTML design
const OAuthButton = ({ 
  strategy, 
  icon, 
  label 
}: { 
  strategy: "oauth_figma" | "oauth_google" | "oauth_microsoft", 
  icon: React.ReactNode, 
  label: string 
}) => {
  const { isLoaded, signUp } = useSignUp();

  const handleSignUp = async () => {
    if (!isLoaded) {
      return;
    }
    await signUp.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/signup",
      redirectUrlComplete: "/dashboard",
    });
  };

  const isPrimary = strategy === "oauth_figma";

  return (
    <button
      onClick={handleSignUp}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        padding: '12px 16px',
        fontSize: '15px',
        fontWeight: 500,
        borderRadius: '8px',
        border: isPrimary ? 'none' : '1px solid rgba(0, 0, 0, 0.12)',
        backgroundColor: isPrimary ? '#212126' : 'white',
        color: isPrimary ? 'white' : 'rgba(0, 0, 0, 0.87)',
        cursor: 'pointer',
        fontFamily: 'inherit',
        lineHeight: '1.75',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.opacity = '0.9';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.opacity = '1';
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default function Page() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fafafa',
      backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.2) 100%), url("/assets/bg-grid.svg")',
      backgroundAttachment: 'fixed',
      padding: '20px',
    }}>
      {/* White Logo Header */}
      <header style={{
        position: 'absolute',
        top: '32px',
        left: '32px',
        zIndex: 10,
        filter: 'invert(1) brightness(1.2)',
      }}>
        <Image 
          src="/cdn.prod.website-files.com/681b040781d5b5e278a69989/682350d42a7c97b440a58480_Nav%20left%20item%20-%20DESKTOP.svg" 
          alt="Weavy Logo" 
          width={228} 
          height={41} 
          priority
        />
      </header>

      {/* Dark Logo for Mobile/Visibility */}
      <div style={{
        position: 'absolute',
        top: '32px',
        right: '32px',
        zIndex: 10,
        display: 'none',
      }}>
        <Image 
          src="/cdn.prod.website-files.com/681b040781d5b5e278a69989/682350d42a7c97b440a58480_Nav%20left%20item%20-%20DESKTOP.svg" 
          alt="Weavy Logo" 
          width={36} 
          height={36} 
          priority
        />
      </div>

      {/* Main Sign-up Card Container */}
      <div style={{
        width: '100%',
        maxWidth: '360px',
        borderRadius: '8px',
        backgroundColor: 'white',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Cover Image */}
        <Image 
          src="/assets/weavy-sign-in-back.png" 
          alt="Sign up cover" 
          width={360} 
          height={270}
          priority
          style={{ 
            width: '100%', 
            height: '270px',
            objectFit: 'cover',
            borderRadius: '8px 8px 0 0',
          }} 
        />

        {/* Card Content */}
        <div style={{ 
          padding: '32px',
          display: 'flex', 
          flexDirection: 'column', 
          gap: '20px',
          textAlign: 'center',
        }}>
          {/* Title */}
          <h1 style={{ 
            fontSize: '26px',
            fontWeight: '700',
            margin: 0,
            color: 'rgba(0, 0, 0, 0.87)',
            letterSpacing: '-0.5px',
          }}>
            Welcome to Weavy
          </h1>

          {/* Description with Legal Links */}
          <p style={{ 
            fontSize: '13px',
            fontWeight: '400',
            color: 'rgba(0, 0, 0, 0.6)',
            margin: 0,
            lineHeight: '1.6',
          }}>
            By clicking "Sign up with Figma, Google, or Microsoft", you agree to{' '}
            <a 
              href="https://content.weavy.ai/terms-of-service" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                color: 'rgba(0, 0, 0, 0.87)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Weavy Terms of Service
            </a>{' '}
            and{' '}
            <a 
              href="https://content.weavy.ai/privacy-policy" 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ 
                color: 'rgba(0, 0, 0, 0.87)',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              Privacy Policy
            </a>.
          </p>

          {/* OAuth Buttons */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginTop: '8px',
          }}>
            <OAuthButton
              strategy="oauth_figma"
              label="Sign up with Figma"
              icon={
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <g clipPath="url(#clip0_2689_424)">
                    <path d="M3.72852 16.6666C3.72852 14.8256 5.22589 13.3333 7.073 13.3333H10.4175V16.6666C10.4175 18.5075 8.9201 19.9999 7.073 19.9999C5.22589 19.9999 3.72852 18.5075 3.72852 16.6666Z" fill="currentColor"></path>
                    <path d="M10.417 -6.10352e-05V6.66661H13.7615C15.6086 6.66661 17.106 5.17422 17.106 3.33327C17.106 1.49232 15.6086 -6.10352e-05 13.7615 -6.10352e-05L10.417 -6.10352e-05Z" fill="currentColor"></path>
                    <ellipse cx="13.7332" cy="10" rx="3.34448" ry="3.33333" fill="currentColor"></ellipse>
                    <path d="M3.72852 3.33335C3.72852 5.1743 5.22589 6.66669 7.073 6.66669L10.4175 6.66669V1.95503e-05L7.073 1.95503e-05C5.22589 1.95503e-05 3.72852 1.4924 3.72852 3.33335Z" fill="currentColor"></path>
                    <path d="M3.72852 9.99992C3.72852 11.8409 5.22589 13.3333 7.073 13.3333H10.4175V6.66658L7.073 6.66658C5.22589 6.66658 3.72852 8.15897 3.72852 9.99992Z" fill="currentColor"></path>
                  </g>
                  <defs><clipPath id="clip0_2689_424"><rect width="20" height="20" fill="white"></rect></clipPath></defs>
                </svg>
              }
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0, 0, 0, 0.08)' }}></div>
              <span style={{ fontSize: '13px', color: 'rgba(0, 0, 0, 0.6)', fontWeight: '500' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(0, 0, 0, 0.08)' }}></div>
            </div>

            <OAuthButton
              strategy="oauth_google"
              label="Sign up with Google"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28.608" width="20" height="20" style={{ flexShrink: 0 }}>
                  <path d="M-1.058 51.945a16.572 16.572 0 0 0-.226-2.706h-13.47v5.376h7.712A6.641 6.641 0 0 1-9.9 58.882v3.576h4.6a13.986 13.986 0 0 0 4.242-10.513z" transform="translate(29.058 -37.319)" fill="#4285f4"></path>
                  <path d="M-12.7 65.1a13.625 13.625 0 0 0 9.453-3.469l-4.6-3.576a8.629 8.629 0 0 1-4.853 1.386 8.543 8.543 0 0 1-8.022-5.912h-4.744v3.683A14.283 14.283 0 0 0-12.7 65.1z" transform="translate(27.002 -36.495)" fill="#34a853"></path>
                  <path d="M-20.472 55a8.3 8.3 0 0 1-.453-2.73 8.623 8.623 0 0 1 .453-2.73v-3.681h-4.744a14.138 14.138 0 0 0-1.538 6.413 14.138 14.138 0 0 0 1.538 6.413z" transform="translate(26.754 -37.968)" fill="#fbbc05"></path>
                  <path d="M-12.7 44.9a7.761 7.761 0 0 1 5.483 2.146l4.077-4.077a13.676 13.676 0 0 0-9.56-3.731 14.283 14.283 0 0 0-12.764 7.892l4.744 3.683A8.543 8.543 0 0 1-12.7 44.9z" transform="translate(27.002 -39.239)" fill="#ea4335"></path>
                </svg>
              }
            />

            <OAuthButton
              strategy="oauth_microsoft"
              label="Sign up with Microsoft"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" width="20" height="20" style={{ flexShrink: 0 }}>
                  <path fill="#f35325" d="M1 1h10v10H1z"></path>
                  <path fill="#81bc06" d="M12 1h10v10H12z"></path>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"></path>
                  <path fill="#ffba08" d="M12 12h10v10H12z"></path>
                </svg>
              }
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        position: 'absolute',
        bottom: '32px',
        color: 'rgba(0, 0, 0, 0.6)',
        fontSize: '12px',
        fontWeight: '400',
      }}>
        © 2025 Weavy. All rights reserved.
      </footer>
    </div>
  );
}

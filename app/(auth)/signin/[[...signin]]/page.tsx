'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const WeavyLogoSVG = () => (
  <svg width="228" height="41" viewBox="0 0 228 41" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'rgb(255, 255, 255)', cursor: 'pointer' }}>
    <path d="M57.7669 18L55.4629 9.6H56.5429L58.3549 16.8L60.4069 9.6H61.5349L63.5389 16.824L65.3749 9.6H66.4549L64.1029 18H62.9509L60.9469 11.052L58.8949 18H57.7669ZM67.7839 18V9.6H72.9799V10.428H68.7919V13.356H72.6199V14.172H68.7919V17.172H72.9799V18H67.7839ZM74.1725 18L77.2685 9.6H78.3365L81.4205 18H80.3525L77.7965 10.86L75.2285 18H74.1725ZM75.5885 15.84L75.8765 15.024H79.6805L79.9685 15.84H75.5885ZM84.1728 18L81.0168 9.6H82.1088L84.7608 16.932L87.4368 9.6H88.5048L85.3488 18H84.1728ZM91.8882 18V14.808L89.1522 9.6H90.2922L92.4762 14.028H92.2962L94.4922 9.6H95.6202L92.8962 14.808V18H91.8882Z" fill="currentColor" style={{ mixBlendMode: 'difference' }} />
    <path d="M126.36 18L129.456 9.6H130.524L133.608 18H132.54L129.984 10.86L127.416 18H126.36ZM127.776 15.84L128.064 15.024H131.868L132.156 15.84H127.776ZM135 18V9.6H137.712C138.368 9.6 138.904 9.712 139.32 9.936C139.736 10.152 140.044 10.444 140.244 10.812C140.444 11.18 140.544 11.596 140.544 12.06C140.544 12.508 140.44 12.92 140.232 13.296C140.032 13.672 139.72 13.972 139.296 14.196C138.872 14.42 138.328 14.532 137.664 14.532H136.008V18H135ZM139.44 18L137.592 14.244H138.72L140.628 18H139.44ZM136.008 13.74H137.64C138.28 13.74 138.748 13.584 139.044 13.272C139.348 12.96 139.5 12.56 139.5 12.072C139.5 11.576 139.352 11.184 139.056 10.896C138.768 10.6 138.292 10.452 137.628 10.452H136.008V13.74ZM144.237 18V10.428H141.729V9.6H147.753V10.428H145.245V18H144.237ZM149.127 18V9.6H150.135V18H149.127ZM154.747 18.144C154.131 18.144 153.595 18.032 153.139 17.808C152.683 17.584 152.331 17.272 152.083 16.872C151.835 16.472 151.711 16.008 151.711 15.48H152.767C152.767 15.808 152.843 16.112 152.995 16.392C153.147 16.664 153.367 16.884 153.655 17.052C153.951 17.212 154.315 17.292 154.747 17.292C155.123 17.292 155.443 17.232 155.707 17.112C155.979 16.984 156.183 16.812 156.319 16.596C156.463 16.38 156.535 16.136 156.535 15.864C156.535 15.536 156.463 15.272 156.319 15.072C156.183 14.864 155.995 14.696 155.755 14.568C155.515 14.44 155.235 14.328 154.915 14.232C154.603 14.128 154.275 14.02 153.931 13.908C153.267 13.684 152.779 13.404 152.467 13.068C152.155 12.732 151.999 12.296 151.999 11.76C151.999 11.304 152.103 10.904 152.311 10.56C152.527 10.216 152.831 9.948 153.223 9.756C153.623 9.556 154.095 9.456 154.639 9.456C155.175 9.456 155.639 9.556 156.031 9.756C156.431 9.956 156.743 10.232 156.967 10.584C157.191 10.928 157.303 11.328 157.303 11.784H156.247C156.247 11.552 156.187 11.324 156.067 11.1C155.947 10.876 155.763 10.692 155.515 10.548C155.275 10.396 154.971 10.32 154.603 10.32C154.299 10.312 154.027 10.364 153.787 10.476C153.555 10.58 153.371 10.732 153.235 10.932C153.107 11.132 153.043 11.376 153.043 11.664C153.043 11.936 153.099 12.156 153.211 12.324C153.331 12.492 153.499 12.636 153.715 12.756C153.939 12.868 154.199 12.972 154.495 13.068C154.791 13.164 155.119 13.272 155.479 13.392C155.887 13.528 156.247 13.696 156.559 13.896C156.879 14.088 157.127 14.336 157.303 14.64C157.487 14.944 157.579 15.332 157.579 15.804C157.579 16.204 157.471 16.584 157.255 16.944C157.047 17.296 156.735 17.584 156.319 17.808C155.903 18.032 155.379 18.144 154.747 18.144ZM160.945 18V10.428H158.437V9.6H164.461V10.428H161.953V18H160.945ZM165.835 18V9.6H166.843V18H165.835ZM172.427 18.144C171.611 18.144 170.903 17.964 170.303 17.604C169.711 17.236 169.255 16.728 168.935 16.08C168.615 15.424 168.455 14.664 168.455 13.8C168.455 12.936 168.615 12.18 168.935 11.532C169.255 10.876 169.711 10.368 170.303 10.008C170.903 9.64 171.611 9.456 172.427 9.456C173.387 9.456 174.167 9.684 174.767 10.14C175.367 10.596 175.751 11.24 175.919 12.072H174.803C174.675 11.552 174.415 11.136 174.023 10.824C173.631 10.504 173.099 10.344 172.427 10.344C171.827 10.344 171.307 10.484 170.867 10.764C170.427 11.036 170.087 11.432 169.847 11.952C169.607 12.464 169.487 13.08 169.487 13.8C169.487 14.52 169.607 15.14 169.847 15.66C170.087 16.172 170.427 16.568 170.867 16.848C171.307 17.12 171.827 17.256 172.427 17.256C173.099 17.256 173.631 17.104 174.023 16.8C174.415 16.488 174.675 16.076 174.803 15.564H175.919C175.751 16.372 175.367 17.004 174.767 17.46C174.167 17.916 173.387 18.144 172.427 18.144ZM126.9 30V21.6H127.908V30H126.9ZM129.844 30V21.6H130.852L135.328 28.332V21.6H136.336V30H135.328L130.852 23.268V30H129.844ZM140.241 30V22.428H137.733V21.6H143.757V22.428H141.249V30H140.241ZM145.131 30V21.6H150.327V22.428H146.139V25.356H149.967V26.172H146.139V29.172H150.327V30H145.131ZM152.06 30V21.6H153.068V29.196H156.98V30H152.06ZM158.52 30V21.6H159.528V29.196H163.44V30H158.52ZM164.979 30V21.6H165.987V30H164.979ZM171.536 30.144C170.752 30.144 170.064 29.964 169.472 29.604C168.88 29.236 168.42 28.728 168.092 28.08C167.764 27.432 167.6 26.676 167.6 25.812C167.6 24.956 167.764 24.2 168.092 23.544C168.428 22.888 168.9 22.376 169.508 22.008C170.124 21.64 170.848 21.456 171.68 21.456C172.624 21.456 173.412 21.684 174.044 22.14C174.676 22.588 175.08 23.216 175.256 24.024H174.092C173.98 23.52 173.716 23.12 173.3 22.824C172.884 22.528 172.344 22.38 171.68 22.38C171.064 22.38 170.524 22.52 170.06 22.8C169.604 23.072 169.252 23.464 169.004 23.976C168.756 24.488 168.632 25.1 168.632 25.812C168.632 26.524 168.756 27.14 169.004 27.66C169.252 28.172 169.596 28.564 170.036 28.836C170.484 29.108 170.996 29.244 171.572 29.244C172.468 29.244 173.144 28.98 173.6 28.452C174.056 27.924 174.316 27.208 174.38 26.304H171.956V25.512H175.412V30H174.488L174.404 28.62C174.204 28.948 173.972 29.228 173.708 29.46C173.452 29.684 173.148 29.856 172.796 29.976C172.444 30.088 172.024 30.144 171.536 30.144ZM177.161 30V21.6H182.357V22.428H178.169V25.356H181.997V26.172H178.169V29.172H182.357V30H177.161ZM184.089 30V21.6H185.097L189.573 28.332V21.6H190.581V30H189.573L185.097 23.268V30H184.089ZM196.166 30.144C195.35 30.144 194.642 29.964 194.042 29.604C193.45 29.236 192.994 28.728 192.674 28.08C192.354 27.424 192.194 26.664 192.194 25.8C192.194 24.936 192.354 24.18 192.674 23.532C192.994 22.876 193.45 22.368 194.042 22.008C194.642 21.64 195.35 21.456 196.166 21.456C197.126 21.456 197.906 21.684 198.506 22.14C199.106 22.596 199.49 23.24 199.658 24.072H198.542C198.414 23.552 198.154 23.136 197.762 22.824C197.37 22.504 196.838 22.344 196.166 22.344C195.566 22.344 195.046 22.484 194.606 22.764C194.166 23.036 193.826 23.432 193.586 23.952C193.346 24.464 193.226 25.08 193.226 25.8C193.226 26.52 193.346 27.14 193.586 27.66C193.826 28.172 194.166 28.568 194.606 28.848C195.046 29.12 195.566 29.256 196.166 29.256C196.838 29.256 197.37 29.104 197.762 28.8C198.154 28.488 198.414 28.076 198.542 27.564H199.658C199.49 28.372 199.106 29.004 198.506 29.46C197.906 29.916 197.126 30.144 196.166 30.144ZM201.204 30V21.6H206.4V22.428H202.212V25.356H206.04V26.172H202.212V29.172H206.4V30H201.204Z" fill="currentColor" style={{ mixBlendMode: 'difference' }} />
    <path d="M116 -3.80576e-05L116 40" stroke="currentColor" style={{ mixBlendMode: 'difference' }} />
    <path d="M11.3959 0H0V26.1767H11.3959V0Z" fill="currentColor" style={{ mixBlendMode: 'difference' }} />
    <path d="M19.683 26.1818H8.28711V40.0019H19.683V26.1818Z" fill="currentColor" style={{ mixBlendMode: 'difference' }} />
    <path d="M36.2592 26.1818H24.8633V40.0019H36.2592V26.1818Z" fill="currentColor" style={{ mixBlendMode: 'difference' }} />
    <path d="M27.9716 0H16.5757V26.1767H27.9716V0Z" fill="currentColor" style={{ mixBlendMode: 'difference' }} />
    <path d="M44.5463 0H33.1504V26.1767H44.5463V0Z" fill="currentColor" style={{ mixBlendMode: 'difference' }} />
  </svg>
);

const WeavyDarkLogoSVG = () => (
  <svg width="36" height="36" viewBox="0 0 35 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'rgb(33, 33, 38)', cursor: 'pointer' }}>
    <title>Weavy Logo</title>
    <path d="M34.6895 0H25.8153V19.4784H21.7818V0H12.9077V19.4784H8.87414V0H0V19.6353H6.45383V30H15.328V19.6353H19.3615V30H28.2356V19.6353H34.6895V0Z" fill="currentColor" />
  </svg>
);

const FigmaLogoSVG = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_2689_424)">
      <path d="M3.72852 16.6666C3.72852 14.8256 5.22589 13.3333 7.073 13.3333H10.4175V16.6666C10.4175 18.5075 8.9201 19.9999 7.073 19.9999C5.22589 19.9999 3.72852 18.5075 3.72852 16.6666Z" fill="#24CB71"/>
      <path d="M10.417 -6.10352e-05V6.66661H13.7615C15.6086 6.66661 17.106 5.17422 17.106 3.33327C17.106 1.49232 15.6086 -6.10352e-05 13.7615 -6.10352e-05L10.417 -6.10352e-05Z" fill="#FF7237"/>
      <ellipse cx="13.7332" cy="10" rx="3.34448" ry="3.33333" fill="#00B6FF"/>
      <path d="M3.72852 3.33335C3.72852 5.1743 5.22589 6.66669 7.073 6.66669L10.4175 6.66669V1.95503e-05L7.073 1.95503e-05C5.22589 1.95503e-05 3.72852 1.4924 3.72852 3.33335Z" fill="#FF3737"/>
      <path d="M3.72852 9.99992C3.72852 11.8409 5.22589 13.3333 7.073 13.3333H10.4175V6.66658L7.073 6.66658C5.22589 6.66658 3.72852 8.15897 3.72852 9.99992Z" fill="#874FFF"/>
    </g>
    <defs>
      <clipPath id="clip0_2689_424">
        <rect width="20" height="20" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const GoogleLogoSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28.608" width="20" height="20">
    <title>Google logo</title>
    <path d="M-1.058 51.945a16.572 16.572 0 0 0-.226-2.706h-13.47v5.376h7.712A6.641 6.641 0 0 1-9.9 58.882v3.576h4.6a13.986 13.986 0 0 0 4.242-10.513z" transform="translate(29.058 -37.319)" style={{ fill: 'rgb(66, 133, 244)' }}/>
    <path d="M-12.7 65.1a13.625 13.625 0 0 0 9.453-3.469l-4.6-3.576a8.629 8.629 0 0 1-4.853 1.386 8.543 8.543 0 0 1-8.022-5.912h-4.744v3.683A14.283 14.283 0 0 0-12.7 65.1z" transform="translate(27.002 -36.495)" style={{ fill: 'rgb(52, 168, 83)' }}/>
    <path d="M-20.472 55a8.3 8.3 0 0 1-.453-2.73 8.623 8.623 0 0 1 .453-2.73v-3.681h-4.744a14.138 14.138 0 0 0-1.538 6.413 14.138 14.138 0 0 0 1.538 6.413z" transform="translate(26.754 -37.968)" style={{ fill: 'rgb(251, 188, 5)' }}/>
    <path d="M-12.7 44.9a7.761 7.761 0 0 1 5.483 2.146l4.077-4.077a13.676 13.676 0 0 0-9.56-3.731 14.283 14.283 0 0 0-12.764 7.892l4.744 3.683A8.543 8.543 0 0 1-12.7 44.9z" transform="translate(27.002 -39.239)" style={{ fill: 'rgb(234, 67, 53)' }}/>
  </svg>
);

const MicrosoftLogoSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" width="20" height="20">
    <title>Microsoft logo</title>
    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
    <path fill="#f35325" d="M1 1h10v10H1z"/>
    <path fill="#81bc06" d="M12 1h10v10H12z"/>
    <path fill="#05a6f0" d="M1 12 h10v10H1z"/>
    <path fill="#ffba08" d="M12 12h10v10H12z"/>
  </svg>
);

export default function Page() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleOAuthSignIn = async (provider: 'google' | 'figma' | 'microsoft') => {
    setIsLoading(true);
    try {
      setTimeout(() => {
        router.push('/flow');
      }, 1000);
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div id="weavy-main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'rgb(255, 255, 255)', width: '100%' }}>
      <main style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Logo header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'rgb(25, 25, 30)' }}>
            <div style={{ width: '228px', height: '41px' }}>
              <WeavyLogoSVG />
            </div>
            <div style={{ width: '36px', height: '36px' }}>
              <WeavyDarkLogoSVG />
            </div>
          </div>

          {/* Main content area */}
          <div data-testid="signin-page-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
              <img
                src="/assets/weavy-sign-in-back.png"
                alt="Sign in cover"
                style={{ width: '100%', height: '270px', borderRadius: '8px 8px 0px 0px', display: 'block' }}
                onError={(e) => {
                  console.log('Primary image failed, trying fallback');
                  (e.currentTarget as HTMLImageElement).src = '/sign-in-images/bg-net-hero.avif';
                }}
              />
              <div style={{ backgroundColor: 'white', padding: '32px 24px', borderRadius: '0 0 8px 8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
                <h1 style={{ fontSize: '32px', fontWeight: 500, textAlign: 'center', marginBottom: '12px', color: 'rgb(33, 33, 38)' }}>Welcome to Weavy</h1>
                <p style={{ fontSize: '13px', color: 'rgb(100, 100, 100)', textAlign: 'center', marginBottom: '24px', lineHeight: 1.5 }}>
                  By clicking "Log in with Figma, Google, or Microsoft", you agree to{' '}
                  <a href="https://content.weavy.ai/terms-of-service" target="_blank" rel="noopener noreferrer" style={{ color: 'rgb(25, 103, 210)', textDecoration: 'underline' }}>
                    Weavy Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="https://content.weavy.ai/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: 'rgb(25, 103, 210)', textDecoration: 'underline' }}>
                    Privacy Policy
                  </a>
                  .
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button
                    onClick={() => handleOAuthSignIn('figma')}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      backgroundColor: 'black',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    <FigmaLogoSVG />
                    <span>Log in with Figma</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '4px 0' }}>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgb(200, 200, 200)' }} />
                    <span style={{ fontSize: '13px', color: 'rgb(120, 120, 120)' }}>or</span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgb(200, 200, 200)' }} />
                  </div>

                  <button
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      backgroundColor: 'white',
                      color: 'rgb(33, 33, 38)',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '12px 16px',
                      border: '1px solid rgb(200, 200, 200)',
                      borderRadius: '4px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    <GoogleLogoSVG />
                    <span>Log in with Google</span>
                  </button>

                  <button
                    onClick={() => handleOAuthSignIn('microsoft')}
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '12px',
                      backgroundColor: 'white',
                      color: 'rgb(33, 33, 38)',
                      fontSize: '14px',
                      fontWeight: 500,
                      padding: '12px 16px',
                      border: '1px solid rgb(200, 200, 200)',
                      borderRadius: '4px',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.6 : 1,
                    }}
                  >
                    <MicrosoftLogoSVG />
                    <span>Log in with Microsoft</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <div style={{ padding: '20px', backgroundColor: 'white', borderTop: '1px solid rgb(240, 240, 240)', textAlign: 'center' }}>
        <span style={{ fontSize: '12px', color: 'rgb(120, 120, 120)' }}>© 2025 Weavy. All rights reserved.</span>
      </div>
    </div>
  );
}

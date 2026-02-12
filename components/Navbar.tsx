"use client";

import { useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

export default function Navbar() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const navLinks = document.querySelectorAll(".nav-link-text-block-large");
    const isMobileOrTablet = window.matchMedia("(max-width: 767px)").matches;

    if (!isMobileOrTablet) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "150px",
          scrub: true,
          onUpdate: (self) => {
            navLinks.forEach((el) => {
              if (self.progress > 0.5) {
                el.classList.remove("nav-normal-case");
              } else {
                el.classList.add("nav-normal-case");
              }
            });
          },
        },
      });

      tl.to(
        ".nav-link-text-block-large",
        {
          fontSize: "12px",
          letterSpacing: "0.15px",
          ease: "power2.out",
        },
        0,
      );

      tl.to(
        ".nav-button-spacer",
        {
          height: "0rem",
          ease: "power2.out",
        },
        0,
      );
    }
  }, []);

  return (
    <div data-wf--navbar--variant="with-banner---black" className="navbar_main">
      <section className="banner_component w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
        <div className="padding-global is-stretch-banner w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
          <div className="container-banner-top">
            <div className="banner_wrapper w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
              <div className="banner_small-image-wrapp w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
                <img
                  src="/cdn.prod.website-files.com/681b040781d5b5e278a69989/69032e91ec29a8f27508fa9c_Image-Figma_acc.avif"
                  loading="lazy"
                  alt=""
                  height="Auto"
                  className="image-banner_small w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04"
                />
              </div>
              <div className="banner_content w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
                <div className="banner_rich-text w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04 w-richtext">
                  <p>
                    <strong>Weavy is now a part of Figma</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="navbar-left w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
        <Link
          href="/"
          aria-current="page"
          className="brand w-nav-brand w--current"
        >
          <img
            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682350d42a7c97b440a58480_Nav%20left%20item%20-%20DESKTOP.svg"
            loading="lazy"
            alt=""
            className="image_nav-logo-desktop"
          />
          <img
            src="https://cdn.prod.website-files.com/681b040781d5b5e278a69989/682350d42a7c97b440a58480_Nav%20left%20item%20-%20DESKTOP.svg"
            loading="lazy"
            alt=""
            height="30"
            className="image_nav-logo-mobile w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04"
          />
        </Link>
      </div>
      <div className="navbar-right w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04">
        <div className="nav-bar-right">
          <div className="nav-links-wrapper">
            <Link
              href="/collective"
              className="nav_text-link w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04 hide-mobile-landscape"
            >
              COLLECTIVE
            </Link>
            <Link
              href="/enterprise"
              className="nav_text-link w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04 hide-mobile-landscape"
            >
              ENTERPRISE
            </Link>
            <Link
              href="/pricing"
              className="nav_text-link w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04"
            >
              Pricing
            </Link>
            <a
              href="https://form.typeform.com/to/VmiA3c6t?startpoint=intro?utm_source=top_bar&utm_medium=request_a_demo"
              target="_blank"
              className="nav_text-link w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04 hide-mobile-landscape"
            >
              Request a Demo
            </a>
            <a
              href="/signin"
              className="nav_text-link w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04"
            >
              Sign In
            </a>
          </div>
        </div>
        <div className="navbar_main-cta-wrapper">
          <div className="huge_nav-button-dummy">
            <div className="nav-button-spacer"></div>
            <div className="nav-link-text-block-large nav-normal-case">
              Start Now
            </div>
          </div>
        </div>
      </div>
      <a
        id="try_now_top"
        href="https://app.weavy.ai/signin"
        className="huge_nav-button is-real w-variant-138f51c6-a923-3c01-fe1a-d27a5c95ed04 w-inline-block"
      >
        <div className="nav-button-spacer"></div>
        <div className="nav-link-text-block-large nav-normal-case">
          Start Now
        </div>
      </a>
    </div>
  );
}

"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Client-only "island": renders no DOM, just wires up scroll-triggered
// reveal animations by targeting ids/classes rendered by the (server) sections.
// targeting using ID
export default function LandingPageGsapAnimation() {
	useGSAP(() => {
		// About: icon pops in, then text and signature slide up in sequence
		gsap
			.timeline({
				scrollTrigger: {
					trigger: "#about-section",
					start: "top 70%",
					toggleActions: "play none none reverse",
				},
			})
			.from("#quote", {
				opacity: 0,
				scale: 0.5,
				rotation: -15,
				duration: 0.6,
				ease: "back.out(1.7)",
			})
			.from(
				"#about-text",
				{ opacity: 0, y: 24, duration: 0.6, ease: "power2.out" },
				"-=0.25", // overlap with previous tween for a smoother chain
			)
			.from(
				"#about-signature",
				{ opacity: 0, y: 16, duration: 0.5, ease: "power2.out" },
				"-=0.3",
			);

		// Feature cards: whole group fades/slides up together as one unit
		gsap.from("#feature-row .feature-card", {
			scrollTrigger: {
				trigger: "#feature-row",
				start: "top 70%",
				toggleActions: "play none none reverse",
			},
			opacity: 0,
			y: 32,
			duration: 0.6,
			ease: "power2.out",
		});

		// CTA: text and image slide in from opposite sides
		gsap.from("#cta-text", {
			scrollTrigger: {
				trigger: "#cta-section",
				start: "top 70%",
				toggleActions: "play none none reverse",
			},
			opacity: 0,
			x: -40,
			duration: 0.7,
			ease: "power2.out",
		});

		gsap.from("#cta-image", {
			scrollTrigger: {
				trigger: "#cta-section",
				start: "top 70%",
				toggleActions: "play none none reverse",
			},
			opacity: 0,
			x: 40,
			duration: 0.7,
			ease: "power2.out",
		});

		// FAQ: heading first, then each question staggers in
		gsap
			.timeline({
				scrollTrigger: {
					trigger: "#faq-section",
					start: "top 70%",
					toggleActions: "play none none reverse",
				},
			})
			.from("#faq-heading", {
				opacity: 0,
				y: 20,
				duration: 0.5,
				ease: "power2.out",
			})
			.from(
				"#faq-section [data-faq-item]",
				{ opacity: 0, y: 20, duration: 0.5, ease: "power2.out", stagger: 0.1 },
				"-=0.2",
			);

		// Footer: simple fade/slide up as it comes into view
		gsap.from("#footer-content", {
			scrollTrigger: {
				trigger: "#landing-footer",
				start: "top 80%",
				toggleActions: "play none none reverse",
			},
			opacity: 0,
			y: 32,
			duration: 0.7,
			ease: "power2.out",
		});

		// Images below the fold finish loading after trigger positions are first
		// calculated, which shifts page height and leaves later triggers stuck
		// mid-page (invisible, but still taking up layout space). Recalculate
		// once everything (including images) has actually finished loading.
		const refresh = () => ScrollTrigger.refresh();
		if (document.readyState === "complete") {
			refresh();
		} else {
			window.addEventListener("load", refresh, { once: true });
			return () => window.removeEventListener("load", refresh);
		}
	}); // useGSAP auto-scopes and reverts these tweens/ScrollTriggers on unmount

	return null;
}

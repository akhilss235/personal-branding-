"use client";
import React from "react";

export default function ContentSection({
  id,
  title,
  kicker,
  children,
  wide = false,
  className = "",
}) {
  return (
    <section
      id={id}
      className={`py-16 sm:py-20 reveal ${className}`}
    >
      <div className={`${wide ? "max-w-7xl" : "max-w-6xl"} mx-auto px-4`}>
        {(title || kicker) && (
          <header className="mb-8">
            {kicker && (
              <div className="text-xs uppercase tracking-[0.18em] opacity-70">
                {kicker}
              </div>
            )}

            {title && (
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold">
                {title}
              </h2>
            )}
          </header>
        )}

        <div className="text-white/80 leading-relaxed space-y-5">
          {children}
        </div>
      </div>
    </section>
  );
}

"use client";
import React from "react";
import '@mantine/core/styles.css';
import { Providers } from "@/src/providers";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";

export default function LoginLayout({
    children
}: {
    children : React.ReactNode
}){ 
    return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
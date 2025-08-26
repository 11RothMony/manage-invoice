"use client"; // This is a Client Component

import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./button";

export default function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault(); // Prevent the default mini-infobar
      setDeferredPrompt(e); // Store the event for later use
      setIsInstallable(true); // Show the install button
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Cleanup the event listener
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Trigger the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;
    console.log(
      `User ${
        outcome === "accepted" ? "accepted" : "dismissed"
      } the install prompt`
    );

    // Reset the prompt after use
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Only show the button if the app is installable
  if (!isInstallable) return null;

  return (
    <Button
      className="text-lg bg-blue-500 p-7 rounded-full"
      onClick={handleInstallClick}
    >
      <Download size={25} />
      Install
    </Button>
  );
}
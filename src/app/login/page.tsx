"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
      setError("");
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError("");
  };

  const handleSubmit = async () => {
    if (pin.length !== 4) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Wrong PIN. Please try again.");
        setPin("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit when 4 digits entered
  if (pin.length === 4 && !loading && !error) {
    handleSubmit();
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-brand-bg">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">&#9992;&#65039;</div>
          <CardTitle className="text-2xl font-serif">Trip Command Center</CardTitle>
          <p className="text-muted-foreground text-base mt-2">
            Enter your 4-digit PIN to continue
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PIN Display */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold"
                style={{
                  borderColor: pin.length > i ? "#8B2131" : "#E8DED1",
                  backgroundColor: pin.length > i ? "#F5E1E4" : "#FFFDFC",
                }}
              >
                {pin[i] ? "\u2022" : ""}
              </div>
            ))}
          </div>

          {error && (
            <p className="text-coral text-center text-base font-medium">{error}</p>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].map(
              (key) => {
                if (key === "") return <div key="empty" />;
                if (key === "del") {
                  return (
                    <Button
                      key="del"
                      variant="outline"
                      size="lg"
                      className="h-14 text-lg"
                      onClick={handleDelete}
                      disabled={loading}
                    >
                      Delete
                    </Button>
                  );
                }
                return (
                  <Button
                    key={key}
                    variant="outline"
                    size="lg"
                    className="h-14 text-xl font-semibold"
                    onClick={() => handleDigit(key)}
                    disabled={loading || pin.length >= 4}
                  >
                    {key}
                  </Button>
                );
              }
            )}
          </div>

          {loading && (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-red" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

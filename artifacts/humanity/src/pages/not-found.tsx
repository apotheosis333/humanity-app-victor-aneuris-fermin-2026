import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[70vh] px-4 py-24">
      <Card className="w-full max-w-md mx-4 glass-panel border-none rounded-3xl overflow-hidden animate-fade-up">
        <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 glass rounded-full flex items-center justify-center border border-white/10 mb-2">
            <AlertCircle className="h-10 w-10 text-[#FBBF24] glow-gold/20" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-serif text-white">Lost in Space</h1>
            <p className="text-lg text-white/60">
              We couldn't find the page you're looking for.
            </p>
          </div>

          <div className="accent-rule my-2" />

          <Link href="/">
            <Button className="mt-4 bg-gradient-to-r from-[#2563EB] to-[#1d4ed8] hover:from-[#1d4ed8] hover:to-[#1e40af] text-white rounded-full glow-blue h-12 px-8">
              <ArrowLeft className="mr-2 h-4 w-4" /> Return to Earth
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

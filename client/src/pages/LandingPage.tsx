import { MessageSquare, Shield, Zap } from "lucide-react";

export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col">
      <header className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <img
            src="/app_icon.png"
            alt="BmGapshap"
            className="w-48 h-48 object-contain"
          />

          <span className="font-display font-bold text-xl tracking-tight">
            BmGapshap
          </span>
        </div>
        <button
          onClick={handleLogin}
          className="px-4 py-2 rounded bg-primary text-white"
        >
          Log In
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-enter">
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-tight text-foreground">
              Connect with your world,{" "}
              <span className="text-primary">beautifully.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Experience messaging reimagined with stunning design, crystal
              clear audio, and seamless sharing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleLogin}
                className="text-lg px-8 py-6 rounded-full bg-primary text-white
                           shadow-xl shadow-primary/20 hover:shadow-primary/30
                           transition-all hover:-translate-y-1"
              >
                Get Started
              </button>

              <button
                className="text-lg px-8 py-6 rounded-full border-2 border-primary text-primary
                           hover:bg-primary hover:text-white transition-all"
              >
                Learn More
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t">
              {[
                { icon: Zap, label: "Fast" },
                { icon: Shield, label: "Secure" },
                { icon: MessageSquare, label: "Simple" },
              ].map((feature, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <feature.icon className="w-6 h-6 text-primary" />
                  <span className="font-medium">{feature.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative bg-background border border-border/50 shadow-2xl rounded-[2.5rem] p-6 rotate-3 hover:rotate-0 transition-all duration-500">
              {/* Mock Chat Interface */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20" />
                  <div className="h-4 w-32 bg-muted rounded" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-sm max-w-[80%]">
                      Hey! Check out this new chat app 🚀
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
                      Looks amazing! Love the teal color.
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground p-3 rounded-2xl rounded-tr-sm max-w-[80%]">
                      And the music player is built-in! 🎵
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © 2024 BmGapshap. All rights reserved.
      </footer>
    </div>
  );
}

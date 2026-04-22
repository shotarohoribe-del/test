import { useAthleteAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { LogOut, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WestmontHeaderProps {
  mode?: "track" | "xc";
  showNav?: boolean;
}

export default function WestmontHeader({ mode = "track", showNav = true }: WestmontHeaderProps) {
  const { athlete, refetch } = useAthleteAuth();
  const [, navigate] = useLocation();

  const logoutMutation = trpc.athleteAuth.logout.useMutation({
    onSuccess: () => {
      refetch();
      navigate("/login");
      toast.success("Signed out successfully");
    },
  });

  const modeColor = mode === "xc" ? "oklch(0.5 0.16 145)" : "oklch(0.55 0.2 22)";
  const modeBg = mode === "xc" ? "oklch(0.38 0.13 145 / 0.15)" : "oklch(0.45 0.18 22 / 0.15)";

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "oklch(0.07 0.01 0 / 0.95)",
        borderColor: "oklch(0.2 0.02 15)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
            style={{ background: modeBg, border: `1px solid ${modeColor}` }}
          >
            {mode === "xc" ? (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke={modeColor} strokeWidth="2.5">
                <path d="M17 8C17 8 15 10 12 10C9 10 7 8 7 8" />
                <path d="M12 2C12 2 8 6 8 10C8 14 12 16 12 16C12 16 16 14 16 10C16 6 12 2 12 2Z" />
                <path d="M5 20C5 20 8 17 12 17C16 17 19 20 19 20" />
                <path d="M3 22H21" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke={modeColor} strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                <circle cx="12" cy="12" r="3" fill={modeColor} />
              </svg>
            )}
          </div>
          <div>
            <span
              className="text-lg font-black tracking-widest leading-none block"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                color: "oklch(0.96 0.005 0)",
                letterSpacing: "0.1em",
              }}
            >
              WESTMONT
            </span>
            <span
              className="text-xs tracking-widest leading-none block -mt-0.5"
              style={{
                fontFamily: "'Bebas Neue', Impact, sans-serif",
                color: modeColor,
                letterSpacing: "0.12em",
              }}
            >
              DISTANCE
            </span>
          </div>
        </div>

        {/* Mode badge */}
        {showNav && (
          <div
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
            style={{ background: modeBg, color: modeColor, border: `1px solid ${modeColor}` }}
          >
            {mode === "xc" ? (
              <><span>🌲</span> Cross Country</>
            ) : (
              <><span>🏃</span> Track & Field</>
            )}
          </div>
        )}

        {/* User menu */}
        {athlete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-9 px-3 text-sm"
                style={{ color: "oklch(0.75 0.01 0)" }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: modeBg, color: modeColor, border: `1px solid ${modeColor}` }}
                >
                  {athlete.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block max-w-[120px] truncate">{athlete.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-foreground truncate">{athlete.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{athlete.role}</p>
              </div>
              <DropdownMenuSeparator />
              {athlete.role === "admin" && (
                <DropdownMenuItem onClick={() => navigate("/admin")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </DropdownMenuItem>
              )}
              {athlete.role !== "admin" && (
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <User className="w-4 h-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logoutMutation.mutate()}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}

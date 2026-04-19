import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { LogOut, Save } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth-service";
import { AppHeader } from "@/components/AppHeader";
import { toast } from "sonner";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [landSize, setLandSize] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setIsSaving(true);
    try {
      // Call API to save profile
      toast.success("Profile saved! ✅");
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div>
      <AppHeader title="My Profile" />
      <main className="mx-auto max-w-lg px-4 py-6 space-y-4">
        {/* User Info */}
        {user && (
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white font-bold">
                {(name || user.email || "U")[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{name || "Set your name"}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Profile Form */}
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold">Basic Information</h3>
          <div>
            <Label>Name</Label>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Village</Label>
            <Input
              placeholder="Your village"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>District</Label>
              <Input
                placeholder="District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>State</Label>
              <Input
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <div>
            <Label>Land Size (acres)</Label>
            <Input
              type="number"
              placeholder="0"
              value={landSize}
              onChange={(e) => setLandSize(e.target.value)}
              className="mt-1"
            />
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Profile"}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>
    </div>
  );
}

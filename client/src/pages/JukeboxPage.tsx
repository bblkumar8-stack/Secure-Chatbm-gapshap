import { useAudios, useCreateAudio } from "@/hooks/use-media";
import { usePlayer } from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Music, Upload, Plus } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { ObjectUploader } from "@/components/ObjectUploader";

export default function JukeboxPage() {
  const { data: audios, isLoading } = useAudios();
  const { currentTrackId, isPlaying, playTrack, togglePlay } = usePlayer();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const createAudio = useCreateAudio();
  const { user } = useAuth();

  // Temporary state for new upload form
  const [newTrack, setNewTrack] = useState({ title: "", artist: "", url: "" });

  const handleUploadSubmit = () => {
    // In a real flow, ObjectUploader would provide the URL
    // Here we're mocking the flow for the UI
    createAudio.mutate(
      {
        title: newTrack.title || "Untitled Track",
        artist: newTrack.artist || "Unknown Artist",
        url:
          newTrack.url ||
          "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Demo URL
      },
      {
        onSuccess: () => setIsUploadOpen(false),
      },
    );
  };

  return (
    <div className="flex min-h-screen bg-background pb-24 md:pl-20 lg:pl-64">
      <Navigation />

      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Jukebox
            </h1>
            <p className="text-muted-foreground mt-1">
              Discover and share music with the community
            </p>
          </div>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                <Plus className="w-5 h-5 mr-2" />
                Upload Track
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background/95 backdrop-blur-xl">
              <div className="mb-4">
                <h2 className="text-lg font-semibold">Upload New Track</h2>
              </div>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newTrack.title}
                    onChange={(e) =>
                      setNewTrack({ ...newTrack, title: e.target.value })
                    }
                    placeholder="Song Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Artist</Label>
                  <Input
                    value={newTrack.artist}
                    onChange={(e) =>
                      setNewTrack({ ...newTrack, artist: e.target.value })
                    }
                    placeholder="Artist Name"
                  />
                </div>

                <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Click to upload MP3 file
                  </p>
                  <p className="text-xs text-muted-foreground">Max 10MB</p>
                </div>

                <Button
                  className="w-full"
                  onClick={handleUploadSubmit}
                  disabled={createAudio.isPending}
                >
                  {createAudio.isPending ? "Uploading..." : "Add to Library"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 bg-muted/20 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {audios?.map((track) => {
              const isCurrent = currentTrackId === track.id;

              return (
                <Card
                  key={track.id}
                  className={`
                    border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden bg-card
                    ${isCurrent ? "ring-2 ring-primary" : ""}
                  `}
                >
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Music className="w-16 h-16 text-primary/30" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <Button
                        size="icon"
                        className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl scale-90 group-hover:scale-100 transition-transform"
                        onClick={() =>
                          isCurrent ? togglePlay() : playTrack(track.id)
                        }
                      >
                        {isCurrent && isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3
                      className={`font-bold truncate ${isCurrent ? "text-primary" : "text-foreground"}`}
                    >
                      {track.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {track.artist || "Unknown"}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

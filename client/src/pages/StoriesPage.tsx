import { useStories, useCreateStory } from "@/hooks/use-media";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { Plus, X } from "lucide-react";
import { useState } from "react";

export default function StoriesPage() {
  const { data: stories, isLoading } = useStories();
  const { user } = useAuth();
  const [selectedStory, setSelectedStory] = useState<any>(null);

  const displayName = user?.username || user?.email || "?";

  useCreateStory(); // future use

  return (
    <div className="flex min-h-screen bg-background pb-24 md:pl-20 lg:pl-64">
      <Navigation />

      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-8">Stories</h1>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Add Story */}
          <div className="flex flex-col items-center gap-2 cursor-pointer shrink-0">
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center">
                <span className="font-bold">
                  {displayName[0]?.toUpperCase()}
                </span>
              </div>
              <div className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-1">
                <Plus className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xs">Add Story</span>
          </div>

          {/* Stories */}
          {isLoading
            ? [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-20 h-20 rounded-full bg-muted animate-pulse shrink-0"
                />
              ))
            : stories?.map((story: any) => (
                <div
                  key={story.id}
                  className="flex flex-col items-center gap-2 cursor-pointer shrink-0"
                  onClick={() => setSelectedStory(story)}
                >
                  <img
                    src={story.mediaUrl}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover border-2"
                  />
                  <span className="text-xs truncate w-20 text-center">
                    User
                  </span>
                </div>
              ))}
        </div>

        {/* Viewer */}
        {selectedStory && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <button
              className="absolute top-4 right-4 text-white"
              onClick={() => setSelectedStory(null)}
            >
              <X className="w-8 h-8" />
            </button>

            <div className="max-w-lg w-full aspect-[9/16] bg-black rounded-xl overflow-hidden">
              <img
                src={selectedStory.mediaUrl}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

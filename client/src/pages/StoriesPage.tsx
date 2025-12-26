import { useStories, useCreateStory } from "@/hooks/use-media";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/use-auth";
import { Plus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function StoriesPage() {
  const { data: stories, isLoading } = useStories();
  const { user } = useAuth();
  const [selectedStory, setSelectedStory] = useState<any>(null);

  // Mock implementation for creation - ideally uses ObjectUploader
  const createStory = useCreateStory();

  return (
    <div className="flex min-h-screen bg-background pb-24 md:pl-20 lg:pl-64">
      <Navigation />
      
      <div className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-display font-bold mb-8">Stories</h1>
        
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
          {/* Add Story Button */}
          <div className="flex flex-col items-center gap-2 cursor-pointer group shrink-0">
            <div className="relative w-20 h-20">
              <div className="w-20 h-20 rounded-full p-[2px] border-2 border-dashed border-muted-foreground/30 group-hover:border-primary transition-colors">
                <Avatar className="w-full h-full border-2 border-background">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback>Me</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1 shadow-md group-hover:scale-110 transition-transform">
                <Plus className="w-4 h-4" />
              </div>
            </div>
            <span className="text-xs font-medium">Add Story</span>
          </div>

          {isLoading ? (
             [1, 2, 3].map(i => <div key={i} className="w-20 h-20 rounded-full bg-muted animate-pulse shrink-0" />)
          ) : (
            stories?.map((story) => (
              <div 
                key={story.id} 
                className="flex flex-col items-center gap-2 cursor-pointer group shrink-0"
                onClick={() => setSelectedStory(story)}
              >
                <div className="w-20 h-20 rounded-full p-[3px] bg-gradient-to-tr from-primary to-accent">
                  <Avatar className="w-full h-full border-2 border-background">
                    {/* In a real app, this would be the user's avatar, not the story media */}
                    <AvatarImage src={story.mediaUrl} className="object-cover" />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs font-medium truncate w-20 text-center">User</span>
              </div>
            ))
          )}
        </div>

        {/* Story Viewer Modal */}
        {selectedStory && (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center animate-enter p-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4 text-white hover:bg-white/10 rounded-full"
              onClick={() => setSelectedStory(null)}
            >
              <X className="w-8 h-8" />
            </Button>
            
            <div className="max-w-lg w-full aspect-[9/16] bg-black rounded-2xl overflow-hidden relative shadow-2xl">
              <img src={selectedStory.mediaUrl} alt="Story" className="w-full h-full object-cover" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent pt-20">
                <p className="text-white text-lg font-medium text-center">{selectedStory.content}</p>
              </div>
              
              {/* Progress bar mock */}
              <div className="absolute top-4 left-4 right-4 flex gap-1 h-1">
                <div className="flex-1 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-1/2" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

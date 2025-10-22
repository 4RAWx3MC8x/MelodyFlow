
"use client";

import React, { useState } from "react";
import { Music, ListMusic, Plus, Trash2, Heart, User, History, FolderKanban, MoreHorizontal, Pencil } from "lucide-react";
import { Album } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMusic } from "@/hooks/use-music";
import { Playlist } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES } from "@/lib/audio-data";
import { Label } from "./ui/label";
import { Logo } from "./Logo";
import { ScrollArea } from "./ui/scroll-area";

const PLAYLIST_NAME_MAX_LENGTH = 50;

export function AppSidebar() {
  const { playlists, activeView, setActiveView, createPlaylist, deletePlaylist, renamePlaylist, isLoading } = useMusic();
  const [isPlaylistDialogOpen, setIsPlaylistDialogOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [playlistToDelete, setPlaylistToDelete] = useState<Playlist | null>(null);
  const [playlistToRename, setPlaylistToRename] = useState<Playlist | null>(null);


  const handleCreatePlaylist = () => {
    if (newPlaylistName.trim()) {
      createPlaylist(newPlaylistName);
      setNewPlaylistName("");
      setIsPlaylistDialogOpen(false);
    }
  };

  const handleDeletePlaylistConfirm = () => {
    if (playlistToDelete) {
      deletePlaylist(playlistToDelete.id);
      setPlaylistToDelete(null);
    }
  };

  const handleRenamePlaylist = () => {
    if (playlistToRename && newPlaylistName.trim()) {
      renamePlaylist(playlistToRename.id, newPlaylistName.trim());
      setPlaylistToRename(null);
    }
  };
  
  React.useEffect(() => {
    if (playlistToRename) {
      setNewPlaylistName(playlistToRename.name);
    } else {
      setNewPlaylistName("");
    }
  }, [playlistToRename]);


  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center justify-start p-4 h-[64px]">
             <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 8653.7 2301.94" className="h-10 w-auto">
   <defs>
     <style>
      {`
       .st0 {
         opacity: .5;
       }
       .st0, .st1, .st2 {
         fill: #e21f26;
       }
       .st3 {
         fill: #eaeae9;
       }
       .st1 {
         opacity: .75;
       }
      `}
     </style>
   </defs>
   <g>
     <path className="st3" d="M756.44,1649.58c-122.16,17.71-246.64-38.87-315.44-140.17-63.35-93.26-72.4-213.7-38.9-320.03,40.42-128.31,148.84-215.57,256.39-287.45l-18.6-162.08c-5.95-110.46,11.96-269,114.94-332.94,94.47-58.65,206.32-6.15,233.29,98.24,41.59,161-84.65,309.52-191.74,412.73-10.44,10.06-51.46,40.08-51.79,51.96l22.5,173.64,3.4,2.6c111.5-17.86,217.8,60.41,236.78,171.38,24.25,141.88-65.49,254.57-184.8,316.59,12.54,103.83-21.94,233.17-128.85,273.32-91.58,34.39-226.52-7.95-212.97-123.99,4.49-38.46,36.11-73.49,75.18-78.23,107.17-13,144.81,106.57,59.5,163.82,55.94,8.56,105.26-38.09,125.05-86.65,5.6-13.73,16.07-50.12,16.07-63.7v-69.03ZM731.91,848.79c4.98,1.21,7.11-1.01,10.8-2.98,101.84-54.42,211.89-228.42,166.73-344.83-28.8-74.23-98.71-63.65-137.11-2.93-60.77,96.1-46.7,242.52-40.42,350.74ZM670.52,1014.5c-3.66-4.15-53.99,37.92-59.73,43.02-100.75,89.54-166.41,219.44-129.6,356.48,29.38,109.39,123.28,174.36,236.87,164.97,7.72-.64,28.95-2.03,29.03-10.39l-42.81-314.77c-4.57-4.86-37.31,29.11-41.15,33.99-41.29,52.59-43.73,123.98-29.43,186.9-84.98-96.23-59.21-248.07,54.83-308.85l-18-151.35ZM814.75,1548.32c141.55-58.2,132.58-313.37-39.89-309.85l39.89,309.85Z"/>
     <path className="st2" d="M811.68,1106.51c37.72-144.55,157.55-236.49,303.04-256.86,240.56-33.68,453.92,96.31,693.98-5.55,81.32-34.5,138.99-85.12,191.54-155.16,18.47-24.62,32.93-51.54,50.91-76.39-17.24,210.12-134.47,444.24-363.98,475.12-145.87,19.62-268.46-39.63-408.04-60.51-130.3-19.49-255.25-8.78-378.45,37.99-30.64,11.63-59.58,27.22-89.01,41.35Z"/>
     <path className="st1" d="M1928.44,1082c-45.83,129.11-147.51,256.33-288.28,283.89-175.37,34.34-269.36-62.57-411.17-135.17-80.93-41.43-171.55-79.04-263.91-78.19-1.05-7.19,7.47-10.25,12.52-13.53,274.65-178.66,574.82,109.4,857.33-10.94l93.51-46.06Z"/>
     <path className="st0" d="M1713.66,1391.86c2.93,3.66-12.25,21.73-15.44,25.95-45.23,59.89-133.86,118.88-209.92,124.51-197.71,14.63-241.42-151.4-373.14-249.92-16.86-12.61-36.32-21.4-51.91-35.5,126.24,5.2,228.1,78.58,338.49,126.29,101.19,43.73,208.41,50.1,311.91,8.67Z"/>
   </g>
   <g>
     <path className="st3" d="M2590.6,768.27l222.6,394.61,239.19-394.61h146.94v755.67h-151.13v-461.8l-197.77,326.99c-12.5,20.87-40.85,24.91-58.26,8.73l-205.69-335.73,8.31,461.8h-159.53v-755.67h155.33Z"/>
     <path className="st3" d="M7523.45,952.99l104.95,352.73,118.47-353.25,141.94,8.79,121.53,344.37,105.04-352.64h155.33l-189.84,571.47-150.42-8.71c-26.42-119-91.1-232.96-104.82-352.86l-126.69,360.18-150.82-2.82-192.6-567.27h167.93Z"/>
     <path className="st3" d="M5340.4,768.27v755.67h-142.74l-.08-58.77c-171.74,158.03-410.58,34.3-428.43-188.62-20.87-260.56,187.53-426.87,420.12-281.58v-226.7h151.13ZM5027.44,1064.09c-144.16,29.96-149.33,385.89,71.74,340.37,148.74-30.62,142.28-384.84-71.74-340.37Z"/>
     <path className="st3" d="M5550.31,952.99c39.31,105.91,65.92,236.62,111.09,338.11,5.22,11.73,8.4,27.88,23.16,31.33l117.63-369.44h167.93l-264.98,679.6c-39.99,70.37-99.93,121.03-183.89,126.71-24.7,1.67-63.38,6.04-80.09-12.86v-121.75c92.5,16.26,130.16-27.21,148.7-112.03l-207.47-559.67h167.93Z"/>
     <path className="st3" d="M3837.46,1288.85h-411.42c19.23,149.07,211.99,164.86,297.99,60.7,27.14,17.64,58.47,29.41,85.85,46.41,24.38,15.14-4.87,46.55-18.3,61.11-126.72,137.34-415.89,90.31-493.1-86.85-110.79-254.22,100.15-498.35,370.99-412.97,74.19,23.39,167.99,132.07,167.99,209.85v121.75ZM3694.72,1188.09c-12.01-170.84-258.82-173.69-268.68,0h268.68Z"/>
     <path className="st3" d="M4355.85,946.61c238.29-37.04,393.22,96.02,371.92,338.33-22.88,260.29-378.88,335.82-529.06,142.24-122.07-157.34-55.06-447.59,157.14-480.57ZM4397.71,1064.11c-155.19,32.11-152.29,382,71.74,340.31,166.8-31.04,140.25-384.17-71.74-340.31Z"/>
     <path className="st3" d="M6975.66,946.77c156.2-21.12,307.38,27.13,350.39,191.03,61.95,236.06-80.86,419.23-327.29,394.47-331.21-33.29-326.38-544.48-23.1-585.49ZM7017.48,1064.18c-162.12,26.36-161.87,364.7,42.92,345.04,194.18-18.64,162.73-378.48-42.92-345.04Z"/>
     <path className="st3" d="M6465.51,768.27v134.34h-310.66v155.33c0,2.57-11.53,11.95-8.4,20.99h285.48v125.95h-277.08v319.06h-151.13v-755.67h461.8Z"/>
     <rect className="st3" x="3913.02" y="768.27" width="151.13" height="755.67"/>
     <rect className="st3" x="6524.28" y="768.27" width="151.13" height="755.67"/>
   </g>
 </svg>
          </div>
        </SidebarHeader>
        <ScrollArea className="h-full">
          <SidebarContent className="pb-20">
            <SidebarGroup>
              <SidebarGroupLabel>Library</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView({ type: "all" })}
                    isActive={activeView.type === "all"}
                    tooltip="All Songs"
                  >
                    <Music />
                    <span>All Songs</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView({ type: "artists" })}
                    isActive={activeView.type === "artists"}
                    tooltip="All Artists"
                  >
                    <User />
                    <span>All Artists</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveView({ type: "albums" })}
                    isActive={activeView.type === "albums"}
                    tooltip="Albums"
                  >
                    <Album />
                    <span>Albums</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {CATEGORIES.length > 0 && (
              <SidebarGroup>
                <SidebarGroupLabel>Categories</SidebarGroupLabel>
                <SidebarMenu>
                  {CATEGORIES.map((category) => (
                    <SidebarMenuItem key={category.id}>
                      <SidebarMenuButton
                        onClick={() =>
                          setActiveView({ type: "category", id: category.id, subView: 'top' })
                        }
                        isActive={
                          activeView.type === "category" &&
                          activeView.id === category.id
                        }
                        tooltip={category.name}
                      >
                        <FolderKanban />
                        <span>{category.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            )}

            <SidebarGroup>
              <SidebarGroupLabel>Your Music</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveView({ type: "favorite_songs" })}
                      isActive={activeView.type === "favorite_songs"}
                      tooltip="Liked Songs"
                    >
                      <Heart />
                      <span>Songs</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveView({ type: "favorite_albums" })}
                      isActive={activeView.type === "favorite_albums"}
                      tooltip="Liked Albums"
                    >
                      <Album />
                      <span>Albums</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveView({ type: "favorite_artists" })}
                      isActive={activeView.type === "favorite_artists"}
                      tooltip="Followed Artists"
                    >
                      <User />
                      <span>Artists</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => setActiveView({ type: "history" })}
                      isActive={activeView.type === "history"}
                      tooltip="History"
                    >
                      <History />
                      <span>History</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            <SidebarGroup className="flex-grow">
              <SidebarGroupLabel className="flex items-center justify-between">
                <span>Playlists</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsPlaylistDialogOpen(true)}>
                      <Plus className="h-4 w-4" />
                  </Button>
              </SidebarGroupLabel>
              <SidebarMenu>
                {isLoading ? (
                  <>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <SidebarMenuItem key={i}>
                        <div className="flex items-center gap-3 w-full h-9 px-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                      </SidebarMenuItem>
                    ))}
                  </>
                ) : (
                  playlists.map((playlist) => (
                    <SidebarMenuItem key={playlist.id}>
                      <SidebarMenuButton
                        onClick={() =>
                          setActiveView({ type: "playlist", id: playlist.id })
                        }
                        isActive={
                          activeView.type === "playlist" &&
                          activeView.id === playlist.id
                        }
                        tooltip={playlist.name}
                        className="group/menu-item"
                      >
                        <ListMusic />
                        <span>{playlist.name}</span>
                      </SidebarMenuButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" 
                                className="absolute right-1 top-1.5 h-7 w-7 opacity-0 group-hover/menu-item:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4"/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setPlaylistToRename(playlist)}>
                                <Pencil className="w-4 h-4 mr-2" />
                                Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator/>
                            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => setPlaylistToDelete(playlist)}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Playlist
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </SidebarMenuItem>
                  ))
                )}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </ScrollArea>
      </Sidebar>

      <Dialog open={isPlaylistDialogOpen} onOpenChange={setIsPlaylistDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playlist</DialogTitle>
            <DialogDescription>
              Enter a name for your new playlist.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
             <Label htmlFor="name" className="sr-only">Name</Label>
            <Input
              id="name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              placeholder="My Awesome Mix"
              maxLength={PLAYLIST_NAME_MAX_LENGTH}
            />
            <div className="text-right text-sm text-muted-foreground">
                {newPlaylistName.length} / {PLAYLIST_NAME_MAX_LENGTH}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlaylistDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!playlistToDelete} onOpenChange={(open) => !open && setPlaylistToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete this playlist?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the playlist
                      "{playlistToDelete?.name}".
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPlaylistToDelete(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeletePlaylistConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                      Delete
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

       <Dialog open={!!playlistToRename} onOpenChange={(open) => { if (!open) setPlaylistToRename(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Playlist</DialogTitle>
            <DialogDescription>
              Enter a new name for the playlist "{playlistToRename?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <Label htmlFor="rename" className="sr-only">Name</Label>
            <Input
              id="rename"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRenamePlaylist()}
              placeholder="My Awesome Mix"
              maxLength={PLAYLIST_NAME_MAX_LENGTH}
            />
             <div className="text-right text-sm text-muted-foreground">
                {newPlaylistName.length} / {PLAYLIST_NAME_MAX_LENGTH}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlaylistToRename(null)}>Cancel</Button>
            <Button onClick={handleRenamePlaylist} disabled={!newPlaylistName.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

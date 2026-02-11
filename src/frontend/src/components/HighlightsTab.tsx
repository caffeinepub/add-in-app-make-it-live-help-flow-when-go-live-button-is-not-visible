import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, Star, Trophy } from 'lucide-react';
import { toast } from 'sonner';

interface Highlight {
  id: string;
  caption: string;
  imageUrl: string;
  votes: number;
  timestamp: number;
  hasVoted: boolean;
}

interface HighlightsTabProps {
  teamName: string;
  teamColor: string;
  onPointsEarned: (points: number) => void;
}

export default function HighlightsTab({ teamName, teamColor, onPointsEarned }: HighlightsTabProps) {
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [topHighlights, setTopHighlights] = useState<Highlight[]>([]);

  // Load highlights from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(`fanforge_highlights_${teamName}`);
    if (stored) {
      setHighlights(JSON.parse(stored));
    }
    
    // Check if it's Sunday and compile top highlights
    checkAndCompileWeeklyHighlights();
  }, [teamName]);

  const checkAndCompileWeeklyHighlights = () => {
    const lastCompiled = localStorage.getItem('fanforge_last_compiled');
    const now = new Date();
    const lastSunday = new Date(now);
    lastSunday.setDate(now.getDate() - now.getDay());
    lastSunday.setHours(0, 0, 0, 0);

    if (!lastCompiled || new Date(parseInt(lastCompiled)) < lastSunday) {
      compileTopHighlights();
      localStorage.setItem('fanforge_last_compiled', Date.now().toString());
    } else {
      // Load existing top highlights
      const stored = localStorage.getItem('fanforge_top_highlights');
      if (stored) {
        setTopHighlights(JSON.parse(stored));
      }
    }
  };

  const compileTopHighlights = () => {
    const stored = localStorage.getItem(`fanforge_highlights_${teamName}`);
    if (stored) {
      const allHighlights: Highlight[] = JSON.parse(stored);
      const sorted = [...allHighlights].sort((a, b) => b.votes - a.votes);
      const top5 = sorted.slice(0, 5);
      setTopHighlights(top5);
      localStorage.setItem('fanforge_top_highlights', JSON.stringify(top5));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = () => {
    if (!caption.trim() || !imagePreview) {
      toast.error('Please add both an image and caption');
      return;
    }

    const newHighlight: Highlight = {
      id: Date.now().toString(),
      caption: caption.trim(),
      imageUrl: imagePreview,
      votes: 0,
      timestamp: Date.now(),
      hasVoted: false
    };

    const updated = [newHighlight, ...highlights];
    setHighlights(updated);
    localStorage.setItem(`fanforge_highlights_${teamName}`, JSON.stringify(updated));

    // Award points
    onPointsEarned(25);
    toast.success('Highlight uploaded! +25 points earned');

    // Reset form
    setCaption('');
    setImageFile(null);
    setImagePreview('');
  };

  const handleVote = (highlightId: string) => {
    const updated = highlights.map(h => {
      if (h.id === highlightId && !h.hasVoted) {
        return { ...h, votes: h.votes + 1, hasVoted: true };
      }
      return h;
    });
    setHighlights(updated);
    localStorage.setItem(`fanforge_highlights_${teamName}`, JSON.stringify(updated));
    toast.success('Vote recorded!');
  };

  return (
    <div className="space-y-6">
      {/* Weekly Top 5 Banner */}
      {topHighlights.length > 0 && (
        <Card className="rounded-2xl shadow-lg border-white/10 bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <CardTitle className="font-bold text-white">
                This Week's FanForge Highlights — Powered by You
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                {topHighlights.map((highlight, index) => (
                  <div 
                    key={highlight.id}
                    className="relative rounded-xl overflow-hidden border-2 border-yellow-400/50 shadow-lg"
                  >
                    <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-lg font-bold text-xs">
                      #{index + 1}
                    </div>
                    <img 
                      src={highlight.imageUrl} 
                      alt={highlight.caption}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3 bg-black/60 backdrop-blur">
                      <p className="text-sm text-white font-medium line-clamp-2">{highlight.caption}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-white/80">{highlight.votes} votes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <Card className="rounded-2xl shadow-lg border-white/10 bg-white/5 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5" style={{ color: teamColor }} />
            <CardTitle className="font-bold text-white">Upload Highlight of the Week</CardTitle>
          </div>
          <CardDescription className="text-white/60 font-medium">
            Share your best moment and earn +25 points
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Upload Image/Clip
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="bg-white/10 border-white/20 text-white"
            />
            {imagePreview && (
              <div className="mt-3">
                <img 
                  src={imagePreview} 
                  alt="Preview"
                  className="w-full max-h-48 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Caption
            </label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe your highlight..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
              rows={3}
            />
          </div>
          <Button
            onClick={handleUpload}
            disabled={!caption.trim() || !imagePreview}
            className="w-full rounded-xl font-semibold"
            style={{ backgroundColor: teamColor }}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Highlight
          </Button>
        </CardContent>
      </Card>

      {/* All Highlights */}
      <Card className="rounded-2xl shadow-lg border-white/10 bg-white/5 backdrop-blur">
        <CardHeader>
          <CardTitle className="font-bold text-white">All Highlights</CardTitle>
          <CardDescription className="text-white/60 font-medium">
            Vote for your favorites
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {highlights.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                {highlights.map((highlight) => (
                  <div 
                    key={highlight.id}
                    className="rounded-xl overflow-hidden border border-white/10 shadow-lg bg-white/5"
                  >
                    <img 
                      src={highlight.imageUrl} 
                      alt={highlight.caption}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-3">
                      <p className="text-sm text-white font-medium mb-3 line-clamp-2">{highlight.caption}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-white/80">{highlight.votes}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(highlight.id)}
                          disabled={highlight.hasVoted}
                          className="rounded-lg border-white/20 hover:bg-white/10"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          Vote
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center text-white/50">
                <Upload className="w-12 h-12 mb-3" />
                <p className="text-sm font-medium">No highlights yet</p>
                <p className="text-xs mt-1">Be the first to upload!</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

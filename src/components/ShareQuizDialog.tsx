import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Check, Share2, Loader2 } from "lucide-react";

interface ShareQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string;
  quizTopic: string;
}

const ShareQuizDialog = ({ open, onOpenChange, quizId, quizTopic }: ShareQuizDialogProps) => {
  const [shareLink, setShareLink] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const generateShareLink = async () => {
    setIsGenerating(true);
    try {
      // Check if share already exists
      const { data: existing } = await supabase
        .from("shared_quizzes")
        .select("share_token")
        .eq("quiz_id", quizId)
        .maybeSingle();

      let token: string;

      if (existing) {
        token = existing.share_token;
      } else {
        // Generate new token
        const { data: tokenData, error: tokenError } = await supabase
          .rpc("generate_share_token");

        if (tokenError) throw tokenError;
        token = tokenData;

        // Create share record
        const { error: insertError } = await supabase
          .from("shared_quizzes")
          .insert({
            quiz_id: quizId,
            share_token: token,
          });

        if (insertError) throw insertError;
      }

      const link = `${window.location.origin}/quiz/shared/${token}`;
      setShareLink(link);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate share link",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setShareLink("");
      setCopied(false);
    } else if (!shareLink) {
      generateShareLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Share Quiz
          </DialogTitle>
          <DialogDescription>
            Anyone with this link can attempt "{quizTopic}" without logging in
          </DialogDescription>
        </DialogHeader>

        {isGenerating ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : shareLink ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1"
                onClick={(e) => e.currentTarget.select()}
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleCopy}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Share this quiz:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Anyone can access without signing up</li>
                <li>Results are saved anonymously</li>
                <li>Link never expires</li>
              </ul>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default ShareQuizDialog;

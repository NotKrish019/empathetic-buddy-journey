
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'mindful' | 'nature';
  title: string;
}

export const JournalEntryModal = ({ isOpen, onClose, type, title }: JournalEntryModalProps) => {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const today = new Date();

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          {
            entry_type: type,
            content: content,
            user_id: (await supabase.auth.getUser()).data.user?.id,
          }
        ]);

      if (error) {
        console.error('Error saving journal entry:', error);
        throw error;
      }

      toast({
        title: "Journal Entry Saved",
        description: "Your thoughts have been recorded successfully.",
      });

      setContent("");
      onClose();
    } catch (error) {
      console.error('Error saving journal entry:', error);
      toast({
        title: "Error",
        description: "Failed to save your journal entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-chat-navy border-chat-teal shadow-lg">
        <DialogHeader className="border-b border-chat-teal/30 pb-3">
          <DialogTitle className="text-chat-gray">
            {title} - {format(today, 'MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts here..."
            className="min-h-[200px] bg-chat-dark/50 border-chat-teal/30 text-chat-light placeholder:text-chat-light/50 focus:ring-1 focus:ring-chat-teal focus:border-chat-teal"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-chat-teal/30 text-chat-light hover:bg-chat-teal/20"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-chat-teal text-white hover:bg-chat-teal/90"
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

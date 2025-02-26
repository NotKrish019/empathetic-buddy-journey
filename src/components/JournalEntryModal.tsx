
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
  const { toast } = useToast();
  const today = new Date();

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .insert([
          {
            entry_type: type,
            content: content,
          }
        ]);

      if (error) throw error;

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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-chat-navy border-chat-teal">
        <DialogHeader>
          <DialogTitle className="text-chat-gray">
            {title} - {format(today, 'MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts here..."
            className="min-h-[200px] bg-chat-dark/50 border-chat-teal/30 text-chat-light placeholder:text-chat-light/50"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-chat-teal/30 text-chat-light hover:bg-chat-teal/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-chat-teal text-white hover:bg-chat-teal/90"
              disabled={!content.trim()}
            >
              Save Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
